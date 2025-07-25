import { PomodoroTimer } from '@/components/serene/PomodoroTimer';
import { TodoList } from '@/components/serene/TodoList';
import { WelcomeMessageWrapper } from '@/components/serene/WelcomeMessageWrapper';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body selection:bg-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col items-center gap-8">
          <header className="w-full text-center">
            <WelcomeMessageWrapper />
          </header>
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full">
            <div className="w-full">
              <TodoList />
            </div>
            <div className="w-full lg:w-auto">
              <PomodoroTimer />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
