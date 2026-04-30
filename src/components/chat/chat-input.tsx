
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  ImageIcon, 
  Code, 
  Mic, 
  X,
  Plus,
  Zap,
  Music,
  Brain,
  Rocket,
  Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MessageType } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatInputProps {
  onSend: (message: string, mode?: MessageType, file?: File | null) => void;
  disabled?: boolean;
}

const modes = [
  { id: 'text' as MessageType, icon: <Zap className="h-4 w-4" />, label: "دردشة ذكية", color: "text-amber-500" },
  { id: 'image' as MessageType, icon: <ImageIcon className="h-4 w-4" />, label: "توليد صور", color: "text-blue-500" },
  { id: 'code' as MessageType, icon: <Code className="h-4 w-4" />, label: "مساعد برمجـي", color: "text-emerald-500" },
  { id: 'diagram' as MessageType, icon: <Layout className="h-4 w-4" />, label: "إنشاء مخططات", color: "text-indigo-500" },
  { id: 'planning' as MessageType, icon: <Rocket className="h-4 w-4" />, label: "تخطيط قواعد البيانات", color: "text-rose-500" },
  { id: 'music' as MessageType, icon: <Music className="h-4 w-4" />, label: "ألحان وصوت", color: "text-purple-500" },
];

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<MessageType>('text');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((input.trim() || attachedFile) && !disabled) {
      onSend(input, selectedMode, attachedFile);
      setInput('');
      setAttachedFile(null);
      setSelectedMode('text');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const currentModeInfo = modes.find(m => m.id === selectedMode) || modes[0];

  return (
    <div className="p-4 bg-white/95 backdrop-blur-3xl border-t border-primary/5 safe-bottom sticky bottom-0 z-30 shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.08)]">
      <div className="max-w-3xl mx-auto space-y-3">
        
        {attachedFile && (
          <div className="flex items-center gap-2 bg-primary/5 p-2 pr-4 rounded-xl border border-primary/10 animate-fade-in w-fit">
            <ImageIcon className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-secondary truncate max-w-[150px]">{attachedFile.name}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setAttachedFile(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="bg-muted/30 rounded-[24px] border border-primary/5 overflow-hidden transition-all duration-300 focus-within:ring-4 focus-within:ring-primary/5 focus-within:bg-white focus-within:border-primary/20 p-1">
          <div className="px-4">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="تحدث مع حساني..."
              className="min-h-[56px] max-h-[180px] border-0 focus-visible:ring-0 bg-transparent resize-none py-4 text-lg font-medium placeholder:text-muted-foreground/30 no-scrollbar"
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-primary/5 mt-1 px-2 pb-1.5">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-primary/5 text-primary hover:bg-primary/10 transition-all shadow-sm">
                    <Plus className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-60 rounded-2xl p-2 border-primary/10 shadow-2xl backdrop-blur-xl bg-white/90">
                  {modes.map((mode) => (
                    <DropdownMenuItem 
                      key={mode.id} 
                      className="rounded-xl flex flex-row items-center gap-3 py-3 cursor-pointer focus:bg-primary/5"
                      onClick={() => setSelectedMode(mode.id)}
                    >
                      <div className={cn("p-2 rounded-lg bg-current/10 shrink-0", mode.color)}>
                        {mode.icon}
                      </div>
                      <span className="font-bold text-secondary text-sm flex-1 text-right">{mode.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/5"
                onClick={() => fileInputRef.current?.click()}
                title="إرفاق صورة"
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              {selectedMode !== 'text' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full animate-slide-in-right">
                  <span className={cn("shrink-0", currentModeInfo.color)}>{currentModeInfo.icon}</span>
                  <span className="text-[10px] font-black text-primary uppercase">{currentModeInfo.label}</span>
                </div>
              )}
            </div>

            <div className="flex items-center">
              {input.trim() || attachedFile ? (
                <Button 
                  onClick={handleSend}
                  disabled={disabled}
                  className="h-10 w-10 rounded-2xl luxury-gradient shadow-lg shadow-primary/20 shrink-0 transition-all active:scale-90"
                >
                  <Send className="h-5 w-5 fill-white rotate-180" />
                </Button>
              ) : (
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-2xl bg-secondary/5 text-secondary hover:bg-secondary/10 shrink-0 transition-all active:scale-90"
                  title="تحدث بالصوت"
                >
                  <Mic className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
