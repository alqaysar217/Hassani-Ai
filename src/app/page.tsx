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
import { Menu, LogIn } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { automaticIntentRouting } from '@/ai/flows/automatic-intent-routing';
import { intelligentConversationalAi } from '@/ai/flows/intelligent-conversational-ai';
import { aiImageCreation } from '@/ai/flows/ai-image-creation-flow';
import { aiCodeAssistance } from '@/ai/flows/ai-code-assistance-flow';
import { generateDiagram } from '@/ai/flows/ai-diagram-generation-flow';
import { Message, MessageType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import Image from 'next/image';

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
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: "خطأ في تسجيل الدخول",
        description: "تعذر الاتصال بخدمات Google."
      });
    }
  };

  const handleSendMessage = async (text: string, selectedMode?: MessageType) => {
    if (!text.trim()) return;

    let activeId = currentId;
    if (!activeId) {
      activeId = createNewConversation();
    }

    if (!activeId) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      type: 'text',
      timestamp: Date.now()
    };

    addMessage(activeId, userMsg);
    setIsLoading(true);

    try {
      let intent: string = selectedMode || 'text';
      if (!selectedMode || selectedMode === 'text') {
        const res = await automaticIntentRouting({ query: text });
        intent = res.intent;
      }
      
      let aiResponse = "";
      let msgType: MessageType = 'text';
      let metadata = {};

      switch (intent) {
        case 'image':
          const imgRes = await aiImageCreation({ prompt: text });
          aiResponse = `تم إنشاء الصورة لـ: "${text}"`;
          msgType = 'image';
          metadata = { mediaUrl: imgRes.media };
          break;
        case 'programming':
          const codeRes = await aiCodeAssistance({ codeRequest: text });
          aiResponse = codeRes.explanation;
          msgType = 'code';
          metadata = { code: codeRes.code, explanation: codeRes.explanation };
          break;
        case 'diagram':
          const diagramRes = await generateDiagram({ description: text, diagramType: 'erd' });
          aiResponse = diagramRes.diagramExplanation || "هيكل المخطط جاهز.";
          msgType = 'diagram';
          metadata = { 
            diagramSyntax: diagramRes.diagramSyntax, 
            diagramExplanation: diagramRes.diagramExplanation 
          };
          break;
        default:
          const chatRes = await intelligentConversationalAi({ query: text });
          aiResponse = chatRes.response;
          msgType = 'text';
          break;
      }

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        type: msgType,
        timestamp: Date.now(),
        metadata
      };

      addMessage(activeId, aiMsg);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: "خطأ في المساعد",
        description: error.message || "يرجى التحقق من الاتصال والمحاولة مرة أخرى."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="h-svh w-full flex flex-col items-center justify-center bg-background space-y-6">
        <div className="relative h-24 w-24 rounded-[10px] overflow-hidden">
          <Image src="/logo-hassani.png" alt="Logo" fill className="object-contain animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-bold text-secondary">جاري التحميل...</h2>
          <div className="h-1 w-32 bg-primary/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[loading_1.5s_infinite_ease-in-out]" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-svh w-full flex flex-col items-center justify-center bg-background px-6">
        <div className="max-w-md w-full space-y-12 text-center">
          <div className="space-y-6">
            <div className="relative h-32 w-32 mx-auto rounded-[10px] overflow-hidden">
              <Image src="/logo-hassani.png" alt="Logo" fill className="object-contain" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-secondary tracking-tight">مرحباً بك في حساني</h1>
              <p className="text-muted-foreground font-medium text-lg">مساعدك الذكي الفاخر لإنجاز المهام</p>
            </div>
          </div>
          
          <Button 
            onClick={handleLogin}
            className="w-full h-16 rounded-[10px] luxury-gradient text-white font-bold text-xl shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 group transition-all active:scale-95"
          >
            <LogIn className="h-6 w-6 group-hover:translate-x-[-4px] transition-transform" />
            ابدأ الآن مع Google
          </Button>
          
          <p className="text-xs text-muted-foreground opacity-60">
            بتسجيل دخولك، أنت توافق على شروط الاستخدام وسياسة الخصوصية
          </p>
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
              <div className="relative h-10 w-10 rounded-[10px] overflow-hidden">
                <Image src="/logo-hassani.png" alt="Hassani Logo" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-extrabold tracking-tight text-secondary">حساني الذكي</h1>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">نشط الآن</span>
                </div>
              </div>
            </div>

            <SidebarTrigger className="h-10 w-10 hover:bg-primary/5 rounded-[10px] text-primary transition-transform active:scale-90">
               <Menu className="h-6 w-6" />
            </SidebarTrigger>
          </header>

          <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.05),transparent)]">
            <ScrollArea ref={scrollRef} className="flex-1">
              <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
                {(!currentConversation || currentConversation.messages.length === 0) ? (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 space-y-8">
                    <div className="relative">
                      <div className="relative h-32 w-32 mx-auto drop-shadow-2xl rounded-[10px] overflow-hidden">
                        <Image src="/logo-hassani.png" alt="Hassani AI" fill className="object-contain" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-white border-4 border-background flex items-center justify-center shadow-xl">
                        <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-4xl font-extrabold tracking-tight text-secondary">أهلاً بك، أنا حساني</h2>
                      <p className="text-muted-foreground leading-relaxed max-w-[300px] mx-auto text-lg font-medium">
                        شريكك الذكي للإبداع، البرمجة، والتخطيط المستقبلي.
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
                    <div className="h-9 w-9 relative flex items-center justify-center rounded-[10px] overflow-hidden">
                      <Image src="/logo-hassani.png" alt="Thinking" fill className="object-contain opacity-50 animate-pulse" />
                    </div>
                    <div className="bg-white px-5 py-3 rounded-[10px] rounded-tr-sm border border-primary/10 flex items-center gap-2 shadow-sm">
                      <span className="flex gap-1.5">
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></span>
                      </span>
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
