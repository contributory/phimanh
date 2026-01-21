import MovieSection from "@/components/movie-section";

interface TopicSectionProps {
  topic: {
    name: string;
    slug: string;
  };
  movies: any[];
  initialVisible?: number;
  maxVisible?: number;
}

export default function TopicSection({
  topic,
  movies,
  initialVisible = 12,
  maxVisible = 20,
}: TopicSectionProps) {
  return (
    <MovieSection
      title={topic.name}
      movies={movies}
      viewAllLink={`/topic/${topic.slug}`}
      buttonColor="green"
      emptyMessage="Chưa có phim nào"
      initialVisible={initialVisible}
      maxVisible={maxVisible}
    />
  );
}
