import PhimApi from "@/libs/phimapi.com";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

const api = new PhimApi();

export const movieKeys = {
  all: ["movies"] as const,
  lists: () => [...movieKeys.all, "list"] as const,
  list: (filters: any) => [...movieKeys.lists(), filters] as const,
  details: () => [...movieKeys.all, "detail"] as const,
  detail: (slug: string) => [...movieKeys.details(), slug] as const,
  categories: () => ["categories"] as const,
  countries: () => ["countries"] as const,
  search: (query: string) => ["search", query] as const,
  recommended: (slug: string) => [...movieKeys.detail(slug), "recommended"] as const,
};

export function useMovieDetail(slug: string) {
  return useQuery({
    queryKey: movieKeys.detail(slug),
    queryFn: () => api.get(slug),
    enabled: !!slug,
  });
}

export function useNewMovies(page: number = 1) {
  return useQuery({
    queryKey: movieKeys.list({ type: "new", page }),
    queryFn: () => api.newAdding(page),
  });
}

export function useMoviesByCategory(slug: string, page: number = 1) {
  return useQuery({
    queryKey: movieKeys.list({ type: "category", slug, page }),
    queryFn: () => api.byCategory(slug, page),
    enabled: !!slug,
  });
}

export function useMoviesByTopic(slug: string, page: number = 1) {
  return useQuery({
    queryKey: movieKeys.list({ type: "topic", slug, page }),
    queryFn: () => api.byTopic(slug, page),
    enabled: !!slug,
  });
}

export function useSearchMovies(query: string, page: number = 1) {
  return useQuery({
    queryKey: movieKeys.search(query),
    queryFn: () => api.search(query, page),
    enabled: !!query,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: movieKeys.categories(),
    queryFn: () => api.listCategories(),
  });
}

export function useCountries() {
  return useQuery({
    queryKey: movieKeys.countries(),
    queryFn: () => api.listCountries(),
  });
}

export function useRecommendedMovies(movie: any) {
  return useQuery({
    queryKey: movieKeys.recommended(movie?.slug),
    queryFn: () => api.getRecommended(movie),
    enabled: !!movie?.slug,
  });
}

export function useFilteredMovies(params: any) {
  return useQuery({
    queryKey: movieKeys.list({ type: "filtered", ...params }),
    queryFn: () => api.getFilteredList(params),
  });
}
