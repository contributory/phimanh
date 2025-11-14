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
