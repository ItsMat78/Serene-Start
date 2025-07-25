'use client';

import { useState, useEffect } from 'react';

export function DateTimeDisplay() {
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    setDate(new Date());
    const timerId = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  if (!date) {
    return (
        <div className="text-right space-y-1">
            <div className="h-10 w-32 bg-muted rounded-md animate-pulse" />
            <div className="h-5 w-40 bg-muted rounded-md animate-pulse" />
        </div>
    )
  }

  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const day = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dayAndMonth = date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });

  return (
    <div className="text-right flex-shrink-0 w-full lg:w-72">
      <p className="text-4xl md:text-5xl font-bold text-foreground/90 tabular-nums">{time}</p>
      <p className="text-lg text-muted-foreground">{day}, {dayAndMonth}</p>
    </div>
  );
}
