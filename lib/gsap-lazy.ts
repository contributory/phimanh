/**
 * Lazy-loaded GSAP setup - only imports when needed
 */
let gsapInstance: any = null;
let gsapReady = false;

export async function loadGsap() {
  if (gsapInstance) return gsapInstance;

  const { default: gsap } = await import("gsap");
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  gsapInstance = gsap;
  gsapReady = true;
  return gsap;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduce-motion: reduce)").matches
  );
}

export const EASE = {
  out: "power3.out",
  outSoft: "power2.out",
  in: "power2.in",
  pop: "back.out(1.7)",
  popStrong: "back.out(2.4)",
} as const;
