
export type Role = 'user' | 'assistant';

export type MessageType = 
  | 'text' 
  | 'image' 
  | 'code' 
  | 'diagram' 
  | 'diagram_usecase'
  | 'diagram_erd'
  | 'diagram_dfd'
  | 'music' 
  | 'planning'
  | 'planning_db'
  | 'planning_system';

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
  userId: string;
  pinned?: boolean;
  messages?: Message[];
}

export interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  apiKey?: string;
}
