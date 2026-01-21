"use client";

import MovieSection from "@/components/movie-section";
import { ScrollReveal } from "@/components/ui/material-animations";
import { useForYouMovies } from "@/components/foryou/use-for-you-movies";

interface ForYouSectionProps {
  limit?: number;
  initialVisible?: number;
}

export default function ForYouSection({ limit = 20, initialVisible = 6 }: ForYouSectionProps) {
  const cappedLimit = Math.min(limit, 20);
  const { movies, loading } = useForYouMovies(cappedLimit);
  const skeletonCount = Math.min(initialVisible, cappedLimit);

  if (loading) return null;

  if (movies.length === 0) return null;

  return (
    <ScrollReveal animation="fade" direction="up">
      <MovieSection
        title="Dành Cho Bạn"
        movies={(movies || []).slice(0, cappedLimit)}
        viewAllLink="/foryou"
        emptyMessage="Chưa đủ dữ liệu để gợi ý - hãy xem vài phim trước nhé!"
        initialVisible={Math.min(initialVisible, cappedLimit)}
        maxVisible={cappedLimit}
      />
    </ScrollReveal>
  );
}
