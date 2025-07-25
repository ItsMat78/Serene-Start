'use client';

import { cn } from '@/lib/utils';
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
  // This component will only handle providing the context
  const [theme, setThemeState] = useState<Theme>('dark'); // Default to dark
  const [customWallpaper, setCustomWallpaperState] = useState<string>('');
  
  useEffect(() => {
    // This effect runs once on the client to get values from localStorage
    try {
        const storedTheme = localStorage.getItem('serene-theme') as Theme | null;
        const storedWallpaper = localStorage.getItem('serene-wallpaper');
        
        if (storedTheme) setThemeState(storedTheme);
        if (storedWallpaper) setCustomWallpaperState(storedWallpaper);
    } catch (e) {
        // localStorage might be disabled
        console.error("Could not access localStorage for theme.", e)
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

  const value = useMemo(() => ({
    theme,
    setTheme,
    customWallpaper,
    setCustomWallpaper
  }), [theme, customWallpaper]); // Dependencies updated to reflect functions are stable now

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// New component to apply body styles
export function ThemeBody({ children }: { children: React.ReactNode }) {
    const { theme, customWallpaper } = useTheme();
  
    useEffect(() => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark', 'custom');
      root.classList.add(theme);

      const body = window.document.body;
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
  
    // Use `antialiased` and `font-body` from original RootLayout
    return (
        <body className="font-body antialiased">
            {children}
        </body>
    )
}


export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
