
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/use-chat';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessage } from '@/components/chat/chat-message';
import { ChatSidebar } from '@/components/chat/sidebar';
import { SettingsDialog } from '@/components/chat/settings-dialog';
import { 
  SidebarProvider, 
  SidebarTrigger, 
  SidebarInset, 
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Lightbulb, Code2, Rocket, MoreVertical, Layout, Music } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { intelligentConversationalAi } from '@/ai/flows/intelligent-conversational-ai';
import { Message, MessageType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import Image from 'next/image';

const MARKETING_PHRASES = [
  "يلا نبدأ الإبداع.. أنا جاهز لمساعدتك",
  "لنبتكر شيئاً مذهلاً اليوم",
  "دعنا نحول أفكارك إلى واقع ملموس",
  "حساني شريكك الذكي في كل خطوة",
  "هل أنت مستعد لتحدي برمجـي جديد؟"
];

export default function HassaniApp() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const { 
    conversations, 
    currentId, 
    setCurrentId, 
    currentConversation, 
    createNewConversation, 
    addMessage,
    deleteConversation,
    renameConversation
  } = useChat();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // تأثير تبديل العبارات التسويقية
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % MARKETING_PHRASES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [currentConversation?.messages, isLoading]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "مرحباً بك في حساني" });
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({ variant: 'destructive', title: "خطأ في تسجيل الدخول", description: error.message });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "تم تسجيل الخروج" });
    } catch (error) {
      toast({ variant: 'destructive', title: "خطأ في تسجيل الخروج" });
    }
  };

  const handleSendMessage = async (text: string, type: MessageType = 'text', file: File | null = null) => {
    if (!currentId) {
      const newId = createNewConversation();
      if (newId) processMessage(newId, text, type, file);
    } else {
      processMessage(currentId, text, type, file);
    }
  };

  const processMessage = async (convId: string, text: string, type: MessageType, file: File | null) => {
    let imageBase64 = "";
    if (file) {
      const reader = new FileReader();
      imageBase64 = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      type: file ? 'image' : 'text',
      timestamp: Date.now(),
      metadata: file ? { mediaUrl: imageBase64 } : {}
    };

    addMessage(convId, userMsg);
    setIsLoading(true);

    try {
      const { response } = await intelligentConversationalAi({ 
        query: text,
        imageHeader: imageBase64 || undefined
      });

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        type: 'text',
        timestamp: Date.now()
      };

      addMessage(convId, aiMsg);
    } catch (err: any) {
      toast({ variant: 'destructive', title: "خطأ في الرد", description: "تعذر الاتصال بالمحرك." });
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="h-svh w-full flex flex-col items-center justify-center bg-background">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-svh w-full flex flex-col items-center justify-center bg-background px-6">
        <div className="max-w-md w-full space-y-10 text-center">
          <div className="space-y-6 animate-fade-in flex flex-col items-center">
            <div className="relative h-32 w-32 shadow-2xl rounded-3xl overflow-hidden mb-4 border-2 border-primary/10">
               <Image 
                src="/logo-hassani.png" 
                alt="حساني" 
                fill 
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://picsum.photos/seed/hassani/200/200";
                }}
              />
            </div>
            <h1 className="text-7xl font-black text-secondary tracking-tighter">حساني</h1>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed">رفيقك الذكي الذي يفهمكم ويبتكر معكم في كل خطوة</p>
          </div>
          <Button 
            onClick={handleLogin}
            className="w-full h-16 rounded-2xl luxury-gradient text-white font-bold text-xl shadow-2xl transition-all active:scale-95"
          >
            ابدأ رحلتك الآن
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex w-full h-svh bg-background overflow-hidden relative" dir="rtl">
        <ChatSidebar 
          conversations={conversations}
          currentId={currentId}
          onSelect={setCurrentId}
          onNew={createNewConversation}
          onDelete={deleteConversation}
          onRename={renameConversation}
          onOpenSettings={() => setIsSettingsOpen(true)}
          user={user}
          onLogout={handleLogout}
        />
        
        <SidebarInset className="flex flex-col h-full w-full relative overflow-hidden">
          <header className="h-16 flex items-center justify-between px-5 glass-morphism sticky top-0 z-30 shrink-0 border-b border-primary/5">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl shadow-lg border border-primary/10">
                <Image 
                  src="/logo-hassani.png" 
                  alt="حساني" 
                  fill 
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://picsum.photos/seed/hassani/40/40";
                  }}
                />
              </div>
              <h1 className="text-xl font-black text-secondary tracking-tight">حساني</h1>
            </div>

            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-10 w-10 hover:bg-primary/5 rounded-xl text-primary transition-colors">
                 <MoreVertical className="h-6 w-6" />
              </SidebarTrigger>
            </div>
          </header>

          <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.04),transparent)]">
            <ScrollArea ref={scrollRef} className="flex-1">
              <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
                {(!currentConversation || currentConversation.messages.length === 0) ? (
                  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 animate-fade-in-up">
                    <div className="relative group">
                      <div className="h-32 w-32 bg-white rounded-3xl flex items-center justify-center transform group-hover:rotate-6 transition-transform shadow-2xl overflow-hidden border border-primary/10">
                        <Image 
                          src="/logo-hassani.png" 
                          alt="حساني" 
                          fill 
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://picsum.photos/seed/hassani/128/128";
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-5xl font-black text-secondary flex items-center justify-center gap-2 flex-wrap">
                        <span>أهلاً</span>
                        <span className="text-primary">{user.displayName?.split(' ')[0]}</span>
                      </h2>
                      <div className="h-8 overflow-hidden">
                        <p className="text-muted-foreground font-bold text-xl transition-all duration-500 animate-fade-in" key={phraseIndex}>
                          {MARKETING_PHRASES[phraseIndex]}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-2">
                      {[
                        { text: "حل مشكلة برمجية معقدة", icon: <Code2 className="h-4 w-4" />, color: "text-emerald-500" },
                        { text: "توليد فكرة إبداعية لمشروع", icon: <Lightbulb className="h-4 w-4" />, color: "text-amber-500" },
                        { text: "إنشاء مخططات احترافية", icon: <Layout className="h-4 w-4" />, color: "text-indigo-500" },
                        { text: "تخطيط قواعد البيانات", icon: <Rocket className="h-4 w-4" />, color: "text-rose-500" },
                        { text: "ألحان وصوتيات ذكية", icon: <Music className="h-4 w-4" />, color: "text-purple-500" },
                        { text: "تحليل صورة أو بيانات", icon: <Brain className="h-4 w-4" />, color: "text-blue-500" }
                      ].map((item) => (
                        <Button 
                          key={item.text} 
                          variant="outline" 
                          className="h-16 rounded-2xl border-primary/10 hover:bg-primary/5 hover:border-primary/30 flex flex-row items-center justify-start gap-4 px-5 transition-all shadow-sm group"
                          onClick={() => handleSendMessage(item.text)}
                        >
                          <div className={`h-10 w-10 rounded-xl bg-current/10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${item.color}`}>
                            {item.icon}
                          </div>
                          <span className="font-bold text-secondary text-sm flex-1 text-right">{item.text}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  currentConversation.messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start items-center gap-3">
                    <div className="bg-white px-6 py-4 rounded-3xl rounded-tr-sm border border-primary/10 flex items-center gap-3 shadow-sm animate-pulse">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                      <span className="text-xs text-muted-foreground font-bold italic">حساني يفكر...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
          </div>
        </SidebarInset>

        <SettingsDialog 
          open={isSettingsOpen} 
          onOpenChange={setIsSettingsOpen} 
        />
      </div>
    </SidebarProvider>
  );
}
