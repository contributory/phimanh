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
  const accents = ["emerald", "cyan", "violet", "amber", "rose"] as const;
  const accentIndex = Array.from(topic.slug).reduce((sum, char) => sum + char.charCodeAt(0), 0) % accents.length;

  return (
    <MovieSection
      title={topic.name}
      movies={movies}
      viewAllLink={`/topic/${topic.slug}`}
      buttonColor={accents[accentIndex]}
      emptyMessage="Chưa có phim nào"
      initialVisible={initialVisible}
      maxVisible={maxVisible}
    />
  );
}
