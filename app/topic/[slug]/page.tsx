import PhimApi from "@/services/phimapi.com";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MovieListClient from "@/components/movie/movie-list-client";
import { ScrollToTopFAB } from "@/components/ui/material-fab";
import { fetchMovieList } from "@/services/movie-list";

type TopicPageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ index?: string }>;
};

export async function generateMetadata({ params, searchParams }: TopicPageProps) {
    const { slug } = await params;
    const { index } = await searchParams;
    const pageIndex = Number(index) || 1;

    const api = new PhimApi();
    const topics = api.listTopics();
    const topic = topics.find((t: any) => t.slug === slug);

    const titleText =
        (topic ? `${topic.name} | ` : "") +
        "Phim Ảnh" +
        (pageIndex > 1 ? " - Trang " + pageIndex : "");

    return {
        title: titleText,
        description: topic
            ? `Xem danh sách ${topic.name} chất lượng cao. Cập nhật liên tục các bộ phim mới nhất.`
            : "Khám phá kho tàng phim ảnh chất lượng cao.",
        keywords: `${topic?.name || "phim"}, phim ảnh, phim hd, xem phim online`,
    };
}

export default async function TopicPage({ params, searchParams }: TopicPageProps) {
    const { slug } = await params;
    const { index } = await searchParams;
    const pageIndex = Number(index) || 1;

    const api = new PhimApi();
    const topics = api.listTopics();
    const [categories, countries, listData] = await Promise.all([
        api.listCategories(),
        api.listCountries(),
        fetchMovieList({ index: pageIndex, topic: slug }),
    ]);
    const topic = topics.find((t: any) => t.slug === slug);

    return (
        <main className="mx-auto max-w-screen-2xl px-4 material-surface min-h-screen bg-black">
            <Header
                categories={categories}
                countries={countries}
                topics={topics}
            />
            <div className="py-8">
                <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter mb-8">
                    {topic?.name || "Danh sách phim"}
                </h1>
                <MovieListClient
                    movies={listData.movies}
                    pageInfo={listData.pageInfo}
                />
            </div>
            <Footer />
            <ScrollToTopFAB />
        </main>
    );
}
