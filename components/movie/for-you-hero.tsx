"use client";

import { useMemo } from "react";
import HeroSection from "@/components/movie/hero-section";
import { useForYouMovies } from "@/components/foryou/use-for-you-movies";

interface ForYouHeroProps {
  fallbackMovies?: any[];
}

const takeUnique = <T, K extends string | number>(
  items: T[],
  getKey: (item: T) => K | undefined | null
) => {
  const map = new Map<K, T>();
  for (const item of items) {
    const key = getKey(item);
    if (!key || map.has(key)) continue;
    map.set(key, item);
  }
  return Array.from(map.values());
};

export default function ForYouHero({ fallbackMovies = [] }: ForYouHeroProps) {
  const { movies, loading } = useForYouMovies(4);

  const personalized = useMemo(() => {
    if (!movies.length) return [];
    const pick = movies[Math.floor(Math.random() * movies.length)];
    return [
      {
        ...pick,
        badgeText: "Dành cho bạn",
        badgeType: "personal",
      },
    ];
  }, [movies]);
  const desiredCount = 5;
  const personalMovie = personalized[0];
  const heroMovies = useMemo(() => {
    const fallbackPool = personalMovie
      ? fallbackMovies.filter((movie) => movie?.slug !== personalMovie.slug)
      : fallbackMovies;
    const fallbackLimit = personalMovie ? desiredCount - 1 : desiredCount;
    const fallbackPicks = takeUnique(
      fallbackPool,
      (m: any) => m?.slug
    ).slice(0, fallbackLimit || desiredCount);

    if (!personalMovie) return fallbackPicks;

    return [...fallbackPicks, personalMovie];
  }, [fallbackMovies, personalMovie, desiredCount]);

  if (heroMovies.length === 0 && loading) {
    return (
      <section className="relative h-[220px] w-full overflow-hidden bg-[#070707] px-3 py-2.5 sm:h-[240px] sm:px-4 sm:py-3 md:h-[260px] md:px-8 md:py-4 lg:h-[280px] lg:px-10">
        <div className="relative mx-auto h-full max-w-[1320px] overflow-hidden rounded-[20px] border border-white/[0.08] bg-zinc-950 sm:rounded-[24px]">
          <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.04),transparent_25%)]" />
          <div className="relative flex h-full max-w-2xl flex-col justify-end p-4 sm:p-5 md:p-6">
            <div className="mb-3 h-5 w-28 rounded bg-white/10" />
            <div className="h-9 w-3/4 rounded bg-white/10 sm:h-10" />
            <div className="mt-3 h-4 w-1/2 rounded bg-white/5" />
            <div className="mt-4 h-9 w-28 rounded-full bg-white/10" />
          </div>
        </div>
      </section>
    );
  }

  if (heroMovies.length === 0) return null;

  return <HeroSection movies={heroMovies} />;
}
