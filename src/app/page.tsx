'use client'

import { DateTimeDisplay } from '@/components/serene/DateTimeDisplay';
import { NameDialog } from '@/components/serene/NameDialog';
import { PomodoroTimer } from '@/components/serene/PomodoroTimer';
import { ThemeSwitcherDialog } from '@/components/serene/ThemeSwitcher';
import { TodoList } from '@/components/serene/TodoList';
import { WelcomeMessageWrapper } from '@/components/serene/WelcomeMessageWrapper';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

export default function Home() {
  const { theme, customWallpaper, name } = useTheme();
  const isMobile = useIsMobile();
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);

  useEffect(() => {
    // Open the name dialog if the name isn't set
    if (!name) {
      setIsNameDialogOpen(true);
    }
  }, [name]);

  return (
    <main 
      className={cn(
        "min-h-screen text-foreground font-body selection:bg-primary/20",
        (theme !== 'custom' || !customWallpaper) && 'bg-background'
      )}
    >
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcherDialog />
      </div>

      <NameDialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className={cn(
            "lg:col-span-3 flex flex-col lg:flex-row justify-between lg:items-center gap-4",
            theme === 'custom' && 'bg-card/80 backdrop-blur-sm border-border/50 shadow-lg rounded-lg p-6'
          )}>
              <WelcomeMessageWrapper />
              {!isMobile && <DateTimeDisplay />}
          </div>

          <div className="lg:col-span-2">
            <TodoList />
          </div>

          <div className="lg:col-span-1">
            <PomodoroTimer />
          </div>

        </div>
      </div>
    </main>
  );
}
