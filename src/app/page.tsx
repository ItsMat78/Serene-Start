import { PomodoroTimer } from '@/components/serene/PomodoroTimer';
import { TodoList } from '@/components/serene/TodoList';
import { WelcomeMessage } from '@/components/serene/WelcomeMessage';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body p-4 sm:p-6 lg:p-8 selection:bg-primary/20">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <header>
          <WelcomeMessage />
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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
