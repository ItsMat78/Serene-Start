'use client'

import { DateTimeDisplay } from '@/components/serene/DateTimeDisplay';
import { PomodoroTimer } from '@/components/serene/PomodoroTimer';
import { ThemeSwitcherDialog } from '@/components/serene/ThemeSwitcher';
import { TodoList } from '@/components/serene/TodoList';
import { WelcomeMessageWrapper } from '@/components/serene/WelcomeMessageWrapper';
import { Card } from '@/components/ui/card';
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
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg p-6">
            <WelcomeMessageWrapper />
          </Card>
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg p-6">
            <DateTimeDisplay />
          </Card>
        </div>
        
        <div className="hidden lg:flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
            <div className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg p-6 rounded-lg">
                <WelcomeMessageWrapper />
            </div>
            <TodoList />
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-1/3 flex flex-col gap-8">
            <div className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg p-6 rounded-lg">
                <DateTimeDisplay />
            </div>
            <div className="w-full">
              <PomodoroTimer />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
