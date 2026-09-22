"use client";

import { gsap, EASE } from "@/lib/gsap";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ClientOnly from "./client-only";

declare global {
  interface Window {
    __globalLoading?: boolean;
  }
}

interface PageTransitionProps {
  children: React.ReactNode;
  duration?: number;
  initial?: { opacity: number; y?: number };
  animate?: { opacity: number; y?: number };
  exit?: { opacity: number; y?: number };
}

export default function PageTransition({
  children,
  duration = 0.45,
  initial = { opacity: 0, y: 12 },
  animate = { opacity: 1, y: 0 },
  exit,
}: PageTransitionProps) {
  const pathname = usePathname();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);

    // Only run on client side
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      window.__globalLoading = false;
    }
  }, [pathname, isMounted]);

  // GSAP route-change entrance: content rises into place with a soft fade.
  useEffect(() => {
    const el = containerRef.current;
    if (!isMounted || prefersReducedMotion || !el) return;

    const tween = gsap.fromTo(
      el,
      { opacity: initial.opacity, y: initial.y ?? 0 },
      {
        opacity: animate.opacity,
        y: animate.y ?? 0,
        duration,
        ease: EASE.out,
        overwrite: "auto",
        clearProps: "opacity,transform",
      }
    );

    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isMounted, prefersReducedMotion, duration]);

  // Server-side và initial client render: render without animation
  if (!isMounted || prefersReducedMotion) {
    return (
      <div key={pathname} suppressHydrationWarning>
        {children}
      </div>
    );
  }

  // Client-side với animation
  return (
    <ClientOnly fallback={<div key={pathname}>{children}</div>}>
      <div key={pathname} ref={containerRef} suppressHydrationWarning>
        {children}
      </div>
    </ClientOnly>
  );
}
