import { PomodoroTimer } from '@/components/serene/PomodoroTimer';
import { TodoList } from '@/components/serene/TodoList';
import { WelcomeMessage } from '@/components/serene/WelcomeMessage';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body p-4 sm:p-6 lg:p-8 selection:bg-primary/20">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
        <header className="w-full">
          <WelcomeMessage />
        </header>
        <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full">
          <div className="w-full md:w-2/3">
            <TodoList />
          </div>
          <div className="w-full md:w-1/3">
            <PomodoroTimer />
          </div>
        </div>
      </div>
    </main>
  );
}
