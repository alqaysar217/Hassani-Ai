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
import { Menu, LogIn, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { intelligentConversationalAi } from '@/ai/flows/intelligent-conversational-ai';
import { Message, MessageType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

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
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في عالم حساني الذكي!"
      });
    } catch (error: any) {
      console.error("Login Error Details:", error);
      
      let errorMsg = "حدث خطأ غير متوقع.";
      if (error.code === 'auth/operation-not-allowed') {
        errorMsg = "يجب تفعيل 'Google' في إعدادات Firebase Console -> Authentication.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMsg = "تم إغلاق النافذة قبل إتمام الدخول.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMsg = "هذا النطاق غير مصرح له بتسجيل الدخول في إعدادات Firebase.";
      }

      toast({
        variant: 'destructive',
        title: "خطأ في تسجيل الدخول",
        description: errorMsg
      });
    }
  };

  if (userLoading) {
    return (
      <div className="h-svh w-full flex flex-col items-center justify-center bg-background space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-secondary">جاري التحقق من الهوية...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-svh w-full flex flex-col items-center justify-center bg-background px-6">
        <div className="max-w-md w-full space-y-12 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-secondary tracking-tight">حساني الذكي</h1>
            <p className="text-muted-foreground font-medium text-lg">مساعدك المتطور بمحرك OpenRouter</p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={handleLogin}
              className="w-full h-16 rounded-2xl luxury-gradient text-white font-bold text-xl shadow-2xl flex items-center justify-center gap-4 group transition-all active:scale-95"
            >
              <LogIn className="h-6 w-6" />
              ابدأ الآن مع Google
            </Button>
            
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 text-right">
              <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold">
                <AlertTriangle className="h-5 w-5" />
                <span>خطوات تفعيل الدخول:</span>
              </div>
              <ol className="text-sm text-amber-800 list-decimal list-inside space-y-1">
                <li>اذهب إلى <a href="https://console.firebase.google.com" target="_blank" className="underline font-bold">Firebase Console</a></li>
                <li>اختر <b>Authentication</b> ثم <b>Sign-in method</b></li>
                <li>اضغط <b>Add new provider</b> واختر <b>Google</b></li>
                <li>قم بتفعيله (Enable) وحفظ الإعدادات.</li>
              </ol>
            </div>
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
                <h1 className="text-lg font-extrabold text-secondary">حساني (OpenRouter Mode)</h1>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">المحرك نشط</span>
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
                    <div className="p-6 bg-primary/5 rounded-full">
                       <ShieldCheck className="h-16 w-16 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-extrabold text-secondary">جاهز لخدمتك يا {user.displayName?.split(' ')[0]}</h2>
                      <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                        أنا أعمل الآن باستخدام محرك Gemini 2.0 عبر OpenRouter لضمان أفضل استجابة.
                      </p>
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
