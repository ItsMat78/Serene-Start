'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './use-auth';
import { saveUserData, getUserData } from '@/lib/firestore';
import { Task } from '@/lib/types'; // Assuming Task type is defined here

type Theme = 'light' | 'dark' | 'custom';

type AppState = {
  theme: Theme;
  customWallpaper: string;
  backgroundDim: number;
  name: string;
  tasks: Task[];
};

type AppContextState = AppState & {
  setTheme: (theme: Theme) => void;
  setCustomWallpaper: (url: string) => void;
  setBackgroundDim: (dim: number) => void;
  setName: (name: string) => void;
  setTasks: (tasks: Task[]) => void;
  isDataLoaded: boolean;
};

const AppContext = createContext<AppContextState | undefined>(undefined);

// --- Default Guest State ---
const defaultState: AppState = {
    theme: 'dark',
    customWallpaper: '',
    backgroundDim: 0.3,
    name: '',
    tasks: [],
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<AppState>(defaultState);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Effect to SAVE data to the correct source whenever it changes
  useEffect(() => {
    // We only save after the initial data load is complete.
    if (!isDataLoaded) return;

    if (user) {
      // LOGGED IN: Save the entire state to Firestore.
      saveUserData(user.uid, state);
    } else {
      // LOGGED OUT: Save individual items to localStorage.
      // This is more efficient than writing the whole state object on every change for guests.
      localStorage.setItem('serene-theme', state.theme);
      localStorage.setItem('serene-wallpaper', state.customWallpaper);
      localStorage.setItem('serene-bg-dim', state.backgroundDim.toString());
      localStorage.setItem('serene-name', state.name);
      localStorage.setItem('serene-tasks', JSON.stringify(state.tasks));
    }
  }, [state, user, isDataLoaded]);

  // Effect to LOAD data when auth state changes
  useEffect(() => {
    const loadData = async () => {
      setIsDataLoaded(false); // Begin loading
      if (user) {
        // --- USER IS LOGGED IN ---
        const userData = await getUserData(user.uid);
        setState({
          theme: userData?.theme || defaultState.theme,
          customWallpaper: userData?.customWallpaper || defaultState.customWallpaper,
          backgroundDim: userData?.backgroundDim ?? defaultState.backgroundDim,
          name: userData?.name || user.displayName?.split(' ')[0] || defaultState.name,
          tasks: userData?.tasks || defaultState.tasks,
        });
      } else {
        // --- USER IS LOGGED OUT (GUEST) ---
        const storedTheme = localStorage.getItem('serene-theme') as Theme;
        const storedWallpaper = localStorage.getItem('serene-wallpaper');
        const storedDim = localStorage.getItem('serene-bg-dim');
        const storedName = localStorage.getItem('serene-name');
        const storedTasks = localStorage.getItem('serene-tasks');
        
        setState({
          theme: storedTheme || defaultState.theme,
          customWallpaper: storedWallpaper || defaultState.customWallpaper,
          backgroundDim: storedDim ? parseFloat(storedDim) : defaultState.backgroundDim,
          name: storedName || defaultState.name,
          tasks: storedTasks ? JSON.parse(storedTasks) : defaultState.tasks,
        });
      }
      setIsDataLoaded(true); // End loading
    };

    loadData();
  }, [user]);

  // --- State Update Functions ---
  // These functions simply update the state. The `useEffect` above handles persistence.
  const setTheme = (theme: Theme) => setState(s => ({ ...s, theme }));
  const setCustomWallpaper = (url: string) => setState(s => ({ ...s, customWallpaper: url }));
  const setBackgroundDim = (dim: number) => setState(s => ({ ...s, backgroundDim: dim }));
  const setName = (name: string) => setState(s => ({ ...s, name: name.trim().split(' ')[0] }));
  const setTasks = (tasks: Task[]) => setState(s => ({ ...s, tasks }));

  const contextValue = useMemo(() => ({
    ...state,
    setTheme,
    setCustomWallpaper,
    setBackgroundDim,
    setName,
    setTasks,
    isDataLoaded,
  }), [state, isDataLoaded]);

  return (
    <AppContext.Provider value={contextValue}>
      {isDataLoaded ? children : null}
    </AppContext.Provider>
  );
}

// Renaming useTheme to useAppContext for clarity
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// --- Wrapper component for body styling ---
export function ThemeBody({ children }: { children: React.ReactNode }) {
    const { theme, customWallpaper, backgroundDim } = useAppContext();

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'custom');
        
        const body = window.document.body;
        body.style.backgroundImage = '';
        
        if (theme === 'custom' && customWallpaper) {
            root.classList.add('custom', 'dark'); // Apply custom styles
            body.style.backgroundImage = `linear-gradient(rgba(0,0,0,${backgroundDim}), rgba(0,0,0,${backgroundDim})), url('${customWallpaper}')`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundAttachment = 'fixed';
        } else {
            root.classList.add(theme); // Apply standard light/dark theme
        }
    }, [theme, customWallpaper, backgroundDim]);
  
    return (
        <body className="font-body antialiased">
            {children}
        </body>
    )
}
