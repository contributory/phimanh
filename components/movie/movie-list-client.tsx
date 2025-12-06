"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MovieHorizontalCard from "@/components/movie/movie-horizontal";
import Pagination from "@/components/pagination";
import { Card, CardContent } from "@/components/ui/enhanced-card";
import { MaterialLoading, ScrollReveal } from "@/components/ui/material-animations";

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
      const hasAdvancedFilters = searchParams.get("typeList") || searchParams.get("sortField") || searchParams.get("category") || searchParams.get("country") || searchParams.get("year");

      if (hasAdvancedFilters) {
        // Use advanced filter API - no limit restriction
        const typeList = searchParams.get("typeList") || "phim-bo";
        const sortField = searchParams.get("sortField") || "modified.time";
        const sortType = searchParams.get("sortType") || "desc";
        const sortLang = searchParams.get("sortLang") || "vietsub";
        const filterCategory = searchParams.get("category");
        const filterCountry = searchParams.get("country");
        const filterYear = searchParams.get("year");
        const limit = searchParams.get("limit") || "64"; // Increased default limit

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
          url = `https://phimapi.com/v1/api/the-loai/${category}?page=${index}&limit=64`;
        } else if (topic) {
          url = `https://phimapi.com/v1/api/danh-sach/${topic}?page=${index}&limit=64`;
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
        <Card variant="glass" className="p-8 text-center max-w-md">
          <CardContent className="space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <MaterialLoading />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Đang tải phim...
              </h2>
              <p className="text-muted-foreground">
                Vui lòng chờ trong giây lát
              </p>
            </div>

            {/* Loading skeleton */}
            <div className="space-y-3">
              <div className="h-2 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-full animate-pulse"></div>
              <div className="h-2 bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-3/4 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <ScrollReveal animation="fade">
        <div className="py-16">
          <Card variant="glass" className="text-center p-12 max-w-2xl mx-auto">
            <CardContent className="space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  Không tìm thấy phim nào
                </h3>
                <p className="text-muted-foreground text-lg">
                  Không có phim nào phù hợp với tiêu chí tìm kiếm của bạn. Vui lòng thử lại với các tùy chọn khác.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal animation="fade" direction="up">
      <div className="py-4">
        {/* Movie count info */}
        <div className="mb-4 text-sm text-muted-foreground">
          Hiển thị {movies.length} phim
          {pageInfo && pageInfo.totalItems && (
            <span> / Tổng {pageInfo.totalItems} phim</span>
          )}
        </div>

        {/* Responsive grid: 1 column portrait, 2 columns landscape */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 landscape:grid-cols-2 2xl:grid-cols-2">
          {movies.map((movie: any, idx: number) => (
            <ScrollReveal
              key={movie.slug}
              animation="fade"
              threshold={0.1}
            >
              <div
                className="material-transition"
                style={{ animationDelay: `${idx * 0.02}s` }}
              >
                <MovieHorizontalCard movie={movie} />
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Pagination with Material Design */}
        <div className="mt-8">
          <Card variant="glass">
            <CardContent className="p-4">
              <Pagination />
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollReveal>
  );
}

