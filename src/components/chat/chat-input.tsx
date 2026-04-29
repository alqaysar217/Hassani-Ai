
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  Sparkles, 
  ImageIcon, 
  Code, 
  Music, 
  Mic, 
  Layout, 
  X,
  Map,
  Plus,
  Zap
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
  onSend: (message: string, mode?: MessageType) => void;
  disabled?: boolean;
}

const modes = [
  { id: 'text' as MessageType, icon: <Zap className="h-4 w-4" />, label: "دردشة ذكية", color: "text-amber-500" },
  { id: 'image' as MessageType, icon: <ImageIcon className="h-4 w-4" />, label: "توليد صور", color: "text-blue-500" },
  { id: 'code' as MessageType, icon: <Code className="h-4 w-4" />, label: "مساعد برمجـي", color: "text-emerald-500" },
  { id: 'diagram' as MessageType, icon: <Layout className="h-4 w-4" />, label: "مخططات هندسية", color: "text-purple-500" },
  { id: 'planning' as MessageType, icon: <Map className="h-4 w-4" />, label: "تخطيط استراتيجي", color: "text-orange-500" },
  { id: 'music' as MessageType, icon: <Music className="h-4 w-4" />, label: "تأليف موسيقي", color: "text-pink-500" },
];

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<MessageType>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((input.trim() || attachedFile) && !disabled) {
      onSend(input, selectedMode);
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
    if (file) setAttachedFile(file);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const currentModeInfo = modes.find(m => m.id === selectedMode) || modes[0];

  return (
    <div className="p-4 bg-white/80 backdrop-blur-2xl border-t border-primary/10 safe-bottom sticky bottom-0 z-30 shadow-[0_-8px_30px_-10px_rgba(197,160,89,0.1)]">
      <div className="max-w-3xl mx-auto space-y-3">
        {attachedFile && (
          <div className="flex items-center gap-2 bg-primary/5 p-2 pr-4 rounded-2xl border border-primary/10 animate-fade-in w-fit">
            <Paperclip className="h-4 w-4 text-primary" />
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

        {selectedMode !== 'text' && (
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full w-fit animate-slide-in-right">
            <span className={cn("shrink-0", currentModeInfo.color)}>{currentModeInfo.icon}</span>
            <span className="text-[11px] font-bold text-primary">نمط: {currentModeInfo.label}</span>
            <button onClick={() => setSelectedMode('text')} className="hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="bg-muted/40 rounded-[28px] border border-primary/5 p-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/10 focus-within:bg-white focus-within:border-primary/20">
          <div className="px-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={isRecording ? "جاري الاستماع..." : (selectedMode === 'text' ? "اسأل حساني..." : `اكتب تفاصيل الـ ${currentModeInfo.label}...`)}
              className="min-h-[45px] max-h-[120px] border-0 focus-visible:ring-0 bg-transparent resize-none py-3 text-base font-medium placeholder:text-muted-foreground/50 no-scrollbar"
              disabled={disabled || isRecording}
            />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-primary/5 mt-1 px-1">
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full text-primary hover:bg-primary/5 shrink-0"
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-3xl p-2 shadow-2xl border-primary/10 bg-white" dir="rtl">
                  <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-primary/5 mb-1 text-right">القدرات الذكية</div>
                  {modes.map((m) => (
                    <DropdownMenuItem 
                      key={m.id}
                      onClick={() => setSelectedMode(m.id)}
                      className="rounded-2xl gap-3 py-3 cursor-pointer group focus:bg-primary/5 flex items-center justify-start text-right"
                    >
                      <div className={cn("p-2 rounded-xl transition-colors bg-muted group-focus:bg-white group-focus:shadow-sm shrink-0", m.color)}>
                        {m.icon}
                      </div>
                      <span className="font-bold text-secondary flex-1">{m.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center">
              {input.trim() || attachedFile ? (
                <Button 
                  onClick={handleSend}
                  disabled={disabled}
                  className="h-11 w-11 rounded-full luxury-gradient shadow-lg shadow-primary/20 shrink-0 transition-transform active:scale-90"
                >
                  <Send className="h-5 w-5 fill-white rotate-180" />
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-11 w-11 rounded-full transition-all duration-300 shrink-0",
                    isRecording ? "bg-red-500 text-white shadow-lg animate-pulse" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  <Mic className="h-6 w-6" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
