'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './use-auth';
import { saveUserData, getUserData } from '@/lib/firestore';

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
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('dark');
  const [customWallpaper, setCustomWallpaperState] = useState<string>('');
  const [backgroundDim, setBackgroundDimState] = useState<number>(0.3);
  const [name, setNameState] = useState<string>('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Effect to load user data from the correct source (Firestore or localStorage)
  useEffect(() => {
    const loadUserSettings = async () => {
      setIsDataLoaded(false); // Start loading
      if (user) {
        // LOGGED IN: Ignore localStorage, load from Firestore.
        const userData = await getUserData(user.uid);
        setThemeState(userData?.theme || 'dark');
        setCustomWallpaperState(userData?.customWallpaper || '');
        setBackgroundDimState(userData?.backgroundDim ?? 0.3);
        setNameState(userData?.name || user.displayName?.split(' ')[0] || '');
      } else {
        // LOGGED OUT: Load from localStorage.
        const storedTheme = localStorage.getItem('serene-theme') as Theme | null;
        const storedWallpaper = localStorage.getItem('serene-wallpaper');
        const storedDim = localStorage.getItem('serene-bg-dim');
        const storedName = localStorage.getItem('serene-name');
        setThemeState(storedTheme || 'dark');
        setCustomWallpaperState(storedWallpaper || '');
        setBackgroundDimState(storedDim ? parseFloat(storedDim) : 0.3);
        setNameState(storedName || '');
      }
      setIsDataLoaded(true); // Done loading
    };

    loadUserSettings();
  }, [user]);

  // Effect to SAVE data automatically when it changes
  useEffect(() => {
    // Only save data if the user is logged in and the initial data load is complete.
    // This prevents writing default values to the database on first load.
    if (user && isDataLoaded) {
      const settingsToSave = {
        name,
        theme,
        customWallpaper,
        backgroundDim,
      };
      saveUserData(user.uid, settingsToSave);
    }
  }, [user, name, theme, customWallpaper, backgroundDim, isDataLoaded]);


  // State setters now only need to update the state. The `useEffect` above handles persistence.
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (!user) {
      localStorage.setItem('serene-theme', newTheme);
    }
  };
  
  const setCustomWallpaper = (url: string) => {
    setCustomWallpaperState(url);
    if (!user) {
      localStorage.setItem('serene-wallpaper', url);
    }
  };

  const setBackgroundDim = (dim: number) => {
    setBackgroundDimState(dim);
    if (!user) {
      localStorage.setItem('serene-bg-dim', dim.toString());
    }
  };

  const setName = (newName: string) => {
    const firstName = newName.trim().split(' ')[0];
    setNameState(firstName);
    if (!user) {
      localStorage.setItem('serene-name', firstName);
    }
  };
  
  const value = useMemo(() => ({
    theme,
    setTheme,
    customWallpaper,
    setCustomWallpaper,
    backgroundDim,
    setBackgroundDim,
    name,
    setName,
  }), [theme, customWallpaper, backgroundDim, name]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {isDataLoaded ? children : null}
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
