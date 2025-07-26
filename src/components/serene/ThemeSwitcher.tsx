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
import { Settings, Sun, Moon, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Slider } from '../ui/slider';

type ThemeSwitcherDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ThemeSwitcherDialog({ open, onOpenChange }: ThemeSwitcherDialogProps) {
  const { theme, setTheme, customWallpaper, setCustomWallpaper, backgroundDim, setBackgroundDim, name, setName } = useTheme();
  const [wallpaperInput, setWallpaperInput] = useState(customWallpaper);
  const [localName, setLocalName] = useState(name || '');

  useEffect(() => {
    setWallpaperInput(customWallpaper);
  }, [customWallpaper]);

  useEffect(() => {
    setLocalName(name || '');
  }, [name]);

  const handleApplyWallpaper = () => {
    setCustomWallpaper(wallpaperInput);
  };

  const handleNameSave = () => {
    if (localName.trim()) {
      setName(localName.trim());
      // If the dialog was forced open, allow it to close now
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  const dialogTitle = name ? "Settings" : "Welcome to Serene Start!";
  const dialogDescription = name ? "Customize your experience." : "What should I call you?";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings />
          <span className="sr-only">Theme Settings</span>
        </Button>
      </DialogTrigger>
       <DialogContent 
        className="sm:max-w-[425px] border-0"
        onInteractOutside={(e) => {
            // Prevent closing by clicking outside if no name is set
            if (!name) {
                e.preventDefault();
            }
        }}
        hideCloseButton={!name}
       >
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
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
                            handleNameSave();
                        }
                    }}
                />
                <Button onClick={handleNameSave}>Save</Button>
              </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Appearance</Label>
            <RadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'custom')}
              className="grid grid-cols-3 gap-4 pt-2"
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
                <p className="text-xs text-muted-foreground">
                  Hint: Right-click an image online and select "Copy Image Address" to get a direct link.
                </p>
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
      </DialogContent>
    </Dialog>
  );
}
