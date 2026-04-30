
"use client"

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
  addDoc, 
  deleteDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';

export function useChat() {
  const db = useFirestore();
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // جلب المحادثات الخاصة بالمستخدم
  useEffect(() => {
    if (!db || !user) return;

    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      setConversations(convs);
    });

    return () => unsubscribe();
  }, [db, user]);

  // جلب الرسائل للمحادثة الحالية
  useEffect(() => {
    if (!db || !currentId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'conversations', currentId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    });

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
    setDoc(doc(db, 'conversations', id), {
      title: 'محادثة جديدة',
      userId: user.uid,
      updatedAt: Date.now()
    });
    
    setCurrentId(id);
    return id;
  };

  const addMessage = (conversationId: string, message: Message) => {
    if (!db) return;

    // إضافة الرسالة للمجموعة الفرعية
    addDoc(collection(db, 'conversations', conversationId, 'messages'), message);

    // تحديث عنوان المحادثة وتاريخها إذا كانت أول رسالة
    if (messages.length === 0 && message.role === 'user') {
      const newTitle = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
      updateDoc(doc(db, 'conversations', conversationId), {
        title: newTitle,
        updatedAt: Date.now()
      });
    } else {
      updateDoc(doc(db, 'conversations', conversationId), {
        updatedAt: Date.now()
      });
    }
  };

  const deleteConversation = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'conversations', id));
    if (currentId === id) setCurrentId(null);
  };

  const renameConversation = (id: string, title: string) => {
    if (!db) return;
    updateDoc(doc(db, 'conversations', id), { title });
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
