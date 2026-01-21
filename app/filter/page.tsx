import PhimApi from "@/libs/phimapi.com";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MovieListClient from "@/components/movie/movie-list-client";
import { ScrollToTopFAB } from "@/components/ui/material-fab";
import { fetchMovieList } from "@/libs/movie-list";

type FilterPageProps = {
    searchParams: Promise<{
        index?: string;
        typeList?: string;
        sortField?: string;
        sortType?: string;
        sortLang?: string;
        category?: string;
        country?: string;
        year?: string;
        limit?: string;
    }>;
};

export async function generateMetadata({ searchParams }: FilterPageProps) {
    const params = await searchParams;
    const index = Number(params.index) || 1;

    return {
        title: `Kết quả Lọc | Phim Ảnh${index > 1 ? " - Trang " + index : ""}`,
        description: "Tìm kiếm và lọc phim theo nhiều tiêu chí: thể loại, quốc gia, năm sản xuất...",
        keywords: "lọc phim, tìm phim, phim ảnh, phim hd",
    };
}

export default async function FilterPage({ searchParams }: FilterPageProps) {
    const params = await searchParams;
    const index = Number(params.index) || 1;

    const api = new PhimApi();
    const topics = api.listTopics();
    const [categories, countries, listData] = await Promise.all([
        api.listCategories(),
        api.listCountries(),
        fetchMovieList({ index, searchParams: params }),
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
                    Kết quả Lọc
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
