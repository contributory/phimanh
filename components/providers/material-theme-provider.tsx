'use client';

import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { darkTheme } from '@/lib/material-theme';

interface MaterialThemeProviderProps {
  children: React.ReactNode;
}

export default function MaterialThemeProvider({ children }: MaterialThemeProviderProps) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div suppressHydrationWarning style={{ display: 'contents' }}>
        {children}
      </div>
    </ThemeProvider>
  );
}
