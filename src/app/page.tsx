'use client'

import { DateTimeDisplay } from '@/components/serene/DateTimeDisplay';
import { PomodoroTimer } from '@/components/serene/PomodoroTimer';
import { ThemeSwitcherDialog } from '@/components/serene/ThemeSwitcher';
import { TodoList } from '@/components/serene/TodoList';
import { WelcomeMessageWrapper } from '@/components/serene/WelcomeMessageWrapper';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

export default function Home() {
  const { theme, customWallpaper } = useTheme();

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header for mobile */}
        <div className="flex flex-col gap-8 lg:hidden mb-8">
          <WelcomeMessageWrapper />
          <DateTimeDisplay />
        </div>
        
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <WelcomeMessageWrapper />
            <TodoList />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <DateTimeDisplay />
            <div className="w-full">
              <PomodoroTimer />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
