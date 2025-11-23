import Link from "next/link";
import MovieMinimalCard from "@/components/movie/movie-minimal";

interface NewUpdatesSectionProps {
  movies: any[];
}

export default function NewUpdatesSection({ movies }: NewUpdatesSectionProps) {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Mới Cập Nhật
        </h2>
        <Link
          href="/new-updates"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 dark:text-blue-400 dark:border-blue-400 font-semibold transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </div>

      {movies.length > 0 ? (
        <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:gap-6 md:auto-rows-[280px] md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:overflow-visible">
          {movies.map((movie: any, index: number) => (
            <div
              key={movie.slug}
              className="flex-shrink-0 w-44 md:w-auto"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <MovieMinimalCard movie={movie} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Chưa có phim mới cập nhật
          </p>
        </div>
      )}
    </section>
  );
}