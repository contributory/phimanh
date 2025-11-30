'use client';

import Link from 'next/link';
import { ChevronRight, Star, Clock, Eye } from 'lucide-react';

interface Movie {
  name: string;
  slug: string;
  poster_url?: string;
  category?: Array<{ name: string; slug: string }>;
  country?: Array<{ name: string; slug: string }>;
  year?: number;
}

interface Category {
  name: string;
  slug: string;
  count?: number;
}

interface Topic {
  name: string;
  slug: string;
}

// Related Movies Component
interface RelatedMoviesProps {
  currentMovie: Movie;
  relatedMovies: Movie[];
  title?: string;
}

export function RelatedMovies({ currentMovie, relatedMovies, title = "Phim liên quan" }: RelatedMoviesProps) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Star className="w-6 h-6 mr-2 text-yellow-500" />
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {relatedMovies.slice(0, 12).map((movie) => (
          <Link
            key={movie.slug}
            href={`/watch?slug=${movie.slug}`}
            className="group block transition-transform hover:scale-105"
            title={`Xem phim ${movie.name}`}
          >
            <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {movie.poster_url && (
                <img
                  src={movie.poster_url}
                  alt={`Poster phim ${movie.name}`}
                  className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                  loading="lazy"
                />
              )}
            </div>
            <h3 className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {movie.name}
            </h3>
            {movie.year && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{movie.year}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

// Category Links Component
interface CategoryLinksProps {
  categories: Category[];
  title?: string;
  showCount?: boolean;
}

export function CategoryLinks({ categories, title = "Thể loại phim", showCount = true }: CategoryLinksProps) {
  return (
    <section className="mt-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/?category=${category.slug}`}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
            title={`Xem phim ${category.name}`}
          >
            {category.name}
            {showCount && category.count && (
              <span className="ml-1 text-xs text-gray-500">({category.count})</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

// Topic Navigation Component
interface TopicNavigationProps {
  topics: Topic[];
  currentTopic?: string;
  title?: string;
}

export function TopicNavigation({ topics, currentTopic, title = "Chủ đề nổi bật" }: TopicNavigationProps) {
  return (
    <nav className="mt-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {topics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/?topic=${topic.slug}`}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
              currentTopic === topic.slug
                ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            title={`Xem phim ${topic.name}`}
          >
            <span className="font-medium">{topic.name}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ))}
      </div>
    </nav>
  );
}

// Recently Watched Links
interface RecentlyWatchedLinksProps {
  movies: Movie[];
  title?: string;
}

export function RecentlyWatchedLinks({ movies, title = "Xem gần đây" }: RecentlyWatchedLinksProps) {
  return (
    <section className="mt-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        {title}
      </h2>
      <div className="space-y-3">
        {movies.slice(0, 5).map((movie) => (
          <Link
            key={movie.slug}
            href={`/watch?slug=${movie.slug}`}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            title={`Tiếp tục xem ${movie.name}`}
          >
            <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
              {movie.poster_url && (
                <img
                  src={movie.poster_url}
                  alt={`Poster ${movie.name}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {movie.name}
              </h3>
              {movie.category && movie.category[0] && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {movie.category[0].name}
                </p>
              )}
              <div className="flex items-center mt-1 text-xs text-gray-400">
                <Eye className="w-3 h-3 mr-1" />
                Tiếp tục xem
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Popular Categories with SEO links
interface PopularCategoriesProps {
  categories: Category[];
  title?: string;
}

export function PopularCategories({ categories, title = "Thể loại phổ biến" }: PopularCategoriesProps) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.slice(0, 9).map((category) => (
          <Link
            key={category.slug}
            href={`/?category=${category.slug}`}
            className="group p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg hover:shadow-md transition-all"
            title={`Khám phá phim ${category.name}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category.name}
                </h3>
                {category.count && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.count} phim
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Footer SEO Links
interface FooterSEOLinksProps {
  categories: Category[];
  topics: Topic[];
}

export function FooterSEOLinks({ categories, topics }: FooterSEOLinksProps) {
  return (
    <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Categories */}
        <div>
          <h3 className="font-semibold mb-4">Thể loại phim</h3>
          <div className="space-y-2">
            {categories.slice(0, 10).map((category) => (
              <Link
                key={category.slug}
                href={`/?category=${category.slug}`}
                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title={`Phim ${category.name}`}
              >
                Phim {category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div>
          <h3 className="font-semibold mb-4">Chủ đề phim</h3>
          <div className="space-y-2">
            {topics.slice(0, 10).map((topic) => (
              <Link
                key={topic.slug}
                href={`/?topic=${topic.slug}`}
                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title={`Phim ${topic.name}`}
              >
                {topic.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-4">Liên kết nhanh</h3>
          <div className="space-y-2">
            <Link
              href="/new-updates"
              className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Phim mới cập nhật
            </Link>
            <Link
              href="/recently"
              className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Phim xem gần đây
            </Link>
            <Link
              href="/search"
              className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Tìm kiếm phim
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}