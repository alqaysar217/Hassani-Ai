
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
import { Menu, LogIn, ShieldCheck, Sparkles, Globe, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { intelligentConversationalAi } from '@/ai/flows/intelligent-conversational-ai';
import { Message, MessageType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [authError, setAuthError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في عالم حساني الذكي!"
      });
    } catch (error: any) {
      console.error("Auth Error:", error);
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        return;
      }
      
      const currentDomain = window.location.hostname;
      if (error.code === 'auth/unauthorized-domain') {
        setAuthError(currentDomain);
      } else {
        toast({
          variant: 'destructive',
          title: "خطأ في تسجيل الدخول",
          description: error.message || "حدث خطأ غير متوقع.",
        });
      }
    }
  };

  const handleSendMessage = async (text: string, type: MessageType = 'text', file: File | null = null) => {
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
      toast({
        variant: 'destructive',
        title: "خطأ في الرد",
        description: "تعذر الاتصال بمحرك OpenRouter."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="h-svh w-full flex flex-col items-center justify-center bg-background space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-secondary">جاري التحقق...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-svh w-full flex flex-col items-center justify-center bg-background px-6" dir="rtl">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-secondary tracking-tight">حساني الذكي</h1>
            <p className="text-muted-foreground font-medium text-lg">مساعدك المتطور بمحرك OpenRouter</p>
          </div>
          
          {authError && (
            <Alert variant="destructive" className="text-right border-2 animate-fade-in">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-bold">تنبيه: يجب إتمام الخطوة الأخيرة</AlertTitle>
              <AlertDescription className="space-y-3 mt-2">
                <p className="text-sm">بما أنك أضفت النطاق في Firebase، جرب الآن الضغط على "ابدأ الآن" مرة أخرى. إذا استمر الخطأ، تأكد من إضافة هذا الرابط بالضبط:</p>
                <div className="flex items-center gap-2 bg-white/20 p-2 rounded-lg font-mono text-xs overflow-hidden">
                  <span className="truncate flex-1">{authError}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-white/30"
                    onClick={() => {
                      navigator.clipboard.writeText(authError);
                      toast({ title: "تم نسخ الرابط" });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] opacity-80 leading-relaxed">
                  اذهب إلى: Authentication {"→"} Settings {"→"} Authorized domains {"→"} Add domain
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Button 
              onClick={handleLogin}
              className="w-full h-16 rounded-2xl luxury-gradient text-white font-bold text-xl shadow-2xl flex items-center justify-center gap-4 group transition-all active:scale-95"
            >
              <LogIn className="h-6 w-6" />
              ابدأ الآن مع Google
            </Button>
            <p className="text-xs text-muted-foreground">بالدخول أنت توافق على شروط استخدام حساني الذكي</p>
          </div>
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
        />
        
        <SidebarInset className="flex flex-col h-full w-full relative overflow-hidden">
          <header className="h-16 flex items-center justify-between px-5 glass-morphism sticky top-0 z-30 shrink-0 border-b border-primary/5">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <h1 className="text-lg font-extrabold text-secondary">حساني الذكي</h1>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">OpenRouter Active</span>
                </div>
              </div>
            </div>

            <SidebarTrigger className="h-10 w-10 hover:bg-primary/5 rounded-xl text-primary">
               <Menu className="h-6 w-6" />
            </SidebarTrigger>
          </header>

          <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.05),transparent)]">
            <ScrollArea ref={scrollRef} className="flex-1">
              <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
                {(!currentConversation || currentConversation.messages.length === 0) ? (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                    <div className="p-6 bg-primary/5 rounded-full relative">
                       <CheckCircle2 className="h-16 w-16 text-primary" />
                       <div className="absolute -top-1 -right-1 bg-green-500 text-white p-1 rounded-full shadow-lg">
                          <Sparkles className="h-4 w-4" />
                       </div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-extrabold text-secondary">أهلاً بك يا {user.displayName?.split(' ')[0]}</h2>
                      <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                        أنا جاهز لمساعدتك الآن عبر محرك OpenRouter. يمكنك سؤالي عن أي شيء أو إرسال صورة لتحليلها.
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                       {["كيف أبدأ؟", "حل لي هذه المعادلة", "حلل هذه الصورة"].map((hint) => (
                         <Button key={hint} variant="outline" className="rounded-full text-xs font-bold border-primary/20 hover:bg-primary/5" onClick={() => handleSendMessage(hint)}>
                           {hint}
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
                    <div className="bg-white px-5 py-3 rounded-2xl rounded-tr-sm border border-primary/10 flex items-center gap-2 shadow-sm">
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
