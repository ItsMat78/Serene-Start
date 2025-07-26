'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useRef } from 'react';
import { getWelcomeMessageAction, getGreetingSpeechAction } from '@/app/actions';
import type { Task } from '@/lib/types';
import { Button } from '../ui/button';
import { Volume2, Loader, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const getMessage = async () => {
      setIsLoading(true);
      try {
        const tasksIdentifier = tasks.map(t => `${t.title}:${t.description || ''}`).join(',');
        const cacheKey = `welcomeMessage:${tasksIdentifier}`;
        
        const cachedItem = localStorage.getItem(cacheKey);

        if (cachedItem) {
          const cachedData: CachedMessage = JSON.parse(cachedItem);
          const thirtyMinutes = 30 * 60 * 1000;
          if (Date.now() - cachedData.timestamp < thirtyMinutes) {
            setMessage(cachedData.message);
            setFocus(cachedData.focus);
            setIsLoading(false);
            return;
          }
        }
        
        const taskPayload = tasks.map(({ title, description }) => ({ title, description }));
        // For now, we'll use the hardcoded name. In a real app, this would come from user auth.
        const result = await getWelcomeMessageAction(taskPayload, 'Shreyash');
        
        setMessage(result.message);
        setFocus(result.focus);

        const newCachedData: CachedMessage = {
          message: result.message,
          focus: result.focus,
          timestamp: Date.now(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(newCachedData));
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

  const handlePlaySpeech = async () => {
    if (!message || isSpeaking) return;

    setIsSpeaking(true);
    setSpeechError(null);
    const fullMessage = `${message}. ${focus || ''}`;

    try {
      const result = await getGreetingSpeechAction(fullMessage);
      if (result.audio) {
        if (audioRef.current) {
          audioRef.current.src = result.audio;
          audioRef.current.play();
        }
      } else {
        throw new Error('Audio generation failed.');
      }
    } catch (error) {
      console.error(error);
      setSpeechError('Could not play audio. Please try again.');
    }
  };
  
  useEffect(() => {
    // Setup audio element and its event listeners
    const audio = new Audio();
    audioRef.current = audio;

    const handleEnded = () => setIsSpeaking(false);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audioRef.current = null;
    }
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64 md:w-80" />
        <Skeleton className="h-4 w-full md:w-96" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground/90 tracking-tight transition-all duration-500 animate-in fade-in">
          {message}
        </h1>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button onClick={handlePlaySpeech} variant="ghost" size="icon" className="size-11" disabled={isSpeaking}>
            {isSpeaking ? (
                <Loader className="animate-spin" />
            ) : (
                <Volume2 className="size-6" />
            )}
            <span className="sr-only">Play greeting</span>
          </Button>
        </motion.div>
      </div>

        {focus && (
            <p className="text-lg text-muted-foreground transition-all duration-500 animate-in fade-in delay-100">
                {focus}
            </p>
        )}
        {speechError && (
             <p className="text-sm text-destructive flex items-center gap-2">
                <AlertTriangle className="size-4" /> {speechError}
            </p>
        )}
    </div>
  );
}
