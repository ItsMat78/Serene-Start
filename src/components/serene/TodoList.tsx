'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { AddTaskForm } from './AddTaskForm';
import { TaskItem } from './TaskItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { Confetti } from './Confetti';
import { useToast } from '@/hooks/use-toast';
import { PartyPopper } from 'lucide-react';
import { useAppContext } from '@/hooks/use-theme'; // Use the new central context

const TASK_COLORS = ['#64B5F6', '#81C784', '#FFD54F', '#FF8A65', '#9575CD', '#F06292'];

// No props are needed anymore. The component is self-sufficient via the context.
export function TodoList() {
  // Get tasks and the global setter function from our new central context.
  const { tasks, setTasks } = useAppContext(); 
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  // All old useEffects for loading/saving are GONE. This is now handled centrally.

  const handleAddTask = (title: string, description?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      completed: false,
      color: TASK_COLORS[Math.floor(Math.random() * TASK_COLORS.length)],
    };
    // Update the global state. The central useEffect will handle persistence.
    setTasks([newTask, ...tasks]);
  };

  const handleToggleTask = (id: string) => {
    let taskTitle = '';
    let isCompleting = false;

    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        if (!task.completed) {
          taskTitle = task.title;
          isCompleting = true;
        }
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    
    setTasks(updatedTasks); // Update the global state

    if (isCompleting) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      toast({
        title: 'Task Completed!',
        description: (
          <div className="flex items-center gap-2">
            <PartyPopper className="text-accent" />
            <span>Great job on finishing "{taskTitle}"!</span>
          </div>
        ),
      });
    }
  };

  const handleUpdateTask = (id: string, title: string, description?: string) => {
    const updatedTasks = tasks.map((task) => 
      (task.id === id ? { ...task, title, description } : task)
    );
    setTasks(updatedTasks); // Update the global state
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks); // Update the global state
  };

  const ongoingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <div className="relative space-y-10">
      {showConfetti && <Confetti />}

      <motion.div layout className="space-y-10">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="pb-4">
              <AddTaskForm onAddTask={handleAddTask} />
            </div>
            {ongoingTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {ongoingTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                      onUpdate={handleUpdateTask}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <p className="text-muted-foreground p-4 text-center">
                Nothing to do! Add a task above.
              </p>
            )}
          </CardContent>
        </Card>

        {completedTasks.length > 0 && (
          <Card className="bg-card/60 backdrop-blur-sm border-border/30 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-shadow">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {completedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                      onUpdate={handleUpdateTask}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
