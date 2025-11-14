"use client";
import { useEffect, useState } from "react";
import MovieMinimalCard from "@/components/movie/movie-minimal";
import Pagination from "@/components/pagination";

export default function MovieListClient({ index = 1 }: { index?: number }) {
  const [movies, setMovies] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    const fetchMovies = () => {
      setLoading(true);
      fetch(`https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${index}`)
        .then((res) => res.json())
        .then((data) => {
          setMovies(data.items);
          setPageInfo(data.pagination);
          setLoading(false);
        });
    };
    fetchMovies();
    interval = setInterval(fetchMovies, 300000); // 5 phút
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [index]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 py-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl h-[320px] w-full flex flex-col">
            <div className="h-2/3 w-full bg-gray-300 dark:bg-gray-700 rounded-t-xl" />
            <div className="flex-1 p-4 flex flex-col justify-end">
              <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-3/4" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie: any) => (
          <MovieMinimalCard key={movie.slug} movie={movie} />
        ))}
      </div>
  <Pagination />
    </>
  );
}
