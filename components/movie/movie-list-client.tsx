"use client";

import { Suspense } from "react";
import { MovieCardDefault } from "@/components/movie/movie-card-variants";
import Pagination from "@/components/pagination";
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
        <div className="content-grid-panel mx-auto max-w-3xl py-14 text-center md:py-20">
          <div className="mx-auto mb-5 h-1 w-16 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 shadow-[0_0_24px_rgba(139,92,246,0.4)]" />
          <h3 className="text-xl font-semibold tracking-tight text-zinc-100 md:text-2xl">
            Không tìm thấy phim nào
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-500 md:text-base">
            Không có phim phù hợp với tiêu chí hiện tại. Hãy đổi bộ lọc hoặc thử một danh mục khác.
          </p>
        </div>
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal animation="fade" direction="up">
      <div className="content-grid-panel">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
          <p className="text-xs font-medium text-zinc-500 md:text-sm">
            Hiển thị <span className="text-zinc-300">{movies.length}</span> phim
            {pageInfo?.totalItems ? (
              <span> / {pageInfo.totalItems} phim</span>
            ) : null}
          </p>
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-700">
            PHIMANH / COLLECTION
          </span>
        </div>

        <div className="movie-list-grid">
          {movies.map((movie: any, index: number) => (
            <ScrollReveal
              key={movie.slug}
              animation="fade"
              threshold={0.08}
            >
              <div
                className="material-transition"
                style={{ animationDelay: `${index * 0.015}s` }}
              >
                <MovieCardDefault movie={movie} />
              </div>
            </ScrollReveal>
          ))}
        </div>

        {pageInfo && (
          <div className="mt-8 border-t border-white/[0.07] pt-6">
            <Suspense fallback={null}>
              <Pagination pageInfo={pageInfo} />
            </Suspense>
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}
