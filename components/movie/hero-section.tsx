"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Calendar, Play, Star } from "lucide-react";
import { prefersReducedMotion } from "@/lib/gsap";
import Image from "next/image";

const SLIDE_DURATION = 8000;
const EASE = {
  out: "power3.out",
  outSoft: "power2.out",
  in: "power2.in",
  pop: "back.out(1.7)",
  popStrong: "back.out(2.4)",
} as const;

interface HeroSectionProps {
  movies: any[];
}

const imageUrl = (value?: string) => {
  if (!value) return "/placeholder-movie.png";
  return value.startsWith("http") ? value : `https://phimimg.com/${value}`;
};

export default function HeroSection({ movies }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gsapReady, setGsapReady] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const gsapRef = useRef<any>(null);

  const loadGsap = useCallback(async () => {
    if (gsapReady || gsapRef.current) return;
    try {
      const { default: gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      gsapRef.current = gsap;
      setGsapReady(true);
    } catch (error) {
      console.error("Failed to load GSAP:", error);
    }
  }, [gsapReady]);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  useEffect(() => {
    if (isPaused || movies.length < 2) return;
    const interval = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused, movies.length]);

  const featuredMovie = movies[activeIndex];

  const getRating = (movie: any) => {
    const imdb = Number(movie?.imdb?.rating);
    if (!Number.isNaN(imdb) && imdb > 0) return imdb.toFixed(1);
    const tmdb = Number(movie?.tmdb?.vote_average);
    if (!Number.isNaN(tmdb) && tmdb > 0) return tmdb.toFixed(1);
    return null;
  };

  const resetCard = useCallback(() => {
    if (!cardRef.current || prefersReducedMotion() || !gsapRef.current) return;

    gsapRef.current.to(cardRef.current, {
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      duration: 0.75,
      ease: EASE.out,
      overwrite: "auto",
    });

    if (glowRef.current) {
      gsapRef.current.to(glowRef.current, {
        opacity: 0.18,
        duration: 0.5,
        ease: EASE.outSoft,
        overwrite: "auto",
      });
    }
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (
      !cardRef.current ||
      prefersReducedMotion() ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      !gsapRef.current
    ) {
      return;
    }

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = (event.clientX || event.pageX) - rect.left;
    const y = (event.clientY || event.pageY) - rect.top;
    const distX = (x - centerX) * 0.1;
    const distY = (y - centerY) * 0.1;
    const angle = Math.atan2(distY, distX);

    gsapRef.current.to(cardRef.current, {
      x: Math.cos(angle) * 8,
      y: Math.sin(angle) * 8,
      rotateX: (y - centerY) * 0.05,
      rotateY: (x - centerX) * -0.05,
      duration: 0.4,
      ease: EASE.outSoft,
      overwrite: "auto",
    });

    if (glowRef.current) {
      const distance = Math.hypot(x - centerX, y - centerY);
      const maxDistance = Math.hypot(centerX, centerY);
      const opacity = 0.18 + (1 - distance / maxDistance) * 0.3;

      gsapRef.current.to(
        glowRef.current,
        { opacity, duration: 0.3, ease: EASE.outSoft, overwrite: "auto" },
        0
      );
    }
  };

  const handlePointerEnter = () => {
    loadGsap();
    setIsPaused(true);
  };

  const handlePointerLeave = () => {
    setIsPaused(false);
    resetCard();
  };

  useEffect(() => {
    if (!rootRef.current || prefersReducedMotion()) return;
    loadGsap();
  }, [loadGsap]);

  if (!featuredMovie) return null;

  return (
    <section
      ref={rootRef}
      className="relative mx-2 mt-2 mb-4 overflow-hidden rounded-2xl md:mx-4 md:mb-6 lg:rounded-3xl"
    >
      <div
        className="relative aspect-video overflow-hidden bg-zinc-900 md:aspect-auto md:h-96 lg:h-[500px]"
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <Image
          src={imageUrl(featuredMovie.poster_url)}
          alt={featuredMovie.name}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
        />

        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0"
          style={{ willChange: "opacity" }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div
          ref={cardRef}
          className="absolute bottom-0 left-0 right-0 flex flex-col justify-end p-4 md:p-8 lg:p-10"
          style={{ willChange: "transform" }}
        >
          <div className="mb-4 space-y-2 md:mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white md:text-sm">
                Phim Nổi Bật
              </span>
              {getRating(featuredMovie) && (
                <div className="flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-xs md:text-sm">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-yellow-400">{getRating(featuredMovie)}</span>
                </div>
              )}
            </div>
            <h1 className="line-clamp-2 text-2xl font-bold text-white md:text-4xl lg:text-5xl">
              {featuredMovie.name}
            </h1>
            {featuredMovie.origin_name && (
              <p className="line-clamp-1 text-sm text-zinc-300 md:text-base lg:text-lg">
                {featuredMovie.origin_name}
              </p>
            )}
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-zinc-300 md:mb-6 md:gap-4 md:text-sm">
            {featuredMovie.year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{featuredMovie.year}</span>
              </div>
            )}
            {featuredMovie.country?.[0]?.name && (
              <span>{featuredMovie.country[0].name}</span>
            )}
            {featuredMovie.episode_current && (
              <span>{featuredMovie.episode_current}</span>
            )}
          </div>

          <p className="mb-6 line-clamp-2 text-xs text-zinc-300 md:mb-8 md:text-sm md:line-clamp-3">
            {featuredMovie.content || "Không có mô tả"}
          </p>

          <div className="flex flex-wrap gap-3 md:gap-4">
            <Link
              href={`/watch?slug=${featuredMovie.slug}`}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 md:px-6 md:py-3"
            >
              <Play className="h-4 w-4 fill-current md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Xem Ngay</span>
            </Link>
            <Link
              href={`/phim/${featuredMovie.slug}`}
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2 font-semibold text-white transition hover:border-white/60 hover:bg-white/10 md:px-6 md:py-3"
            >
              <span className="text-sm md:text-base">Chi Tiết</span>
            </Link>
          </div>
        </div>
      </div>

      {movies.length > 1 && (
        <div className="absolute bottom-4 right-4 z-20 flex gap-2 md:bottom-6 md:right-6">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all md:h-2 ${
                index === activeIndex ? "w-6 bg-red-600 md:w-8" : "w-1.5 bg-white/40 hover:bg-white/60 md:w-2"
              }`}
              aria-label={`Chuyển đến slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
