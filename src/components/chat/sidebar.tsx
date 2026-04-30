"use client"

import React, { useEffect, useState } from 'react';
import { Conversation } from '@/lib/types';
import { 
  Plus, 
  MessageSquare, 
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar
} from "@/components/ui/sidebar";
import { User } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';

interface ChatSidebarProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onOpenSettings: () => void;
  user: User;
  onLogout: () => void;
  lang: 'ar' | 'en';
}

export function ChatSidebar({ 
  conversations, 
  currentId, 
  onSelect, 
  onNew, 
  onOpenSettings,
  user,
  onLogout,
  lang
}: ChatSidebarProps) {
  const { setOpenMobile } = useSidebar();
  const db = useFirestore();
  const [profile, setProfile] = useState<{ displayName?: string, photoURL?: string } | null>(null);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) setProfile(doc.data());
      });
      return () => unsubscribe();
    }
  }, [user, db]);

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpenMobile(false);
  };

  const displayName = profile?.displayName || user.displayName || (lang === 'ar' ? "مستخدم حساني" : "Hassani User");
  const photoURL = profile?.photoURL || user.photoURL || undefined;

  return (
    <Sidebar side={lang === 'ar' ? 'right' : 'left'} className="border-primary/5">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl shadow-lg border border-primary/10">
            <Image 
              src="/logo-hassani.png" 
              alt="Hassani" 
              fill 
              className="object-cover" 
              onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/hassani/40/40"; }} 
            />
          </div>
          <span className="text-2xl font-black text-foreground tracking-tighter">{lang === 'ar' ? 'حساني' : 'Hassani'}</span>
        </div>
        <Button onClick={onNew} className="w-full justify-center gap-3 luxury-gradient text-white rounded-2xl h-14 shadow-xl shadow-primary/20 font-black text-lg">
          <Plus className="h-6 w-6" />
          {lang === 'ar' ? 'محادثة جديدة' : 'New Chat'}
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <div className="py-2">
          <h3 className="px-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-4">
            {lang === 'ar' ? 'السجل' : 'History'}
          </h3>
          {conversations.length === 0 ? (
            <div className="text-center py-10 opacity-30 text-sm font-bold text-muted-foreground">
              {lang === 'ar' ? 'لا توجد محادثات' : 'No conversations'}
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((c) => (
                <div key={c.id} className={cn("group relative flex items-center rounded-2xl px-4 py-4 text-sm transition-all cursor-pointer", currentId === c.id ? "bg-primary/10 text-primary font-bold shadow-sm" : "hover:bg-muted/50 text-muted-foreground")} onClick={() => handleSelect(c.id)}>
                  <MessageSquare className={cn("h-5 w-5 opacity-60", lang === 'ar' ? 'ml-3' : 'mr-3')} />
                  <span className="truncate flex-1 font-bold">{c.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-primary/5 bg-sidebar/30 space-y-4">
        <Button variant="ghost" className="w-full justify-start gap-4 rounded-2xl text-foreground font-black hover:bg-primary/5 h-12 px-4 transition-all" onClick={onOpenSettings}>
          <Settings className="h-5 w-5 text-primary" />
          <span>{lang === 'ar' ? 'الإعدادات' : 'Settings'}</span>
        </Button>
        <Separator className="bg-primary/5" />
        <div className="flex items-center gap-3 p-2 bg-background/40 rounded-2xl border border-primary/5">
          <Avatar className="h-10 w-10 border border-primary/10">
            <AvatarImage src={photoURL} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 shrink-0" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}