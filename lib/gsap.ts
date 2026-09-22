/**
 * Central GreenSock (GSAP) setup for the whole site.
 *
 * - Registers plugins (ScrollTrigger) once, client-side only.
 * - Exports tiny helpers shared by every animated component so
 *   easing / timing / reduced-motion behaviour stays consistent.
 */
import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Register GSAP plugins lazily on the client (safe during SSR). */
export function ensureGsap() {
  if (typeof window !== "undefined" && !registered) {
    gsap.registerPlugin(ScrollTrigger);
    // Slightly more forgiving refresh timing for image-heavy layouts
    ScrollTrigger.config({ ignoreMobileResize: true });
    registered = true;
  }
  return gsap;
}

/** Respect the user's OS-level reduced motion preference. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * useLayoutEffect on the client, useEffect on the server — avoids the
 * React SSR warning while guaranteeing zero-flash animation starts.
 */
export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Signature cinematic easings used across the site. */
export const EASE = {
  /** Smooth deceleration for entrances. */
  out: "power3.out",
  /** Softer variant for large surfaces (hero, backgrounds). */
  outSoft: "power2.out",
  /** Snappy acceleration for exits. */
  in: "power2.in",
  /** Bouncy pop for small UI elements (buttons, FABs, play badges). */
  pop: "back.out(1.7)",
  /** Extra springy pop for icon-only elements. */
  popStrong: "back.out(2.4)",
} as const;

/** Default "from" vars for each named reveal animation. */
export function getFromVars(
  animation: string,
  direction: string,
  offset = 32
): gsap.TweenVars {
  switch (animation) {
    case "slide":
      if (direction === "down") return { autoAlpha: 0, y: -offset };
      if (direction === "left") return { autoAlpha: 0, x: offset };
      if (direction === "right") return { autoAlpha: 0, x: -offset };
      return { autoAlpha: 0, y: offset };
    case "grow":
      return { autoAlpha: 0, scale: 0.86 };
    case "zoom":
      return { autoAlpha: 0, scale: 0.5 };
    case "fade":
    default:
      return { autoAlpha: 0 };
  }
}

/** ScrollTrigger start line that matches an IntersectionObserver threshold. */
export function triggerStart(threshold: number): string {
  return `top ${Math.max(5, Math.round(100 - threshold * 100))}%`;
}

export { gsap, ScrollTrigger };
