"use client";

import { Card } from "@/components/ui/card";
import { useLoading } from "@/components/ui/loading-context";
import { useRouter } from "next/navigation";

// Component thẻ phim mặc định - Cinematic Style (Sửa lỗi cắt góc và đè lên nhau)
export function MovieCardDefault({ movie }: { movie: any }) {
  const router = useRouter();
  const { showLoading } = useLoading();
  const handleClick = () => {
    showLoading();
    router.push(`/watch?slug=${movie.slug}`);
  };

  const thumbUrl = movie.thumb_url || movie.poster_url;
  const imageUrl = thumbUrl?.startsWith("http")
    ? thumbUrl
    : thumbUrl ? `https://phimimg.com/${thumbUrl}` : '/placeholder-movie.png';

  return (
    <div className="w-full">
      <button onClick={handleClick} className="block w-full text-left group">
        <div className="flex flex-col gap-3">
          {/* Thumbnail Container */}
          <Card className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900 border-none transition-all duration-300 shadow-lg ring-1 ring-white/10 group-hover:ring-white/20">
            <img
              src={imageUrl}
              alt={movie.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-2 right-2 z-20">
              <span className="px-1.5 py-0.5 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold rounded shadow-sm border border-white/10">
                {movie.quality || "HD"}
              </span>
            </div>
            {/* Overlay gradient for better hover effect */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Card>
          
          {/* Movie Info */}
          <div className="px-1 space-y-1">
            <h3 className="text-zinc-100 text-[15px] font-semibold line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">
              {movie.name}
            </h3>
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
              <span className="line-clamp-1">{movie.origin_name}</span>
              {movie.year && (
                <>
                  <span className="w-1 h-1 rounded-full bg-zinc-600" />
                  <span>{movie.year}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

export function MovieCardLarge({ movie }: { movie: any }) {
  return <MovieCardDefault movie={movie} />;
}

export function MovieCardWide({ movie }: { movie: any }) {
  return <MovieCardDefault movie={movie} />;
}

export function MovieCardCompact({ movie }: { movie: any }) {
  return <MovieCardDefault movie={movie} />;
}
