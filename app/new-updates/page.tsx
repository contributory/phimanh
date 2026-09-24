import PhimApi from "@/services/phimapi.com";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MovieListClient from "@/components/movie/movie-list-client";
import { fetchMovieList } from "@/services/movie-list";

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
    <main className="content-page">
      <Header
        categories={categories}
        countries={countries}
        topics={topics}
      />
      <div className="content-page-inner">
        <h1 className="content-page-title">
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
