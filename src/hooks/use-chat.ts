
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
    if (!db || !user) return null;
    
    const id = crypto.randomUUID();
    const docRef = doc(db, 'conversations', id);
    const data = {
      title: 'محادثة جديدة',
      userId: user.uid,
      updatedAt: Date.now()
    };

    setDoc(docRef, data).catch(async () => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    setCurrentId(id);
    return id;
  };

  const sanitizeObject = (obj: any) => {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitized[key] = sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    }
    return sanitized;
  };

  const addMessage = (conversationId: string, message: Message) => {
    if (!db) return;

    const messageRef = doc(db, 'conversations', conversationId, 'messages', message.id);
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

    const conversationRef = doc(db, 'conversations', conversationId);
    const updateData: any = { updatedAt: Date.now() };
    
    if (message.role === 'user' && (!messages.length || messages.length === 0)) {
      updateData.title = (message.content || "").slice(0, 30) + ((message.content || "").length > 30 ? '...' : '');
    }

    updateDoc(conversationRef, updateData)
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: conversationRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const deleteConversation = (id: string) => {
    if (!db) return;
    const docRef = doc(db, 'conversations', id);
    deleteDoc(docRef)
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    if (currentId === id) setCurrentId(null);
  };

  const renameConversation = (id: string, title: string) => {
    if (!db) return;
    const docRef = doc(db, 'conversations', id);
    updateDoc(docRef, { title })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: { title },
        });
        errorEmitter.emit('permission-error', permissionError);
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
  };
}
