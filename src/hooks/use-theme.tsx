'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './use-auth';
import { saveUserData, getUserData } from '@/lib/firestore';
import { Task } from '@/lib/types';

// This will be the one true state for the application
type AppState = {
  theme: 'light' | 'dark' | 'custom';
  customWallpaper: string;
  backgroundDim: number;
  name: string;
  tasks: Task[];
};

type AppContextState = AppState & {
  setTheme: (theme: AppState['theme']) => void;
  setCustomWallpaper: (url: string) => void;
  setBackgroundDim: (dim: number) => void;
  setName: (name: string) => void;
  setTasks: (tasks: Task[]) => void;
  isDataLoaded: boolean;
};

const AppContext = createContext<AppContextState | undefined>(undefined);

// Define the default state for a guest user. This is our clean slate.
const GUEST_DEFAULT_STATE: AppState = {
    theme: 'dark',
    customWallpaper: '',
    backgroundDim: 0.3,
    name: '',
    tasks: [],
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<AppState>(GUEST_DEFAULT_STATE);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // This useEffect handles LOADING data only when the user logs in or out.
  useEffect(() => {
    const loadData = async () => {
      setIsDataLoaded(false); // Start loading process
      if (user) {
        // --- USER IS LOGGED IN ---
        // Fetch their entire profile from Firestore.
        const userData = await getUserData(user.uid);
        setState({
          theme: userData?.theme || GUEST_DEFAULT_STATE.theme,
          customWallpaper: userData?.customWallpaper || GUEST_DEFAULT_STATE.customWallpaper,
          backgroundDim: userData?.backgroundDim ?? GUEST_DEFAULT_STATE.backgroundDim,
          name: userData?.name || user.displayName?.split(' ')[0] || GUEST_DEFAULT_STATE.name,
          tasks: userData?.tasks || GUEST_DEFAULT_STATE.tasks,
        });
      } else {
        // --- USER IS LOGGED OUT ---
        // Perform a hard reset to the guest default state first. This prevents data leakage.
        setState(GUEST_DEFAULT_STATE);
        // Then, try to load any settings the guest may have saved in localStorage.
        const storedTheme = localStorage.getItem('serene-theme') as AppState['theme'];
        const storedWallpaper = localStorage.getItem('serene-wallpaper');
        const storedDim = localStorage.getItem('serene-bg-dim');
        const storedName = localStorage.getItem('serene-name');
        const storedTasks = localStorage.getItem('serene-tasks');
        
        setState({
          theme: storedTheme || GUEST_DEFAULT_STATE.theme,
          customWallpaper: storedWallpaper || GUEST_DEFAULT_STATE.customWallpaper,
          backgroundDim: storedDim ? parseFloat(storedDim) : GUEST_DEFAULT_STATE.backgroundDim,
          name: storedName || GUEST_DEFAULT_STATE.name,
          tasks: storedTasks ? JSON.parse(storedTasks) : GUEST_DEFAULT_STATE.tasks,
        });
      }
      setIsDataLoaded(true); // Mark loading as complete
    };

    loadData();
  }, [user]);

  // This useEffect handles SAVING data whenever the state changes.
  useEffect(() => {
    // Only save after the initial data has been loaded.
    if (!isDataLoaded) return;

    if (user) {
      // LOGGED IN: Save the entire state object to Firestore.
      saveUserData(user.uid, state);
    } else {
      // LOGGED OUT: Save the state to localStorage.
      localStorage.setItem('serene-theme', state.theme);
      localStorage.setItem('serene-wallpaper', state.customWallpaper);
      localStorage.setItem('serene-bg-dim', state.backgroundDim.toString());
      localStorage.setItem('serene-name', state.name);
      localStorage.setItem('serene-tasks', JSON.stringify(state.tasks));
    }
  }, [state, user, isDataLoaded]);

  // --- State Update Functions ---
  const setTheme = (theme: AppState['theme']) => setState(s => ({ ...s, theme }));
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
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

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
