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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-3 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Đang tải phim...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="py-8">
        <div className="grid gap-6 auto-rows-[280px]" style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))'
        }}>
          {movies.map((movie: any, index: number) => {
            const patterns = [
              'row-span-1',
              'row-span-1',
              'row-span-2',
              'row-span-1',
              'row-span-1',
              'row-span-1',
            ];
            const pattern = patterns[index % patterns.length];
            return (
              <div key={movie.slug} className={`${pattern} animate-float`} style={{animationDelay: `${index * 0.1}s`}}>
                <MovieMinimalCard movie={movie} />
              </div>
            );
          })}
        </div>
      </div>
      <Pagination />
    </>
  );
}
