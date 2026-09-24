import { createTheme, ThemeOptions } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// Base colors matching current design system - Dark red and black theme
const baseColors = {
  primary: {
    main: '#e50914', // Netflix Red
    light: '#ff1f1f',
    dark: '#b20710',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#141414', // Very dark gray
    light: '#2f2f2f',
    dark: '#000000',
    contrastText: '#ffffff',
  },
  error: {
    main: '#e50914',
    light: '#ff1f1f',
    dark: '#b20710',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f5c518', // IMDb Gold
    light: '#ffda44',
    dark: '#c29b00',
    contrastText: '#000000',
  },
  info: {
    main: '#e50914',
    light: '#ff1f1f',
    dark: '#b20710',
    contrastText: '#ffffff',
  },
  success: {
    main: '#46d369',
    light: '#65e084',
    dark: '#2ba84b',
    contrastText: '#ffffff',
  },
};

// Shared dark theme configuration.
const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    ...baseColors,
    background: {
      default: '#070707',
      paper: '#0f0f0f',
    },
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
      disabled: '#71717a',
    },
    divider: 'rgba(255,255,255,0.10)',
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
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 700,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 700,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 700,
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
      fontWeight: 600,
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 4,
  },
  spacing: 8,
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
            borderColor: 'rgba(255,255,255,0.12)',
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
        backgroundColor: 'rgba(7,7,7,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
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

// Create the single application theme.
export const darkTheme = createTheme({
  ...themeOptions,
  components: {
    ...componentOverrides,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(7,7,7,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
  },
});