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
import { ScrollArea } from '@/components/ui/scroll-area';

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
  return (
    <div className="flex flex-col h-full bg-sidebar border-l">
      <div className="p-5">
        <Button 
          onClick={onNew}
          className="w-full justify-start gap-3 luxury-gradient text-white rounded-2xl h-14 shadow-lg shadow-primary/20 font-bold text-lg"
        >
          <Plus className="h-6 w-6" />
          محادثة جديدة
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          <h3 className="px-4 text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-widest mb-2">المحادثات الأخيرة</h3>
          {conversations.length === 0 ? (
            <div className="text-center py-10 opacity-40 text-sm font-medium">
              لا توجد محادثات سابقة
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "group relative flex items-center rounded-2xl px-4 py-3 text-sm transition-all cursor-pointer",
                  currentId === c.id 
                    ? "bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5" 
                    : "hover:bg-muted text-muted-foreground hover:text-secondary"
                )}
                onClick={() => onSelect(c.id)}
              >
                <MessageSquare className="ml-3 h-5 w-5 opacity-70" />
                <span className="truncate flex-1 pl-6">{c.title}</span>
                
                <div className="absolute left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-background">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 rounded-2xl p-2">
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
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-5 border-t bg-sidebar/50">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 rounded-2xl text-secondary font-bold hover:bg-primary/5"
          onClick={onOpenSettings}
        >
          <Settings className="h-6 w-6 text-primary" />
          الإعدادات
        </Button>
      </div>
    </div>
  );
}
