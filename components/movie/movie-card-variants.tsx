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

  // Xử lý lỗi hình ảnh
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder-movie.png';
  };

  return (
    <div className="w-full">
      <button onClick={handleClick} className="block w-full text-left group">
        <div className="flex flex-col gap-3">
          {/* Thumbnail Container */}
          <Card className="relative aspect-video overflow-hidden rounded-xl bg-muted border-none transition-all duration-300 shadow-lg ring-1 ring-border group-hover:ring-primary/20">
            <img
              src={imageUrl}
              alt={movie.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={handleImageError}
            />
            <div className="absolute top-2 right-2 z-20">
              <span className="px-1.5 py-0.5 bg-background/80 backdrop-blur-md text-foreground text-[10px] font-bold rounded shadow-sm border border-border">
                {movie.quality || "HD"}
              </span>
            </div>
            {/* Overlay gradient for better hover effect */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Card>
          
          {/* Movie Info */}
          <div className="px-1 space-y-1">
            <h3 className="text-foreground text-[15px] font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {movie.name}
            </h3>
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
              <span className="line-clamp-1">{movie.origin_name}</span>
              {movie.year && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
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
