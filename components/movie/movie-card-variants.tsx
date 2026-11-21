"use client";

import { Card } from "@/components/ui/card";
import { useLoading } from "@/components/ui/loading-context";
import { useRouter } from "next/navigation";
import { Play, X } from "lucide-react";
import Image from "next/image";
import { memo, useState } from "react";

const MovieCardDefault = memo(function MovieCardDefault({
  movie,
  onRemove,
}: {
  movie: any;
  onRemove?: (movie: any) => void;
}) {
  const router = useRouter();
  const { showLoading } = useLoading();
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleClick = () => {
    showLoading();
    router.push(`/watch?slug=${movie.slug}`);
  };

  const thumbUrl = movie.thumb_url || movie.poster_url;
  const imageUrl = thumbUrl?.startsWith("http")
    ? thumbUrl
    : thumbUrl
      ? `https://phimimg.com/${thumbUrl}`
      : "/placeholder-movie.png";

  const secondaryMeta = [movie.year, movie.episode_current]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="group relative">
      <button
        onClick={handleClick}
        className="block w-full text-left focus-visible:outline-none"
        aria-label={`Xem ${movie.name}`}
      >
        <Card className="relative aspect-video overflow-hidden rounded-lg border border-white/[0.06] bg-zinc-900 shadow-none transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/15 group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)] group-focus-visible:ring-2 group-focus-visible:ring-red-500 will-change-transform">
          <Image
            src={imageUrl}
            alt={movie.name}
            fill
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
              isImageLoading ? "blur-sm" : "blur-0"
            }`}
            onLoad={() => setIsImageLoading(false)}
            onError={(e) => {
              e.currentTarget.src = "/placeholder-movie.png";
              setIsImageLoading(false);
            }}
            sizes="(max-width: 640px) 220px, (max-width: 768px) 250px, (max-width: 1024px) 270px, 285px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="rounded-md border border-white/10 bg-black/65 px-2 py-1 text-[10px] font-semibold tracking-wide text-white backdrop-blur-md">
              {movie.quality || "HD"}
            </span>
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform duration-300 group-hover:scale-100">
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            </span>
          </div>
        </Card>

        <div className="mt-3 space-y-1 px-0.5">
          <h3 className="line-clamp-1 text-[14px] font-semibold leading-5 text-zinc-100 transition-colors group-hover:text-white">
            {movie.name}
          </h3>
          <div className="flex min-w-0 items-center gap-2 text-xs text-zinc-500">
            {movie.origin_name && (
              <span className="min-w-0 flex-1 truncate">{movie.origin_name}</span>
            )}
            {secondaryMeta && (
              <span className="shrink-0">{secondaryMeta}</span>
            )}
          </div>
        </div>
      </button>

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(movie);
          }}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white opacity-100 backdrop-blur-md transition hover:border-red-500 hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          aria-label={`Xóa ${movie.name} khỏi danh sách đã xem`}
          title="Xóa khỏi danh sách đã xem"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

MovieCardDefault.displayName = "MovieCardDefault";

export { MovieCardDefault };
export const MovieCardLarge = MovieCardDefault;
export const MovieCardWide = MovieCardDefault;
export const MovieCardCompact = MovieCardDefault;
