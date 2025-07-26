'use client'

import { DateTimeDisplay } from '@/components/serene/DateTimeDisplay';
import { PomodoroTimer } from '@/components/serene/PomodoroTimer';
import { ThemeSwitcherDialog } from '@/components/serene/ThemeSwitcher';
import { TodoList } from '@/components/serene/TodoList';
import { WelcomeMessage } from '@/components/serene/WelcomeMessage';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState, useMemo } from 'react';
import { cn } from "@/lib/utils";
import type { Task } from '@/lib/types';


export default function Home() {
  const { theme, customWallpaper, name } = useTheme();
  const isMobile = useIsMobile();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Open the settings dialog if the name isn't set after a brief delay
    const timer = setTimeout(() => {
        if (!name) {
            setIsSettingsOpen(true);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [name]);

  const memoizedWelcomeMessage = useMemo(() => (
    <WelcomeMessage tasks={tasks} />
  ), [tasks, name]);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <main 
      className={cn(
        "min-h-screen text-foreground font-body selection:bg-primary/20",
        (theme !== 'custom' || !customWallpaper) && 'bg-background'
      )}
    >
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcherDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className={cn(
            "lg:col-span-3 flex flex-col lg:flex-row justify-between lg:items-center gap-4",
            theme === 'custom' && 'bg-card/80 backdrop-blur-sm border-border/50 shadow-lg rounded-lg p-6'
          )}>
              {memoizedWelcomeMessage}
              {!isMobile && <DateTimeDisplay />}
          </div>

          <div className="lg:col-span-2">
            <TodoList onTasksChange={setTasks} />
          </div>

          <div className="lg:col-span-1">
            <PomodoroTimer />
          </div>

        </div>
      </div>
    </main>
  );
}
