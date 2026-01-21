"use client";
import { MovieCardDefault } from "@/components/movie/movie-card-variants";
import Pagination from "@/components/pagination";
import { Card, CardContent } from "@/components/ui/enhanced-card";
import { ScrollReveal } from "@/components/ui/material-animations";

interface MovieListClientProps {
  movies?: any[];
  pageInfo?: any;
}

export default function MovieListClient({
  movies = [],
  pageInfo = null,
}: MovieListClientProps) {
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

        {/* Responsive grid: YouTube style */}
        <div className="grid gap-x-4 gap-y-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
                <MovieCardDefault movie={movie} />
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Pagination with Material Design */}
        <div className="mt-8">
          <Card variant="glass">
            <CardContent className="p-4">
              <Pagination pageInfo={pageInfo} />
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollReveal>
  );
}
