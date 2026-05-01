
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
        "relative flex flex-col gap-3 max-w-[96%] md:max-w-[85%]",
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
          {/* عرض المحتوى الأساسي باستخدام Markdown - يدعم النصوص والأكواد والجداول في رسالة واحدة */}
          <div className="prose prose-stone dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-lg prose-p:font-medium prose-strong:font-black prose-headings:font-black prose-table:my-6 prose-table:border-collapse prose-table:rounded-xl prose-table:overflow-hidden">
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
                          {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
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
                    <div className="overflow-x-auto my-6 rounded-2xl border border-primary/10 bg-card shadow-lg">
                      <table className="min-w-full divide-y divide-primary/10">
                        {children}
                      </table>
                    </div>
                  );
                },
                thead({ children }) {
                  return <thead className="bg-primary/5">{children}</thead>;
                },
                th({ children }) {
                  return <th className="px-4 py-3 text-start text-sm font-black text-primary uppercase tracking-wider border-b border-primary/10">{children}</th>;
                },
                td({ children }) {
                  return <td className="px-4 py-3 text-sm font-medium border-b border-primary/5">{children}</td>;
                }
              }}
            >
              {message.content || ""}
            </ReactMarkdown>
          </div>

          {/* عرض الصورة إذا كانت موجودة */}
          {message.type === 'image' && message.metadata?.mediaUrl && (
            <div className="mt-4 space-y-4">
               <div className="relative aspect-square w-full min-w-[280px] rounded-2xl overflow-hidden border border-primary/5 shadow-2xl">
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
