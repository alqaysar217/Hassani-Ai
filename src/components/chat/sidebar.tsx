
"use client"

import React from 'react';
import { Conversation } from '@/lib/types';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  MoreVertical, 
  Settings,
  Pencil
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
import Image from 'next/image';

interface ChatSidebarProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onOpenSettings: () => void;
}

export function ChatSidebar({ 
  conversations, 
  currentId, 
  onSelect, 
  onNew, 
  onDelete, 
  onRename,
  onOpenSettings
}: ChatSidebarProps) {
  const { setOpenMobile } = useSidebar();

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpenMobile(false);
  };

  const handleNew = () => {
    onNew();
    setOpenMobile(false);
  };

  return (
    <Sidebar side="right" className="border-l border-primary/10">
      <SidebarHeader className="p-5 pb-2">
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="relative h-8 w-8">
            <Image src="/logo-hassani.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="font-extrabold text-secondary text-lg">حساني الذكي</span>
        </div>
        <Button 
          onClick={handleNew}
          className="w-full justify-start gap-3 luxury-gradient text-white rounded-2xl h-12 shadow-lg shadow-primary/20 font-bold"
        >
          <Plus className="h-5 w-5" />
          محادثة جديدة
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <div className="py-4">
          <h3 className="px-4 text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-widest mb-3">المحادثات الأخيرة</h3>
          {conversations.length === 0 ? (
            <div className="text-center py-10 opacity-40 text-sm font-medium">
              لا توجد محادثات سابقة
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "group relative flex items-center rounded-2xl px-4 py-3 text-sm transition-all cursor-pointer",
                    currentId === c.id 
                      ? "bg-primary/10 text-primary font-bold shadow-sm" 
                      : "hover:bg-muted text-muted-foreground hover:text-secondary"
                  )}
                  onClick={() => handleSelect(c.id)}
                >
                  <MessageSquare className="ml-3 h-5 w-5 opacity-70" />
                  <span className="truncate flex-1 pl-6">{c.title}</span>
                  
                  <div className="absolute left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-background">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48 rounded-2xl p-2 shadow-xl border-primary/5">
                        <DropdownMenuItem className="rounded-xl gap-2 font-bold" onClick={(e) => {
                          e.stopPropagation();
                          const newTitle = prompt('إعادة تسمية المحادثة:', c.title);
                          if (newTitle) onRename(c.id, newTitle);
                        }}>
                          <Pencil className="h-4 w-4" />
                          تعديل الاسم
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded-xl text-destructive gap-2 font-bold focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if(confirm('هل أنت متأكد من حذف هذه المحادثة؟')) onDelete(c.id);
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

      <SidebarFooter className="p-5 border-t border-primary/5 bg-sidebar/50">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 rounded-2xl text-secondary font-bold hover:bg-primary/5 h-12"
          onClick={() => {
            onOpenSettings();
            setOpenMobile(false);
          }}
        >
          <Settings className="h-5 w-5 text-primary" />
          الإعدادات
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
