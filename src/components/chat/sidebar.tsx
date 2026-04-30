
"use client"

import React, { useEffect, useState } from 'react';
import { Conversation } from '@/lib/types';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  MoreVertical, 
  Settings,
  Pencil,
  Brain,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
}

export function ChatSidebar({ 
  conversations, 
  currentId, 
  onSelect, 
  onNew, 
  onDelete, 
  onRename,
  onOpenSettings,
  user,
  onLogout
}: ChatSidebarProps) {
  const { setOpenMobile } = useSidebar();
  const db = useFirestore();
  const [profile, setProfile] = useState<{ displayName?: string, photoURL?: string } | null>(null);

  // مراقبة بيانات المستخدم في Firestore
  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data());
        }
      });
      return () => unsubscribe();
    }
  }, [user, db]);

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpenMobile(false);
  };

  const handleNew = () => {
    onNew();
    setOpenMobile(false);
  };

  const displayName = profile?.displayName || user.displayName || "مستخدم حساني";
  const photoURL = profile?.photoURL || user.photoURL || undefined;

  return (
    <Sidebar side="right" className="border-l border-primary/5">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Brain className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black text-secondary tracking-tighter">حساني</span>
        </div>
        <Button 
          onClick={handleNew}
          className="w-full justify-center gap-3 luxury-gradient text-white rounded-2xl h-14 shadow-xl shadow-primary/20 font-black text-lg"
        >
          <Plus className="h-6 w-6" />
          محادثة جديدة
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <div className="py-2">
          <h3 className="px-4 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">السجل</h3>
          {conversations.length === 0 ? (
            <div className="text-center py-10 opacity-30 text-sm font-bold">
              لا توجد محادثات
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "group relative flex items-center rounded-2xl px-4 py-4 text-sm transition-all cursor-pointer",
                    currentId === c.id 
                      ? "bg-primary/10 text-primary font-bold shadow-sm" 
                      : "hover:bg-muted/50 text-muted-foreground hover:text-secondary"
                  )}
                  onClick={() => handleSelect(c.id)}
                >
                  <MessageSquare className="ml-3 h-5 w-5 opacity-60" />
                  <span className="truncate flex-1 pl-6 font-bold">{c.title}</span>
                  
                  <div className="absolute left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-background">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48 rounded-2xl p-2 shadow-2xl border-primary/5">
                        <DropdownMenuItem className="rounded-xl gap-2 font-bold py-3" onClick={(e) => {
                          e.stopPropagation();
                          const newTitle = prompt('إعادة تسمية المحادثة:', c.title);
                          if (newTitle) onRename(c.id, newTitle);
                        }}>
                          <Pencil className="h-4 w-4" />
                          تعديل الاسم
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded-xl text-destructive gap-2 font-bold py-3 focus:text-destructive focus:bg-destructive/5"
                          onClick={(e) => {
                            e.stopPropagation();
                            if(confirm('هل أنت متأكد؟')) onDelete(c.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          حذف المحادثة
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-primary/5 bg-sidebar/30 space-y-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-4 rounded-2xl text-secondary font-black hover:bg-primary/5 h-12 px-4 transition-all"
          onClick={() => {
            onOpenSettings();
            setOpenMobile(false);
          }}
        >
          <Settings className="h-5 w-5 text-primary" />
          <span>الإعدادات</span>
        </Button>

        <Separator className="bg-primary/5" />

        <div className="flex items-center gap-3 p-2 bg-white/40 rounded-2xl border border-primary/5">
          <Avatar className="h-10 w-10 border border-primary/10">
            <AvatarImage src={photoURL} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {displayName.charAt(0) || <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0 overflow-hidden text-right">
            <p className="text-sm font-bold text-secondary truncate">{displayName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 shrink-0"
            onClick={onLogout}
            title="تسجيل الخروج"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
