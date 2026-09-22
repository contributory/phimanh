'use client';

/**
 * GSAP-powered animation primitives (Material-flavoured).
 *
 * Every component here is animated with GreenSock instead of
 * CSS keyframes / MUI transitions, giving us proper easing curves,
 * stagger choreography and scroll-driven reveals via ScrollTrigger.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  gsap,
  ScrollTrigger,
  ensureGsap,
  prefersReducedMotion,
  getFromVars,
  triggerStart,
  EASE,
  useIsoLayoutEffect,
} from '@/lib/gsap';

/* ------------------------------------------------------------------ */
/* Ripple — GSAP driven, zero re-renders per ripple                    */
/* ------------------------------------------------------------------ */

interface MaterialRippleProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const MaterialRipple: React.FC<MaterialRippleProps> = ({
  children,
  disabled = false,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);

  const createRipple = (event: React.MouseEvent) => {
    if (disabled || !containerRef.current || !overlayRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.cssText = [
      'position:absolute',
      `left:${x - size / 2}px`,
      `top:${y - size / 2}px`,
      `width:${size}px`,
      `height:${size}px`,
      'border-radius:50%',
      'background-color:currentColor',
      'opacity:0.3',
      'transform:scale(0)',
      'pointer-events:none',
    ].join(';');
    overlayRef.current.appendChild(ripple);

    gsap.to(ripple, {
      scale: 4,
      opacity: 0,
      duration: 0.65,
      ease: 'power2.out',
      onComplete: () => ripple.parentNode?.removeChild(ripple),
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className || ''}`}
      onMouseDown={createRipple}
    >
      {children}
      {!disabled && (
        <span
          ref={overlayRef}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Staggered container — children cascade in with GSAP stagger         */
/* ------------------------------------------------------------------ */

interface StaggeredAnimationProps {
  children: React.ReactElement[];
  /** Stagger between items in milliseconds. */
  delay?: number;
  animation?: 'fade' | 'slide' | 'grow' | 'zoom';
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  delay = 100,
  animation = 'fade',
  direction = 'up',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReducedMotion()) return;
    ensureGsap();

    const items = Array.from(el.children);
    const tween = gsap.from(items, {
      ...getFromVars(animation, direction),
      duration: 0.65,
      ease: EASE.out,
      stagger: delay / 1000,
      clearProps: 'transform,opacity,visibility',
      overwrite: 'auto',
    });
    return () => {
      tween.kill();
    };
  }, [children, delay, animation, direction]);

  return (
    <div ref={containerRef} style={{ display: 'contents' }}>
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Floating Action Button — springy pop in / out                       */
/* ------------------------------------------------------------------ */

interface MaterialFABProps {
  children: React.ReactNode;
  visible?: boolean;
  onClick?: () => void;
}

export const MaterialFAB: React.FC<MaterialFABProps> = ({
  children,
  visible = true,
  onClick,
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    if (prefersReducedMotion()) {
      gsap.set(btn, {
        autoAlpha: visible ? 1 : 0,
        scale: visible ? 1 : 0,
        y: visible ? 0 : 40,
      });
      return;
    }

    gsap.to(btn, {
      autoAlpha: visible ? 1 : 0,
      scale: visible ? 1 : 0,
      y: visible ? 0 : 40,
      duration: 0.55,
      ease: visible ? EASE.pop : EASE.in,
      overwrite: 'auto',
    });
  }, [visible]);

  const handleEnter = () => {
    if (!visible || prefersReducedMotion()) return;
    gsap.to(btnRef.current, {
      scale: 1.08,
      y: -4,
      duration: 0.3,
      ease: EASE.outSoft,
      overwrite: 'auto',
    });
  };

  const handleLeave = () => {
    if (!visible || prefersReducedMotion()) return;
    gsap.to(btnRef.current, {
      scale: 1,
      y: 0,
      duration: 0.4,
      ease: EASE.outSoft,
      overwrite: 'auto',
    });
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        width: 60,
        height: 60,
        borderRadius: 20,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        backdropFilter: 'blur(8px)',
        color: 'white',
        boxShadow:
          '0 8px 32px rgba(239, 68, 68, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      {children}
    </button>
  );
};

/* ------------------------------------------------------------------ */
/* Loading dots — GSAP pulse with staggered breathing                  */
/* ------------------------------------------------------------------ */

export const MaterialLoading: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const tween = gsap.to(el.children, {
      scale: 1.05,
      opacity: 0.7,
      duration: 0.7,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 0.2,
    });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: 'hsl(var(--primary))',
            display: 'block',
          }}
        />
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Page transition — directional slide with GSAP                       */
/* ------------------------------------------------------------------ */

interface PageTransitionProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
}

export const MaterialPageTransition: React.FC<PageTransitionProps> = ({
  children,
  direction = 'horizontal',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    gsap.fromTo(
      el,
      direction === 'horizontal'
        ? { xPercent: -6, autoAlpha: 0 }
        : { yPercent: 6, autoAlpha: 0 },
      {
        xPercent: 0,
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.65,
        ease: EASE.out,
        clearProps: 'transform,opacity,visibility',
      }
    );
  }, [direction]);

  return (
    <div ref={ref} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Expandable card — GSAP height auto animation                        */
/* ------------------------------------------------------------------ */

interface ExpandableCardProps {
  children: React.ReactNode;
  expanded: boolean;
  expandedContent?: React.ReactNode;
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  children,
  expanded,
  expandedContent,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(expanded);
  const prevExpanded = useRef(expanded);

  useIsoLayoutEffect(() => {
    const el = contentRef.current;
    if (!el || prevExpanded.current === expanded) return;
    prevExpanded.current = expanded;

    if (expanded) {
      setDisplay(true);
      gsap.fromTo(
        el,
        { height: 0, opacity: 0, overflow: 'hidden' },
        {
          height: 'auto',
          opacity: 1,
          duration: 0.35,
          ease: EASE.out,
          onComplete: () => gsap.set(el, { clearProps: 'height,opacity,overflow' }),
        }
      );
    } else {
      gsap.fromTo(
        el,
        { height: 'auto', opacity: 1, overflow: 'hidden' },
        {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: EASE.in,
          onComplete: () => {
            setDisplay(false);
            gsap.set(el, { clearProps: 'height,opacity,overflow' });
          },
        }
      );
    }
  }, [expanded]);

  return (
    <div>
      {children}
      <div
        ref={contentRef}
        style={{ display: display ? 'block' : 'none', paddingTop: 16 }}
      >
        {expandedContent}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Modal — backdrop fade + springy zoom                                */
/* ------------------------------------------------------------------ */

interface MaterialModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MaterialModal: React.FC<MaterialModalProps> = ({
  open,
  onClose,
  children,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!backdrop || !panel) return;

    if (open) {
      backdrop.style.display = 'flex';
      panel.style.display = 'block';
      gsap.fromTo(
        backdrop,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: EASE.outSoft }
      );
      gsap.fromTo(
        panel,
        { scale: 0.7, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.4, ease: EASE.popStrong }
      );
    } else {
      gsap.to(backdrop, {
        opacity: 0,
        duration: 0.25,
        ease: EASE.in,
        onComplete: () => {
          backdrop.style.display = 'none';
        },
      });
      gsap.to(panel, {
        scale: 0.85,
        autoAlpha: 0,
        duration: 0.25,
        ease: EASE.in,
        onComplete: () => {
          panel.style.display = 'none';
        },
      });
    }
  }, [open]);

  return (
    <div
      ref={backdropRef}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: open ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        ref={panelRef}
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
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Scroll reveal hook — ScrollTrigger based, same public API           */
/* ------------------------------------------------------------------ */

export const useScrollReveal = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setIsVisible(true);
      return;
    }
    ensureGsap();

    const st = ScrollTrigger.create({
      trigger: el,
      start: triggerStart(threshold),
      once: true,
      onEnter: () => setIsVisible(true),
    });
    return () => {
      st.kill();
    };
  }, [threshold]);

  return { ref, isVisible };
};

/* ------------------------------------------------------------------ */
/* ScrollReveal — cinematic scroll entrance with cascade delays        */
/* ------------------------------------------------------------------ */

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'grow' | 'zoom';
  direction?: 'up' | 'down' | 'left' | 'right';
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fade',
  direction = 'up',
  threshold = 0.1,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    ensureGsap();

    // Give items further along a row/grid a tiny extra delay so
    // neighbouring cards cascade in instead of popping all at once.
    const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
    const index = siblings.indexOf(el);
    const cascadeDelay = Math.max(0, index % 8) * 0.05;

    const tween = gsap.from(el, {
      ...getFromVars(animation, direction),
      duration: 0.85,
      delay: cascadeDelay,
      ease: EASE.out,
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: {
        trigger: el,
        start: triggerStart(threshold),
        once: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [animation, direction, threshold]);

  return <div ref={ref}>{children}</div>;
};
