
'use client';

import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center">
      <Sparkles className="mr-2 text-foreground" size={18} />
      <h1 className="text-sm font-bold text-muted-foreground">
        Serenity Start by Shreyash
      </h1>
    </header>
  );
}
