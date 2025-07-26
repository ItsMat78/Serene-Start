'use client'

import { DateTimeDisplay } from '@/components/serene/DateTimeDisplay';
import { PomodoroTimer } from '@/components/serene/PomodoroTimer';
import { ThemeSwitcherDialog } from '@/components/serene/ThemeSwitcher';
import { TodoList } from '@/components/serene/TodoList';
import { WelcomeMessage } from '@/components/serene/WelcomeMessage';
import { useAppContext } from '@/hooks/use-theme'; // Use the new central context
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState, useMemo } from 'react';
import { cn } from "@/lib/utils";

export default function Home() {
  // Get all state from the central context. No more local state for theme, name, or tasks.
  const { theme, customWallpaper, name, tasks, isDataLoaded } = useAppContext();
  const isMobile = useIsMobile();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Wait for data to be loaded before checking if the name is set.
    if (isDataLoaded) {
      const timer = setTimeout(() => {
        if (!name) {
          setIsSettingsOpen(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [name, isDataLoaded]);

  // The WelcomeMessage now gets its tasks from the central context.
  const memoizedWelcomeMessage = useMemo(() => (
    <WelcomeMessage tasks={tasks} />
  ), [tasks, name]); // name is a dependency to re-render when the user logs in/out

  if (!isDataLoaded) {
    // You can replace this with a more sophisticated loading spinner/skeleton screen
    return <div className="min-h-screen bg-background" />;
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
            {/* The onTasksChange prop is removed, as TodoList now uses the central context */}
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
