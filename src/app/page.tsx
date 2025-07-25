import { DateTimeDisplay } from '@/components/serene/DateTimeDisplay';
import { PomodoroTimer } from '@/components/serene/PomodoroTimer';
import { ThemeSwitcherDialog } from '@/components/serene/ThemeSwitcher';
import { TodoList } from '@/components/serene/TodoList';
import { WelcomeMessageWrapper } from '@/components/serene/WelcomeMessageWrapper';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body selection:bg-primary/20">
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcherDialog />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header for mobile */}
        <div className="flex justify-between items-start gap-8 lg:hidden mb-8">
            <WelcomeMessageWrapper />
            <DateTimeDisplay />
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
            <div className="hidden lg:flex justify-between items-start">
              <div className="w-full">
                <WelcomeMessageWrapper />
              </div>
            </div>
            <TodoList />
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-1/3 flex flex-col gap-8">
             <div className="w-full hidden lg:flex justify-end">
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
