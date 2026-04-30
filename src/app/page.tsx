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
import { Code2, Lightbulb, Menu, Layout, Rocket } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { intelligentConversationalAi } from '@/ai/flows/intelligent-conversational-ai';
import { Message, MessageType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';

export default function HassaniApp() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
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
  const [displayText, setDisplayText] = useState("");
  const [profile, setProfile] = useState<{ displayName?: string, photoURL?: string } | null>(null);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedLang = localStorage.getItem('lang') as 'ar' | 'en' || 'ar';
    setLang(savedLang);
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang;
  }, []);

  const MARKETING_PHRASES = lang === 'ar' ? [
    "يلا نبدأ الإبداع.. أنا جاهز لمساعدتك",
    "لنبتكر شيئاً مذهلاً اليوم",
    "دعنا نحول أفكارك إلى واقع ملموس",
    "حساني شريكك الذكي في كل خطوة",
    "هل أنت مستعد لتحدي برمجـي جديد؟"
  ] : [
    "Let's start creating.. I'm ready to help",
    "Let's innovate something amazing today",
    "Let's turn your ideas into reality",
    "Hassani, your smart partner in every step",
    "Ready for a new coding challenge?"
  ];

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) setProfile(doc.data());
      });
      return () => unsubscribe();
    }
  }, [user, db]);

  useEffect(() => {
    let currentText = "";
    let i = 0;
    const fullText = MARKETING_PHRASES[phraseIndex];
    setDisplayText("");
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        currentText += fullText.charAt(i);
        setDisplayText(currentText);
        i++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setPhraseIndex((prev) => (prev + 1) % MARKETING_PHRASES.length);
        }, 3000);
      }
    }, 60);
    return () => clearInterval(typingInterval);
  }, [phraseIndex, lang]);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [currentConversation?.messages, isLoading]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({ variant: 'destructive', title: "Error", description: error.message });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      toast({ variant: 'destructive', title: "Logout Error" });
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
      toast({ variant: 'destructive', title: "Error", description: "Connection failed." });
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
               <Image src="/logo-hassani.png" alt="Hassani" fill className="object-cover" onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/hassani/200/200"; }} />
            </div>
            <h1 className="text-7xl font-black text-foreground tracking-tighter">{lang === 'ar' ? 'حساني' : 'Hassani'}</h1>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed">
              {lang === 'ar' ? 'رفيقك الذكي الذي يفهمكم ويبتكر معكم في كل خطوة' : 'Your smart companion that understands and innovates with you.'}
            </p>
          </div>
          <Button onClick={handleLogin} className="w-full h-16 rounded-2xl luxury-gradient text-white font-bold text-xl shadow-2xl transition-all active:scale-95">
            {lang === 'ar' ? 'ابدأ رحلتك الآن' : 'Start Your Journey'}
          </Button>
        </div>
      </div>
    );
  }

  const userName = profile?.displayName || user.displayName?.split(' ')[0] || (lang === 'ar' ? "مستخدم" : "User");

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex w-full h-svh bg-background overflow-hidden relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
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
          lang={lang}
        />
        
        <SidebarInset className="flex flex-col h-full w-full relative overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <header className="h-16 flex items-center justify-between px-5 glass-morphism sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl shadow-lg border border-primary/10">
                <Image src="/logo-hassani.png" alt="Hassani" fill className="object-cover" onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/hassani/40/40"; }} />
              </div>
              <h1 className="text-xl font-black text-foreground tracking-tight">{lang === 'ar' ? 'حساني' : 'Hassani'}</h1>
            </div>
            <SidebarTrigger className="h-10 w-10 hover:bg-primary/5 rounded-xl text-primary transition-colors">
               <Menu className="h-6 w-6" />
            </SidebarTrigger>
          </header>

          <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.04),transparent)]">
            <ScrollArea ref={scrollRef} className="flex-1">
              <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
                {(!currentConversation || currentConversation.messages.length === 0) ? (
                  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 animate-fade-in-up">
                    <div className="h-32 w-32 bg-card rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden border border-primary/10 relative">
                      <Image src="/logo-hassani.png" alt="Hassani" fill className="object-cover" onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/hassani/128/128"; }} />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-5xl font-black text-center text-foreground">
                        {lang === 'ar' ? `أهلاً ${userName}` : `Hello ${userName}`}
                      </h2>
                      <p className="text-muted-foreground font-bold text-xl min-h-[1.5em] flex items-center justify-center">
                        {displayText}<span className="w-1 h-6 bg-primary ml-1 animate-pulse shrink-0"></span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-2">
                      {[
                        { text: lang === 'ar' ? "حل مشكلة برمجية" : "Solve Code Problem", icon: <Code2 className="h-4 w-4" />, color: "text-emerald-500" },
                        { text: lang === 'ar' ? "توليد فكرة إبداعية" : "Generate Idea", icon: <Lightbulb className="h-4 w-4" />, color: "text-amber-500" },
                        { text: lang === 'ar' ? "إنشاء مخططات" : "Create Diagrams", icon: <Layout className="h-4 w-4" />, color: "text-indigo-500" },
                        { text: lang === 'ar' ? "تخطيط قواعد بيانات" : "DB Planning", icon: <Rocket className="h-4 w-4" />, color: "text-rose-500" },
                      ].map((item) => (
                        <Button 
                          key={item.text} 
                          variant="outline" 
                          className="h-16 rounded-2xl border-primary/10 hover:bg-primary/5 flex flex-row items-center gap-4 px-5 shadow-sm group" 
                          onClick={() => handleSendMessage(item.text)}
                        >
                          <div className={`h-10 w-10 rounded-xl bg-current/10 flex items-center justify-center shrink-0 group-hover:scale-110 ${item.color}`}>
                            {item.icon}
                          </div>
                          <span className="font-bold text-foreground text-sm">{item.text}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  currentConversation.messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
                )}
                {isLoading && (
                  <div className="flex justify-start items-center gap-3">
                    <div className="bg-card px-6 py-4 rounded-3xl rounded-tr-sm border border-primary/10 flex items-center gap-3 shadow-sm animate-pulse">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                      <span className="text-xs text-muted-foreground font-bold italic">{lang === 'ar' ? 'حساني يفكر...' : 'Hassani thinking...'}</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <ChatInput onSend={handleSendMessage} disabled={isLoading} lang={lang} />
          </div>
        </SidebarInset>
        <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      </div>
    </SidebarProvider>
  );
}
