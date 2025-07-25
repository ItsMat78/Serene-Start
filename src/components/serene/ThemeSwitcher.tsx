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
import { Settings, Sun, Moon, Sparkles, Wand2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ThemeSwitcherDialog() {
  const { theme, setTheme, customWallpaper, setCustomWallpaper, customThemeMode, setCustomThemeMode } = useTheme();
  const [wallpaperInput, setWallpaperInput] = useState(customWallpaper);

  const handleApplyWallpaper = () => {
    setCustomWallpaper(wallpaperInput);
  };
  
  // Sync local state if customWallpaper from context changes, e.g. on initial load
  useEffect(() => {
    setWallpaperInput(customWallpaper);
  }, [customWallpaper]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings />
          <span className="sr-only">Theme Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Theme Settings</DialogTitle>
          <DialogDescription>
            Customize the look and feel of your start page.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
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
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Sun className="mb-3 h-6 w-6" />
                  Light
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Moon className="mb-3 h-6 w-6" />
                  Dark
                </Label>
              </div>
              <div>
                <RadioGroupItem value="custom" id="custom" className="peer sr-only" />
                <Label
                  htmlFor="custom"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Sparkles className="mb-3 h-6 w-6" />
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

              <div>
                <Label className="text-sm font-medium">Custom Theme Mode</Label>
                <RadioGroup
                  value={customThemeMode}
                  onValueChange={(value) => setCustomThemeMode(value as 'auto' | 'light' | 'dark')}
                  className="grid grid-cols-3 gap-4 pt-2"
                >
                   <div>
                      <RadioGroupItem value="auto" id="auto" className="peer sr-only" />
                      <Label
                        htmlFor="auto"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Wand2 className="mb-3 h-6 w-6" />
                        Auto
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="light" id="custom-light" className="peer sr-only" />
                      <Label
                        htmlFor="custom-light"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Sun className="mb-3 h-6 w-6" />
                        Light
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="dark" id="custom-dark" className="peer sr-only" />
                      <Label
                        htmlFor="custom-dark"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Moon className="mb-3 h-6 w-6" />
                        Dark
                      </Label>
                    </div>
                </RadioGroup>
                 <p className="text-xs text-muted-foreground pt-2">
                  "Auto" tries to detect the best theme. If it fails due to image host restrictions (CORS), select Light or Dark manually.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
