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
  Map, 
  Layout, 
  X,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const features = [
  { icon: <Sparkles className="h-4 w-4 text-amber-500" />, label: "دردشة عامة", hint: "" },
  { icon: <ImageIcon className="h-4 w-4 text-blue-500" />, label: "توليد صور", hint: "صمم لي صورة لـ " },
  { icon: <Code className="h-4 w-4 text-emerald-500" />, label: "مساعدة برمجية", hint: "اشرح لي هذا الكود: " },
  { icon: <Layout className="h-4 w-4 text-purple-500" />, label: "رسم مخططات", hint: "ارسم لي مخطط لـ " },
  { icon: <Map className="h-4 w-4 text-orange-500" />, label: "تخطيط ذكي", hint: "ساعدني في التخطيط لـ " },
  { icon: <Music className="h-4 w-4 text-pink-500" />, label: "إبداع موسيقي", hint: "لحن لي أغنية عن " },
];

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((input.trim() || attachedFile) && !disabled) {
      const messageText = attachedFile 
        ? `${input} [ملف مرفق: ${attachedFile.name}]` 
        : input;
      onSend(messageText);
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
    if (file) {
      setAttachedFile(file);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // هنا يمكن إضافة منطق Web Speech API مستقبلاً
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  return (
    <div className="p-4 pb-8 border-t bg-white/80 backdrop-blur-xl safe-bottom sticky bottom-0 z-30 mobile-app-shadow">
      {/* File Preview */}
      {attachedFile && (
        <div className="mb-3 flex items-center gap-2 bg-primary/5 p-2 pr-4 rounded-xl border border-primary/10 animate-fade-in">
          <Paperclip className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-secondary truncate max-w-[200px]">{attachedFile.name}</span>
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

      <div className="flex items-end gap-2 bg-muted/60 rounded-[28px] p-1.5 border border-primary/10 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300 relative">
        
        {/* Features Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full text-primary hover:bg-white shrink-0"
            >
              <Plus className={cn("h-6 w-6 transition-transform", input ? "rotate-45" : "rotate-0")} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-[24px] p-2 shadow-2xl border-primary/5 mb-2">
            <div className="grid grid-cols-1 gap-1">
              {features.map((f, i) => (
                <DropdownMenuItem 
                  key={i} 
                  className="rounded-xl flex items-center gap-3 p-3 cursor-pointer hover:bg-primary/5 focus:bg-primary/5"
                  onClick={() => {
                    setInput(f.hint);
                    textareaRef.current?.focus();
                  }}
                >
                  <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    {f.icon}
                  </div>
                  <span className="font-bold text-secondary text-sm">{f.label}</span>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Attachment Button */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-full text-muted-foreground hover:bg-white hover:text-primary shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={isRecording ? "جاري الاستماع..." : "اسأل حساني أي شيء..."}
          className={cn(
            "min-h-[40px] max-h-[160px] border-0 focus-visible:ring-0 bg-transparent resize-none py-2.5 px-1 text-base leading-relaxed font-medium placeholder:text-muted-foreground/60 transition-all",
            isRecording && "text-primary animate-pulse"
          )}
          disabled={disabled || isRecording}
        />

        {/* Action Buttons (Send or Mic) */}
        <div className="flex items-center gap-1 pr-1">
          {input.trim() || attachedFile ? (
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={disabled}
              className="h-10 w-10 rounded-full luxury-gradient transition-all active:scale-90 shadow-lg shadow-primary/30"
            >
              <Send className="h-5 w-5 fill-white rotate-180" />
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-10 w-10 rounded-full transition-all duration-300",
                isRecording ? "bg-red-500 text-white shadow-lg animate-pulse" : "text-muted-foreground hover:text-primary hover:bg-white"
              )}
              onClick={toggleRecording}
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
