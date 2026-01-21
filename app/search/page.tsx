import PhimApi from "@/libs/phimapi.com";
import { MovieCardDefault } from "@/components/movie/movie-card-variants";
import Header from "@/components/header";
import Pagination from "@/components/pagination";
import Footer from "@/components/footer";
import { ScrollReveal } from "@/components/ui/material-animations";

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
      "Trang web dành cho mục đích học tập, chúng tôi không lưu trữ và cũng không chịu trách nhiệm cho nội dung bản quyền xuất hiện trên trang web.",
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
    <main className="mx-auto max-w-screen-2xl px-4 material-surface min-h-screen bg-black">
      <Header
        topics={topics}
        categories={categories}
      />
      <div className="py-8">
        <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter mb-8">
          Kết quả tìm kiếm cho "{query}"
        </h1>
        
        <ScrollReveal animation="fade" direction="up">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {movies.map((movie: any, idx: number) => (
              <div
                key={movie.slug}
                className="material-transition"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <MovieCardDefault movie={movie} />
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
      <div className="py-8 border-t border-zinc-800/50 mt-8">
        <Pagination />
      </div>
      <Footer />
    </main>
  );
}
