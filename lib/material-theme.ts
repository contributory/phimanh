import { createTheme, ThemeOptions } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// Base colors matching current design system
const baseColors = {
  primary: {
    main: '#2563eb', // blue-600
    light: '#3b82f6', // blue-500
    dark: '#1d4ed8', // blue-700
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#8b5cf6', // violet-500
    light: '#a78bfa', // violet-400
    dark: '#7c3aed', // violet-600
    contrastText: '#ffffff',
  },
  error: {
    main: '#ef4444', // red-500
    light: '#f87171', // red-400
    dark: '#dc2626', // red-600
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f59e0b', // amber-500
    light: '#fbbf24', // amber-400
    dark: '#d97706', // amber-600
    contrastText: '#ffffff',
  },
  info: {
    main: '#06b6d4', // cyan-500
    light: '#22d3ee', // cyan-400
    dark: '#0891b2', // cyan-600
    contrastText: '#ffffff',
  },
  success: {
    main: '#10b981', // emerald-500
    light: '#34d399', // emerald-400
    dark: '#059669', // emerald-600
    contrastText: '#ffffff',
  },
};

// Light theme configuration
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    ...baseColors,
    background: {
      default: '#ffffff',
      paper: '#f8fafc', // gray-50
    },
    text: {
      primary: '#0f172a', // slate-900
      secondary: '#475569', // slate-600
      disabled: '#94a3b8', // slate-400
    },
    divider: '#e2e8f0', // slate-200
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
};

// Dark theme configuration
const darkThemeOptions: ThemeOptions = {
  ...lightThemeOptions,
  palette: {
    mode: 'dark',
    ...baseColors,
    background: {
      default: '#0f172a', // slate-900
      paper: '#1e293b', // slate-800
    },
    text: {
      primary: '#f1f5f9', // slate-100
      secondary: '#cbd5e1', // slate-300
      disabled: '#64748b', // slate-500
    },
    divider: '#334155', // slate-700
    grey: {
      50: '#0f172a',
      100: '#1e293b',
      200: '#334155',
      300: '#475569',
      400: '#64748b',
      500: '#94a3b8',
      600: '#cbd5e1',
      700: '#e2e8f0',
      800: '#f1f5f9',
      900: '#f8fafc',
    },
  },
};

// Component customizations
const componentOverrides = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none' as const,
        fontWeight: 500,
        padding: '8px 16px',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        },
      },
      contained: {
        background: 'linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, var(--mui-palette-primary-dark) 0%, var(--mui-palette-primary-main) 100%)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        '&:hover': {
          boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
          transform: 'translateY(-2px)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          '& fieldset': {
            borderColor: 'rgba(0,0,0,0.12)',
          },
          '&:hover fieldset': {
            borderColor: 'var(--mui-palette-primary-main)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'var(--mui-palette-primary-main)',
            borderWidth: 2,
          },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontWeight: 500,
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      elevation1: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
      elevation2: {
        boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
      },
      elevation3: {
        boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
      },
    },
  },
};

// Create themes
export const lightTheme = createTheme({
  ...lightThemeOptions,
  components: componentOverrides,
});

export const darkTheme = createTheme({
  ...darkThemeOptions,
  components: {
    ...componentOverrides,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
  },
});

// Theme provider utility
export const getTheme = (isDark: boolean) => isDark ? darkTheme : lightTheme;