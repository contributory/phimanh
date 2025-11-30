'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  Fade, 
  Slide, 
  Grow, 
  Zoom, 
  Collapse,
  Backdrop
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Material Design ripple animation
const rippleAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

// Enhanced ripple component
const RippleContainer = styled('span')({
  position: 'absolute',
  inset: 0,
  borderRadius: 'inherit',
  pointerEvents: 'none',
  overflow: 'hidden',
});

const RippleElement = styled('span')<{ 
  x: number; 
  y: number; 
  size: number; 
  animate: boolean; 
}>(({ x, y, size, animate }) => ({
  position: 'absolute',
  left: x - size / 2,
  top: y - size / 2,
  width: size,
  height: size,
  borderRadius: '50%',
  backgroundColor: 'currentColor',
  opacity: 0.3,
  transform: 'scale(0)',
  animation: animate ? `${rippleAnimation} 0.6s ease-out` : 'none',
}));

interface MaterialRippleProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const MaterialRipple: React.FC<MaterialRippleProps> = ({ 
  children, 
  disabled = false,
  className 
}) => {
  const [ripples, setRipples] = useState<Array<{
    key: number;
    x: number;
    y: number;
    size: number;
  }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleKeyRef = useRef(0);

  const createRipple = (event: React.MouseEvent) => {
    if (disabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = {
      key: rippleKeyRef.current++,
      x,
      y,
      size,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.key !== newRipple.key));
    }, 600);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className || ''}`}
      onMouseDown={createRipple}
    >
      {children}
      {!disabled && (
        <RippleContainer>
          {ripples.map(ripple => (
            <RippleElement
              key={ripple.key}
              x={ripple.x}
              y={ripple.y}
              size={ripple.size}
              animate={true}
            />
          ))}
        </RippleContainer>
      )}
    </div>
  );
};

// Staggered animation container
interface StaggeredAnimationProps {
  children: React.ReactElement[];
  delay?: number;
  animation?: 'fade' | 'slide' | 'grow' | 'zoom';
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  delay = 100,
  animation = 'fade',
  direction = 'up'
}) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    children.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
      }, index * delay);
    });
  }, [children, delay]);

  const renderChild = (child: React.ReactElement, index: number) => {
    const isVisible = visibleItems.has(index);
    
    switch (animation) {
      case 'fade':
        return (
          <Fade key={index} in={isVisible} timeout={600}>
            <div>{child}</div>
          </Fade>
        );
      case 'slide':
        return (
          <Slide 
            key={index} 
            in={isVisible} 
            timeout={600}
            direction={direction}
          >
            <div>{child}</div>
          </Slide>
        );
      case 'grow':
        return (
          <Grow key={index} in={isVisible} timeout={600}>
            <div>{child}</div>
          </Grow>
        );
      case 'zoom':
        return (
          <Zoom key={index} in={isVisible} timeout={600}>
            <div>{child}</div>
          </Zoom>
        );
      default:
        return child;
    }
  };

  return (
    <>
      {children.map((child, index) => renderChild(child, index))}
    </>
  );
};

// Floating Action Button animation
const fabAnimation = keyframes`
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(-22.5deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
`;

const FloatingButton = styled('button')<{ visible: boolean }>(({ theme, visible }) => ({
  position: 'fixed',
  bottom: 24,
  right: 24,
  width: 56,
  height: 56,
  borderRadius: '50%',
  border: 'none',
  backgroundColor: 'hsl(var(--primary))',
  color: 'hsl(var(--primary-foreground))',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  transform: visible ? 'scale(1)' : 'scale(0)',
  opacity: visible ? 1 : 0,
  animation: visible ? `${fabAnimation} 0.5s ease-out` : 'none',
  
  '&:hover': {
    transform: visible ? 'scale(1.1)' : 'scale(0)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
  },
  
  '&:active': {
    transform: visible ? 'scale(0.95)' : 'scale(0)',
  },
}));

interface MaterialFABProps {
  children: React.ReactNode;
  visible?: boolean;
  onClick?: () => void;
}

export const MaterialFAB: React.FC<MaterialFABProps> = ({ 
  children, 
  visible = true,
  onClick 
}) => {
  return (
    <FloatingButton visible={visible} onClick={onClick}>
      {children}
    </FloatingButton>
  );
};

// Loading animation component
const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
`;

const LoadingContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
});

const LoadingDot = styled('div')<{ delay: number }>(({ delay }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: 'hsl(var(--primary))',
  animation: `${pulseAnimation} 1.4s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

export const MaterialLoading: React.FC = () => {
  return (
    <LoadingContainer>
      <LoadingDot delay={0} />
      <LoadingDot delay={0.2} />
      <LoadingDot delay={0.4} />
    </LoadingContainer>
  );
};

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
}

export const MaterialPageTransition: React.FC<PageTransitionProps> = ({
  children,
  direction = 'horizontal'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <Slide 
      in={isVisible} 
      direction={direction === 'horizontal' ? 'left' : 'up'}
      timeout={500}
    >
      <div style={{ minHeight: '100vh' }}>
        {children}
      </div>
    </Slide>
  );
};

// Expandable card animation
interface ExpandableCardProps {
  children: React.ReactNode;
  expanded: boolean;
  expandedContent?: React.ReactNode;
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  children,
  expanded,
  expandedContent
}) => {
  return (
    <div>
      {children}
      <Collapse in={expanded} timeout={300}>
        <div style={{ paddingTop: 16 }}>
          {expandedContent}
        </div>
      </Collapse>
    </div>
  );
};

// Modal with backdrop animation
interface MaterialModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MaterialModal: React.FC<MaterialModalProps> = ({
  open,
  onClose,
  children
}) => {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
      }}
      open={open}
      onClick={onClose}
    >
      <Zoom in={open} timeout={300}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'hsl(var(--card))',
            borderRadius: 16,
            padding: 24,
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          {children}
        </div>
      </Zoom>
    </Backdrop>
  );
};

// Scroll reveal animation hook
export const useScrollReveal = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// Scroll reveal component
interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'grow';
  direction?: 'up' | 'down' | 'left' | 'right';
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fade',
  direction = 'up',
  threshold = 0.1
}) => {
  const { ref, isVisible } = useScrollReveal(threshold);

  const renderAnimation = () => {
    switch (animation) {
      case 'fade':
        return (
          <Fade in={isVisible} timeout={800}>
            <div>{children}</div>
          </Fade>
        );
      case 'slide':
        return (
          <Slide in={isVisible} direction={direction} timeout={800}>
            <div>{children}</div>
          </Slide>
        );
      case 'grow':
        return (
          <Grow in={isVisible} timeout={800}>
            <div>{children}</div>
          </Grow>
        );
      default:
        return <div>{children}</div>;
    }
  };

  return (
    <div ref={ref}>
      {renderAnimation()}
    </div>
  );
};