'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from '@/hooks/use-theme';
import { Settings, Sun, Moon, Sparkles, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Slider } from '../ui/slider';
import { useAuth } from '@/hooks/use-auth';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '../ui/skeleton';

type ThemeSwitcherDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ThemeSwitcherDialog({ open, onOpenChange }: ThemeSwitcherDialogProps) {
  const { theme, setTheme, customWallpaper, setCustomWallpaper, backgroundDim, setBackgroundDim, name, setName } = useTheme();
  const { user, loading: authLoading } = useAuth();
  
  const [wallpaperInput, setWallpaperInput] = useState(customWallpaper);
  const [localName, setLocalName] = useState(name || '');

  useEffect(() => {
    setWallpaperInput(customWallpaper);
  }, [customWallpaper]);

  // If a user logs in, set the theme name to their display name if no name is already set
  useEffect(() => {
    if (user?.displayName && !name) {
      setName(user.displayName);
    }
  }, [user, name, setName]);

  const handleApplyWallpaper = () => {
    setCustomWallpaper(wallpaperInput);
  };

  const handleLocalNameSave = () => {
    if (localName.trim()) {
      setName(localName.trim());
      // If the dialog was forced open, allow it to close now
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    // Reset to default guest state
    setName('');
    setTheme('dark');
    setCustomWallpaper('');
    setBackgroundDim(0.3);
  };

  // Determine dialog state based on auth and local name
  const isUserAuthenticated = !!user;
  const hasLocalName = !!name && !isUserAuthenticated;
  const isInitialSetup = !isUserAuthenticated && !hasLocalName;

  const dialogTitle = isInitialSetup ? "Welcome to Serene Start!" : "Settings";
  const dialogDescription = isInitialSetup ? "Sign in to sync your data, or just set a local name to get started." : "Customize your experience.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings />
          <span className="sr-only">Theme Settings</span>
        </Button>
      </DialogTrigger>
       <DialogContent className="sm:max-w-[425px] border-0">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        {authLoading ? (
            <div className="py-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-1/2" />
            </div>
        ) : (
          <div className="grid gap-6 py-4">
            {isUserAuthenticated ? (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                    <img src={user.photoURL || undefined} alt="User" className="w-10 h-10 rounded-full" />
                    <div className="text-sm">
                        <p className="font-semibold">{user.displayName}</p>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </div>
                <Button onClick={handleSignOut} variant="outline" className="w-full">
                  <LogOut className="mr-2 h-4 w-4"/>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                 <Button onClick={handleSignIn} className="w-full">
                    Sign In with Google
                </Button>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                        Or
                        </span>
                    </div>
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                        id="name"
                        placeholder="Enter your name..."
                        value={localName}
                        onChange={(e) => setLocalName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleLocalNameSave();
                            }
                        }}
                    />
                    <Button onClick={handleLocalNameSave}>Save</Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Theme
                    </span>
                </div>
            </div>

            <div>
              <RadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'custom')}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem value="light" id="light" className="peer sr-only" />
                  <Label
                    htmlFor="light"
                    className="flex h-24 flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Sun className="h-6 w-6" />
                    Light
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                  <Label
                    htmlFor="dark"
                    className="flex h-24 flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Moon className="h-6 w-6" />
                    Dark
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="custom" id="custom" className="peer sr-only" />
                  <Label
                    htmlFor="custom"
                    className="flex h-24 flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Sparkles className="h-6 w-6" />
                    Custom
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {theme === 'custom' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="wallpaper-url">Background Wallpaper URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="wallpaper-url"
                      placeholder="Paste direct image link here..."
                      value={wallpaperInput}
                      onChange={(e) => setWallpaperInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyWallpaper();
                        }
                      }}
                    />
                    <Button onClick={handleApplyWallpaper} variant="secondary">Load</Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="dim-slider">Background Dimness</Label>
                  <Slider
                    id="dim-slider"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[backgroundDim]}
                    onValueChange={(value) => setBackgroundDim(value[0])}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
