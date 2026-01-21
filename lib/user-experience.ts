// Lưu lịch sử xem phim và đánh dấu phim yêu thích bằng localStorage
export interface Movie {
  slug: string;
  name: string;
  poster_url?: string;
  [key: string]: any;
}

export function getWatchedMovies(): Movie[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("watchedMovies") || "[]");
}

export function addWatchedMovie(movie: Movie): void {
  if (typeof window === "undefined") return;
  const movies: Movie[] = getWatchedMovies();
  if (!movies.find((m: Movie) => m.slug === movie.slug)) {
    movies.push(movie);
    localStorage.setItem("watchedMovies", JSON.stringify(movies));
  }
}

export function getFavoriteMovies(): Movie[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("favoriteMovies") || "[]");
}

export function toggleFavoriteMovie(movie: Movie): void {
  if (typeof window === "undefined") return;
  let movies: Movie[] = getFavoriteMovies();
  if (movies.find((m: Movie) => m.slug === movie.slug)) {
    movies = movies.filter((m: Movie) => m.slug !== movie.slug);
  } else {
    movies.push(movie);
  }
  localStorage.setItem("favoriteMovies", JSON.stringify(movies));
}

export function getPlaybackProgress(slug: string): number {
  if (typeof window === "undefined") return 0;
  const progress = JSON.parse(localStorage.getItem("playbackProgress") || "{}");
  return progress[slug] || 0;
}

export function savePlaybackProgress(slug: string, time: number, duration: number): void {
  if (typeof window === "undefined" || !slug) return;
  
  const progress = JSON.parse(localStorage.getItem("playbackProgress") || "{}");
  
  // Nếu chỉ còn 5 phút (300 giây) nữa hết phim thì không lưu nữa mà xóa trạng thái
  if (duration > 0 && duration - time < 300) {
    if (progress[slug]) {
      delete progress[slug];
      localStorage.setItem("playbackProgress", JSON.stringify(progress));
    }
    return;
  }

  // Lưu trạng thái mới
  if (time > 0) {
    progress[slug] = time;
    localStorage.setItem("playbackProgress", JSON.stringify(progress));
  }
}

export function clearPlaybackProgress(slug: string): void {
  if (typeof window === "undefined" || !slug) return;
  const progress = JSON.parse(localStorage.getItem("playbackProgress") || "{}");
  if (progress[slug]) {
    delete progress[slug];
    localStorage.setItem("playbackProgress", JSON.stringify(progress));
  }
}
