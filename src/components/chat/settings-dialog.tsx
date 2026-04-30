
"use client"

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Key, Moon, Sun, Globe, Shield } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [apiKey, setApiKey] = React.useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[10px] overflow-hidden bg-background border-none shadow-2xl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-2xl font-extrabold text-secondary">الإعدادات</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            قم بتخصيص تجربة حساني الذكي الخاصة بك.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-6">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-[10px] border border-primary/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-[10px] luxury-gradient text-white shadow-md">
                <Sun className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-lg font-bold text-secondary">الوضع الفاتح</Label>
                <p className="text-xs text-muted-foreground">التصميم اللؤلؤي والذهبي</p>
              </div>
            </div>
            <Switch checked={false} disabled />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <Label className="font-bold text-secondary">اللغة</Label>
            </div>
            <Select defaultValue="ar">
              <SelectTrigger className="rounded-[10px] h-12 border-primary/10">
                <SelectValue placeholder="اختر اللغة" />
              </SelectTrigger>
              <SelectContent className="rounded-[10px]">
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-primary" />
              <Label className="font-bold text-secondary">مفتاح API الخارجي (اختياري)</Label>
            </div>
            <div className="relative">
              <Input 
                type="password"
                placeholder="sk-..."
                className="rounded-[10px] h-12 pr-12 border-primary/10 bg-white"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Key className="absolute right-4 top-3.5 h-5 w-5 opacity-30" />
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              يتم تخزين المفاتيح محلياً فقط في متصفحك لضمان الخصوصية.
            </p>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-[10px] bg-primary/5 border border-primary/10">
            <Shield className="h-6 w-6 text-primary shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-secondary">ملاحظة الخصوصية</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                حساني لا يقوم بتخزين بيانات المستخدم الحساسة على خوادم خارجية. يتم الاحتفاظ بالمحادثات في بيئتك المحلية فقط.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-3 sm:justify-center">
          <Button className="flex-1 luxury-gradient hover:opacity-90 rounded-[10px] h-14 font-bold text-lg shadow-lg shadow-primary/20" onClick={() => onOpenChange(false)}>حفظ التغييرات</Button>
          <Button variant="ghost" className="rounded-[10px] h-14 font-bold px-8" onClick={() => onOpenChange(false)}>إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
