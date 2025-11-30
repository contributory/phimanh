'use client';

import * as React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps, CardContent, CardHeader, CardActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import { forwardRef } from 'react';

// Enhanced Material Card with custom styling
const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: 16,
  border: 'none',
  background: 'hsl(var(--card))',
  color: 'hsl(var(--card-foreground))',
  boxShadow: 'var(--shadow-sm)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  // Hover effect
  '&:hover': {
    boxShadow: 'var(--shadow-lg)',
    transform: 'translateY(-2px)',
  },
  
  // Glass morphism variant
  '&.glass': {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    
    [theme.breakpoints.down('sm')]: {
      backdropFilter: 'blur(10px)',
    },
  },
  
  '.dark &.glass': {
    background: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  
  // Interactive variant
  '&.interactive': {
    cursor: 'pointer',
    
    '&:hover': {
      boxShadow: 'var(--shadow-xl)',
      transform: 'translateY(-4px) scale(1.02)',
    },
    
    '&:active': {
      transform: 'translateY(-2px) scale(1.01)',
      boxShadow: 'var(--shadow-lg)',
    },
  },
  
  // Elevated variant
  '&.elevated': {
    boxShadow: 'var(--shadow-md)',
    
    '&:hover': {
      boxShadow: 'var(--shadow-xl)',
    },
  },
  
  // Gradient variant
  '&.gradient': {
    background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
  },
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  paddingBottom: 8,
  
  '& .MuiCardHeader-title': {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'hsl(var(--card-foreground))',
  },
  
  '& .MuiCardHeader-subheader': {
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.875rem',
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: '16px 24px',
  color: 'hsl(var(--card-foreground))',
  
  '&:last-child': {
    paddingBottom: 24,
  },
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
  padding: '8px 24px 24px',
  gap: 8,
  
  '& .MuiButton-root': {
    borderRadius: 8,
  },
}));

export interface EnhancedCardProps extends Omit<MuiCardProps, 'variant'> {
  variant?: 'default' | 'glass' | 'interactive' | 'elevated' | 'gradient';
  loading?: boolean;
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = 'default', loading = false, children, ...props }, ref) => {
    const cardClasses = [
      variant !== 'default' && variant,
      className,
    ].filter(Boolean).join(' ');

    return (
      <StyledCard
        ref={ref}
        className={cardClasses}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          children
        )}
      </StyledCard>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

// Enhanced Card Header
const EnhancedCardHeader = forwardRef<HTMLDivElement, React.ComponentProps<typeof CardHeader>>(
  ({ className, ...props }, ref) => (
    <StyledCardHeader
      ref={ref}
      className={className}
      {...props}
    />
  )
);

EnhancedCardHeader.displayName = 'EnhancedCardHeader';

// Enhanced Card Content
const EnhancedCardContent = forwardRef<HTMLDivElement, React.ComponentProps<typeof CardContent>>(
  ({ className, ...props }, ref) => (
    <StyledCardContent
      ref={ref}
      className={className}
      {...props}
    />
  )
);

EnhancedCardContent.displayName = 'EnhancedCardContent';

// Enhanced Card Actions
const EnhancedCardActions = forwardRef<HTMLDivElement, React.ComponentProps<typeof CardActions>>(
  ({ className, ...props }, ref) => (
    <StyledCardActions
      ref={ref}
      className={className}
      {...props}
    />
  )
);

EnhancedCardActions.displayName = 'EnhancedCardActions';

// Card Title component for consistency
const EnhancedCardTitle = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`font-semibold text-lg leading-none tracking-tight ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
);

EnhancedCardTitle.displayName = 'EnhancedCardTitle';

// Card Description component
const EnhancedCardDescription = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`text-sm text-muted-foreground ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
);

EnhancedCardDescription.displayName = 'EnhancedCardDescription';

export {
  EnhancedCard as Card,
  EnhancedCardHeader as CardHeader,
  EnhancedCardContent as CardContent,
  EnhancedCardActions as CardActions,
  EnhancedCardTitle as CardTitle,
  EnhancedCardDescription as CardDescription,
};

export default EnhancedCard;