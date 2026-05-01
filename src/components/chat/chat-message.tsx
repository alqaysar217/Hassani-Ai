"use client"

import React, { useEffect, useState } from 'react';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
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
    if (!text || text === "undefined") return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "تم النسخ" });
    setTimeout(() => setCopied(false), 2000);
  };

  const userPhoto = userProfile?.photoURL || user?.photoURL || undefined;
  const userInitial = userProfile?.displayName?.charAt(0) || user?.displayName?.charAt(0) || "م";

  return (
    <div className={cn(
      "flex w-full group animate-fade-in-up overflow-hidden mb-6",
      isAI ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "relative flex flex-col gap-2 w-full max-w-[95%] md:max-w-[85%] min-w-0",
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
          "px-4 md:px-6 py-4 md:py-5 shadow-sm transition-all duration-300 w-full overflow-hidden min-w-0",
          isAI ? "chat-bubble-ai" : "chat-bubble-user"
        )}>
          <div className="prose prose-stone dark:prose-invert max-w-full overflow-x-auto no-scrollbar break-words">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p({ children }) {
                  // استخدام div بدلاً من p لتجنب مشاكل التداخل البرمجي
                  return <div className="mb-4 last:mb-0 leading-relaxed text-base md:text-lg font-medium break-words">{children}</div>;
                },
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeContent = String(children).replace(/\n$/, '');
                  
                  if (codeContent === "undefined" || !codeContent) return null;

                  return !inline ? (
                    <div className="my-4 rounded-xl overflow-hidden bg-secondary border border-white/5 shadow-xl w-full max-w-full" dir="ltr">
                      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                        <span className="text-[9px] font-black opacity-60 uppercase tracking-widest text-white">
                          {match ? match[1] : 'Code'}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 hover:bg-white/10 text-white/70 rounded-lg"
                          onClick={() => copyToClipboard(codeContent)}
                        >
                          {copied ? <Check className="h-2.5 w-2.5 text-green-400" /> : <Copy className="h-2.5 w-2.5" />}
                        </Button>
                      </div>
                      <div className="overflow-x-auto no-scrollbar bg-[#1e1e1e] w-full">
                        <pre className="p-4 font-code text-[12px] md:text-sm leading-normal text-amber-50 min-w-full whitespace-pre">
                          <code>{children}</code>
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold text-xs md:text-sm break-all" {...props}>
                      {children}
                    </code>
                  );
                },
                table({ children }) {
                  return (
                    <div className="my-6 w-full overflow-x-auto no-scrollbar rounded-xl border border-primary/10 bg-card shadow-lg">
                      <table className="min-w-full divide-y divide-primary/10 border-collapse">
                        {children}
                      </table>
                    </div>
                  );
                },
                thead({ children }) {
                  return <thead className="bg-primary/5">{children}</thead>;
                },
                th({ children }) {
                  return <th className="px-3 md:px-4 py-3 text-start text-[11px] md:text-xs font-black text-primary uppercase tracking-wider border-b border-primary/10 whitespace-nowrap">{children}</th>;
                },
                td({ children }) {
                  return <td className="px-3 md:px-4 py-3 text-[12px] md:text-sm font-medium border-b border-primary/5 whitespace-nowrap">{children}</td>;
                }
              }}
            >
              {message.content || ""}
            </ReactMarkdown>
          </div>

          {message.type === 'image' && message.metadata?.mediaUrl && (
            <div className="mt-4 w-full">
               <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-primary/5 shadow-xl">
                  <Image 
                    src={message.metadata.mediaUrl} 
                    alt="Hassani Media" 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}