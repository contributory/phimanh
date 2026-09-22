"use client";

import Link from "next/link";
import { MovieCardDefault } from "@/components/movie/movie-card-variants";
import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { gsap, ensureGsap, prefersReducedMotion, EASE } from "@/lib/gsap";

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
  const rootRef = useRef<HTMLElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [moved, setMoved] = useState(false);
  const cappedMaxVisible = Math.min(maxVisible, movies.length || 0);
  const [visibleCount, setVisibleCount] = useState(() =>
    cappedMaxVisible ? Math.min(initialVisible, cappedMaxVisible) : 0,
  );

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -560 : 560,
      behavior: "smooth",
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setMoved(false);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) setMoved(true);
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
    if (currentLeft + clientWidth >= scrollWidth - 240) {
      setVisibleCount((prev) => Math.min(prev + loadStep, maxItems));
    }
  }, [loadStep, maxVisible, movies]);

  const displayedMovies = movies.slice(0, visibleCount || 0);

  useEffect(() => {
    if (!rootRef.current || prefersReducedMotion()) return;
    ensureGsap();
    const ctx = gsap.context(() => {
      gsap.from("[data-section-title]", {
        y: 16,
        autoAlpha: 0,
        duration: 0.55,
        ease: EASE.out,
        scrollTrigger: { trigger: rootRef.current, start: "top 92%", once: true },
      });
      gsap.from("[data-row-card]", {
        y: 20,
        autoAlpha: 0,
        duration: 0.55,
        ease: EASE.out,
        stagger: 0.035,
        scrollTrigger: { trigger: rootRef.current, start: "top 88%", once: true },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="py-5 md:py-7">
      <div className="mb-4 flex items-end justify-between px-4 md:px-8 lg:px-10">
        <div data-section-title>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Khám phá
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100 md:text-2xl">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 md:flex">
            <button
              onClick={() => scroll("left")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-500 transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
              aria-label={`Cuộn ${title} sang trái`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-500 transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
              aria-label={`Cuộn ${title} sang phải`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Link
            href={viewAllLink}
            className="ml-1 flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-zinc-500 transition hover:text-white"
          >
            Xem tất cả
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden px-4 md:px-8 lg:px-10">
        {displayedMovies.length > 0 ? (
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onScroll={maybeLoadMore}
            className={`scrollbar-hide flex gap-3.5 overflow-x-auto pb-5 pt-1 snap-x md:gap-4 ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {displayedMovies.map((movie: any, index: number) => (
              <div
                key={`${movie.slug}-${index}`}
                data-row-card
                className="w-[220px] flex-shrink-0 snap-start sm:w-[250px] md:w-[270px] xl:w-[285px]"
              >
                <div className={moved ? "pointer-events-none" : "pointer-events-auto"}>
                  <MovieCardDefault movie={movie} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-14 text-center text-sm text-zinc-500">
            {emptyMessage}
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
