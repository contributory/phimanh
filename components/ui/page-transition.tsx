"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLoading } from "./loading-context";

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
  const { isLoading } = useLoading();

  useEffect(() => {
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
    if (typeof window !== 'undefined') {
      window.__globalLoading = false;
    }
  }, [pathname]);

  if (prefersReducedMotion) {
    return (
      <div key={pathname}>
        {children}
      </div>
    );
  }

  return (
    <>
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
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
