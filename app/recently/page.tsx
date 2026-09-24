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
    <main className="content-page">
      <Header categories={categories} countries={countries} />
      <div className="content-page-inner">
        <section>
          <div className="flex items-center justify-between mb-8">
            <h1 className="content-page-title">
              Phim Đã Xem Gần Đây
            </h1>
          </div>

          {movies.length === 0 ? (
            <div className="content-grid-panel py-20 text-center">
              <p className="text-lg text-zinc-500 font-bold uppercase tracking-widest">
                Bạn chưa xem phim nào gần đây
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
