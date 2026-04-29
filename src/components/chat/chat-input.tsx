
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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MessageType } from '@/lib/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ChatInputProps {
  onSend: (message: string, mode?: MessageType) => void;
  disabled?: boolean;
}

const modes = [
  { id: 'text' as MessageType, icon: <Sparkles className="h-4 w-4" />, label: "دردشة", color: "text-amber-500", bg: "bg-amber-50" },
  { id: 'image' as MessageType, icon: <ImageIcon className="h-4 w-4" />, label: "صور", color: "text-blue-500", bg: "bg-blue-50" },
  { id: 'code' as MessageType, icon: <Code className="h-4 w-4" />, label: "برمجة", color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: 'diagram' as MessageType, icon: <Layout className="h-4 w-4" />, label: "مخططات", color: "text-purple-500", bg: "bg-purple-50" },
  { id: 'planning' as MessageType, icon: <Map className="h-4 w-4" />, label: "تخطيط", color: "text-orange-500", bg: "bg-orange-50" },
  { id: 'music' as MessageType, icon: <Music className="h-4 w-4" />, label: "موسيقى", color: "text-pink-500", bg: "bg-pink-50" },
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

  return (
    <div className="p-4 bg-white/80 backdrop-blur-2xl border-t border-primary/10 safe-bottom sticky bottom-0 z-30 shadow-[0_-8px_30px_-10px_rgba(197,160,89,0.1)]">
      <div className="max-w-3xl mx-auto space-y-3">
        {/* File Preview */}
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

        {/* Main Input Container */}
        <div className="bg-muted/40 rounded-[28px] border border-primary/5 p-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/10 focus-within:bg-white focus-within:border-primary/20">
          
          {/* Row 1: Textarea */}
          <div className="px-2 pt-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={isRecording ? "جاري الاستماع..." : "اسأل حساني..."}
              className="min-h-[40px] max-h-[120px] border-0 focus-visible:ring-0 bg-transparent resize-none py-2 text-base font-medium placeholder:text-muted-foreground/50 no-scrollbar"
              disabled={disabled || isRecording}
            />
          </div>

          {/* Row 2: Controls */}
          <div className="flex items-center gap-2 pt-1 border-t border-primary/5 mt-1">
            {/* Scrollable Modes */}
            <ScrollArea className="flex-1 whitespace-nowrap rtl" dir="rtl">
              <div className="flex items-center gap-1.5 pb-2">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMode(m.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-bold transition-all shrink-0 border border-transparent",
                      selectedMode === m.id 
                        ? "bg-white text-secondary shadow-sm border-primary/10" 
                        : "text-muted-foreground hover:bg-white/50"
                    )}
                  >
                    <span className={cn(selectedMode === m.id ? m.color : "opacity-70")}>
                      {m.icon}
                    </span>
                    {m.label}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>

            {/* Attachment */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-white shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            {/* Action Button: Send or Mic */}
            {input.trim() || attachedFile ? (
              <Button 
                onClick={handleSend}
                disabled={disabled}
                className="h-10 w-10 rounded-full luxury-gradient shadow-lg shadow-primary/20 shrink-0"
              >
                <Send className="h-5 w-5 fill-white rotate-180" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-10 w-10 rounded-full transition-all duration-300 shrink-0",
                  isRecording ? "bg-red-500 text-white shadow-lg animate-pulse" : "text-muted-foreground hover:text-primary hover:bg-white"
                )}
                onClick={() => setIsRecording(!isRecording)}
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
