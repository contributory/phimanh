import MovieSection from "@/components/movie-section";

interface TopicSectionProps {
  topic: {
    name: string;
    slug: string;
  };
  movies: any[];
}

export default function TopicSection({ topic, movies }: TopicSectionProps) {
  return (
    <MovieSection
      title={topic.name}
      movies={movies}
      viewAllLink={`/?topic=${topic.slug}`}
      buttonColor="green"
      emptyMessage="Chưa có phim nào"
    />
  );
}
