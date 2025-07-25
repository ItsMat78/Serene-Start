'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { getWelcomeMessageAction } from '@/app/actions';

type CachedMessage = {
  message: string;
  timestamp: number;
};

export function WelcomeMessage() {
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getMessage = async () => {
      setIsLoading(true);
      try {
        const cachedItem = localStorage.getItem('welcomeMessage');
        if (cachedItem) {
          const cachedData: CachedMessage = JSON.parse(cachedItem);
          const oneDay = 24 * 60 * 60 * 1000;
          if (Date.now() - cachedData.timestamp < oneDay) {
            setMessage(cachedData.message);
            setIsLoading(false);
            return;
          }
        }

        const newMessage = await getWelcomeMessageAction();
        setMessage(newMessage);
        const newCachedData: CachedMessage = {
          message: newMessage,
          timestamp: Date.now(),
        };
        localStorage.setItem('welcomeMessage', JSON.stringify(newCachedData));
      } catch (error) {
        console.error(error);
        setMessage("Welcome! Let's have a great day.");
      } finally {
        setIsLoading(false);
      }
    };
    getMessage();
  }, []);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-3/4 md:w-1/2" />
      </div>
    );
  }

  return (
    <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground/90 tracking-tight transition-all duration-500 animate-in fade-in">
      {message}
    </h1>
  );
}
