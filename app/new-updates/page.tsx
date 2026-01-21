import PhimApi from "@/libs/phimapi.com";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MovieListClient from "@/components/movie/movie-list-client";
import { fetchMovieList } from "@/libs/movie-list";

type NewUpdatesProps = {
  searchParams: Promise<{
    index?: string;
  }>;
};

export async function generateMetadata({ searchParams }: NewUpdatesProps) {
  const params = await searchParams;
  const index = Number(params.index) || 1;

  return {
    title: `Mới Cập Nhật | Phim Ảnh${index > 1 ? " - Trang " + index : ""}`,
    description: "Khám phá những bộ phim mới nhất được cập nhật trên Phim Ảnh.",
    keywords: "phim mới, phim cập nhật, phim ảnh, phim hd",
  };
}

export default async function NewUpdatesPage({ searchParams }: NewUpdatesProps) {
  const params = await searchParams;
  const index = Number(params.index) || 1;

  const api = new PhimApi();
  const topics = api.listTopics();
  const [categories, countries, listData] = await Promise.all([
    api.listCategories(),
    api.listCountries(),
    fetchMovieList({ index }),
  ]);

  return (
    <main className="mx-auto max-w-screen-2xl px-4 material-surface min-h-screen bg-black">
      <Header
        categories={categories}
        countries={countries}
        topics={topics}
      />
      <div className="py-8">
        <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter mb-8">
          Mới Cập Nhật
        </h1>
        <MovieListClient
          movies={listData.movies}
          pageInfo={listData.pageInfo}
        />
      </div>
      <Footer />
    </main>
  );
}
