'use client';

import { cn } from '@/lib/utils';
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import ColorThief from 'color-thief-react';

type Theme = 'light' | 'dark' | 'custom';

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  customWallpaper: string;
  setCustomWallpaper: (url: string) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [customWallpaper, setCustomWallpaperState] = useState<string>('');
  
  useEffect(() => {
    try {
        const storedTheme = localStorage.getItem('serene-theme') as Theme | null;
        const storedWallpaper = localStorage.getItem('serene-wallpaper');
        
        if (storedTheme) setThemeState(storedTheme);
        if (storedWallpaper) setCustomWallpaperState(storedWallpaper);
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

// New component to apply body styles
export function ThemeBody({ children }: { children: React.ReactNode }) {
    const { theme, customWallpaper } = useTheme();

    const handleWallpaperColorChange = (color: number[]) => {
      // Basic brightness check (luminance formula)
      const brightness = (color[0] * 299 + color[1] * 587 + color[2] * 114) / 1000;
      // If the background is dark, use light text, and vice-versa
      const newTheme = brightness < 128 ? 'dark' : 'light';
      
      const root = window.document.documentElement;
      
      // Clear existing theme classes
      root.classList.remove('light', 'dark');
      // Apply the 'custom' class for glassmorphism, and the detected theme for text color
      root.classList.add('custom', newTheme);
    };
  
    useEffect(() => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark', 'custom');
      
      const body = window.document.body;
      if (theme === 'custom' && customWallpaper) {
        body.style.backgroundImage = `url('${customWallpaper}')`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        body.style.backgroundAttachment = 'fixed';
        // When going to custom theme, we let the ColorThief determine light/dark.
        // We initially add 'custom' and let the color thief add light/dark.
        root.classList.add('custom');
      } else {
        root.classList.add(theme);
        body.style.backgroundImage = '';
      }
  
      return () => {
          body.style.backgroundImage = '';
      }
    }, [theme, customWallpaper]);
  
    return (
        <body className="font-body antialiased">
            {theme === 'custom' && customWallpaper && (
                <ColorThief src={customWallpaper} format="rgbArray" crossOrigin="anonymous">
                    {({ data }) => {
                        if (data) {
                            // Run this in the next frame to ensure the DOM has updated
                            requestAnimationFrame(() => handleWallpaperColorChange(data));
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
