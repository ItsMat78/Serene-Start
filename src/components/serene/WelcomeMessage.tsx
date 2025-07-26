'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useRef } from 'react';
import { getWelcomeMessageAction, getGreetingSpeechAction } from '@/app/actions';
import type { Task } from '@/lib/types';
import { Button } from '../ui/button';
import { Volume2, Loader, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '@/hooks/use-theme'; // Corrected import to useAppContext

type CachedMessage = {
  message: string;
  focus: string;
  timestamp: number;
};

type WelcomeMessageProps = {
  tasks: Task[];
};

export function WelcomeMessage({ tasks }: WelcomeMessageProps) {
  const { name } = useAppContext(); // Using useAppContext
  const [welcomeMessage, setWelcomeMessage] = useState<CachedMessage | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      setMessageLoading(true);
      setError(null);
      try {
        const currentTime = new Date();
        const timeOfDay = getTimeOfDay(currentTime.getHours());
        const dayOfWeek = getDayOfWeek(currentTime.getDay());

        const cached = localStorage.getItem('welcomeMessageCache');
        if (cached) {
          const parsedCache: CachedMessage = JSON.parse(cached);
          const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
          if (currentTime.getTime() - parsedCache.timestamp < oneHour) {
            setWelcomeMessage(parsedCache);
            setMessageLoading(false);
            return;
          }
        }

        // CORRECTED: Pass arguments positionally
        const response = await getWelcomeMessageAction(tasks, timeOfDay, dayOfWeek, name);

        if (response.message && response.focus) {
          const newMessage: CachedMessage = {
            message: response.message,
            focus: response.focus,
            timestamp: currentTime.getTime(),
          };
          setWelcomeMessage(newMessage);
          localStorage.setItem('welcomeMessageCache', JSON.stringify(newMessage));
        } else {
          setError('Failed to load welcome message.');
        }
      } catch (err) {
        console.error('Error fetching welcome message:', err);
        setError('Failed to load welcome message. Please try again later.');
      } finally {
        setMessageLoading(false);
      }
    };

    fetchWelcomeMessage();
  }, [name, tasks]);

  const handleSpeakGreeting = async () => {
    if (speaking) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setSpeaking(false);
      return;
    }

    if (!welcomeMessage?.message) return;

    setSpeaking(true);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const audioBase64 = await getGreetingSpeechAction(welcomeMessage.message);
      if (audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
        audio.play();
        audio.onended = () => setSpeaking(false);
        audio.onpause = () => setSpeaking(false);
        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          setError("Could not play greeting.");
          setSpeaking(false);
        };
      } else {
        setError("Could not generate speech.");
        setSpeaking(false);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Speech synthesis aborted');
      } else {
        console.error("Error getting greeting speech:", err);
        setError("Failed to generate speech. " + (err.message || ''));
      }
      setSpeaking(false);
    }
  };

  if (messageLoading) {
    return (
      <div className="space-y-4 w-full">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-10 w-24" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-500">
        <AlertTriangle className="h-5 w-5" />
        <span>Error: {error}</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-grow max-w-xl"
    >
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-bold text-shadow leading-tight mb-4">
        {welcomeMessage?.message}
      </h1>
      <p className="text-lg sm:text-xl text-muted-foreground mb-6">
        {welcomeMessage?.focus}
      </p>
      <Button 
        onClick={handleSpeakGreeting} 
        variant="outline" 
        size="lg"
        disabled={speaking}
      >
        {speaking ? (
          <Loader className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Volume2 className="mr-2 h-5 w-5" />
        )}
        {speaking ? 'Stop Listening' : 'Listen'}
      </Button>
    </motion.div>
  );
}

const getTimeOfDay = (hours: number): string => {
  if (hours >= 5 && hours < 12) return 'morning';
  if (hours >= 12 && hours < 17) return 'afternoon';
  if (hours >= 17 && hours < 21) return 'evening';
  return 'night';
};

const getDayOfWeek = (day: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day];
};
