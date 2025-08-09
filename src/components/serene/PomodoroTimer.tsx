
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

const PRESETS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

type Mode = keyof typeof PRESETS;

export function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [customTime, setCustomTime] = useState(PRESETS.pomodoro);
  const [time, setTime] = useState(PRESETS.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(Math.floor(customTime / 60)));
  const workerRef = useRef<Worker>();
  const isMobile = useIsMobile();

  const getActivePreset = () => (mode === 'pomodoro' ? customTime : PRESETS[mode]);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../../workers/timer.worker.ts', import.meta.url));
    workerRef.current.postMessage({ type: 'set', value: getActivePreset() });
    workerRef.current.postMessage({ type: 'setMode', value: mode });

    workerRef.current.onmessage = (e: MessageEvent) => {
        const {type, value} = e.data;
        if (type === "tick") {
            setTime(value);
            if (value === 0) {
                setIsActive(false);
            }
        } else if (type === "alarm") {
            const alarmFile = `/sounds/${value}_alarm.wav`;
            const alarm = new Audio(alarmFile);
            alarm.play().catch(error => console.error(`Could not play alarm: ${alarmFile}`, error));
        }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    document.title = `${formatTime(time)} - Serenity Start`;
  }, [time]);

  const toggleTimer = () => {
    if (isEditing) setIsEditing(false);
    if (isActive) {
      workerRef.current?.postMessage({ type: 'pause' });
    } else {
      if (time === 0) {
        const newTime = getActivePreset();
        setTime(newTime);
        workerRef.current?.postMessage({ type: 'reset', value: newTime });
      }
      workerRef.current?.postMessage({ type: 'start' });
    }
    setIsActive(!isActive);
  };

  const resetTimer = useCallback(() => {
    if (isEditing) setIsEditing(false);
    const newTime = getActivePreset();
    workerRef.current?.postMessage({type: "reset", value: newTime})
    setIsActive(false);
    setTime(newTime);
  }, [mode, customTime]);

  const changeMode = (newMode: Mode) => {
    setMode(newMode);
    setIsActive(false);
    setIsEditing(false);
    const newTime = newMode === 'pomodoro' ? customTime : PRESETS[newMode];
    setTime(newTime);
    workerRef.current?.postMessage({type: "reset", value: newTime});
    workerRef.current?.postMessage({ type: 'setMode', value: newMode });
  };
  
  const handleSaveCustomTime = () => {
      let value = parseInt(editValue, 10);
      if (isNaN(value) || value < 1) {
        value = 1; 
      }
      if (value > 999) value = 999;
      
      const newTimeInSeconds = value * 60;
      setCustomTime(newTimeInSeconds);
      setEditValue(String(value));
      
      if(mode === 'pomodoro' && !isActive) {
          setTime(newTimeInSeconds);
          workerRef.current?.postMessage({ type: 'reset', value: newTimeInSeconds });
      }
      setIsEditing(false);
  };

  const startEditing = () => {
    if (mode !== 'pomodoro' || isActive || isEditing) return;
    setEditValue(String(Math.floor(customTime / 60)));
    setIsEditing(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const progress = useMemo(() => {
    const total = getActivePreset();
    if (total === 0) return 0;
    return (1 - time / total) * 100;
  }, [time, mode, customTime]);
  
  const renderTimeDisplay = (isMobileLayout: boolean) => {
    const inputClassName = isMobileLayout 
        ? "w-16 h-8 text-center text-lg font-mono font-bold bg-primary/10 border-primary/20"
        : "w-28 h-14 text-center text-5xl font-mono font-bold bg-primary/10 border-primary/20";
    
    const timeClassName = isMobileLayout
        ? "text-xl font-mono font-bold text-foreground tabular-nums"
        : "text-5xl md:text-6xl font-mono font-bold text-foreground tabular-nums text-shadow-lg";

    if (isEditing && mode === 'pomodoro') {
      return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-1">
          <Input 
            type="number" 
            value={editValue}
            onChange={(e) => setEditValue(e.target.value.replace(/[^0-9]/g, ''))}
            className={inputClassName}
            autoFocus
            onBlur={handleSaveCustomTime}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCustomTime() }}
          />
        </motion.div>
      )
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={time}
                initial={{ opacity: 0.5, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0.5, y: -5 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={timeClassName}
            >
                {formatTime(time)}
            </motion.div>
        </AnimatePresence>
    )
  }

  if (isMobile) {
    return (
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg w-full">
            <CardContent className="p-3 space-y-3">
                 <Tabs value={mode} onValueChange={(value) => changeMode(value as Mode)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-primary/10 h-9">
                        <TabsTrigger value="pomodoro" className="text-xs">Focus</TabsTrigger>
                        <TabsTrigger value="shortBreak" className="text-xs">Short Break</TabsTrigger>
                        <TabsTrigger value="longBreak" className="text-xs">Long Break</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex items-center gap-4 w-full">
                    <div className="flex-grow space-y-1">
                        <div 
                          className="flex justify-between items-center px-1 h-8"
                          onClick={startEditing}
                        >
                            {renderTimeDisplay(true)}
                        </div>
                        <Progress value={progress} className="w-full h-2" indicatorClassName="bg-brand" />
                    </div>
                     <div className="flex items-center flex-shrink-0">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button onClick={toggleTimer} size="sm" className="w-24 bg-brand hover:bg-brand/90 rounded-full shadow-md">
                            {isActive ? <Pause className="mr-1.5 size-4" /> : <Play className="mr-1.5 size-4" />}
                            {isActive ? 'Pause' : 'Start'}
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05, rotate: -15 }} whileTap={{ scale: 0.95 }}>
                            <Button onClick={resetTimer} variant="ghost" size="icon" className="size-9 rounded-full">
                            <RotateCcw className="size-4"/>
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg w-full">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-shadow">Timer</CardTitle>
        </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 p-4 md:p-6">
        <Tabs value={mode} onValueChange={(value) => changeMode(value as Mode)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-primary/10">
            <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
            <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
            <TabsTrigger value="longBreak">Long Break</TabsTrigger>
          </TabsList>
        </Tabs>

        <div 
          className={cn(
            "relative size-48 md:size-56 flex items-center justify-center",
             mode === 'pomodoro' && !isActive && "cursor-pointer rounded-full"
          )}
          onClick={startEditing}
        >
            <svg className="absolute inset-0" viewBox="0 0 100 100">
                <circle className="stroke-current text-primary/30" strokeWidth="4" cx="50" cy="50" r="45" fill="transparent" />
                <motion.circle
                    className="stroke-current text-brand"
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
            {renderTimeDisplay(false)}
        </div>

        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={toggleTimer} size='lg' className="w-32 bg-brand hover:bg-brand/90 rounded-full shadow-md">
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
