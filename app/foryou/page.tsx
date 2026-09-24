import PhimApi from "@/services/phimapi.com";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ForYouGrid from "@/components/foryou/for-you-grid";

export const metadata = {
  title: "Dành Cho Bạn | Phim Ảnh",
  description:
    "Gợi ý phim dựa trên những gì bạn đã xem gần đây. Phối hợp nhiều nguồn dữ liệu để tìm ra lựa chọn phù hợp nhất.",
};

export default async function ForYouPage() {
  const api = new PhimApi();
  const topics = api.listTopics();
  const [categories, countries] = await Promise.all([
    api.listCategories(),
    api.listCountries(),
  ]);

  return (
    <main className="content-page">
      <Header
        categories={categories}
        countries={countries}
        topics={topics}
      />
      <div className="content-page-inner space-y-6">
        <div className="space-y-2">
          <h1 className="content-page-title">
            Dành Cho Bạn
          </h1>
          
        </div>

        <ForYouGrid limit={20} />
      </div>
      <Footer />
    </main>
  );
}
