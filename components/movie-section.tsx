import Link from "next/link";
import MovieMinimalCard from "@/components/movie/movie-minimal";
import {
  MovieCardLarge,
  MovieCardWide,
  MovieCardCompact,
  MovieCardDefault,
} from "@/components/movie/movie-card-variants";
import { Card, CardContent } from "@/components/ui/enhanced-card";
import {
  MaterialRipple,
  ScrollReveal,
} from "@/components/ui/material-animations";

interface MovieSectionProps {
  title: string;
  movies: any[];
  viewAllLink: string;
  buttonColor?: "red" | "purple" | "green" | "orange" | "pink";
  emptyMessage?: string;
  isClientSide?: boolean;
}

const buttonColors = {
  red: "bg-red-600 hover:bg-red-700",
  purple: "bg-purple-600 hover:bg-purple-700",
  green: "bg-green-600 hover:bg-green-700",
  orange: "bg-orange-600 hover:bg-orange-700",
  pink: "bg-pink-600 hover:bg-pink-700",
};

export default function MovieSection({
  title,
  movies,
  viewAllLink,
  buttonColor = "red",
  emptyMessage = "Chưa có phim nào",
  isClientSide = false,
}: MovieSectionProps) {
  const content = (
    <section className="py-8">
      {/* Header với title và nút bên ngoài Card */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-pink-600 rounded-full"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        <Link
          href={viewAllLink}
          className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-white font-semibold transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg ${buttonColors[buttonColor]}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </div>
      
      {/* Card chứa movies */}
      <Card variant="glass" className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:gap-4 md:grid-cols-6 md:auto-rows-[200px] md:overflow-visible scrollbar-thin">
            {movies && movies.length > 0 ? (
              movies.map((movie: any, index: number) => {
                return (
                  <ScrollReveal
                    key={movie.slug}
                    animation="grow"
                    threshold={0.1}
                  >
                    <div
                      className="flex-shrink-0 transform transition-transform duration-300 w-44 md:w-auto"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <MaterialRipple>
                        <div className="rounded-xl overflow-hidden material-elevation-1 hover:material-elevation-3 material-transition h-full">
                          <MovieCardDefault movie={movie} />
                        </div>
                      </MaterialRipple>
                    </div>
                  </ScrollReveal>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 4v16M17 4v16"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {emptyMessage}
                    </h3>
                    <p className="text-muted-foreground">
                      Đang tải dữ liệu hoặc chưa có phim trong danh mục này...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );

  if (isClientSide) {
    return content;
  }

  return (
    <ScrollReveal animation="fade" direction="up">
      {content}
    </ScrollReveal>
  );
}
