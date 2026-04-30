
"use client"

import React from 'react';
import { Conversation } from '@/lib/types';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  MoreVertical, 
  Settings,
  Pencil,
  Brain
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

      <SidebarFooter className="p-6 border-t border-primary/5 bg-sidebar/30">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-4 rounded-2xl text-secondary font-black hover:bg-primary/5 h-14 px-6"
          onClick={() => {
            onOpenSettings();
            setOpenMobile(false);
          }}
        >
          <Settings className="h-6 w-6 text-primary" />
          الإعدادات
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
