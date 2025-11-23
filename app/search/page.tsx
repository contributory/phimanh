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
    <main className="mx-auto max-w-screen-2xl px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      <Header
        currentValue={undefined}
        isCategory={undefined}
        topics={topics}
        categories={categories}
      />
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Kết quả tìm kiếm cho "{query}"
        </h1>
        <div
          className="grid gap-6 auto-rows-[280px]"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          }}
        >
          {movies.map((movie: any, index: number) => (
            <div
              key={movie.slug}
              className="animate-float"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <MovieMinimalCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
      <Pagination />
      <Footer />
    </main>
  );
}
