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
  SidebarContent,
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Sparkles, Menu, History, MoreVertical, Search, Github, Twitter } from 'lucide-react';
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
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
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
      // Step 1: Detect Intent
      const { intent } = await automaticIntentRouting(text);
      
      let aiResponse;
      let msgType: MessageType = 'text';
      let metadata = {};

      // Step 2: Route to specific AI flows
      switch (intent) {
        case 'image':
          const imgRes = await aiImageCreation(text);
          aiResponse = `Here is the image I generated based on: "${text}"`;
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
          // Defaulting to ERD if not specified, but the flow usually handles it.
          // Note: In a real app we might refine the diagramType from the text.
          const diagramRes = await generateDiagram({ description: text, diagramType: 'erd' });
          aiResponse = diagramRes.diagramExplanation || "Generated your diagram structure.";
          msgType = 'diagram';
          metadata = { 
            diagramSyntax: diagramRes.diagramSyntax, 
            diagramExplanation: diagramRes.diagramExplanation 
          };
          break;
        case 'music':
          // Music is mocked since we don't have a specific flow, using general as base
          const musicRes = await intelligentConversationalAi({ query: text });
          aiResponse = musicRes.response;
          msgType = 'music';
          break;
        case 'question':
        case 'planning':
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
        description: "Something went wrong while thinking. Please try again."
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
        
        <SidebarInset className="flex flex-col h-full w-full">
          {/* Top Navigation Bar */}
          <header className="h-14 flex items-center justify-between px-4 glass-morphism z-20">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Hassani
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Search className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full md:hidden">
                <History className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </header>

          {/* Main Chat Area */}
          <main className="flex-1 relative overflow-hidden flex flex-col">
            <ScrollArea ref={scrollRef} className="flex-1 p-4 md:p-6 lg:px-[15%]">
              <div className="space-y-4 max-w-4xl mx-auto pb-20 pt-4">
                {(!currentConversation || currentConversation.messages.length === 0) ? (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
                    <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-inner">
                      <Sparkles className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold tracking-tight">How can I help you today?</h2>
                      <p className="text-muted-foreground max-w-md mx-auto px-4">
                        I can generate images, write code, create diagrams, or just chat with you about anything.
                      </p>
                    </div>
                  </div>
                ) : (
                  currentConversation.messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                    <div className="chat-bubble-ai px-6 py-4 flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                      </div>
                      <span className="text-sm font-medium opacity-60">Hassani is thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="lg:px-[15%]">
               <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            </div>
          </main>
        </SidebarInset>

        <SettingsDialog 
          open={isSettingsOpen} 
          onOpenChange={setIsSettingsOpen} 
        />
      </div>
    </SidebarProvider>
  );
}
