import Link from "next/link";
import MovieMinimalCard from "@/components/movie/movie-minimal";
import { Card, CardContent, CardHeader } from "@/components/ui/enhanced-card";
import { MaterialRipple, ScrollReveal } from "@/components/ui/material-animations";

interface TopicSectionProps {
  topic: {
    name: string;
    slug: string;
  };
  movies: any[];
}

export default function TopicSection({ topic, movies }: TopicSectionProps) {
  return (
    <ScrollReveal animation="fade" direction="up">
      <section className="py-8">
        <Card variant="glass" className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {topic.name}
                </h2>
              </div>
              <MaterialRipple>
                <Link
                  href={`/?topic=${topic.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/30 font-semibold transition-all duration-300 hover:scale-105 material-elevation-1 hover:material-elevation-2"
                >
                  Xem tất cả
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              </MaterialRipple>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {movies.length > 0 ? (
              <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:gap-6 md:auto-rows-[280px] md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:overflow-visible scrollbar-thin">
                {movies.map((movie: any, index: number) => (
                  <ScrollReveal
                    key={movie.slug}
                    animation="grow"
                    threshold={0.1}
                  >
                    <div
                      className="flex-shrink-0 w-44 md:w-auto transform hover:scale-105 transition-transform duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <MaterialRipple>
                        <div className="rounded-xl overflow-hidden material-elevation-1 hover:material-elevation-3 material-transition">
                          <MovieMinimalCard movie={movie} />
                        </div>
                      </MaterialRipple>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <Card variant="elevated" className="text-center py-12">
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
                      Chưa có phim nào
                    </h3>
                    <p className="text-muted-foreground">
                      Hiện tại chưa có phim nào trong danh mục này. Vui lòng quay lại sau.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </CardContent>
        </Card>
      </section>
    </ScrollReveal>
  );
}
