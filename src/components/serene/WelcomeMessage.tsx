
'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useRef } from 'react';
import { getWelcomeMessageAction, getGreetingSpeechAction } from '@/app/actions';
import type { Task } from '@/lib/types';
import { Button } from '../ui/button';
import { Volume2, Loader, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '@/hooks/use-theme';

type CachedMessage = {
  message: string;
  focus: string;
  timestamp: number;
};

type WelcomeMessageProps = {
  tasks: Task[];
};

const getGreetingContext = (date: Date) => {
  let hours = date.getHours();
  let day = date.getDay();

  if (hours >= 0 && hours < 5) {
    day = (day - 1 + 7) % 7;
  }

  const timeOfDay = (hours: number): string => {
    if (hours >= 5 && hours < 12) return 'morning';
    if (hours >= 12 && hours < 17) return 'afternoon';
    if (hours >= 17 && hours < 21) return 'evening';
    return 'night';
  };

  const dayOfWeek = (day: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  return {
    timeOfDay: timeOfDay(hours),
    dayOfWeek: dayOfWeek(day),
  };
};

export function WelcomeMessage({ tasks }: WelcomeMessageProps) {
  const { name } = useAppContext();
  const [welcomeMessage, setWelcomeMessage] = useState<CachedMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const taskStateIdentifier = JSON.stringify(tasks);

  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const currentTime = new Date();
        const { timeOfDay, dayOfWeek } = getGreetingContext(currentTime);

        const cacheKey = `welcomeMessage:${name}:${taskStateIdentifier}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          const parsedCache: CachedMessage = JSON.parse(cached);
          const oneHour = 60 * 60 * 1000;
          if (currentTime.getTime() - parsedCache.timestamp < oneHour) {
            setWelcomeMessage(parsedCache);
            setIsLoading(false);
            return;
          }
        }

        const response = await getWelcomeMessageAction(tasks, timeOfDay, dayOfWeek, name || undefined);

        if (response.message && response.focus) {
          const newMessage: CachedMessage = {
            message: response.message,
            focus: response.focus,
            timestamp: currentTime.getTime(),
          };
          setWelcomeMessage(newMessage);
          localStorage.setItem(cacheKey, JSON.stringify(newMessage));
        } else {
          throw new Error('Failed to get a valid welcome message from the action.');
        }
      } catch (err) {
        console.error('Error fetching welcome message:', err);
        setError('Could not load greeting. Please try again later.');
        setWelcomeMessage({ message: `Let's get to work, ${name || 'friend'}.`, focus: 'What is our first objective?', timestamp: Date.now() });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWelcomeMessage();
  }, [name, taskStateIdentifier]);

  const handlePlaySpeech = async () => {
    if (!welcomeMessage?.message || isSpeaking) return;

    setIsSpeaking(true);
    setError(null);
    const fullMessage = `${welcomeMessage.message} ${welcomeMessage.focus}`;

    try {
      const result = await getGreetingSpeechAction(fullMessage);
      if (result && result.audio && audioRef.current) {
        audioRef.current.src = result.audio;
        audioRef.current.play();
      } else {
        throw new Error('Audio generation failed or returned no audio data.');
      }
    } catch (err) {
      console.error("Error playing speech:", err);
      setError("Could not play the greeting.");
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    const handleEnded = () => setIsSpeaking(false);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4 w-full">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-grow"
    >
      <h1 className="text-2xl sm:text-4xl font-headline font-bold text-shadow leading-tight mb-2">
        {welcomeMessage?.message}
      </h1>
      <div className="flex items-center gap-3">
        <p className="text-sm sm:text-lg text-muted-foreground">
          {welcomeMessage?.focus}
        </p>
        <Button onClick={handlePlaySpeech} variant="ghost" size="icon" className="shrink-0" disabled={isSpeaking}>
          {isSpeaking ? <Loader className="animate-spin" /> : <Volume2 />}
          <span className="sr-only">Listen to greeting</span>
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive mt-2 flex items-center gap-2">
          <AlertTriangle className="size-4" /> {error}
        </p>
      )}
    </motion.div>
  );
}
