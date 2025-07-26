
'use client';

import { useEffect, useState } from 'react';
import type { Task } from '@/lib/types';
import { WelcomeMessage } from './WelcomeMessage';
import { useTheme } from '@/hooks/use-theme';

export function WelcomeMessageWrapper() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { name } = useTheme();

  useEffect(() => {
    const handleTasksUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      setTasks(customEvent.detail.tasks);
    };
    
    // Set initial tasks from localStorage
    try {
      const storedTasks = localStorage.getItem('serene-tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
        console.error("Failed to load tasks from local storage for WelcomeMessage", error)
    }

    window.addEventListener('tasks-updated', handleTasksUpdated);
    return () => {
      window.removeEventListener('tasks-updated', handleTasksUpdated);
    };
  }, []);
  
  const ongoingTasks = tasks.filter((task) => !task.completed);

  return <WelcomeMessage tasks={ongoingTasks} name={name} />;
}
