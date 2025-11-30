"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLoading } from "./loading-context";
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
  duration = 0.3,
  initial = { opacity: 0, y: 10 },
  animate = { opacity: 1, y: 0 },
  exit = { opacity: 0, y: -10 },
}: PageTransitionProps) {
  const pathname = usePathname();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading } = useLoading();

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
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={{
            duration,
            ease: "easeInOut",
          }}
          suppressHydrationWarning
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </ClientOnly>
  );
}
