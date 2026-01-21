"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { MovieCardDefault } from "@/components/movie/movie-card-variants";
import { ScrollReveal } from "@/components/ui/material-animations";

export default function RecentlyWatchedPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    // Fetch categories and countries for header
    const fetchData = async () => {
      const PhimApi = (await import("@/services/phimapi.com")).default;
      const api = new PhimApi();
      const [cats, cnts] = await Promise.all([
        api.listCategories(),
        api.listCountries(),
      ]);
      setCategories(cats);
      setCountries(cnts);
    };
    fetchData();

    // Load recently watched from cookies
    const Cookies = require('js-cookie');
    const recentlyWatched = JSON.parse(Cookies.get('recentlyWatched') || '[]');
    setMovies(recentlyWatched);
  }, []);

  return (
    <main className="mx-auto max-w-screen-2xl px-4 material-surface min-h-screen bg-black">
      <Header categories={categories} countries={countries} />
      <div className="py-8">
        <section className="py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-4xl font-black text-foreground uppercase tracking-tighter">
              Phim Đã Xem Gần Đây
            </h1>
          </div>

          {movies.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/50 rounded-xl">
              <p className="text-lg text-zinc-500 font-bold uppercase tracking-widest">
                Bạn chưa xem phim nào gần đây
              </p>
            </div>
          ) : (
            <ScrollReveal animation="fade" direction="up">
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {movies.map((movie: any, index: number) => (
                  <div
                    key={`${movie?.slug ?? "movie"}-${index}`}
                    className="material-transition"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <MovieCardDefault movie={movie} />
                  </div>
                ))}
              </div>
            </ScrollReveal>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}
