"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Play, Star, Calendar, Tag } from "lucide-react";

interface HeroSectionProps {
  movies: any[];
}

export default function HeroSection({ movies }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  const featuredMovie = movies[activeIndex];

  if (!featuredMovie) return null;

  const getRating = (m: any) => {
    const imdb = Number(m?.imdb?.rating);
    if (!Number.isNaN(imdb) && imdb > 0) return imdb.toFixed(1);
    const tmdb = Number(m?.tmdb?.vote_average);
    if (!Number.isNaN(tmdb) && tmdb > 0) return tmdb.toFixed(1);
    return null;
  };

  return (
    <section 
      className="relative h-[110vh] w-full overflow-hidden bg-background"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images - Crossfade smoothly */}
      {movies.map((m, idx) => (
        <div
          key={m.slug}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
            idx === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={m.thumb_url?.startsWith("http") ? m.thumb_url : `https://phimimg.com/${m.thumb_url}`}
            alt={m.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
      ))}

      {/* Content Area */}
      <div className="relative h-full container mx-auto px-6 flex flex-col justify-end pb-20 md:pb-28 max-w-6xl z-10">
        
        {/* Only the text part changes with smooth transition */}
        <div className="relative h-40 md:h-52 flex flex-col justify-end">
          {movies.map((m, idx) => (
            <div 
              key={`text-${m.slug}`}
              className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out ${
                idx === activeIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                {m?.badgeType === "personal" ? (
                  <div className="bg-red-600 text-white px-3 py-1 rounded-sm font-black text-[10px] uppercase tracking-[0.2em]">
                    {m.badgeText || "Dành cho bạn"}
                  </div>
                ) : m?.badgeType === "imdb" ? (
                  <>
                    <div className="bg-[#f5c518] text-black px-2 py-0.5 rounded-sm font-black text-[10px]">
                      IMDb
                    </div>
                    <div className="flex items-center text-[#f5c518] gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-bold text-xs">
                        {getRating(m) ? `${getRating(m)} / 10` : "8.5 / 10"}
                      </span>
                    </div>
                  </>
                ) : m?.badgeText ? (
                  <div className="bg-muted text-foreground px-3 py-1 rounded-sm font-black text-[10px] uppercase tracking-[0.2em] border border-border">
                    {m.badgeText}
                  </div>
                ) : (
                  <>
                    <div className="bg-[#f5c518] text-black px-2 py-0.5 rounded-sm font-black text-[10px]">
                      IMDb
                    </div>
                    <div className="flex items-center text-[#f5c518] gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-bold text-xs">8.5 / 10</span>
                    </div>
                  </>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground mb-2 tracking-tighter uppercase leading-[0.9] max-w-4xl drop-shadow-sm line-clamp-2">
                {m.name}
              </h1>
              
              <h2 className="text-base md:text-lg font-bold text-red-600 mb-4 tracking-tight uppercase opacity-90 drop-shadow-lg">
                {m.origin_name}
              </h2>

              <div className="flex flex-wrap items-center gap-x-5 mb-4 text-muted-foreground font-bold text-xs md:text-sm">
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-red-600" />
                  {m.year}
                </span>
                <span className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-red-600" />
                  {m.category?.map((c: any) => c.name).slice(0, 2).join(", ")}
                </span>
                <span className="px-1.5 py-0.5 bg-accent rounded text-[10px] border border-border">
                  {m.quality}
                </span>
              </div>

              <p className="text-muted-foreground/80 text-sm md:text-base mb-4 line-clamp-2 font-medium max-w-xl leading-relaxed">
                {m.content?.replace(/<[^>]*>?/gm, "") || "Trải nghiệm siêu phẩm điện ảnh đỉnh cao."}
              </p>
            </div>
          ))}
        </div>

        {/* Fixed Buttons and Thumbnails */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mt-8">
          <Link
            href={`/watch?slug=${featuredMovie.slug}`}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 transform hover:scale-105 shadow-2xl w-fit text-sm"
          >
            <Play className="w-5 h-5 fill-current" /> Xem Phim
          </Link>

          <div className="flex items-center gap-3">
            {movies.map((m, idx) => (
              <button
                key={m.slug}
                onClick={() => setActiveIndex(idx)}
                className={`group relative w-14 h-20 md:w-16 md:h-24 overflow-hidden rounded-sm border transition-all transform hover:scale-110 ${
                  idx === activeIndex ? "border-primary scale-110 z-20 shadow-[0_0_20px_rgba(229,9,20,0.4)]" : "border-border opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={m.poster_url?.startsWith("http") ? m.poster_url : `https://phimimg.com/${m.poster_url}`}
                  alt={m.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
