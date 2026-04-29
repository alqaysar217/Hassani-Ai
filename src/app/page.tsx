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
import { Sparkles, Search, Settings2, MoreHorizontal } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { automaticIntentRouting } from '@/ai/flows/automatic-intent-routing';
import { intelligentConversationalAi } from '@/ai/flows/intelligent-conversational-ai';
import { aiImageCreation } from '@/ai/flows/ai-image-creation-flow';
import { aiCodeAssistance } from '@/ai/flows/ai-code-assistance-flow';
import { generateDiagram } from '@/ai/flows/ai-diagram-generation-flow';
import { Message, MessageType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function HassaniApp() {
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

  const handleSendMessage = async (text: string) => {
    let activeId = currentId;
    if (!activeId) {
      activeId = createNewConversation();
    }

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
      const { intent } = await automaticIntentRouting(text);
      
      let aiResponse;
      let msgType: MessageType = 'text';
      let metadata = {};

      switch (intent) {
        case 'image':
          const imgRes = await aiImageCreation(text);
          aiResponse = `Generated image for: "${text}"`;
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
          aiResponse = diagramRes.diagramExplanation || "Diagram structure ready.";
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
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: "Assistant Error",
        description: "Please check your connection and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex w-full h-svh bg-background overflow-hidden relative">
        <ChatSidebar 
          conversations={conversations}
          currentId={currentId}
          onSelect={setCurrentId}
          onNew={createNewConversation}
          onDelete={deleteConversation}
          onRename={renameConversation}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        
        <SidebarInset className="flex flex-col h-full w-full relative">
          {/* iOS Style Sticky Header */}
          <header className="h-16 flex items-center justify-between px-4 glass-morphism sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="hover:bg-muted rounded-full" />
              <div className="flex flex-col -space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Assistant</span>
                <h1 className="text-base font-bold flex items-center gap-1.5">
                  Hassani AI <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => setIsSettingsOpen(true)}>
                <Settings2 className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Main Conversation Area */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <ScrollArea ref={scrollRef} className="flex-1">
              <div className="max-w-3xl mx-auto px-4 py-6 pb-12 space-y-6">
                {(!currentConversation || currentConversation.messages.length === 0) ? (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 space-y-8 animate-fade-in">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-[32px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                        <Sparkles className="h-12 w-12" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border-4 border-background flex items-center justify-center shadow-lg">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-3xl font-extrabold tracking-tight">Salam, I'm Hassani</h2>
                      <p className="text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
                        Your intelligent partner for code, art, and creative thinking.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 w-full max-w-[320px]">
                      <Button variant="outline" className="rounded-2xl h-14 justify-start px-6 gap-4 border-primary/10 hover:border-primary/30" onClick={() => handleSendMessage("Suggest a weekend trip plan")}>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">🌍</div>
                        Plan a travel
                      </Button>
                      <Button variant="outline" className="rounded-2xl h-14 justify-start px-6 gap-4 border-primary/10 hover:border-primary/30" onClick={() => handleSendMessage("Create a modern login form UI")}>
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">💻</div>
                        Generate UI Code
                      </Button>
                    </div>
                  </div>
                ) : (
                  currentConversation.messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start items-center gap-3 animate-slide-up">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div className="bg-card px-4 py-2.5 rounded-2xl rounded-tl-sm border border-border/50 flex items-center gap-2 shadow-sm">
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
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