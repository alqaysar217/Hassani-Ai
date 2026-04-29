"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Sparkles, Image as ImageIcon, Code, Layout, Music } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const suggestions = [
  { icon: <Sparkles className="h-3.5 w-3.5" />, label: "General Chat", hint: "" },
  { icon: <ImageIcon className="h-3.5 w-3.5" />, label: "Create image", hint: "Generate an image of a " },
  { icon: <Code className="h-3.5 w-3.5" />, label: "Fix code", hint: "Explain how to fix this code: " },
  { icon: <Layout className="h-3.5 w-3.5" />, label: "Draw diagram", hint: "Create a Use Case diagram for " },
  { icon: <Music className="h-3.5 w-3.5" />, label: "Write a song", hint: "Write a short song about " },
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="p-4 border-t glass-morphism safe-bottom">
      {/* Quick Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
        {suggestions.map((s, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className="rounded-full flex-shrink-0 text-xs gap-1.5 border-border hover:border-primary/50"
            onClick={() => setInput(s.hint)}
          >
            {s.icon}
            {s.label}
          </Button>
        ))}
      </div>

      <div className="relative flex items-end gap-2 bg-muted/50 rounded-2xl p-2 border border-border focus-within:border-primary/50 transition-colors">
        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary">
          <Paperclip className="h-5 w-5" />
        </Button>
        
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask anything..."
          className="min-h-[44px] max-h-[200px] border-0 focus-visible:ring-0 bg-transparent resize-none py-3 px-1 text-base md:text-sm"
          disabled={disabled}
        />

        <Button 
          size="icon" 
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 transition-transform active:scale-95 flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      <p className="text-center text-[10px] text-muted-foreground mt-2 px-4">
        Hassani AI can make mistakes. Verify important info.
      </p>
    </div>
  );
}
