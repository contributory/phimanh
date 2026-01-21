'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from '@/lib/material-theme';

interface MaterialThemeContextType {
  theme: 'light' | 'dark' | 'system';
  isDark: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

const MaterialThemeContext = createContext<MaterialThemeContextType | undefined>(undefined);

export const useMaterialTheme = () => {
  const context = useContext(MaterialThemeContext);
  if (context === undefined) {
    throw new Error('useMaterialTheme must be used within a MaterialThemeProvider');
  }
  return context;
};

interface MaterialThemeProviderProps {
  children: React.ReactNode;
}

export default function MaterialThemeProvider({ children }: MaterialThemeProviderProps) {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize theme from storage or default to system
  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
      const initialTheme = savedTheme || 'system';
      setThemeState(initialTheme);
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const updateTheme = (currentTheme: 'light' | 'dark' | 'system') => {
        if (currentTheme === 'system') {
          setIsDark(mediaQuery.matches);
        } else {
          setIsDark(currentTheme === 'dark');
        }
      };

      updateTheme(initialTheme);

      const handleChange = (e: MediaQueryListEvent) => {
        const currentTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
        if (!currentTheme || currentTheme === 'system') {
          setIsDark(e.matches);
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Sync with document class for Tailwind dark mode
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDark, mounted]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      
      if (newTheme === 'system') {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(isSystemDark);
      } else {
        setIsDark(newTheme === 'dark');
      }
    }
  };

  const toggleTheme = () => {
    const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex]);
  };

  // MUI theme based on calculated isDark
  const muiTheme = getTheme(isDark);

  return (
    <MaterialThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <div suppressHydrationWarning style={{ display: 'contents' }}>
          {children}
        </div>
      </ThemeProvider>
    </MaterialThemeContext.Provider>
  );
}