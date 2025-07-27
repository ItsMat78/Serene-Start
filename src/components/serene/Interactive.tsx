'use client';

import { invoke } from '@tauri-apps/api/core';
import React from 'react';

type InteractiveProps = {
  children: React.ReactNode;
  className?: string;
};

export function Interactive({ children, className }: InteractiveProps) {
  const handleMouseEnter = () => {
    invoke('set_interactive');
  };

  const handleMouseLeave = () => {
    invoke('set_ignore');
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </div>
  );
}
