"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MovieMinimalCard from "@/components/movie/movie-minimal";

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

  if (movies.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Đã Xem Gần Đây
        </h2>
        <Link
          href={`/recently`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 dark:text-blue-400 dark:border-blue-400 font-semibold transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </div>

      <div
        className="grid gap-6 auto-rows-[280px]"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        }}
      >
        {movies.map((movie: any, index: number) => (
          <div
            key={movie.slug}
            className="animate-float"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <MovieMinimalCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );
}