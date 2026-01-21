"use client";

import { MovieCardDefault } from "@/components/movie/movie-card-variants";
import { ScrollReveal } from "@/components/ui/material-animations";
import { useForYouMovies } from "@/components/foryou/use-for-you-movies";

interface ForYouGridProps {
  limit?: number;
}

export default function ForYouGrid({ limit = 20 }: ForYouGridProps) {
  const { movies, loading } = useForYouMovies(limit);

  if (loading) {
    return (
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: limit }).map((_, idx) => (
          <div
            key={idx}
            className="h-64 rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="text-center py-20 bg-muted/50 rounded-xl border border-border">
        <p className="text-lg text-muted-foreground font-bold uppercase tracking-widest">
          Chưa có gợi ý phù hợp - hãy xem thêm vài phim để chúng tôi học sở thích của bạn.
        </p>
      </div>
    );
  }

  return (
    <ScrollReveal animation="fade" direction="up">
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {movies.slice(0, limit).map((movie: any, index: number) => (
          <div
            key={`${movie.slug}-${index}`}
            className="material-transition"
            style={{ animationDelay: `${index * 0.02}s` }}
          >
            <MovieCardDefault movie={movie} />
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
