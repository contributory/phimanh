"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MovieMinimalCard from "@/components/movie/movie-minimal";
import Pagination from "@/components/pagination";

interface MovieListClientProps {
  index?: number;
  category?: string;
  topic?: string;
}

export default function MovieListClient({
  index = 1,
  category,
  topic,
}: MovieListClientProps) {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    const fetchMovies = () => {
      setLoading(true);

      // Check if advanced filters are being used
      const hasAdvancedFilters = searchParams.get("typeList") || searchParams.get("sortField") || searchParams.get("category");

      if (hasAdvancedFilters) {
        // Use advanced filter API
        const typeList = searchParams.get("typeList") || "phim-bo";
        const sortField = searchParams.get("sortField") || "modified.time";
        const sortType = searchParams.get("sortType") || "desc";
        const sortLang = searchParams.get("sortLang") || "vietsub";
        const filterCategory = searchParams.get("category");
        const filterCountry = searchParams.get("country");
        const filterYear = searchParams.get("year");
        const limit = searchParams.get("limit") || "10";

        const url = new URL("https://phimapi.com/v1/api/danh-sach/" + typeList);
        url.searchParams.set("page", String(index));
        url.searchParams.set("sort_field", sortField);
        url.searchParams.set("sort_type", sortType);
        url.searchParams.set("limit", limit);
        if (sortLang) url.searchParams.set("sort_lang", sortLang);
        if (filterCategory) url.searchParams.set("category", filterCategory);
        if (filterCountry) url.searchParams.set("country", filterCountry);
        if (filterYear) url.searchParams.set("year", filterYear);

        fetch(url.toString())
          .then((res) => res.json())
          .then((data) => {
            setMovies(data.data.items);
            setPageInfo(data.data.params.pagination);
            setLoading(false);
          })
          .catch(() => {
            setMovies([]);
            setPageInfo(null);
            setLoading(false);
          });
      } else {
        // Use original logic for category/topic/default
        let url: string;
        if (category) {
          url = `https://phimapi.com/v1/api/the-loai/${category}?page=${index}`;
        } else if (topic) {
          url = `https://phimapi.com/v1/api/danh-sach/${topic}?page=${index}`;
        } else {
          url = `https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${index}`;
        }

        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            // Handle different response structures
            if (category || topic) {
              setMovies(data.data.items);
              setPageInfo(data.data.params.pagination);
            } else {
              setMovies(data.items);
              setPageInfo(data.pagination);
            }
            setLoading(false);
          })
          .catch(() => {
            setMovies([]);
            setPageInfo(null);
            setLoading(false);
          });
      }
    };
    fetchMovies();
    interval = setInterval(fetchMovies, 300000); // 5 phút
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [index, category, topic, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div
              className="absolute inset-3 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "1s" }}
            ></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Đang tải phim...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Vui lòng chờ trong giây lát
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="py-8">
        <div
          className="grid gap-6 auto-rows-[280px]"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          }}
        >
          {movies.map((movie: any, index: number) => {
            const patterns = [
              "row-span-1",
              "row-span-1",
              "row-span-2",
              "row-span-1",
              "row-span-1",
              "row-span-1",
            ];
            const pattern = patterns[index % patterns.length];
            return (
              <div
                key={movie.slug}
                className={`${pattern} animate-float`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
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
