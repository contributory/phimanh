import PhimApi from "@/services/phimapi.com";
import { MovieCardDefault } from "@/components/movie/movie-card-variants";
import Header from "@/components/header";
import Pagination from "@/components/pagination";
import Footer from "@/components/footer";
import { ScrollReveal } from "@/components/ui/material-animations";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Suspense } from "react";

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
  
  // Xử lý khi query trống
  if (!query || query.trim() === '') {
    return (
      <main className="content-page">
        <Header topics={[]} categories={[]} />
        <div className="content-page-inner">
          <div className="text-center py-16">
            <h1 className="content-page-title">
              Vui lòng nhập từ khóa tìm kiếm
            </h1>
            <p className="text-zinc-400">
              Hãy nhập tên phim hoặc từ khóa để tìm kiếm
            </p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  try {
    const api = new PhimApi();
    const topics = api.listTopics();
    const categories = await api.listCategories();
    
    // Log để gỡ lỗi
    console.log('Searching for:', query, 'page:', index);
    
    const [movies, pageInfo] = await api.search(query, index);
    
    // Log kết quả để gỡ lỗi
    console.log('Search results:', movies?.length || 0, 'movies');
    
    // Xử lý khi không có kết quả
    if (!movies || movies.length === 0) {
      return (
        <main className="content-page">
          <Header
            topics={topics}
            categories={categories}
          />
          <div className="content-page-inner">
            <h1 className="content-page-title">
              Kết quả tìm kiếm cho "{query}"
            </h1>
            <div className="text-center py-16">
              <p className="text-zinc-400 text-lg">
                Không tìm thấy phim nào với từ khóa "{query}"
              </p>
              <p className="text-zinc-400 mt-2">
                Hãy thử với từ khóa khác
              </p>
            </div>
          </div>
          <Footer />
        </main>
      );
    }

    return (
      <main className="content-page">
        <Header
          topics={topics}
          categories={categories}
        />
        <div className="content-page-inner">
          <h1 className="content-page-title">
            Kết quả tìm kiếm cho "{query}"
          </h1>
          
          <Suspense fallback={
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <ScrollReveal animation="fade" direction="up">
              <div className="content-grid-panel movie-list-grid">
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
          </Suspense>
        </div>
        <div className="mx-auto mt-8 w-full max-w-[1500px] border-t border-white/[0.07] px-4 py-8 md:px-8 lg:px-10">
          <Suspense fallback={null}>
            <Pagination />
          </Suspense>
        </div>
        <Footer />
      </main>
    );
  } catch (error) {
    // Log lỗi để gỡ lỗi
    console.error('Search error:', error);
    
    return (
      <main className="content-page">
        <Header topics={[]} categories={[]} />
        <div className="content-page-inner">
          <div className="text-center py-16">
            <h1 className="content-page-title">
              Đã xảy ra lỗi khi tìm kiếm
            </h1>
            <p className="text-zinc-400">
              Vui lòng thử lại sau hoặc liên hệ quản trị viên
            </p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }
}
