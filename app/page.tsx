import PhimApi from "@/libs/phimapi.com";
import Header from "@/components/header";
import Footer from "@/components/footer";
import TopicSection from "@/components/topic-section";
import RecentlyWatched from "@/components/recently-watched";
import MovieListClient from "@/components/movie/MovieListClient";
import NewUpdatesSection from "@/components/new-updates-section";

type HomeProps = {
  searchParams: Promise<{
    index?: string | number;
    category?: string;
    topic?: string;
    typeList?: string;
    sortField?: string;
    sortType?: string;
    sortLang?: string;
    country?: string;
    year?: string;
    limit?: string;
  }>;
};
export async function generateMetadata({ searchParams }: HomeProps) {
  const params = await searchParams;
  const index = Number(params.index) || 1;
  const category = params.category;
  const topic = params.topic;
  const typeList = params.typeList;

  const api = new PhimApi();
  const topics = api.listTopics();
  const categories = await api.listCategories();
  let postTitle;

  if (typeList) {
    // Advanced filter applied
    postTitle = { name: "Kết quả Lọc" };
  } else if (category) {
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
  const params = await searchParams;
  const index = Number(params.index) || 1;
  const category = params.category;
  const topic = params.topic;
  const typeList = params.typeList;

  const api = new PhimApi();
  const topics = api.listTopics();
  const categories = await api.listCategories();
  const countries = await api.listCountries();
  const newUpdates = await api.newAdding(1);

  // Check if filters or topic/category are being used
  const hasFilters = Boolean(typeList || category || topic || params.country || params.year);

  // Fetch items for each topic if no filters are applied
  let topicsWithMovies = [];
  if (!hasFilters) {
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
  }

  return (
    <main className="mx-auto max-w-screen-2xl px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      <Header
        categories={categories}
        countries={countries}
        topics={topics}
      />
      {hasFilters ? (
        <MovieListClient
          index={index}
          category={category}
          topic={topic}
        />
      ) : (
        <div className="py-8">
          <NewUpdatesSection movies={newUpdates[0].slice(0, 6)} />
          <RecentlyWatched limit={6} />
          {topicsWithMovies
            .filter((topicData: any) => topicData.movies && topicData.movies.length > 0)
            .map((topicData: any) => (
              <TopicSection
                key={topicData.slug}
                topic={topicData}
                movies={topicData.movies}
              />
            ))}
        </div>
      )}
      <Footer />
    </main>
  );
}
