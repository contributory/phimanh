import PhimApi from "@/libs/phimapi.com";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MovieListClient from "@/components/movie/movie-list-client";
import { ScrollToTopFAB } from "@/components/ui/material-fab";
import { fetchMovieList } from "@/libs/movie-list";

type CategoryPageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ index?: string }>;
};

export async function generateMetadata({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const { index } = await searchParams;
    const pageIndex = Number(index) || 1;

    const api = new PhimApi();
    const categories = await api.listCategories();
    const category = categories.find((c: any) => c.slug === slug);

    const titleText =
        (category ? `Phim ${category.name} | ` : "") +
        "Phim Ảnh" +
        (pageIndex > 1 ? " - Trang " + pageIndex : "");

    return {
        title: titleText,
        description: category
            ? `Xem phim ${category.name} chất lượng cao. Tuyển tập phim ${category.name} hay nhất.`
            : "Khám phá kho tàng phim ảnh chất lượng cao.",
        keywords: `phim ${category?.name || ""}, ${category?.name || "thể loại"}, phim ảnh, phim hd`,
    };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const { index } = await searchParams;
    const pageIndex = Number(index) || 1;

    const api = new PhimApi();
    const topics = api.listTopics();
    const [categories, countries, listData] = await Promise.all([
        api.listCategories(),
        api.listCountries(),
        fetchMovieList({ index: pageIndex, category: slug }),
    ]);
    const category = categories.find((c: any) => c.slug === slug);

    return (
        <main className="mx-auto max-w-screen-2xl px-4 material-surface min-h-screen bg-black">
            <Header
                categories={categories}
                countries={countries}
                topics={topics}
            />
            <div className="py-8">
                <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter mb-8">
                    Phim {category?.name || "Thể loại"}
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
