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
      <DialogContent className="sm:max-w-[425px] rounded-3xl overflow-hidden bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl">Settings</DialogTitle>
          <DialogDescription>
            Personalize your Hassani AI experience.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Moon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-xs text-muted-foreground">Always dark by default</p>
              </div>
            </div>
            <Switch checked disabled />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Globe className="h-5 w-5" />
              </div>
              <Label>Language</Label>
            </div>
            <Select defaultValue="en">
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="jp">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Key className="h-5 w-5" />
              </div>
              <Label>External API Key (Optional)</Label>
            </div>
            <div className="relative">
              <Input 
                type="password"
                placeholder="sk-..."
                className="rounded-xl pr-10"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Key className="absolute right-3 top-2.5 h-4 w-4 opacity-40" />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Keys are stored only locally in your browser.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <Shield className="h-5 w-5 text-green-500 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-semibold">Privacy Note</p>
              <p className="text-[10px] text-muted-foreground">
                Hassani does not store sensitive user data on external servers. Conversations are kept in your local environment.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-primary hover:bg-primary/90 rounded-xl" onClick={() => onOpenChange(false)}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
