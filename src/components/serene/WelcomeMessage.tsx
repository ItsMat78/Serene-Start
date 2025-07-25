'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { getWelcomeMessageAction } from '@/app/actions';
import type { Task } from '@/lib/types';

type CachedMessage = {
  message: string;
  focus: string;
  timestamp: number;
};

type WelcomeMessageProps = {
  tasks: Task[];
};

export function WelcomeMessage({ tasks }: WelcomeMessageProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getMessage = async () => {
      setIsLoading(true);
      try {
        const cachedItem = localStorage.getItem('welcomeMessage');
        const taskTitles = tasks.map((t) => t.title).join(',');
        
        // A simple way to check if tasks have changed to invalidate cache
        const cacheKey = `welcomeMessage:${taskTitles}`;

        if (cachedItem) {
          const cachedData: CachedMessage = JSON.parse(cachedItem);
          const oneHour = 60 * 60 * 1000;
          if (Date.now() - cachedData.timestamp < oneHour) {
            setMessage(cachedData.message);
            setFocus(cachedData.focus);
            setIsLoading(false);
            return;
          }
        }
        
        const taskTitleList = tasks.map(t => t.title);
        // For now, we'll use the hardcoded name. In a real app, this would come from user auth.
        const result = await getWelcomeMessageAction(taskTitleList, 'Shreyash');
        
        setMessage(result.message);
        setFocus(result.focus);

        const newCachedData: CachedMessage = {
          message: result.message,
          focus: result.focus,
          timestamp: Date.now(),
        };
        localStorage.setItem('welcomeMessage', JSON.stringify(newCachedData));
      } catch (error) {
        console.error(error);
        setMessage("Welcome! Let's have a great day.");
        setFocus("What will you accomplish today?");
      } finally {
        setIsLoading(false);
      }
    };
    // Debounce or delay the call slightly to avoid rapid calls on task changes
    const timer = setTimeout(() => {
        getMessage();
    }, 500);

    return () => clearTimeout(timer);
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4 md:w-1/2 mx-auto" />
        <Skeleton className="h-4 w-full md:w-2/3 mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-2 pr-4">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground/90 tracking-tight transition-all duration-500 animate-in fade-in">
          {message}
        </h1>
        {focus && (
            <p className="text-lg text-muted-foreground transition-all duration-500 animate-in fade-in delay-100">
                {focus}
            </p>
        )}
    </div>
  );
}
