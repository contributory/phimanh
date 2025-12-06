import PhimApi from "@/libs/phimapi.com";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MovieListClient from "@/components/movie/movie-list-client";
import { ScrollToTopFAB } from "@/components/ui/material-fab";

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
    const categories = await api.listCategories();
    const countries = await api.listCountries();
    const topic = topics.find((t: any) => t.slug === slug);

    return (
        <main className="mx-auto max-w-screen-2xl px-4 material-surface gradient-surface min-h-screen">
            <Header
                categories={categories}
                countries={countries}
                topics={topics}
            />
            <div className="py-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
                    {topic?.name || "Danh sách phim"}
                </h1>
                <MovieListClient index={pageIndex} topic={slug} />
            </div>
            <Footer />
            <ScrollToTopFAB />
        </main>
    );
}
