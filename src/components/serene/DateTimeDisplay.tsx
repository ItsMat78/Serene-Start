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
            <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded-md animate-pulse" />
        </div>
    )
  }

  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const day = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dayAndMonth = date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });

  return (
    <div className="text-right flex-shrink-0">
      <p className="text-2xl font-semibold text-foreground/90 tabular-nums">{time}</p>
      <p className="text-sm text-muted-foreground">{day}, {dayAndMonth}</p>
    </div>
  );
}
