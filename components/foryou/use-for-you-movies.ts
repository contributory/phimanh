"use client";

import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { buildForYouList } from "@/libs/foryou-recommendations";

export function useForYouMovies(limit: number) {
  const { data: movies = [], isLoading: loading } = useQuery({
    queryKey: ["for-you", limit],
    queryFn: async () => {
      const raw = Cookies.get("recentlyWatched");
      const recentlyWatched = raw ? JSON.parse(raw) : [];
      const recommendations = await buildForYouList(recentlyWatched, limit);
      return recommendations.slice(0, limit);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { movies, loading };
}
