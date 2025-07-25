import { PomodoroTimer } from '@/components/serene/PomodoroTimer';
import { TodoList } from '@/components/serene/TodoList';
import { WelcomeMessage } from '@/components/serene/WelcomeMessage';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body selection:bg-primary/20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col items-center gap-12">
          <header className="w-full text-center">
            <TodoList />
          </header>
          <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full px-4">
            <div className="w-full md:w-1/3">
              <PomodoroTimer />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
