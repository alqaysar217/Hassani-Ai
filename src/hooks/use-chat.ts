
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Conversation, Message } from '@/lib/types';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useChat() {
  const db = useFirestore();
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !user) return;

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const convs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Conversation[];
        setConversations(convs);
      },
      async (error) => {
        const permissionError = new FirestorePermissionError({
          path: conversationsRef.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [db, user]);

  useEffect(() => {
    if (!db || !currentId) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, 'conversations', currentId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        setMessages(msgs);
      },
      async (error) => {
        const permissionError = new FirestorePermissionError({
          path: messagesRef.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [db, currentId]);

  const currentConversation = useMemo(() => {
    const conv = conversations.find(c => c.id === currentId);
    if (!conv) return null;
    return { ...conv, messages };
  }, [conversations, currentId, messages]);

  const createNewConversation = () => {
    setCurrentId(null);
  };

  const sanitizeObject = (obj: any) => {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof Date)) {
          sanitized[key] = sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    }
    return sanitized;
  };

  const addMessage = async (conversationId: string | null, message: Message) => {
    if (!db || !user) return null;

    let targetId = conversationId;

    if (!targetId) {
      targetId = crypto.randomUUID();
      const convRef = doc(db, 'conversations', targetId);
      const convData = {
        title: message.content.slice(0, 40) || (message.type === 'image' ? "صورة جديدة" : "محادثة جديدة"),
        userId: user.uid,
        updatedAt: Date.now(),
        pinned: false
      };
      // البدء في الحفظ دون انتظار (Non-blocking)
      setDoc(convRef, convData).catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: convRef.path,
          operation: 'create',
          requestResourceData: convData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
      setCurrentId(targetId);
    }

    const messageRef = doc(db, 'conversations', targetId, 'messages', message.id);
    const sanitizedMessage = sanitizeObject(message);
    
    setDoc(messageRef, sanitizedMessage)
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: messageRef.path,
          operation: 'create',
          requestResourceData: sanitizedMessage,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    const conversationRef = doc(db, 'conversations', targetId);
    updateDoc(conversationRef, { updatedAt: Date.now() });

    return targetId;
  };

  const deleteConversation = (id: string) => {
    if (!db) return;
    const docRef = doc(db, 'conversations', id);
    deleteDoc(docRef).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' }));
    });
    if (currentId === id) setCurrentId(null);
  };

  const renameConversation = (id: string, title: string) => {
    if (!db) return;
    const docRef = doc(db, 'conversations', id);
    updateDoc(docRef, { title }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update' }));
    });
  };

  const togglePin = (id: string, currentPinned: boolean) => {
    if (!db) return;
    const docRef = doc(db, 'conversations', id);
    updateDoc(docRef, { pinned: !currentPinned }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update' }));
    });
  };

  return {
    conversations,
    currentId,
    setCurrentId,
    currentConversation,
    createNewConversation,
    addMessage,
    deleteConversation,
    renameConversation,
    togglePin,
  };
}
