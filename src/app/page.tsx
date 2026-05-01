
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
import { 
  Code2, 
  Lightbulb, 
  Menu, 
  Rocket, 
  Brain, 
  ImageIcon, 
  Music,
  Users,
  Database,
  GitBranch
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { intelligentConversationalAi } from '@/ai/flows/intelligent-conversational-ai';
import { automaticIntentRouting } from '@/ai/flows/automatic-intent-routing';
import { aiCodeAssistance } from '@/ai/flows/ai-code-assistance-flow';
import { generateDiagram } from '@/ai/flows/ai-diagram-generation-flow';
import { aiImageCreation } from '@/ai/flows/ai-image-creation-flow';
import { aiPlanning } from '@/ai/flows/ai-planning-flow';
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

  const handleSendMessage = (text: string, type: MessageType = 'text', file: File | null = null) => {
    if (!currentId) {
      const newId = createNewConversation();
      if (newId) {
        processMessage(newId, text, type, file);
      }
    } else {
      processMessage(currentId, text, type, file);
    }
  };

  const processMessage = async (convId: string, text: string, type: MessageType, file: File | null) => {
    let imageBase64 = "";
    if (file) {
      const reader = new FileReader();
      imageBase64 = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string || "");
        reader.readAsDataURL(file);
      });
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text || "",
      type: file ? 'image' : type,
      timestamp: Date.now(),
      metadata: file ? { mediaUrl: imageBase64 } : {}
    };

    addMessage(convId, userMsg);
    setIsLoading(true);

    try {
      let intent = type;
      if (type === 'text') {
        const routeResult = await automaticIntentRouting({ query: text });
        const detectedIntent = routeResult?.intent || 'question';
        intent = detectedIntent === 'programming' ? 'code' : detectedIntent as MessageType;
      }

      const history = currentConversation?.messages?.map(m => ({
        role: m.role,
        content: m.content || ""
      })) || [];

      let aiResponse: string = "";
      let aiMetadata: any = {};
      let finalType: MessageType = 'text';

      switch (intent) {
        case 'code':
          const codeResult = await aiCodeAssistance({ codeRequest: text });
          const codeSnippet = codeResult?.code || "";
          const expl = codeResult?.explanation || "";
          // دمج الشرح والكود في رسالة واحدة باستخدام Markdown
          aiResponse = `${expl}\n\n\`\`\`\n${codeSnippet}\n\`\`\``;
          aiMetadata = { 
            code: codeSnippet, 
            explanation: expl 
          };
          finalType = 'code';
          break;
        case 'image':
          const imageResult = await aiImageCreation({ prompt: text });
          aiResponse = lang === 'ar' ? "تفضل، لقد قمت بإنشاء هذه الصورة لك بناءً على طلبك:" : "Here is the image I created for you based on your request:";
          aiMetadata = { mediaUrl: imageResult?.media || "" };
          finalType = 'image';
          break;
        case 'diagram':
          let dType = 'useCase';
          const lowerText = text.toLowerCase();
          if (lowerText.includes('erd') || lowerText.includes('قواعد')) dType = 'erd';
          else if (lowerText.includes('dfd') || lowerText.includes('تدفق بيانات')) dType = 'dfd';
          
          const diagramResult = await generateDiagram({ description: text, diagramType: dType });
          const syntax = diagramResult?.diagramSyntax || "";
          const diagramExpl = diagramResult?.diagramExplanation || "";
          // دمج شرح المخطط والكود البرمجي له في رسالة واحدة
          aiResponse = `${diagramExpl}\n\n\`\`\`mermaid\n${syntax}\n\`\`\``;
          aiMetadata = { 
            diagramSyntax: syntax, 
            diagramExplanation: diagramExpl 
          };
          finalType = 'diagram';
          break;
        case 'planning':
          const planningResult = await aiPlanning({ request: text });
          aiResponse = planningResult?.plan || (lang === 'ar' ? "إليك الخطة المقترحة" : "Here is the proposed plan");
          finalType = 'planning';
          break;
        default:
          const chatResult = await intelligentConversationalAi({ 
            query: text,
            history: history,
            imageHeader: imageBase64 || undefined
          });
          aiResponse = chatResult?.response || (lang === 'ar' ? "عذراً، لم أتمكن من معالجة الطلب." : "Sorry, I couldn't process the request.");
      }

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse || "",
        type: finalType,
        timestamp: Date.now(),
        metadata: aiMetadata
      };

      addMessage(convId, aiMsg);
    } catch (err: any) {
      toast({ 
        variant: 'destructive', 
        title: lang === 'ar' ? "خطأ في الاتصال" : "Connection Error", 
        description: err.message 
      });
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
            <div className="relative h-20 w-20 shadow-2xl rounded-full overflow-hidden mb-4 border border-primary/10">
               <Image src="/logo-hassani.png" alt="Hassani" fill className="object-cover" />
            </div>
            <h1 className="text-5xl font-black text-foreground tracking-tighter dark:text-foreground">{lang === 'ar' ? 'حساني' : 'Hassani'}</h1>
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

  const quickActions = [
    { text: lang === 'ar' ? "حل مشكلة برمجية" : "Solve Code Problem", icon: <Code2 className="h-4 w-4" />, color: "text-emerald-500", type: 'code' },
    { text: lang === 'ar' ? "تخطيط قواعد البيانات" : "DB Planning", icon: <Rocket className="h-4 w-4" />, color: "text-rose-500", type: 'planning' },
    { text: lang === 'ar' ? "توليد فكرة إبداعية" : "Generate Creative Idea", icon: <Lightbulb className="h-4 w-4" />, color: "text-amber-500", type: 'text' },
    { text: lang === 'ar' ? "تحليل نظام شامل" : "Comprehensive System Analysis", icon: <Brain className="h-4 w-4" />, color: "text-blue-500", type: 'planning' },
    { text: lang === 'ar' ? "إنشاء مخطط Use Case" : "Create UseCase Diagram", icon: <Users className="h-4 w-4" />, color: "text-indigo-500", type: 'diagram' },
    { text: lang === 'ar' ? "إنشاء مخطط ERD" : "Create ERD Diagram", icon: <Database className="h-4 w-4" />, color: "text-purple-500", type: 'diagram' },
    { text: lang === 'ar' ? "إنشاء مخطط DFD" : "Create DFD Diagram", icon: <GitBranch className="h-4 w-4" />, color: "text-cyan-500", type: 'diagram' },
    { text: lang === 'ar' ? "توليد صور" : "Generate Images", icon: <ImageIcon className="h-4 w-4" />, color: "text-pink-500", type: 'image' },
    { text: lang === 'ar' ? "توليد موسيقى" : "Generate Music", icon: <Music className="h-4 w-4" />, color: "text-orange-500", type: 'music' },
  ];

  const showGreeting = !currentId && !isLoading;

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
          <header className="h-14 flex items-center justify-between px-5 glass-morphism sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative h-6 w-6 overflow-hidden rounded-full shadow-lg border border-primary/10">
                <Image src="/logo-hassani.png" alt="Hassani" fill className="object-cover" />
              </div>
              <h1 className="text-base font-black text-foreground tracking-tight dark:text-foreground">{lang === 'ar' ? 'حساني' : 'Hassani'}</h1>
            </div>
            <SidebarTrigger className="h-9 w-9 hover:bg-primary/5 rounded-xl text-primary transition-colors">
               <Menu className="h-5 w-5" />
            </SidebarTrigger>
          </header>

          <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.04),transparent)]">
            <ScrollArea ref={scrollRef} className="flex-1">
              <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
                {showGreeting ? (
                  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-fade-in-up">
                    <div className="h-16 w-16 bg-card rounded-full flex items-center justify-center shadow-2xl overflow-hidden border border-primary/10 relative">
                      <Image src="/logo-hassani.png" alt="Hassani" fill className="object-cover" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-3xl font-black text-center text-foreground dark:text-white">
                        {lang === 'ar' ? `أهلاً ${userName}` : `Hello ${userName}`}
                      </h2>
                      <p className="text-muted-foreground font-bold text-lg min-h-[1.5em] flex items-center justify-center">
                        {displayText}<span className="w-1 h-5 bg-primary ml-1 animate-pulse shrink-0"></span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                      {quickActions.map((item) => (
                        <Button 
                          key={item.text} 
                          variant="outline" 
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                          className="h-14 rounded-2xl border-primary/10 hover:bg-primary/5 flex items-center justify-between px-4 shadow-sm group overflow-hidden bg-card/50 backdrop-blur-sm" 
                          onClick={() => handleSendMessage(item.text, item.type as MessageType)}
                        >
                          <span className="font-bold text-foreground dark:text-white text-sm truncate">{item.text}</span>
                          <div className={`h-8 w-8 rounded-lg bg-current/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${item.color}`}>
                            {item.icon}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {currentConversation?.messages?.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isLoading && (
                      <div className="flex justify-start items-center gap-3 animate-fade-in">
                        <div className="bg-card px-6 py-4 rounded-3xl rounded-tr-sm border border-primary/10 flex items-center gap-3 shadow-sm animate-pulse">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          </div>
                          <span className="text-xs text-muted-foreground font-bold italic">{lang === 'ar' ? 'حساني يفكر...' : 'Hassani thinking...'}</span>
                        </div>
                      </div>
                    )}
                  </>
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
