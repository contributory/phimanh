"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MovieMinimalProps {
  movie: any;
  setLoading: (loading: boolean) => void;
}

export default function MovieMinimalCard({
  movie,
  setLoading,
}: MovieMinimalProps) {
  return (
    <Link
      onClick={() => setLoading(true)}
      href={`/watch?slug=${movie.slug}`}
      className="block h-full"
    >
      <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-transparent hover:border-blue-500/50">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
          <img
            src={movie.poster_url}
            onError={(e) =>
              (e.currentTarget.src = `https://phimimg.com/${movie.poster_url}`)
            }
            alt={movie.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg z-20">
            HD
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <p className="text-white text-xs line-clamp-2">
              {movie.origin_name || movie.name}
            </p>
          </div>
        </div>
        <CardContent className="flex flex-col justify-between p-4 bg-gradient-to-b from-transparent to-white/50 dark:to-gray-900/50">
          <CardTitle className="mb-2 text-base font-bold line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {movie.name}
          </CardTitle>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {movie.year}
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-semibold">
              {movie.quality || "HD"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
