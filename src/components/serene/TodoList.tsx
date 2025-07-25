'use client';

import { useEffect, useState } from 'react';
import type { Task } from '@/lib/types';
import { AddTaskForm } from './AddTaskForm';
import { TaskItem } from './TaskItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { Confetti } from './Confetti';
import { useToast } from '@/hooks/use-toast';
import { PartyPopper } from 'lucide-react';

const TASK_COLORS = ['#64B5F6', '#81C784', '#FFD54F', '#FF8A65', '#9575CD', '#F06292'];

export function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('serene-tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Failed to load tasks from local storage', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('serene-tasks', JSON.stringify(tasks));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tasks-updated', { detail: { tasks } }));
      }
    } catch (error) {
      console.error('Failed to save tasks to local storage', error);
    }
  }, [tasks]);

  const handleAddTask = (title: string, description?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      completed: false,
      color: TASK_COLORS[Math.floor(Math.random() * TASK_COLORS.length)],
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    let taskTitle = '';
    let isCompleting = false;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          if (!task.completed) {
            taskTitle = task.title;
            isCompleting = true;
          }
          return { ...task, completed: !task.completed };
        }
        return task;
      })
    );

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
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, title, description } : task))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const ongoingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <div className="relative space-y-10">
      {showConfetti && <Confetti />}

      <motion.div layout className="space-y-10">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg overflow-hidden">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-shadow">Ongoing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="pb-4">
              <AddTaskForm onAddTask={handleAddTask} />
            </div>
            {ongoingTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
