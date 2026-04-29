"use client"

import { useState, useEffect } from 'react';
import { Conversation, Message, MessageType } from '@/lib/types';

const STORAGE_KEY = 'hassani_chat_history';

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  const currentConversation = conversations.find(c => c.id === currentId) || null;

  const createNewConversation = () => {
    const id = crypto.randomUUID();
    const newConv: Conversation = {
      id,
      title: 'New Chat',
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations([newConv, ...conversations]);
    setCurrentId(id);
    return id;
  };

  const addMessage = (conversationId: string, message: Message) => {
    setConversations(prev => {
      const updated = prev.map(c => {
        if (c.id === conversationId) {
          const newMessages = [...c.messages, message];
          let newTitle = c.title;
          if (c.messages.length === 0 && message.role === 'user') {
            newTitle = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
          }
          return { ...c, messages: newMessages, title: newTitle, updatedAt: Date.now() };
        }
        return c;
      });
      return updated.sort((a, b) => b.updatedAt - a.updatedAt);
    });
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentId === id) setCurrentId(null);
  };

  const renameConversation = (id: string, title: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
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
