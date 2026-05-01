"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  SendHorizontal, 
  ImageIcon, 
  Code, 
  X,
  Plus,
  Zap,
  Music,
  Rocket,
  Brain,
  Users,
  Database,
  GitBranch,
  Mic
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
  lang?: 'ar' | 'en';
}

export function ChatInput({ onSend, disabled, lang = 'ar' }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<MessageType>('text');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRtl = lang === 'ar';

  const modes = [
    { id: 'code' as MessageType, icon: <Code className="h-4 w-4" />, label: isRtl ? "حل مشكلة برمجية" : "Solve Code Problem", color: "text-emerald-500" },
    { id: 'planning_db' as MessageType, icon: <Rocket className="h-4 w-4" />, label: isRtl ? "تخطيط قواعد البيانات" : "DB Planning", color: "text-rose-500" },
    { id: 'text' as MessageType, icon: <Zap className="h-4 w-4" />, label: isRtl ? "توليد فكرة إبداعية" : "Generate Idea", color: "text-amber-500" },
    { id: 'planning_system' as MessageType, icon: <Brain className="h-4 w-4" />, label: isRtl ? "تحليل نظام شامل" : "System Analysis", color: "text-blue-500" },
    { id: 'diagram_usecase' as MessageType, icon: <Users className="h-4 w-4" />, label: isRtl ? "إنشاء مخطط Use Case" : "Create UseCase", color: "text-indigo-500" },
    { id: 'diagram_erd' as MessageType, icon: <Database className="h-4 w-4" />, label: isRtl ? "إنشاء مخطط ERD" : "Create ERD", color: "text-purple-500" },
    { id: 'diagram_dfd' as MessageType, icon: <GitBranch className="h-4 w-4" />, label: isRtl ? "إنشاء مخطط DFD" : "Create DFD", color: "text-cyan-500" },
    { id: 'image' as MessageType, icon: <ImageIcon className="h-4 w-4" />, label: isRtl ? "توليد صور" : "Generate Images", color: "text-pink-500" },
    { id: 'music' as MessageType, icon: <Music className="h-4 w-4" />, label: isRtl ? "توليد موسيقى" : "Generate Music", color: "text-orange-500" },
  ];

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
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 24)}px`;
    }
  }, [input]);

  const currentModeInfo = modes.find(m => m.id === selectedMode) || modes[2];

  return (
    <div className="p-2 bg-background dark:bg-background backdrop-blur-3xl border-t border-primary/5 safe-bottom sticky bottom-0 z-30 shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.08)]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto space-y-1.5">
        
        {attachedFile && (
          <div className="flex items-center gap-2 bg-primary/5 p-1.5 pr-3 rounded-xl border border-primary/10 animate-fade-in w-fit mb-0.5">
            <ImageIcon className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-bold text-foreground dark:text-foreground truncate max-w-[150px]">{attachedFile.name}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setAttachedFile(null)}
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          </div>
        )}

        <div className="bg-muted/30 dark:bg-background rounded-[18px] border border-primary/5 overflow-hidden transition-all duration-300 focus-within:ring-4 focus-within:ring-primary/5 focus-within:bg-background focus-within:border-primary/20 p-0.5">
          <div className="px-1.5 pt-0.5">
            <Textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={isRtl ? "تحدث مع حساني..." : "Chat with Hassani..."}
              className="min-h-[24px] max-h-[180px] border-0 focus-visible:ring-0 bg-transparent resize-none p-1 text-sm font-medium placeholder:text-muted-foreground/30 dark:placeholder:text-muted-foreground/50 no-scrollbar text-start leading-tight dark:text-white"
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between border-t border-primary/5 mx-1.5 mt-0.5 mb-0.5 pt-0.5 px-0.5">
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-all">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 rounded-2xl p-1.5 border-primary/10 shadow-2xl backdrop-blur-xl bg-popover/90" dir={isRtl ? 'rtl' : 'ltr'}>
                  {modes.map((mode) => (
                    <DropdownMenuItem 
                      key={mode.label} 
                      className="rounded-xl flex flex-row items-center gap-3 py-2.5 cursor-pointer focus:bg-primary/5"
                      onClick={() => setSelectedMode(mode.id)}
                    >
                      <div className={cn("p-1.5 rounded-lg bg-current/10 shrink-0", mode.color)}>
                        {mode.icon}
                      </div>
                      <span className="font-bold text-foreground dark:text-foreground text-sm flex-1 text-start">{mode.label}</span>
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
                className="h-7 w-7 rounded-xl text-muted-foreground dark:text-foreground/70 hover:text-primary hover:bg-primary/5"
                onClick={() => fileInputRef.current?.click()}
                title={isRtl ? "إرفاق صورة" : "Attach Image"}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>

              {selectedMode !== 'text' && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 rounded-full animate-slide-in-right">
                  <span className={cn("shrink-0 scale-75", currentModeInfo.color)}>{currentModeInfo.icon}</span>
                  <span className="text-[8px] font-black text-primary uppercase whitespace-nowrap">{currentModeInfo.label}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-3.5 w-3.5 rounded-full hover:bg-primary/20 p-0 text-primary"
                    onClick={() => setSelectedMode('text')}
                    title={isRtl ? "إلغاء الوضع" : "Clear Mode"}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center">
              {input.trim() || attachedFile ? (
                <Button 
                  onClick={handleSend}
                  disabled={disabled}
                  className={cn(
                    "h-7 w-7 rounded-xl luxury-gradient shadow-lg shadow-primary/20 shrink-0 transition-all active:scale-90",
                    isRtl && "scale-x-[-1]"
                  )}
                >
                  <SendHorizontal className="h-3.5 w-3.5 fill-white" />
                </Button>
              ) : (
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-xl bg-foreground/5 dark:bg-white/10 text-foreground dark:text-white hover:bg-foreground/10 shrink-0 transition-all active:scale-90"
                  title={isRtl ? "تحدث بالصوت" : "Voice Chat"}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
