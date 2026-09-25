"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { MovieCardDefault } from "@/components/movie/movie-card-variants";
import { ScrollReveal } from "@/components/ui/material-animations";
import { hasPlaybackProgress } from "@/lib/user-experience";

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

    // "Tiếp tục xem" chỉ gồm các phim còn playback progress hợp lệ.
    const Cookies = require('js-cookie');
    const recentlyWatched = JSON.parse(Cookies.get('recentlyWatched') || '[]');
    setMovies(recentlyWatched.filter((movie: any) => hasPlaybackProgress(movie.slug)));
  }, []);

  return (
    <main className="content-page">
      <Header categories={categories} countries={countries} />
      <div className="content-page-inner">
        <section>
          <div className="flex items-center justify-between mb-8">
            <h1 className="content-page-title">
              Tiếp Tục Xem
            </h1>
          </div>

          {movies.length === 0 ? (
            <div className="content-grid-panel py-20 text-center">
              <p className="text-lg text-zinc-500 font-bold uppercase tracking-widest">
                Chưa có phim nào để tiếp tục xem
              </p>
            </div>
          ) : (
            <ScrollReveal animation="fade" direction="up">
              <div className="content-grid-panel movie-list-grid">
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
