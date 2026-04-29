export type Role = 'user' | 'assistant';

export type MessageType = 'text' | 'image' | 'code' | 'diagram' | 'music' | 'planning';

export interface Message {
  id: string;
  role: Role;
  content: string;
  type: MessageType;
  timestamp: number;
  metadata?: {
    code?: string;
    explanation?: string;
    mediaUrl?: string;
    diagramSyntax?: string;
    diagramExplanation?: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
}

export interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  apiKey?: string;
}
