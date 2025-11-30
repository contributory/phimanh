"use client";

import { useEffect, useState } from "react";
import MovieSection from "@/components/movie-section";

interface RecentlyWatchedProps {
  limit?: number;
}

export default function RecentlyWatched({ limit }: RecentlyWatchedProps) {
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    const Cookies = require('js-cookie');
    const recentlyWatched = JSON.parse(Cookies.get('recentlyWatched') || '[]');
    setMovies(limit ? recentlyWatched.slice(0, limit) : recentlyWatched);
  }, [limit]);

  return (
    <MovieSection
      title="Đã Xem Gần Đây"
      movies={movies}
      viewAllLink="/recently"
      buttonColor="purple"
      emptyMessage="Chưa có phim đã xem"
      isClientSide={true}
    />
  );
}