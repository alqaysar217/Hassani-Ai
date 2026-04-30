"use client"

import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Key, User, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setPhotoUrl(user.photoURL || '');
    }
  }, [user, open]);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    
    setIsUpdating(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoUrl
      });
      toast({
        title: "تم تحديث البيانات",
        description: "تم حفظ التغييرات على ملفك الشخصي بنجاح.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في التحديث",
        description: error.message || "تعذر تحديث بيانات الملف الشخصي.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl overflow-hidden bg-background border-none shadow-2xl p-0">
        <div className="bg-primary/5 p-8 border-b border-primary/10">
          <DialogHeader className="text-right">
            <DialogTitle className="text-3xl font-black text-secondary">الملف الشخصي</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              قم بتعديل بياناتك الشخصية لتظهر في حساني.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="flex flex-col items-center justify-center gap-4 mb-4">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
              <AvatarImage src={photoUrl} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                {name.charAt(0) || <User className="h-10 w-10" />}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">معاينة الصورة</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="font-black text-secondary text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                الاسم الشخصي
              </Label>
              <Input 
                placeholder="ادخل اسمك..."
                className="rounded-2xl h-14 px-6 border-primary/10 bg-muted/20 focus:bg-white transition-all text-lg font-bold"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="font-black text-secondary text-sm flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                رابط الصورة الشخصية
              </Label>
              <Input 
                placeholder="https://..."
                className="rounded-2xl h-14 px-6 border-primary/10 bg-muted/20 focus:bg-white transition-all text-sm font-medium"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground font-bold leading-relaxed px-2">
                يمكنك استخدام رابط صورة من Unsplash أو أي خدمة استضافة صور.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 flex-row gap-4 sm:justify-center">
          <Button 
            className="flex-1 luxury-gradient hover:opacity-90 rounded-2xl h-16 font-black text-xl shadow-xl shadow-primary/20 transition-all active:scale-95"
            onClick={handleUpdateProfile}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" />
                <span>حفظ التغييرات</span>
              </div>
            )}
          </Button>
          <Button 
            variant="ghost" 
            className="rounded-2xl h-16 font-bold px-8 text-muted-foreground hover:bg-muted"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
