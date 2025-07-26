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
import { useAuth } from '@/hooks/use-auth';
import { saveUserData, getUserData } from '@/lib/firestore';

const TASK_COLORS = ['#64B5F6', '#81C784', '#FFD54F', '#FF8A65', '#9575CD', '#F06292'];

type TodoListProps = {
  onTasksChange: (tasks: Task[]) => void;
};

export function TodoList({ onTasksChange }: TodoListProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadTasks = async () => {
      if (user) {
        const userData = await getUserData(user.uid);
        if (userData && userData.tasks) {
          setTasks(userData.tasks);
          onTasksChange(userData.tasks);
        }
      } else {
        const storedTasks = localStorage.getItem('serene-tasks');
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          setTasks(parsedTasks);
          onTasksChange(parsedTasks);
        }
      }
    };
    loadTasks();
  }, [user]);

  useEffect(() => {
    const saveTasks = async () => {
      if (user) {
        await saveUserData(user.uid, { tasks });
      } else {
        localStorage.setItem('serene-tasks', JSON.stringify(tasks));
      }
      onTasksChange(tasks);
    };
    // We only save when tasks change, not on initial load
    if (tasks.length > 0 || (tasks.length === 0 && localStorage.getItem('serene-tasks') !== null)) {
        saveTasks();
    }
  }, [tasks, user]);

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
