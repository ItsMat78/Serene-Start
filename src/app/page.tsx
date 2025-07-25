import { DateTimeDisplay } from '@/components/serene/DateTimeDisplay';
import { PomodoroTimer } from '@/components/serene/PomodoroTimer';
import { TodoList } from '@/components/serene/TodoList';
import { WelcomeMessageWrapper } from '@/components/serene/WelcomeMessageWrapper';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body selection:bg-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column */}
          <div className="w-full flex flex-col gap-8">
            <div className="pr-4">
              <WelcomeMessageWrapper />
            </div>
            <TodoList />
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-auto flex flex-col gap-8">
            <DateTimeDisplay />
            <PomodoroTimer />
          </div>
        </div>
      </div>
    </main>
  );
}
