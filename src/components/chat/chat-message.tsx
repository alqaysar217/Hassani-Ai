"use client"

import React from 'react';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Copy, Check, Layout, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "تم النسخ" });
    setTimeout(() => setCopied(false), 2000);
  };

  const isAI = message.role === 'assistant';

  return (
    <div className={cn(
      "flex w-full group transition-all duration-300",
      isAI ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "relative flex flex-col gap-2 max-w-[92%] md:max-w-[85%]",
        isAI ? "items-start" : "items-end"
      )}>
        {/* Label */}
        <div className="flex items-center gap-2 px-2">
          <span className="text-[11px] font-extrabold text-muted-foreground/70 uppercase tracking-widest">
            {isAI ? "حساني" : "أنت"} • {new Date(message.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className={cn(
          "px-5 py-4 shadow-sm transition-all duration-200 active:scale-[0.99]",
          isAI ? "chat-bubble-ai" : "chat-bubble-user"
        )}>
          {/* Main Content */}
          {message.type === 'text' && (
            <p className="whitespace-pre-wrap leading-relaxed text-[16px]">
              {message.content}
            </p>
          )}

          {/* Code Block */}
          {message.type === 'code' && (
            <div className="space-y-3">
              {message.metadata?.explanation && (
                <p className="text-[15px] leading-relaxed mb-3">
                  {message.metadata.explanation}
                </p>
              )}
              <div className="rounded-2xl overflow-hidden bg-secondary border border-white/10 shadow-xl">
                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                  <span className="text-[10px] font-mono opacity-60 uppercase tracking-widest">Code</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-white/10 text-white/70"
                    onClick={() => copyToClipboard(message.metadata?.code || "")}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <pre className="p-5 font-code text-xs md:text-sm overflow-x-auto text-amber-100 no-scrollbar dir-ltr" dir="ltr">
                  <code>{message.metadata?.code || message.content}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Image */}
          {message.type === 'image' && (
            <div className="space-y-4">
               <div className="relative aspect-square w-full min-w-[280px] rounded-2xl overflow-hidden border border-primary/10 shadow-2xl">
                  <Image 
                    src={message.metadata?.mediaUrl || message.content} 
                    alt="AI Generated" 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
               </div>
            </div>
          )}

          {/* Diagram */}
          {message.type === 'diagram' && (
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Layout className="h-4 w-4" /> المخطط جاهز
               </div>
               <div className="rounded-2xl overflow-hidden bg-muted/50 border border-primary/10 p-5">
                 <pre className="font-code text-xs overflow-x-auto no-scrollbar dir-ltr text-secondary" dir="ltr">
                   <code>{message.metadata?.diagramSyntax}</code>
                 </pre>
               </div>
            </div>
          )}
        </div>

        {/* Action Menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 mt-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5 text-muted-foreground" onClick={() => copyToClipboard(message.content)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5 text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
