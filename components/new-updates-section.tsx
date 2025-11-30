import MovieSection from "@/components/movie-section";

interface NewUpdatesSectionProps {
  movies: any[];
}

export default function NewUpdatesSection({ movies }: NewUpdatesSectionProps) {
  return (
    <MovieSection
      title="Mới Cập Nhật"
      movies={movies}
      viewAllLink="/new-updates"
      buttonColor="red"
      emptyMessage="Chưa có phim mới cập nhật"
    />
  );
}