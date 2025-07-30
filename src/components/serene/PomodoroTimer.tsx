'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Coffee, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAlarmSpeechAction } from '@/app/actions';

const PRESETS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

type Mode = keyof typeof PRESETS;

export function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [time, setTime] = useState(PRESETS[mode]);
  const [isActive, setIsActive] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const workerRef = useRef<Worker>();

  useEffect(() => {
    // Create the worker
    workerRef.current = new Worker(new URL('../workers/timer.worker.ts', import.meta.url));
    workerRef.current.postMessage({ type: 'set', value: PRESETS[mode] });

    // Listen for messages from the worker
    workerRef.current.onmessage = (e: MessageEvent) => {
        const {type, value} = e.data;
        if (type === "tick") {
            setTime(value);
            if (value === 0) {
                setIsActive(false);
            }
        }
    };

    // Cleanup
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (time === 0) {
        if (!isGeneratingSpeech) {
            setIsGeneratingSpeech(true);
            getAlarmSpeechAction().then(({ audio }) => {
              if (audio) {
                const alarm = new Audio(audio);
                alarm.play();
              }
              setIsGeneratingSpeech(false);
            });
          }
    }
  }, [time, isGeneratingSpeech])

  useEffect(() => {
    document.title = `${formatTime(time)} - Serenity Start`;
  }, [time]);

  const toggleTimer = () => {
    if (isActive) {
        workerRef.current?.postMessage({type: "pause"})
    } else {
        workerRef.current?.postMessage({type: "start"})
    }
    setIsActive(!isActive);
  };

  const resetTimer = useCallback(() => {
    workerRef.current?.postMessage({type: "reset", value: PRESETS[mode]})
    setIsActive(false);
    setTime(PRESETS[mode]);
  }, [mode]);

  const changeMode = (newMode: Mode) => {
    setMode(newMode);
    setIsActive(false);
    const newTime = PRESETS[newMode];
    setTime(newTime);
    workerRef.current?.postMessage({type: "reset", value: newTime});
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const progress = useMemo(() => {
    return (1 - time / PRESETS[mode]) * 100;
  }, [time, mode]);
  
  const ActiveIcon = useMemo(() => {
    if (mode === 'pomodoro') return <Briefcase className="mr-2" />;
    return <Coffee className="mr-2" />;
  }, [mode]);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-shadow">Timer</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <Tabs value={mode} onValueChange={(value) => changeMode(value as Mode)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-primary/10">
            <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
            <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
            <TabsTrigger value="longBreak">Long Break</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative size-48 md:size-56 flex items-center justify-center">
            <svg className="absolute inset-0" viewBox="0 0 100 100">
                <circle className="stroke-current text-primary/30" strokeWidth="4" cx="50" cy="50" r="45" fill="transparent" />
                <motion.circle
                  className="stroke-current text-primary"
                  strokeWidth="4"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 * (1 - progress / 100)}
                  transform="rotate(-90 50 50)"
                  transition={{ duration: 0.5, ease: 'linear' }}
                />
            </svg>
            <AnimatePresence mode="wait">
              <motion.div
                key={time}
                initial={{ opacity: 0.5, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0.5, y: -5 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="text-5xl md:text-6xl font-mono font-bold text-foreground tabular-nums text-shadow-lg"
              >
                {formatTime(time)}
              </motion.div>
            </AnimatePresence>
        </div>

        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={toggleTimer} size="lg" className="w-32 bg-primary hover:bg-primary/90 rounded-full shadow-md">
              {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
              {isActive ? 'Pause' : 'Start'}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, rotate: -15 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={resetTimer} variant="ghost" size="icon" className="size-12 rounded-full">
              <RotateCcw />
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
