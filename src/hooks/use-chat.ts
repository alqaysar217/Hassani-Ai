
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
  updateDoc,
  serverTimestamp 
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

  // جلب المحادثات مع فرز ذكي (المثبت أولاً ثم الأحدث)
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
        
        // فرز المحادثات: المثبت أولاً
        const sortedConvs = convs.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return (b.updatedAt || 0) - (a.updatedAt || 0);
        });
        
        setConversations(sortedConvs);
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

  // جلب الرسائل للمحادثة الحالية
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

  // العودة للرئيسية يعني تصفير المعرف الحالي
  const createNewConversation = () => {
    setCurrentId(null);
    return null;
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

  const addMessage = async (conversationId: string | null, message: Message) => {
    if (!db || !user) return null;

    let targetId = conversationId;

    // إذا لم تكن هناك محادثة، ننشئ واحدة جديدة
    if (!targetId) {
      targetId = crypto.randomUUID();
      const convRef = doc(db, 'conversations', targetId);
      const convData = {
        title: message.content.slice(0, 30) || "محادثة جديدة",
        userId: user.uid,
        updatedAt: Date.now(),
        pinned: false
      };
      await setDoc(convRef, convData);
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

  const togglePin = (id: string, currentPinned: boolean) => {
    if (!db) return;
    const docRef = doc(db, 'conversations', id);
    updateDoc(docRef, { pinned: !currentPinned })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
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
    togglePin,
  };
}
