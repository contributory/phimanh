"use client";

import { Card } from "@/components/ui/card";
import { useLoading } from "@/components/ui/loading-context";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

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

  // Xử lý lỗi hình ảnh
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder-movie.png';
  };

  return (
    <div className="w-full">
      <button onClick={handleClick} className="block w-full text-left group netflix-card rounded-sm overflow-hidden">
        <div className="flex flex-col gap-2">
          {/* Thumbnail Container */}
          <Card className="relative aspect-video overflow-hidden rounded-sm bg-muted border-none transition-all duration-300 shadow-lg ring-1 ring-border/30 group-hover:ring-[#E50914]/50 card-shine">
            <img
              src={imageUrl}
              alt={movie.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={handleImageError}
            />
            <div className="absolute top-2 right-2 z-20">
              <span className="px-2 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-sm shadow-lg border border-white/10">
                {movie.quality || "HD"}
              </span>
            </div>
            {/* Play button overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#E50914]/90 backdrop-blur-sm flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75 shadow-2xl">
                <Play className="w-7 h-7 fill-white text-white ml-1" />
              </div>
            </div>
            {/* Gradient overlay for better readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Card>
          
          {/* Movie Info */}
          <div className="px-0.5 space-y-1.5">
            <h3 className="text-foreground text-[14px] font-bold line-clamp-2 leading-tight group-hover:text-[#E50914] transition-colors duration-300">
              {movie.name}
            </h3>
            <div className="flex items-center gap-2 text-muted-foreground/70 text-xs font-medium">
              <span className="line-clamp-1">{movie.origin_name}</span>
              {movie.year && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border/50" />
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
