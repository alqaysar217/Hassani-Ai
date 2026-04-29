"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Sparkles, Image as ImageIcon, Code, Layout, Music, Mic } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const suggestions = [
  { icon: <Sparkles className="h-4 w-4" />, label: "Chat", hint: "" },
  { icon: <ImageIcon className="h-4 w-4" />, label: "Image", hint: "Generate an image of a " },
  { icon: <Code className="h-4 w-4" />, label: "Code", hint: "Explain this code: " },
  { icon: <Music className="h-4 w-4" />, label: "Song", hint: "Write a song about " },
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
    <div className="p-3 pb-6 border-t bg-background/80 backdrop-blur-md safe-bottom sticky bottom-0 z-30">
      {/* Scrollable Suggestions Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar px-2">
        {suggestions.map((s, i) => (
          <Button
            key={i}
            variant="secondary"
            size="sm"
            className="rounded-full flex-shrink-0 text-xs gap-1.5 h-8 px-4 font-medium"
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

      <div className="flex items-end gap-2 bg-muted/40 rounded-[24px] p-2 pr-1.5 border border-border/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:bg-background/50">
          <Paperclip className="h-5 w-5" />
        </Button>
        
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask Hassani anything..."
          className="min-h-[40px] max-h-[160px] border-0 focus-visible:ring-0 bg-transparent resize-none py-2 px-1 text-base md:text-[15px] leading-normal"
          disabled={disabled}
        />

        {input.trim() ? (
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={disabled}
            className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 transition-all active:scale-90 shadow-md shadow-primary/20"
          >
            <Send className="h-5 w-5 fill-white" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground">
            <Mic className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}