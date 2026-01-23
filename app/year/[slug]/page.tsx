import PhimApi from "@/services/phimapi.com";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MovieListClient from "@/components/movie/movie-list-client";
import { ScrollToTopFAB } from "@/components/ui/material-fab";
import { fetchMovieList } from "@/services/movie-list";

type YearPageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ index?: string }>;
};

export async function generateMetadata({ params, searchParams }: YearPageProps) {
    const { slug } = await params;
    const { index } = await searchParams;
    const pageIndex = Number(index) || 1;

    const titleText =
        `Phim Năm ${slug} | ` +
        "Phim Ảnh" +
        (pageIndex > 1 ? " - Trang " + pageIndex : "");

    return {
        title: titleText,
        description: `Xem phim sản xuất năm ${slug} chất lượng cao. Tuyển tập phim năm ${slug} hay nhất.`,
        keywords: `phim năm ${slug}, phim ${slug}, phim ảnh, phim hd`,
    };
}

export default async function YearPage({ params, searchParams }: YearPageProps) {
    const { slug } = await params;
    const { index } = await searchParams;
    const pageIndex = Number(index) || 1;

    const api = new PhimApi();
    const topics = api.listTopics();
    const [categories, countries, listData] = await Promise.all([
        api.listCategories(),
        api.listCountries(),
        fetchMovieList({ index: pageIndex, year: slug }),
    ]);

    return (
        <main className="mx-auto max-w-screen-2xl px-4 material-surface min-h-screen bg-black">
            <Header
                categories={categories}
                countries={countries}
                topics={topics}
            />
            <div className="py-8">
                <h1 className="text-2xl md:text-4xl font-black text-foreground uppercase tracking-tighter mb-8">
                    Phim Năm {slug}
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
