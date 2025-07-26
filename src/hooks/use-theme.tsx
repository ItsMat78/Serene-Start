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

// Clears all guest-related data from localStorage.
const clearGuestData = () => {
    localStorage.removeItem('serene-theme');
    localStorage.removeItem('serene-wallpaper');
    localStorage.removeItem('serene-bg-dim');
    localStorage.removeItem('serene-name');
    localStorage.removeItem('serene-tasks');
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
        const userData = await getUserData(user.uid);
        setState({
          theme: userData?.theme || GUEST_DEFAULT_STATE.theme,
          customWallpaper: userData?.customWallpaper || GUEST_DEFAULT_STATE.customWallpaper,
          backgroundDim: userData?.backgroundDim ?? GUEST_DEFAULT_STATE.backgroundDim,
          name: userData?.name || user.displayName?.split(' ')[0] || GUEST_DEFAULT_STATE.name,
          tasks: userData?.tasks || GUEST_DEFAULT_STATE.tasks,
        });
        // Clear any lingering guest data from localStorage to prevent conflicts.
        clearGuestData();
      } else {
        // --- USER IS LOGGED OUT ---
        // Clear any user data from localStorage before setting guest defaults.
        clearGuestData(); 
        // Hard reset to the guest default state.
        setState(GUEST_DEFAULT_STATE);
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

    // This useEffect handles applying the theme to the body.
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'custom');
        
        const body = window.document.body;
        body.style.backgroundImage = '';
        
        if (state.theme === 'custom' && state.customWallpaper) {
            root.classList.add('custom', 'dark'); // Apply custom styles
            body.style.backgroundImage = `linear-gradient(rgba(0,0,0,${state.backgroundDim}), rgba(0,0,0,${state.backgroundDim})), url('${state.customWallpaper}')`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundAttachment = 'fixed';
        } else {
            root.classList.add(state.theme); // Apply standard light/dark theme
        }
    }, [state.theme, state.customWallpaper, state.backgroundDim]);

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
