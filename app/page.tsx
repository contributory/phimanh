import PhimApi from "@/libs/phimapi.com";
import Header from "@/components/header";
import Footer from "@/components/footer";
import TopicSection from "@/components/topic-section";
import RecentlyWatched from "@/components/recently-watched";
import NewUpdatesSection from "@/components/new-updates-section";
import { ScrollToTopFAB } from "@/components/ui/material-fab";

export const metadata = {
  title: "Phim Ảnh - Xem phim chất lượng cao",
  description:
    "Trang web dành cho mục đích học tập, chúng tôi không lưu trữ và cũng không chịu trách nhiệm cho nội dung bản quyền xuất hiện trên trang web.",
  keywords:
    "phim ảnh, phim chất lượng cao, phim, phim hd, phim kinh điển, phim viễn tưởng, phim kinh dị, phim bộ, anime",
};

export default async function Home() {
  const api = new PhimApi();
  const topics = api.listTopics();
  const categories = await api.listCategories();
  const countries = await api.listCountries();
  const newUpdates = await api.newAdding(1);

  // Fetch items for each topic
  let topicsWithMovies = [];
  try {
    topicsWithMovies = await Promise.all(
      topics.map(async (topicItem: any) => {
        try {
          const movies = await api.getTopicItems(topicItem.slug, 6);
          return {
            ...topicItem,
            movies: movies || [],
          };
        } catch (error) {
          console.error(`Failed to fetch items for topic ${topicItem.slug}:`, error);
          return {
            ...topicItem,
            movies: [],
          };
        }
      })
    );
  } catch (error) {
    console.error('Failed to fetch all topics:', error);
    topicsWithMovies = topics.map((topicItem: any) => ({
      ...topicItem,
      movies: [],
    }));
  }

  return (
    <main className="mx-auto max-w-screen-2xl px-4 material-surface gradient-surface min-h-screen">
      <Header
        categories={categories}
        countries={countries}
        topics={topics}
      />
      <div className="py-8 space-y-8">
        <NewUpdatesSection movies={newUpdates[0].slice(0, 6)} />
        <RecentlyWatched limit={6} />
        {topicsWithMovies.map((topicData: any) => (
          <TopicSection
            key={topicData.slug}
            topic={topicData}
            movies={topicData.movies || []}
          />
        ))}
      </div>
      <Footer />
      <ScrollToTopFAB />
    </main>
  );
}
