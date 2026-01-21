"use client";

import Link from "next/link";
import { MovieCardDefault } from "@/components/movie/movie-card-variants";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MovieSectionProps {
  title: string;
  movies: any[];
  viewAllLink: string;
  emptyMessage?: string;
  initialVisible?: number;
  maxVisible?: number;
  loadStep?: number;
  buttonColor?: string;
  isClientSide?: boolean;
}

export default function MovieSection({
  title,
  movies = [],
  viewAllLink,
  emptyMessage = "Chưa có phim nào",
  initialVisible = 12,
  maxVisible = 20,
  loadStep = 4,
}: MovieSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const cappedMaxVisible = Math.min(maxVisible, movies.length || 0);
  const [visibleCount, setVisibleCount] = useState(() =>
    cappedMaxVisible ? Math.min(initialVisible, cappedMaxVisible) : 0
  );

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const [moved, setMoved] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setMoved(false);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 5) {
      setMoved(true);
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    setVisibleCount((prev) => {
      if (!cappedMaxVisible) return 0;
      const baseline = Math.min(initialVisible, cappedMaxVisible);
      if (prev === 0) return baseline;
      return Math.min(Math.max(prev, baseline), cappedMaxVisible);
    });
  }, [cappedMaxVisible, initialVisible]);

  const maybeLoadMore = useCallback(() => {
    if (!scrollRef.current) return;
    const maxItems = Math.min(maxVisible, movies.length || 0);
    if (!maxItems) return;

    const { scrollLeft: currentLeft, clientWidth, scrollWidth } = scrollRef.current;
    const nearEnd = currentLeft + clientWidth >= scrollWidth - 200;

    if (nearEnd) {
      setVisibleCount((prev) => Math.min(prev + loadStep, maxItems));
    }
  }, [loadStep, maxVisible, movies]);

  const displayedMovies = (movies || []).slice(0, visibleCount || 0);

  return (
    <section className="py-4 md:py-6">
      <div className="flex items-center justify-between mb-8 px-4 md:px-6">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">
            {title}
          </h2>
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white transition-all bg-black/40 backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white transition-all bg-black/40 backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
        <Link
          href={viewAllLink}
          className="text-[10px] md:text-xs font-black text-zinc-500 hover:text-red-600 transition-colors uppercase tracking-[0.2em]"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="relative px-4 md:px-6 overflow-hidden">
        {displayedMovies && displayedMovies.length > 0 ? (
          <div 
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onScroll={maybeLoadMore}
            className={`flex gap-4 md:gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          >
            {displayedMovies.map((movie: any, index: number) => (
              <div 
                key={`${movie.slug}-${index}`}
                className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] snap-start"
              >
                <div className={moved ? "pointer-events-none" : "pointer-events-auto"}>
                  <MovieCardDefault movie={movie} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/50 rounded-lg">
            <h3 className="text-lg font-bold text-zinc-500 uppercase tracking-widest">
              {emptyMessage}
            </h3>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
