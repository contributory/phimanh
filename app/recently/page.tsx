"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MovieMinimalCard from "@/components/movie/movie-minimal";

export default function RecentlyWatchedPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    // Fetch categories and countries for header
    const fetchData = async () => {
      const PhimApi = (await import("@/libs/phimapi.com")).default;
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
    <main className="mx-auto max-w-screen-2xl px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      <Header categories={categories} countries={countries} />
      <div className="py-8">
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Phim Đã Xem Gần Đây
            </h1>
          </div>

          {movies.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Bạn chưa xem phim nào gần đây. Hãy bắt đầu khám phá kho phim của chúng tôi!
              </p>
            </div>
          ) : (
            <div
              className="grid gap-6 auto-rows-[280px]"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              }}
            >
              {movies.map((movie: any, index: number) => (
                <div
                  key={movie.slug}
                  className="animate-float"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <MovieMinimalCard movie={movie} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}