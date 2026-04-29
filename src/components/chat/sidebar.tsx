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
    <div className="flex flex-col h-full bg-sidebar border-r">
      <div className="p-4">
        <Button 
          onClick={onNew}
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl h-11"
        >
          <Plus className="h-5 w-5" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {conversations.length === 0 ? (
            <div className="text-center py-10 opacity-40 text-sm">
              No conversations yet
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "group relative flex items-center rounded-xl px-3 py-2 text-sm transition-all cursor-pointer",
                  currentId === c.id 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onSelect(c.id)}
              >
                <MessageSquare className="mr-2 h-4 w-4 opacity-70" />
                <span className="truncate flex-1 pr-6">{c.title}</span>
                
                <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        const newTitle = prompt('Rename chat:', c.title);
                        if (newTitle) onRename(c.id, newTitle);
                      }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(c.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 rounded-xl text-muted-foreground hover:text-foreground"
          onClick={onOpenSettings}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Button>
      </div>
    </div>
  );
}
