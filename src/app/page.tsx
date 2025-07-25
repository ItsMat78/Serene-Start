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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column / First on mobile */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className='flex flex-col lg:flex-row justify-between lg:items-center gap-4'>
                <WelcomeMessageWrapper />
                <div className="lg:hidden">
                    <DateTimeDisplay />
                </div>
            </div>
            <TodoList />
          </div>

          {/* Right Column / Last on mobile */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className='hidden lg:block'>
                <DateTimeDisplay />
            </div>
            <PomodoroTimer />
          </div>
        </div>
      </div>
    </main>
  );
}
