'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

type Theme = 'light' | 'dark' | 'custom';

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  customWallpaper: string;
  setCustomWallpaper: (url: string) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [customWallpaper, setCustomWallpaperState] = useState<string>('');
  
  useEffect(() => {
    const storedTheme = localStorage.getItem('serene-theme') as Theme | null;
    const storedWallpaper = localStorage.getItem('serene-wallpaper');
    
    if (storedTheme) {
      setThemeState(storedTheme);
    }
    if (storedWallpaper) {
      setCustomWallpaperState(storedWallpaper);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('serene-theme', newTheme);
    setThemeState(newTheme);
  };
  
  const setCustomWallpaper = (url: string) => {
    localStorage.setItem('serene-wallpaper', url);
    setCustomWallpaperState(url);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    root.classList.remove('light', 'dark', 'custom');
    root.classList.add(theme);

    if (theme === 'custom' && customWallpaper) {
      body.style.backgroundImage = `url(${customWallpaper})`;
      body.style.backgroundSize = 'cover';
      body.style.backgroundPosition = 'center';
      body.style.backgroundAttachment = 'fixed';
    } else {
      body.style.backgroundImage = '';
    }
  }, [theme, customWallpaper]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    customWallpaper,
    setCustomWallpaper
  }), [theme, customWallpaper]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
