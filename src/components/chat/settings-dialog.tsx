
"use client"

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Image as ImageIcon, CheckCircle2, Upload, X, Moon, Sun, Languages, Palette } from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    const savedLang = localStorage.getItem('lang') as 'ar' | 'en' || 'ar';
    setTheme(savedTheme);
    setLang(savedLang);

    const fetchProfile = async () => {
      if (!user || !open) return;
      
      setName(user.displayName || '');
      setPhotoUrl(user.photoURL || '');

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.displayName) setName(data.displayName);
          if (data.photoURL) setPhotoUrl(data.photoURL);
        }
      } catch (error: any) {
        console.warn("Firestore fetch failed, using local profile:", error.message);
      }
    };
    fetchProfile();
  }, [user, open, db]);

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleLang = (newLang: 'ar' | 'en') => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    window.location.reload();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { 
        toast({
          variant: "destructive",
          title: lang === 'ar' ? "الصورة كبيرة جداً" : "Image too large",
          description: lang === 'ar' ? "يرجى اختيار صورة بحجم أقل من 1 ميجابايت." : "Please choose an image under 1MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setPhotoUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    if (!auth.currentUser || !user) return;
    setIsUpdating(true);
    
    const userRef = doc(db, 'users', user.uid);
    const updateData = {
      displayName: name,
      photoURL: photoUrl,
      updatedAt: Date.now()
    };

    setDoc(userRef, updateData, { merge: true })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    updateProfile(auth.currentUser, { displayName: name }).then(() => {
      toast({
        title: lang === 'ar' ? "تم التحديث" : "Profile Updated",
        description: lang === 'ar' ? "سيتم تطبيق التغييرات لحظياً." : "Changes applied instantly.",
      });
      setIsUpdating(false);
      onOpenChange(false);
    }).catch((error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
      setIsUpdating(false);
    });
  };

  const t = {
    title: lang === 'ar' ? "الإعدادات" : "Settings",
    desc: lang === 'ar' ? "خصص تجربتك مع حساني" : "Customize your experience with Hassani",
    profile: lang === 'ar' ? "الملف الشخصي" : "Profile",
    appearance: lang === 'ar' ? "المظهر" : "Appearance",
    language: lang === 'ar' ? "اللغة" : "Language",
    save: lang === 'ar' ? "حفظ التغييرات" : "Save Changes",
    nameLabel: lang === 'ar' ? "الاسم الشخصي" : "Display Name",
    themeLabel: lang === 'ar' ? "نمط الألوان" : "Color Theme",
    light: lang === 'ar' ? "فاتح" : "Light",
    dark: lang === 'ar' ? "داكن" : "Dark",
    langLabel: lang === 'ar' ? "لغة التطبيق" : "App Language",
    arabic: "العربية (AR)",
    english: "English (EN)",
  };

  const isRtl = lang === 'ar';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px] rounded-3xl overflow-hidden bg-background border-none shadow-2xl p-0" 
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="bg-primary/5 p-8 border-b border-primary/10">
          <DialogHeader className="text-start">
            <DialogTitle className="text-3xl font-black text-secondary">{t.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">{t.desc}</DialogDescription>
          </DialogHeader>
        </div>
        
        <Tabs defaultValue="profile" className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
          <TabsList className="w-full justify-start h-14 bg-transparent border-b border-primary/5 px-8 gap-8 rounded-none overflow-x-auto no-scrollbar flex-row-reverse rtl:flex-row">
            <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none font-bold px-0 pb-4 h-full shrink-0">{t.profile}</TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none font-bold px-0 pb-4 h-full shrink-0">{t.appearance}</TabsTrigger>
            <TabsTrigger value="language" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none font-bold px-0 pb-4 h-full shrink-0">{t.language}</TabsTrigger>
          </TabsList>

          <div className="p-8 min-h-[380px]">
            <TabsContent value="profile" className="m-0 space-y-8 animate-fade-in outline-none text-start">
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-white dark:border-secondary shadow-2xl">
                    <AvatarImage src={photoUrl} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
                      {name.charAt(0) || <User className="h-12 w-12" />}
                    </AvatarFallback>
                  </Avatar>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className={cn(
                      "absolute bottom-0 h-10 w-10 rounded-full shadow-lg border-2 border-white dark:border-secondary",
                      isRtl ? "right-0" : "left-0"
                    )} 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-5 w-5" />
                  </Button>
                </div>
                <div className="w-full space-y-3">
                  <Label className="font-black text-secondary text-sm flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    {t.nameLabel}
                  </Label>
                  <Input 
                    placeholder={lang === 'ar' ? "ادخل اسمك..." : "Enter your name..."}
                    className="rounded-2xl h-14 px-6 border-primary/10 bg-muted/20 focus:bg-background transition-all text-lg font-bold text-start"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="m-0 space-y-6 animate-fade-in outline-none text-start">
              <Label className="font-black text-secondary text-sm flex items-center gap-2 mb-4">
                <Palette className="h-4 w-4 text-primary" />
                {t.themeLabel}
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'} 
                  className={cn(
                    "h-28 rounded-2xl flex flex-col gap-3 transition-all border-primary/10",
                    theme === 'light' ? 'luxury-gradient text-white shadow-lg' : 'bg-muted/10'
                  )}
                  onClick={() => toggleTheme('light')}
                >
                  <Sun className="h-7 w-7" />
                  <span className="font-bold text-base">{t.light}</span>
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'} 
                  className={cn(
                    "h-28 rounded-2xl flex flex-col gap-3 transition-all border-primary/10",
                    theme === 'dark' ? 'luxury-gradient text-white shadow-lg' : 'bg-muted/10'
                  )}
                  onClick={() => toggleTheme('dark')}
                >
                  <Moon className="h-7 w-7" />
                  <span className="font-bold text-base">{t.dark}</span>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="language" className="m-0 space-y-6 animate-fade-in outline-none text-start">
              <Label className="font-black text-secondary text-sm flex items-center gap-2 mb-4">
                <Languages className="h-4 w-4 text-primary" />
                {t.langLabel}
              </Label>
              <div className="flex flex-col gap-3">
                <Button 
                  variant={lang === 'ar' ? 'secondary' : 'outline'} 
                  className={cn(
                    "h-16 flex items-center justify-between px-6 rounded-2xl border-primary/10 transition-all",
                    lang === 'ar' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted/10'
                  )}
                  onClick={() => toggleLang('ar')}
                >
                  <span className="font-bold text-lg">{t.arabic}</span>
                  {lang === 'ar' && <CheckCircle2 className="h-6 w-6" />}
                </Button>
                <Button 
                  variant={lang === 'en' ? 'secondary' : 'outline'} 
                  className={cn(
                    "h-16 flex items-center justify-between px-6 rounded-2xl border-primary/10 transition-all",
                    lang === 'en' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted/10'
                  )}
                  onClick={() => toggleLang('en')}
                >
                  <span className="font-bold text-lg">{t.english}</span>
                  {lang === 'en' && <CheckCircle2 className="h-6 w-6" />}
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="p-8 pt-0">
          <Button 
            className="w-full luxury-gradient rounded-2xl h-16 font-black text-xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-70" 
            onClick={handleUpdateProfile} 
            disabled={isUpdating}
          >
            {isUpdating ? <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : t.save}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
