
"use client"

import React, { useEffect, useState } from 'react';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Copy, Check, Layout, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [copied, setCopied] = React.useState(false);
  const [userProfile, setUserProfile] = useState<{ photoURL?: string, displayName?: string } | null>(null);

  const isAI = message.role === 'assistant';

  useEffect(() => {
    if (!isAI && user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) setUserProfile(doc.data());
      });
      return () => unsubscribe();
    }
  }, [isAI, user, db]);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "تم النسخ" });
    setTimeout(() => setCopied(false), 2000);
  };

  const userPhoto = userProfile?.photoURL || user?.photoURL || undefined;
  const userInitial = userProfile?.displayName?.charAt(0) || user?.displayName?.charAt(0) || "م";

  return (
    <div className={cn(
      "flex w-full group animate-fade-in-up",
      isAI ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "relative flex flex-col gap-3 max-w-[94%] md:max-w-[85%]",
        isAI ? "items-start" : "items-end"
      )}>
        <div className={cn(
          "flex items-center gap-2 px-1",
          !isAI && "flex-row-reverse"
        )}>
          <div className={cn(
            "h-7 w-7 rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-primary/10 bg-card shrink-0",
          )}>
            {isAI ? (
              <div className="relative h-full w-full">
                <Image src="/logo-hassani.png" alt="Hassani" fill className="object-cover" />
              </div>
            ) : (
              <Avatar className="h-full w-full rounded-full">
                <AvatarImage src={userPhoto} className="object-cover" />
                <AvatarFallback className="bg-secondary text-[10px] text-white font-bold">{userInitial}</AvatarFallback>
              </Avatar>
            )}
          </div>
          <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
            {isAI ? "حساني" : "أنت"}
          </span>
        </div>

        <div className={cn(
          "px-6 py-5 shadow-sm transition-all duration-300 overflow-hidden",
          isAI ? "chat-bubble-ai rounded-[28px] rounded-tr-sm" : "chat-bubble-user rounded-[28px] rounded-tl-sm"
        )}>
          {(message.type === 'text' || message.type === 'planning') && (
            <div className="prose prose-stone dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-lg prose-p:font-medium prose-strong:font-black prose-headings:font-black prose-table:border prose-table:rounded-xl prose-th:bg-muted/50 prose-th:p-3 prose-td:p-3 prose-td:border-t">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline ? (
                      <div className="my-4 rounded-2xl overflow-hidden bg-secondary border border-white/5 shadow-2xl" dir="ltr">
                        <div className="flex items-center justify-between px-5 py-2 bg-white/5 border-b border-white/5">
                          <span className="text-[10px] font-black opacity-60 uppercase tracking-widest text-white">
                            {match ? match[1] : 'Code'}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 hover:bg-white/10 text-white/70 rounded-lg"
                            onClick={() => copyToClipboard(String(children).replace(/\n$/, ''))}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <pre className="p-4 font-code text-sm overflow-x-auto text-amber-50 no-scrollbar">
                          <code>{children}</code>
                        </pre>
                      </div>
                    ) : (
                      <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-6 rounded-2xl border border-primary/10 bg-card/50">
                        <table className="w-full text-sm text-start border-collapse">
                          {children}
                        </table>
                      </div>
                    );
                  }
                }}
              >
                {message.content || ""}
              </ReactMarkdown>
            </div>
          )}

          {message.type === 'code' && (
            <div className="space-y-4">
              {message.metadata?.explanation && (
                <p className="text-lg leading-relaxed mb-3 font-medium">
                  {message.metadata.explanation}
                </p>
              )}
              <div className="rounded-2xl overflow-hidden bg-secondary border border-white/5 shadow-2xl" dir="ltr">
                <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/5">
                  <span className="text-xs font-black opacity-60 uppercase tracking-widest text-white">Source Code</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 hover:bg-white/10 text-white/70 rounded-xl"
                    onClick={() => copyToClipboard(message.metadata?.code || "")}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <pre className="p-6 font-code text-sm overflow-x-auto text-amber-50 no-scrollbar">
                  <code>{message.metadata?.code || message.content || ""}</code>
                </pre>
              </div>
            </div>
          )}

          {message.type === 'diagram' && (
            <div className="space-y-4">
              {message.metadata?.diagramExplanation && (
                <p className="text-lg leading-relaxed mb-3 font-medium">
                  {message.metadata.diagramExplanation}
                </p>
              )}
              <div className="rounded-2xl overflow-hidden bg-secondary border border-white/5 shadow-2xl">
                <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Layout className="h-4 w-4 text-primary" />
                    <span className="text-xs font-black opacity-60 uppercase tracking-widest text-white">Mermaid Diagram</span>
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
