import MovieSection from "@/components/movie-section";

interface NewUpdatesSectionProps {
  movies: any[];
  initialVisible?: number;
  maxVisible?: number;
}

export default function NewUpdatesSection({
  movies,
  initialVisible = 12,
  maxVisible = 20,
}: NewUpdatesSectionProps) {
  const cappedMax = Math.min(maxVisible, 20);
  return (
    <MovieSection
      title="Mới Cập Nhật"
      movies={(movies || []).slice(0, cappedMax)}
      viewAllLink="/new-updates"
      buttonColor="red"
      emptyMessage="Chưa có phim mới cập nhật"
      initialVisible={Math.min(initialVisible, cappedMax)}
      maxVisible={cappedMax}
    />
  );
}
