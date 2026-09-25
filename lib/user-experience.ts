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

interface PlaybackProgressEntry {
  time: number;
  duration: number;
  videoUrl?: string;
  updatedAt: number;
}

type PlaybackProgressStore = Record<string, number | PlaybackProgressEntry>;

const getPlaybackProgressStore = (): PlaybackProgressStore => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("playbackProgress") || "{}");
  } catch {
    return {};
  }
};

const clearSavedEpisode = (slug: string) => {
  localStorage.removeItem(`lastEpisode_${slug}`);
  localStorage.removeItem(`lastEpisodeIndex_${slug}`);
};

export function getPlaybackProgress(slug: string, videoUrl?: string): number {
  if (typeof window === "undefined" || !slug) return 0;

  const entry = getPlaybackProgressStore()[slug];
  if (!entry) return 0;

  // Backward compatibility with the old numeric storage format.
  if (typeof entry === "number") return entry;

  if (videoUrl && entry.videoUrl && entry.videoUrl !== videoUrl) {
    return 0;
  }

  return entry.time || 0;
}

export function hasPlaybackProgress(slug: string): boolean {
  if (typeof window === "undefined" || !slug) return false;
  const entry = getPlaybackProgressStore()[slug];
  if (!entry) return false;
  return typeof entry === "number" ? entry > 0 : entry.time > 0;
}

export function savePlaybackProgress(
  slug: string,
  time: number,
  duration: number,
  options: {
    isFinalEpisode?: boolean;
    videoUrl?: string;
  } = {}
): void {
  if (
    typeof window === "undefined" ||
    !slug ||
    !Number.isFinite(time) ||
    !Number.isFinite(duration) ||
    time <= 0 ||
    duration <= 0
  ) {
    return;
  }

  const progress = getPlaybackProgressStore();
  const remaining = Math.max(duration - time, 0);

  // Chỉ coi bộ phim là đã xem xong khi đang ở tập cuối và tập cuối còn <= 5 phút.
  if (options.isFinalEpisode && remaining <= 300) {
    delete progress[slug];
    localStorage.setItem("playbackProgress", JSON.stringify(progress));
    clearSavedEpisode(slug);
    return;
  }

  progress[slug] = {
    time,
    duration,
    videoUrl: options.videoUrl,
    updatedAt: Date.now(),
  };
  localStorage.setItem("playbackProgress", JSON.stringify(progress));
}

export function clearPlaybackProgress(
  slug: string,
  clearEpisodeState = false
): void {
  if (typeof window === "undefined" || !slug) return;

  const progress = getPlaybackProgressStore();
  if (progress[slug]) {
    delete progress[slug];
    localStorage.setItem("playbackProgress", JSON.stringify(progress));
  }

  if (clearEpisodeState) {
    clearSavedEpisode(slug);
  }
}
