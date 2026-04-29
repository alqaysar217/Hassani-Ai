"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Sparkles, Image as ImageIcon, Code, Music, Mic } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const suggestions = [
  { icon: <Sparkles className="h-4 w-4" />, label: "دردشة", hint: "" },
  { icon: <ImageIcon className="h-4 w-4" />, label: "صور", hint: "صمم لي صورة لـ " },
  { icon: <Code className="h-4 w-4" />, label: "برمجة", hint: "اشرح لي هذا الكود: " },
  { icon: <Music className="h-4 w-4" />, label: "تخطيط", hint: "ساعدني في التخطيط لـ " },
];

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  return (
    <div className="p-4 pb-8 border-t bg-white/80 backdrop-blur-xl safe-bottom sticky bottom-0 z-30 mobile-app-shadow">
      {/* Scrollable Suggestions Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar px-1">
        {suggestions.map((s, i) => (
          <Button
            key={i}
            variant="secondary"
            size="sm"
            className="rounded-2xl flex-shrink-0 text-sm gap-2 h-10 px-5 font-bold bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 transition-all active:scale-95"
            onClick={() => {
              setInput(s.hint);
              textareaRef.current?.focus();
            }}
          >
            {s.icon}
            {s.label}
          </Button>
        ))}
      </div>

      <div className="flex items-end gap-3 bg-muted/60 rounded-[30px] p-2 pr-2 border border-primary/10 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full text-muted-foreground hover:bg-white hover:text-primary transition-colors">
          <Paperclip className="h-6 w-6" />
        </Button>
        
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="اسأل حساني أي شيء..."
          className="min-h-[44px] max-h-[160px] border-0 focus-visible:ring-0 bg-transparent resize-none py-3 px-1 text-base leading-relaxed font-medium placeholder:text-muted-foreground/60"
          disabled={disabled}
        />

        {input.trim() ? (
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={disabled}
            className="h-11 w-11 rounded-full luxury-gradient transition-all active:scale-90 shadow-lg shadow-primary/30"
          >
            <Send className="h-5 w-5 fill-white rotate-180" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full text-muted-foreground hover:text-primary">
            <Mic className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
}
