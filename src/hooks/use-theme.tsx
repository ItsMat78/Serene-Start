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

const GUEST_DEFAULT_STATE: AppState = {
    theme: 'custom',
    customWallpaper: 'https://images.unsplash.com/photo-1752035682080-6ef2359189ea?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    backgroundDim: 0.3,
    name: '',
    tasks: [],
};

const clearGuestData = () => {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('serene-')) {
            localStorage.removeItem(key);
        }
    });
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<AppState>(GUEST_DEFAULT_STATE);
  // This state now tracks WHO the data belongs to ('guest', a user's UID, or null if loading)
  const [dataOwner, setDataOwner] = useState<string | null>(null);

  // This useEffect handles LOADING data once auth state is confirmed.
  useEffect(() => {
    // Wait until Firebase has confirmed the user's auth status.
    if (authLoading) {
      setDataOwner(null); // While auth is loading, we don't have a data owner
      return;
    }

    const loadData = async () => {
      // Invalidate the data owner at the start of any data load.
      // This prevents the saving logic from running with stale data.
      setDataOwner(null); 

      if (user) {
        // --- USER IS LOGGED IN ---
        clearGuestData();
        const userData = await getUserData(user.uid);
        setState({
          theme: userData?.theme || GUEST_DEFAULT_STATE.theme,
          customWallpaper: userData?.customWallpaper || GUEST_DEFAULT_STATE.customWallpaper,
          backgroundDim: userData?.backgroundDim ?? GUEST_DEFAULT_STATE.backgroundDim,
          name: userData?.name || user.displayName?.split(' ')[0] || GUEST_DEFAULT_STATE.name,
          tasks: userData?.tasks || GUEST_DEFAULT_STATE.tasks,
        });
        // CRITICAL: Mark the data as belonging to the current user.
        setDataOwner(user.uid);
      } else {
        // --- USER IS LOGGED OUT / GUEST ---
        const storedTasks = localStorage.getItem('serene-tasks');
        if (storedTasks) {
            const storedTheme = localStorage.getItem('serene-theme') as AppState['theme'];
            const storedWallpaper = localStorage.getItem('serene-wallpaper');
            const storedDim = localStorage.getItem('serene-bg-dim');
            const storedName = localStorage.getItem('serene-name');
            
            setState({
              theme: storedTheme || GUEST_DEFAULT_STATE.theme,
              customWallpaper: storedWallpaper || GUEST_DEFAULT_STATE.customWallpaper,
              backgroundDim: storedDim ? parseFloat(storedDim) : GUEST_DEFAULT_STATE.backgroundDim,
              name: storedName || GUEST_DEFAULT_STATE.name,
              tasks: JSON.parse(storedTasks),
            });
        } else {
            setState(GUEST_DEFAULT_STATE);
        }
        // CRITICAL: Mark the data as belonging to a guest.
        setDataOwner('guest');
      }
    };

    loadData();
  }, [user, authLoading]);

  // This useEffect handles SAVING data whenever the state changes.
  useEffect(() => {
    // Do not save if we don't know who the data belongs to.
    if (!dataOwner) return;

    if (user && dataOwner === user.uid) {
      // Only save to Firestore if the user is logged in AND the data belongs to them.
      saveUserData(user.uid, state);
    } else if (!user && dataOwner === 'guest') {
      // Only save to localStorage if there is no user AND the data belongs to a guest.
      localStorage.setItem('serene-theme', state.theme);
      localStorage.setItem('serene-wallpaper', state.customWallpaper);
      localStorage.setItem('serene-bg-dim', state.backgroundDim.toString());
      localStorage.setItem('serene-name', state.name);
      localStorage.setItem('serene-tasks', JSON.stringify(state.tasks));
    }
  }, [state, user, dataOwner]); // Depends on `dataOwner` to prevent race conditions.

  // This useEffect handles applying the theme to the body.
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'custom');
    
    const body = window.document.body;
    body.style.backgroundImage = '';
    
    if (state.theme === 'custom' && state.customWallpaper) {
        root.classList.add('custom', 'dark');
        body.style.backgroundImage = `linear-gradient(rgba(0,0,0,${state.backgroundDim}), rgba(0,0,0,${state.backgroundDim})), url('${state.customWallpaper}')`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        body.style.backgroundAttachment = 'fixed';
    } else {
        root.classList.add(state.theme);
    }
  }, [state.theme, state.customWallpaper, state.backgroundDim]);

  const setTheme = (theme: AppState['theme']) => setState(s => ({ ...s, theme }));
  const setCustomWallpaper = (url: string) => setState(s => ({ ...s, customWallpaper: url }));
  const setBackgroundDim = (dim: number) => setState(s => ({ ...s, backgroundDim: dim }));
  const setName = (name: string) => setState(s => ({ ...s, name: name.trim().split(' ')[0] }));
  const setTasks = (tasks: Task[]) => setState(s => ({ ...s, tasks }));

  // isDataLoaded is now simpler: it's true when we have a confirmed data owner.
  const isDataLoaded = dataOwner !== null;

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
