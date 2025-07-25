'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import ColorThief from 'color-thief-react';
import { Skeleton } from '@/components/ui/skeleton';

type Theme = 'light' | 'dark' | 'custom';
type CustomThemeMode = 'auto' | 'light' | 'dark';

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  customWallpaper: string;
  setCustomWallpaper: (url: string) => void;
  customThemeMode: CustomThemeMode;
  setCustomThemeMode: (mode: CustomThemeMode) => void;
  cardBlur: number;
  setCardBlur: (blur: number) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [customWallpaper, setCustomWallpaperState] = useState<string>('');
  const [customThemeMode, setCustomThemeModeState] = useState<CustomThemeMode>('auto');
  const [cardBlur, setCardBlurState] = useState<number>(12);
  
  useEffect(() => {
    try {
        const storedTheme = localStorage.getItem('serene-theme') as Theme | null;
        const storedWallpaper = localStorage.getItem('serene-wallpaper');
        const storedCustomMode = localStorage.getItem('serene-custom-theme-mode') as CustomThemeMode | null;
        const storedCardBlur = localStorage.getItem('serene-card-blur');
        
        if (storedTheme) setThemeState(storedTheme);
        if (storedWallpaper) setCustomWallpaperState(storedWallpaper);
        if (storedCustomMode) setCustomThemeModeState(storedCustomMode);
        if (storedCardBlur) setCardBlurState(parseFloat(storedCardBlur));

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
  
  const setCustomThemeMode = (mode: CustomThemeMode) => {
    try {
      localStorage.setItem('serene-custom-theme-mode', mode);
    } catch (e) {
      // Ignore localStorage errors
    }
    setCustomThemeModeState(mode);
  };
  
  const setCardBlur = (blur: number) => {
    try {
      localStorage.setItem('serene-card-blur', String(blur));
    } catch (e) {
      // Ignore localStorage errors
    }
    setCardBlurState(blur);
  };

  const value = useMemo(() => ({
    theme,
    setTheme,
    customWallpaper,
    setCustomWallpaper,
    customThemeMode,
    setCustomThemeMode,
    cardBlur,
    setCardBlur,
  }), [theme, customWallpaper, customThemeMode, cardBlur]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// New component to apply body styles
export function ThemeBody({ children }: { children: React.ReactNode }) {
    const { theme, customWallpaper, customThemeMode, cardBlur } = useTheme();

    const applyCustomThemeStyles = useCallback((color?: number[]) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        
        let detectedTheme: 'light' | 'dark' = 'dark'; // Default to dark

        if (customThemeMode === 'light' || customThemeMode === 'dark') {
            detectedTheme = customThemeMode;
        } else if (color) { // 'auto' mode with a valid color
            const brightness = (color[0] * 299 + color[1] * 587 + color[2] * 114) / 1000;
            detectedTheme = brightness < 128 ? 'dark' : 'light';
        }
        
        root.classList.add('custom', detectedTheme);
    }, [customThemeMode]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'custom');
        root.style.setProperty('--card-blur', `${cardBlur}px`);
        
        const body = window.document.body;
        body.style.backgroundImage = '';
        body.style.backgroundSize = '';
        body.style.backgroundPosition = '';
        body.style.backgroundAttachment = '';

        if (theme === 'custom' && customWallpaper) {
            body.style.backgroundImage = `url('${customWallpaper}')`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundAttachment = 'fixed';
            if (customThemeMode !== 'auto') {
                applyCustomThemeStyles();
            }
        } else {
            root.classList.add(theme);
        }
    }, [theme, customWallpaper, customThemeMode, cardBlur, applyCustomThemeStyles]);
  
    return (
        <body className="font-body antialiased">
            {theme === 'custom' && customWallpaper && customThemeMode === 'auto' && (
                <ColorThief src={customWallpaper} format="rgbArray" crossOrigin="anonymous">
                    {({ data, loading }) => {
                        if (loading) {
                           // You can return a loading indicator here if you want
                           return null;
                        }
                        if (data) {
                           // Use requestAnimationFrame to ensure styles are applied after the browser has painted
                           requestAnimationFrame(() => applyCustomThemeStyles(data));
                        }
                        return null;
                    }}
                </ColorThief>
            )}
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
