'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from '@/lib/material-theme';

interface MaterialThemeContextType {
  isDark: boolean;
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
  const [isDark, setIsDark] = useState(false); // Start with light theme always
  const [mounted, setMounted] = useState(false);

  // Only run theme detection after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Get theme from the inline script that runs before React
    if (typeof window !== 'undefined') {
      const initialTheme = (window as any).__INITIAL_THEME__ || 'light';
      setIsDark(initialTheme === 'dark');
      
      // Listen for system theme changes only if no saved preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) {
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

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    }
  };

  // Always use the current theme state, no null checks needed
  const theme = getTheme(isDark);

  return (
    <MaterialThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </MaterialThemeContext.Provider>
  );
}