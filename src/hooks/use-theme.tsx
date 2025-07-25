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
    try {
        const storedTheme = localStorage.getItem('serene-theme') as Theme | null;
        const storedWallpaper = localStorage.getItem('serene-wallpaper');
        
        if (storedTheme) {
          setThemeState(storedTheme);
        } else {
          setThemeState('dark'); // Default to dark if nothing is stored
        }

        if (storedWallpaper) {
          setCustomWallpaperState(storedWallpaper);
        }
    } catch (e) {
        // If localStorage is not available, default to dark theme.
        setThemeState('dark');
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    try {
        localStorage.setItem('serene-theme', newTheme);
    } catch (e) {
        // Ignore localStorage errors
    }
    setThemeState(newTheme);
  };
  
  const setCustomWallpaper = (url: string) => {
     try {
        localStorage.setItem('serene-wallpaper', url);
    } catch (e) {
        // Ignore localStorage errors
    }
    setCustomWallpaperState(url);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    root.classList.remove('light', 'dark', 'custom');
    root.classList.add(theme);

    if (theme === 'custom' && customWallpaper) {
      body.style.backgroundImage = `url('${customWallpaper}')`;
      body.style.backgroundSize = 'cover';
      body.style.backgroundPosition = 'center';
      body.style.backgroundAttachment = 'fixed';
    } else {
      body.style.backgroundImage = '';
    }

    return () => {
        // Cleanup style when component unmounts or theme changes
        body.style.backgroundImage = '';
    }
  }, [theme, customWallpaper]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    customWallpaper,
    setCustomWallpaper
  }), [theme, customWallpaper, setTheme, setCustomWallpaper]);

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
