import PhimApi from "@/libs/phimapi.com";
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
    <main className="mx-auto max-w-screen-2xl px-4 material-surface min-h-screen bg-black">
      <Header
        categories={categories}
        countries={countries}
        topics={topics}
      />
      <div className="py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">
            Dành Cho Bạn
          </h1>
          <p className="text-sm text-zinc-500 max-w-2xl">
            Chúng tôi phân tích phim bạn đã xem để kết hợp thể loại, quốc gia, năm phát hành và loại phim từ nhiều endpoint khác nhau, sắp xếp lại thành danh sách gợi ý cá nhân hóa.
          </p>
        </div>

        <ForYouGrid limit={20} />
      </div>
      <Footer />
    </main>
  );
}
