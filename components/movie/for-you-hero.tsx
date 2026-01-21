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
      <section className="relative h-[110vh] w-full overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black">
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.06),transparent_25%)]" />
        <div className="relative h-full container mx-auto px-6 flex flex-col justify-end pb-20 md:pb-28 max-w-6xl">
          <div className="space-y-4 max-w-2xl">
            <div className="w-32 h-5 bg-white/10 rounded" />
            <div className="w-3/4 h-12 bg-white/10 rounded" />
            <div className="w-1/2 h-10 bg-white/5 rounded" />
            <div className="w-full h-20 bg-white/5 rounded" />
            <div className="w-40 h-12 bg-red-600/60 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (heroMovies.length === 0) return null;

  return <HeroSection movies={heroMovies} />;
}
