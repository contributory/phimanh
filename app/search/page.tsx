import PhimApi from "@/libs/phimapi.com";
import MovieMinimalCard from "@/components/movie/movie-minimal";
import Header from "@/components/header";
import Pagination from "@/components/pagination";
import Footer from "@/components/footer";

type SearchPageProps = {
  searchParams: Promise<{
    index: number | 1;
    query: string;
  }>;
};
export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { index, query } = await searchParams;
  const postTitle = `Kết quả cho "${query}"`;

  const titleText =
    `${postTitle} | Phim Ảnh` + (index > 1 ? " - Trang " + index : "");
  return {
    title: titleText,
    description:
      "Khám phá kho tàng phim ảnh chất lượng cao với hình ảnh và âm thanh hoàn hảo. Trải nghiệm những tác phẩm điện ảnh kinh điển với chất lượng tuyệt đỉnh.",
    keywords: `${query}, phim ảnh, phim chất lượng cao, phim, phim hd, phim kinh điển, phim viễn tưởng, phim kinh dị, phim bộ, anime`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { index, query } = await searchParams;
  const api = new PhimApi();
  const topics = api.listTopics();
  const categories = await api.listCategories();
  const [movies, pageInfo] = await api.search(query, index);
  return (
    <main className="mx-auto max-w-screen-2xl px-4">
      <Header
        currentValue={undefined}
        isCategory={undefined}
        topics={topics}
        categories={categories}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie: any) => (
          <MovieMinimalCard key={movie.slug} movie={movie} />
        ))}
      </div>
      <Pagination />
      <Footer />
    </main>
  );
}
