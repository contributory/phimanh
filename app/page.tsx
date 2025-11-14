import PhimApi from "@/libs/phimapi.com";
import MovieMinimalCard from "@/components/movie/movie-minimal";
import Header from "@/components/header";
import Pagination from "@/components/pagination";
import Footer from "@/components/footer";

type HomeProps = {
  searchParams: Promise<{
    index: number | 1;
    category: string | undefined;
    topic: string | undefined;
  }>;
};
export async function generateMetadata({ searchParams }: HomeProps) {
  const { index, category, topic } = await searchParams;
  const api = new PhimApi();
  const topics = api.listTopics();
  const categories = await api.listCategories();
  let postTitle;

  if (category) {
    postTitle = categories.find((c: any) => c.slug === category);
  } else if (topic) {
    postTitle = topics.find((t: any) => t.slug === topic);
  }

  const titleText =
    (postTitle ? `${postTitle.name} | ` : "") +
    "Phim Ảnh" +
    (index > 1 ? " - Trang " + index : "");
  return {
    title: titleText,
    description:
      "Khám phá kho tàng phim ảnh chất lượng cao với hình ảnh và âm thanh hoàn hảo. Trải nghiệm những tác phẩm điện ảnh kinh điển với chất lượng tuyệt đỉnh.",
    keywords:
      "phim ảnh, phim chất lượng cao, phim, phim hd, phim kinh điển, phim viễn tưởng, phim kinh dị, phim bộ, anime",
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const { index } = await searchParams;
  const api = new PhimApi();
  const topics = api.listTopics();
  const categories = await api.listCategories();
  // Sử dụng Client Component để render danh sách phim mới nhất
  const MovieListClient = (await import("@/components/movie/MovieListClient")).default;
  return (
    <main className="mx-auto max-w-screen-2xl px-4">
      <Header
        currentValue={""}
        isCategory={undefined}
        topics={topics}
        categories={categories}
      />
      <MovieListClient index={index || 1} />
      <Footer />
    </main>
  );
}
