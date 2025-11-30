'use client';

import * as React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { forwardRef } from 'react';

// Enhanced Material Button with custom styling
const StyledButton = styled(MuiButton)(({ theme, variant, color }) => ({
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: '10px 20px',
  minHeight: '40px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  
  // Ripple effect base
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, transparent 1%, rgba(255,255,255,0.1) 1%)',
    backgroundSize: '15000%',
    transition: 'background-size 0.3s',
    pointerEvents: 'none',
  },
  
  '&:active::before': {
    backgroundSize: '100%',
    transition: 'background-size 0s',
  },

  // Variant-specific styles
  ...(variant === 'contained' && {
    background: color === 'primary' 
      ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
      : undefined,
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
    },
  }),
  
  ...(variant === 'outlined' && {
    borderWidth: 2,
    '&:hover': {
      borderWidth: 2,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
  }),
  
  ...(variant === 'text' && {
    '&:hover': {
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
      transform: 'translateY(-1px)',
    },
  }),

  // Size variants
  '&.MuiButton-sizeSmall': {
    padding: '6px 12px',
    fontSize: '0.75rem',
    minHeight: '32px',
    borderRadius: 8,
  },
  
  '&.MuiButton-sizeLarge': {
    padding: '12px 24px',
    fontSize: '1rem',
    minHeight: '48px',
    borderRadius: 16,
  },

  // Disabled state
  '&.Mui-disabled': {
    opacity: 0.6,
    transform: 'none',
    boxShadow: 'none',
  },
}));

export interface EnhancedButtonProps extends Omit<MuiButtonProps, 'size'> {
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ children, loading = false, disabled, icon, iconPosition = 'start', size = 'medium', ...props }, ref) => {
    const isDisabled = disabled || loading;
    
    const renderContent = () => {
      if (loading) {
        return (
          <>
            <CircularProgress
              size={16}
              sx={{ 
                color: 'inherit',
                mr: children ? 1 : 0 
              }}
            />
            {children}
          </>
        );
      }

      if (icon) {
        return iconPosition === 'start' ? (
          <>
            <span style={{ fontSize: '18px', marginRight: children ? '8px' : '0', display: 'inline-flex', alignItems: 'center' }}>
              {icon}
            </span>
            {children}
          </>
        ) : (
          <>
            {children}
            <span style={{ fontSize: '18px', marginLeft: children ? '8px' : '0', display: 'inline-flex', alignItems: 'center' }}>
              {icon}
            </span>
          </>
        );
      }

      return children;
    };

    return (
      <StyledButton
        ref={ref}
        disabled={isDisabled}
        size={size}
        {...props}
      >
        {renderContent()}
      </StyledButton>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export default EnhancedButton;