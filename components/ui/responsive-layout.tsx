'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  Grid,
  Container,
  Box,
  useTheme,
  useMediaQuery,
  Breakpoint
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Responsive context for managing breakpoints
interface ResponsiveContextType {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
}

const ResponsiveContext = createContext<ResponsiveContextType | null>(null);

export const useResponsive = () => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within ResponsiveProvider');
  }
  return context;
};

// Enhanced responsive provider
export const ResponsiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  
  const getBreakpoint = (): Breakpoint => {
    if (isMobile) return 'xs';
    if (isTablet) return 'sm';
    if (isDesktop) return 'md';
    if (isLargeScreen) return 'lg';
    return 'xl';
  };
  
  const contextValue: ResponsiveContextType = {
    breakpoint: getBreakpoint(),
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
  };
  
  return (
    <ResponsiveContext.Provider value={contextValue}>
      {children}
    </ResponsiveContext.Provider>
  );
};

// Enhanced responsive container
const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(2),
  
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
  
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(6),
  },
}));

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'lg',
  disableGutters = false,
  className,
}) => {
  return (
    <StyledContainer
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      className={className}
    >
      {children}
    </StyledContainer>
  );
};

// Responsive grid system
interface ResponsiveGridProps {
  children: React.ReactNode;
  spacing?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  spacing = 2,
  columns = 12,
  className,
}) => {
  const theme = useTheme();
  
  const getSpacing = () => {
    if (typeof spacing === 'number') return spacing;
    
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    
    if (isMobile) return spacing.xs || 1;
    if (isTablet) return spacing.sm || 2;
    if (isDesktop) return spacing.md || spacing.lg || 3;
    return 3;
  };
  
  const getColumns = () => {
    if (typeof columns === 'number') return columns;
    
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    
    if (isMobile) return columns.xs || 12;
    if (isTablet) return columns.sm || 12;
    if (isDesktop) return columns.md || columns.lg || 12;
    return 12;
  };
  
  return (
    <Grid
      container
      spacing={getSpacing()}
      className={className}
    >
      {children}
    </Grid>
  );
};

// Responsive grid item
interface ResponsiveGridItemProps {
  children: React.ReactNode;
  xs?: number | 'auto';
  sm?: number | 'auto';
  md?: number | 'auto';
  lg?: number | 'auto';
  xl?: number | 'auto';
  className?: string;
}

export const ResponsiveGridItem: React.FC<ResponsiveGridItemProps> = ({
  children,
  xs = 12,
  sm,
  md,
  lg,
  xl,
  className,
}) => {
  return (
    <div
      className={`responsive-grid-item ${className || ''}`}
      style={{
        gridColumn: `span ${xs}`,
      }}
    >
      {children}
    </div>
  );
};

// Responsive visibility component
interface ResponsiveVisibilityProps {
  children: React.ReactNode;
  only?: Breakpoint | Breakpoint[];
  up?: Breakpoint;
  down?: Breakpoint;
}

export const ResponsiveVisibility: React.FC<ResponsiveVisibilityProps> = ({
  children,
  only,
  up,
  down,
}) => {
  const theme = useTheme();
  
  let shouldShow = true;
  
  if (only) {
    const breakpoints = Array.isArray(only) ? only : [only];
    shouldShow = breakpoints.some(bp => {
      switch (bp) {
        case 'xs':
          return useMediaQuery(theme.breakpoints.only('xs'));
        case 'sm':
          return useMediaQuery(theme.breakpoints.only('sm'));
        case 'md':
          return useMediaQuery(theme.breakpoints.only('md'));
        case 'lg':
          return useMediaQuery(theme.breakpoints.only('lg'));
        case 'xl':
          return useMediaQuery(theme.breakpoints.only('xl'));
        default:
          return false;
      }
    });
  }
  
  if (up) {
    shouldShow = shouldShow && useMediaQuery(theme.breakpoints.up(up));
  }
  
  if (down) {
    shouldShow = shouldShow && useMediaQuery(theme.breakpoints.down(down));
  }
  
  return shouldShow ? <>{children}</> : null;
};

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: {
    xs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2';
    sm?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2';
    md?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2';
    lg?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2';
  };
  component?: React.ElementType;
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = { xs: 'body1' },
  component = 'p',
  className,
}) => {
  const { breakpoint } = useResponsive();
  
  const getVariant = () => {
    if (breakpoint === 'xs' && variant.xs) return variant.xs;
    if (breakpoint === 'sm' && variant.sm) return variant.sm;
    if (breakpoint === 'md' && variant.md) return variant.md;
    if (breakpoint === 'lg' && variant.lg) return variant.lg;
    return variant.xs || 'body1';
  };
  
  const Component = component;
  
  return (
    <Component className={`text-${getVariant()} ${className || ''}`}>
      {children}
    </Component>
  );
};

// Responsive spacing component
interface ResponsiveSpacingProps {
  mt?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  mb?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  ml?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  mr?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  mx?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  my?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  p?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  px?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  py?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  children: React.ReactNode;
}

export const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  children,
  ...spacingProps
}) => {
  return (
    <Box
      sx={{
        ...spacingProps,
      }}
    >
      {children}
    </Box>
  );
};

// Hook for responsive values
export const useResponsiveValue = <T,>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}): T | undefined => {
  const { breakpoint } = useResponsive();
  
  const getValue = () => {
    switch (breakpoint) {
      case 'xs':
        return values.xs || values.sm || values.md || values.lg || values.xl;
      case 'sm':
        return values.sm || values.xs || values.md || values.lg || values.xl;
      case 'md':
        return values.md || values.sm || values.xs || values.lg || values.xl;
      case 'lg':
        return values.lg || values.md || values.sm || values.xs || values.xl;
      case 'xl':
        return values.xl || values.lg || values.md || values.sm || values.xs;
      default:
        return values.xs;
    }
  };
  
  return getValue();
};

// Responsive image component
interface ResponsiveImageProps {
  src: string | {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
  };
  alt: string;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  objectFit = 'cover',
}) => {
  const imageSrc = useResponsiveValue(typeof src === 'string' ? { xs: src } : src);
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={{
        width: '100%',
        height: 'auto',
        objectFit,
      }}
    />
  );
};