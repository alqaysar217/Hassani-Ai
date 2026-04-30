"use client"

import React from 'react';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Copy, Check, Layout, MoreHorizontal, Brain, User, Database, GitBranch, Users } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "تم النسخ" });
    setTimeout(() => setCopied(false), 2000);
  };

  const isAI = message.role === 'assistant';

  return (
    <div className={cn(
      "flex w-full group animate-fade-in-up",
      isAI ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "relative flex flex-col gap-3 max-w-[94%] md:max-w-[85%]",
        isAI ? "items-start" : "items-end"
      )}>
        <div className="flex items-center gap-3 px-1">
          <div className={cn(
            "h-6 w-6 rounded-lg flex items-center justify-center text-white shadow-sm",
            isAI ? "bg-primary" : "bg-secondary"
          )}>
            {isAI ? <Brain className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
          </div>
          <span className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
            {isAI ? "حساني" : "أنت"}
          </span>
        </div>

        <div className={cn(
          "px-6 py-5 shadow-sm transition-all duration-300",
          isAI ? "chat-bubble-ai rounded-[28px] rounded-tr-sm" : "chat-bubble-user rounded-[28px] rounded-tl-sm"
        )}>
          {(message.type === 'text' || message.type === 'planning') && (
            <p className="whitespace-pre-wrap leading-relaxed text-lg font-medium">
              {message.content || ""}
            </p>
          )}

          {message.type === 'code' && (
            <div className="space-y-4">
              {message.metadata?.explanation && (
                <p className="text-lg leading-relaxed mb-3">
                  {message.metadata.explanation}
                </p>
              )}
              <div className="rounded-2xl overflow-hidden bg-secondary border border-white/5 shadow-2xl">
                <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/5">
                  <span className="text-xs font-black opacity-60 uppercase tracking-widest">Code</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 hover:bg-white/10 text-white/70 rounded-xl"
                    onClick={() => copyToClipboard(message.metadata?.code || "")}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <pre className="p-6 font-code text-sm overflow-x-auto text-amber-50 no-scrollbar" dir="ltr">
                  <code>{message.metadata?.code || message.content || ""}</code>
                </pre>
              </div>
            </div>
          )}

          {message.type === 'diagram' && (
            <div className="space-y-4">
              {message.metadata?.diagramExplanation && (
                <p className="text-lg leading-relaxed mb-3">
                  {message.metadata.diagramExplanation}
                </p>
              )}
              <div className="rounded-2xl overflow-hidden bg-secondary border border-white/5 shadow-2xl">
                <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Layout className="h-4 w-4 text-primary" />
                    <span className="text-xs font-black opacity-60 uppercase tracking-widest">Mermaid Diagram</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 hover:bg-white/10 text-white/70 rounded-xl"
                    onClick={() => copyToClipboard(message.metadata?.diagramSyntax || "")}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="p-6 bg-white flex flex-col items-center justify-center overflow-x-auto">
                   <pre className="text-[10px] text-slate-800 font-code" dir="ltr">
                     {message.metadata?.diagramSyntax}
                   </pre>
                   <p className="mt-4 text-[10px] text-slate-400 italic font-medium">(Diagram Render Preview - Copy syntax to view in Mermaid editor)</p>
                </div>
              </div>
            </div>
          )}

          {message.type === 'image' && (
            <div className="space-y-4">
               <div className="relative aspect-square w-full min-w-[280px] rounded-2xl overflow-hidden border border-primary/5 shadow-2xl">
                  {message.metadata?.mediaUrl && (
                    <Image 
                      src={message.metadata.mediaUrl} 
                      alt="Hassani Vision" 
                      fill 
                      className="object-cover"
                      unoptimized
                    />
                  )}
               </div>
            </div>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 mt-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/5 text-muted-foreground" onClick={() => copyToClipboard(message.content || "")}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/5 text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
