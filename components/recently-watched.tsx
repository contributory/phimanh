"use client";

import { useEffect, useState } from "react";
import MovieSection from "@/components/movie-section";
import { hasPlaybackProgress } from "@/lib/user-experience";

interface RecentlyWatchedProps {
  limit?: number;
}

export default function RecentlyWatched({ limit = 20 }: RecentlyWatchedProps) {
  const [movies, setMovies] = useState<any[]>([]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const Cookies = require('js-cookie');
    const recentlyWatched = JSON.parse(Cookies.get('recentlyWatched') || '[]');
    const cappedLimit = Math.min(limit, 20);
    setMovies(
      recentlyWatched
        .filter((movie: any) => hasPlaybackProgress(movie.slug))
        .slice(0, cappedLimit)
    );
  }, [limit]);

  if (!mounted || movies.length === 0) return null;

  return (
    <MovieSection
      title="Tiếp Tục Xem"
      movies={movies}
      viewAllLink="/recently"
      buttonColor="purple"
      emptyMessage="Chưa có phim để tiếp tục xem"
      isClientSide={true}
      initialVisible={6}
      maxVisible={Math.min(limit, 20)}
    />
  );
}
