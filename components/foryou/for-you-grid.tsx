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
      <div className="content-grid-panel movie-list-grid">
        {Array.from({ length: limit }).map((_, idx) => (
          <div key={idx} className="animate-pulse space-y-2.5">
            <div className="aspect-video rounded-lg bg-white/[0.055]" />
            <div className="h-4 w-4/5 rounded bg-white/[0.05]" />
            <div className="h-3 w-3/5 rounded bg-white/[0.035]" />
          </div>
        ))}
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="content-grid-panel py-20 text-center">
        <p className="text-lg text-muted-foreground font-bold uppercase tracking-widest">
          Chưa có gợi ý phù hợp - hãy xem thêm vài phim để chúng tôi học sở thích của bạn.
        </p>
      </div>
    );
  }

  return (
    <ScrollReveal animation="fade" direction="up">
      <div className="content-grid-panel movie-list-grid">
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
