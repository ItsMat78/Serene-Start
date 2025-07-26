
'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

type Theme = 'light' | 'dark' | 'custom';

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  customWallpaper: string;
  setCustomWallpaper: (url: string) => void;
  backgroundDim: number;
  setBackgroundDim: (dim: number) => void;
  name: string;
  setName: (name: string) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [customWallpaper, setCustomWallpaperState] = useState<string>('');
  const [backgroundDim, setBackgroundDimState] = useState<number>(0.3);
  const [name, setNameState] = useState<string>('');
  
  useEffect(() => {
    try {
        const storedTheme = localStorage.getItem('serene-theme') as Theme | null;
        const storedWallpaper = localStorage.getItem('serene-wallpaper');
        const storedDim = localStorage.getItem('serene-bg-dim');
        const storedName = localStorage.getItem('serene-name');
        
        if (storedTheme) setThemeState(storedTheme);
        if (storedWallpaper) setCustomWallpaperState(storedWallpaper);
        if (storedDim) setBackgroundDimState(parseFloat(storedDim));
        if (storedName) setNameState(storedName);

    } catch (e) {
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

  const setBackgroundDim = (dim: number) => {
    try {
      localStorage.setItem('serene-bg-dim', dim.toString());
    } catch (e) {
      // Ignore localStorage errors
    }
    setBackgroundDimState(dim);
  }

  const setName = (newName: string) => {
    try {
        localStorage.setItem('serene-name', newName);
    } catch (e) {
        // Ignore localStorage errors
    }
    setNameState(newName);
  };
  
  const value = useMemo(() => ({
    theme,
    setTheme,
    customWallpaper,
    setCustomWallpaper,
    backgroundDim,
    setBackgroundDim,
    name,
    setName
  }), [theme, customWallpaper, backgroundDim, name]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function ThemeBody({ children }: { children: React.ReactNode }) {
    const { theme, customWallpaper, backgroundDim } = useTheme();

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'custom');
        
        const body = window.document.body;
        body.style.backgroundImage = '';
        body.style.backgroundSize = '';
        body.style.backgroundPosition = '';
        body.style.backgroundAttachment = '';

        if (theme === 'custom' && customWallpaper) {
            root.classList.add('custom', 'dark');
            body.style.backgroundImage = `linear-gradient(rgba(0,0,0,${backgroundDim}), rgba(0,0,0,${backgroundDim})), url('${customWallpaper}')`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundAttachment = 'fixed';
        } else {
            root.classList.add(theme);
        }
    }, [theme, customWallpaper, backgroundDim]);
  
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
