'use client';

import React, { 
  lazy, 
  Suspense, 
  useState, 
  useEffect, 
  useRef, 
  useCallback,
  memo,
  useMemo 
} from 'react';
import { Skeleton, Fade, Grow, Slide } from '@mui/material';
import { useInView } from 'react-intersection-observer';

// Lazy loading wrapper component
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

export const LazyWrapper = memo(({ children, fallback, delay = 0 }: LazyComponentProps) => {
  const [shouldRender, setShouldRender] = useState(delay === 0);
  
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [delay]);
  
  if (!shouldRender) {
    return fallback || <Skeleton variant="rectangular" height={200} animation="wave" />;
  }
  
  return (
    <Suspense fallback={fallback || <Skeleton variant="rectangular" height={200} animation="wave" />}>
      {children}
    </Suspense>
  );
});

LazyWrapper.displayName = 'LazyWrapper';

// Intersection Observer based lazy loading
interface InViewLazyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
  animation?: 'fade' | 'grow' | 'slide';
  animationDirection?: 'up' | 'down' | 'left' | 'right';
}

export const InViewLazy = memo(({
  children,
  fallback,
  rootMargin = '50px',
  threshold = 0.1,
  triggerOnce = true,
  animation = 'fade',
  animationDirection = 'up'
}: InViewLazyProps) => {
  const { ref, inView } = useInView({
    rootMargin,
    threshold,
    triggerOnce,
  });
  
  const renderAnimation = () => {
    if (!inView) return null;
    
    switch (animation) {
      case 'fade':
        return (
          <Fade in={inView} timeout={600}>
            <div>{children}</div>
          </Fade>
        );
      case 'grow':
        return (
          <Grow in={inView} timeout={600}>
            <div>{children}</div>
          </Grow>
        );
      case 'slide':
        return (
          <Slide 
            in={inView} 
            timeout={600}
            direction={animationDirection === 'up' ? 'up' : 
                     animationDirection === 'down' ? 'down' :
                     animationDirection === 'left' ? 'left' : 'right'}
          >
            <div>{children}</div>
          </Slide>
        );
      default:
        return <div>{children}</div>;
    }
  };
  
  return (
    <div ref={ref}>
      {inView ? (
        renderAnimation()
      ) : (
        fallback || (
          <Skeleton 
            variant="rectangular" 
            height={200} 
            animation="wave"
            sx={{ borderRadius: 2 }}
          />
        )
      )}
    </div>
  );
});

InViewLazy.displayName = 'InViewLazy';

// Image lazy loading with progressive enhancement
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  blurDataURL?: string;
  quality?: number;
  priority?: boolean;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  aspectRatio?: string;
}

export const LazyImage = memo(({
  src,
  alt,
  placeholder,
  blurDataURL,
  className,
  objectFit = 'cover',
  aspectRatio,
  ...props
}: LazyImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const { ref: inViewRef, inView } = useInView({
    rootMargin: '50px',
    triggerOnce: true,
  });
  
  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);
  
  const combinedRef = useCallback((node: HTMLImageElement) => {
    imgRef.current = node;
    inViewRef(node);
  }, [inViewRef]);
  
  const containerStyle = useMemo(() => ({
    position: 'relative' as const,
    width: '100%',
    aspectRatio: aspectRatio || 'auto',
    overflow: 'hidden' as const,
    borderRadius: '8px',
  }), [aspectRatio]);
  
  const imageStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    objectFit,
    transition: 'opacity 0.3s ease',
    opacity: isLoading ? 0 : 1,
  }), [objectFit, isLoading]);
  
  return (
    <div style={containerStyle} className={className}>
      {inView && (
        <>
          {/* Blur placeholder */}
          {(isLoading || hasError) && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: blurDataURL 
                  ? `url(${blurDataURL})` 
                  : 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                backgroundSize: 'cover',
                filter: 'blur(10px)',
                transform: 'scale(1.1)',
              }}
            />
          )}
          
          {/* Loading skeleton */}
          {isLoading && (
            <Skeleton
              variant="rectangular"
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: 2,
              }}
              animation="wave"
            />
          )}
          
          {/* Actual image */}
          {!hasError && (
            <img
              ref={combinedRef}
              src={src}
              alt={alt}
              style={imageStyle}
              onLoad={handleLoad}
              onError={handleError}
              loading="lazy"
              {...props}
            />
          )}
          
          {/* Error fallback */}
          {hasError && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground))',
                fontSize: '0.75rem',
              }}
            >
              Không thể tải ảnh
            </div>
          )}
        </>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

// Virtual scrolling component for large lists
interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  overscan?: number;
}

export const VirtualScroll = memo(({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3
}: VirtualScrollProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return (
    <div
      ref={scrollElementRef}
      style={{
        height: containerHeight,
        overflow: 'auto',
      }}
      onScroll={handleScroll}
      className="material-scrollbar"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualScroll.displayName = 'VirtualScroll';

// Memoized component factory
export function withMemo<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  areEqual?: (prevProps: T, nextProps: T) => boolean
) {
  const MemoizedComponent = memo(Component, areEqual);
  MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name})`;
  return MemoizedComponent;
}

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef(performance.now());
  
  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
    }
    
    renderStartTime.current = performance.now();
  });
  
  const markStart = useCallback((markName: string) => {
    performance.mark(`${componentName}-${markName}-start`);
  }, [componentName]);
  
  const markEnd = useCallback((markName: string) => {
    performance.mark(`${componentName}-${markName}-end`);
    performance.measure(
      `${componentName}-${markName}`,
      `${componentName}-${markName}-start`,
      `${componentName}-${markName}-end`
    );
  }, [componentName]);
  
  return { markStart, markEnd };
};