"use client"

import React from 'react';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Copy, Check, Layout, Music, MoreHorizontal } from 'lucide-react';
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
    toast({ title: "Copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  const isAI = message.role === 'assistant';

  return (
    <div className={cn(
      "flex w-full group transition-all duration-300",
      isAI ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "relative flex flex-col gap-1.5 max-w-[88%] md:max-w-[80%] lg:max-w-[70%]",
        isAI ? "items-start" : "items-end"
      )}>
        {/* Timestamp/Label */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
            {isAI ? "Hassani" : "You"} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className={cn(
          "px-4 py-3 shadow-sm transition-transform active:scale-[0.99]",
          isAI ? "chat-bubble-ai" : "chat-bubble-user"
        )}>
          {/* Main Content */}
          {message.type === 'text' && (
            <p className="whitespace-pre-wrap leading-relaxed text-[15px] md:text-base">
              {message.content}
            </p>
          )}

          {/* Code Block Support */}
          {message.type === 'code' && (
            <div className="space-y-3">
              {message.metadata?.explanation && (
                <p className="text-[14px] leading-relaxed mb-2">
                  {message.metadata.explanation}
                </p>
              )}
              <div className="rounded-xl overflow-hidden bg-zinc-950 border border-white/5">
                <div className="flex items-center justify-between px-3 py-1.5 bg-white/5">
                  <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Code</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 hover:bg-white/10"
                    onClick={() => copyToClipboard(message.metadata?.code || "")}
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <pre className="p-4 font-code text-xs md:text-sm overflow-x-auto text-indigo-200 no-scrollbar">
                  <code>{message.metadata?.code || message.content}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Image Display */}
          {message.type === 'image' && (
            <div className="space-y-3">
               <div className="relative aspect-square w-full min-w-[240px] rounded-xl overflow-hidden border border-border/50 bg-muted">
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

          {/* Diagram Display */}
          {message.type === 'diagram' && (
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Layout className="h-4 w-4" /> Diagram Ready
               </div>
               <div className="rounded-xl overflow-hidden bg-muted/30 border border-border/50 p-4">
                 <pre className="font-code text-xs overflow-x-auto no-scrollbar">
                   <code>{message.metadata?.diagramSyntax}</code>
                 </pre>
               </div>
            </div>
          )}
        </div>

        {/* Action Menu (Visible on hover/long press) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => copyToClipboard(message.content)}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}