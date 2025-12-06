"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useLoading } from "@/components/ui/loading-context";

interface MovieCardProps {
  movie: any;
  variant?: 'default' | 'large' | 'wide' | 'compact' | 'featured';
}

// Component thẻ phim kích thước lớn - nổi bật
export function MovieCardLarge({ movie }: { movie: any }) {
  const { showLoading, hideLoading } = useLoading();
  const handleClick = () => {
    showLoading();
    try {
      window.location.href = `/watch?slug=${movie.slug}`;
    } finally {
      hideLoading();
    }
  };

  return (
    <button onClick={handleClick} className="block h-full w-full text-left col-span-2 row-span-2">
      <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-transparent hover:border-red-500/50">
        <div className="relative h-full overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 z-10" />
          <img
            src={
              movie.poster_url?.startsWith("http")
                ? movie.poster_url
                : movie.poster_url ? `https://phimimg.com/${movie.poster_url}` : '/placeholder-movie.png'
            }
            alt={movie.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg z-20">
            FEATURED
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <h3 className="text-white text-xl font-bold mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
              {movie.name}
            </h3>
            <div className="flex items-center gap-4 text-white/80">
              <span className="flex items-center gap-2 text-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {movie.year}
              </span>
              <span className="px-3 py-1 bg-red-600/80 text-white rounded-full text-xs font-semibold">
                {movie.quality || "HD"}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </button>
  );
}

// Component thẻ phim hình chữ nhật ngang - phong cảnh
export function MovieCardWide({ movie }: { movie: any }) {
  const { showLoading, hideLoading } = useLoading();
  const handleClick = () => {
    showLoading();
    try {
      window.location.href = `/watch?slug=${movie.slug}`;
    } finally {
      hideLoading();
    }
  };

  return (
    <button onClick={handleClick} className="block h-full w-full text-left col-span-2">
      <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-transparent hover:border-purple-500/50">
        <div className="flex h-full">
          <div className="relative w-1/2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 group-hover:to-black/40 transition-all duration-300 z-10" />
            <img
              src={
                movie.poster_url?.startsWith("http")
                  ? movie.poster_url
                  : movie.poster_url ? `https://phimimg.com/${movie.poster_url}` : '/placeholder-movie.png'
              }
              alt={movie.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg z-20">
              HD
            </div>
          </div>
          <CardContent className="flex-1 p-4 flex flex-col justify-center">
            <h3 className="font-bold text-lg line-clamp-2 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2">
              {movie.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {movie.year}
              </span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-semibold">
                {movie.quality || "HD"}
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    </button>
  );
}

// Component thẻ phim nhỏ gọn
export function MovieCardCompact({ movie }: { movie: any }) {
  const { showLoading, hideLoading } = useLoading();
  const handleClick = () => {
    showLoading();
    try {
      window.location.href = `/watch?slug=${movie.slug}`;
    } finally {
      hideLoading();
    }
  };

  return (
    <button onClick={handleClick} className="block h-full w-full text-left">
      <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-transparent hover:border-green-500/50">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <img
            src={
              movie.poster_url?.startsWith("http")
                ? movie.poster_url
                : movie.poster_url ? `https://phimimg.com/${movie.poster_url}` : '/placeholder-movie.png'
            }
            alt={movie.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-1 right-1 bg-green-600 text-white px-1.5 py-0.5 rounded-full text-xs font-bold shadow-lg z-20">
            HD
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
            <p className="text-white text-xs font-semibold line-clamp-1 group-hover:text-green-400 transition-colors">
              {movie.name}
            </p>
            <p className="text-white/80 text-[10px]">{movie.year}</p>
          </div>
        </div>
      </Card>
    </button>
  );
}

// Component thẻ phim mặc định (như cũ nhưng cải tiến)
export function MovieCardDefault({ movie }: { movie: any }) {
  const { showLoading, hideLoading } = useLoading();
  const handleClick = () => {
    showLoading();
    try {
      window.location.href = `/watch?slug=${movie.slug}`;
    } finally {
      hideLoading();
    }
  };

  return (
    <button onClick={handleClick} className="block h-full w-full text-left">
      <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-transparent hover:border-blue-500/50">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-t-xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
          <img
            src={
              movie.poster_url?.startsWith("http")
                ? movie.poster_url
                : movie.poster_url ? `https://phimimg.com/${movie.poster_url}` : '/placeholder-movie.png'
            }
            alt={movie.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg z-20">
            HD
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <p className="text-white text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
              {movie.name}
            </p>
          </div>
        </div>
        <CardContent className="p-3 bg-gradient-to-b from-transparent to-white/50 dark:to-gray-900/50">
          <h3 className="font-bold text-sm line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
            {movie.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {movie.year}
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-semibold">
              {movie.quality || "HD"}
            </span>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}