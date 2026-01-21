import PhimApi from "@/libs/phimapi.com";
import Header from "@/components/header";
import Footer from "@/components/footer";
import TopicSection from "@/components/topic-section";
import RecentlyWatched from "@/components/recently-watched";
import NewUpdatesSection from "@/components/new-updates-section";
import { ScrollToTopFAB } from "@/components/ui/material-fab";
import ForYouHero from "@/components/movie/for-you-hero";
import ForYouSection from "@/components/foryou/for-you-section";

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
  const [categories, countries, newUpdates, extraNewUpdates] = await Promise.all([
    api.listCategories(),
    api.listCountries(),
    api.newAdding(1),
    api.newAdding(2).catch((error) => {
      console.error("Failed to fetch more new updates:", error);
      return [[], {}];
    }),
  ]);
  const [movieTopicItems, tvTopicItems] = await Promise.all([
    api.getTopicItems("phim-le", 6),
    api.getTopicItems("phim-bo", 6),
  ]);
  let topicsWithMovies = [];
  try {
    topicsWithMovies = await Promise.all(
      topics.map(async (topicItem: any) => {
        try {
          const movies = await api.getTopicItems(topicItem.slug, 20);
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

  const newUpdatesItems = newUpdates?.[0] || [];
  const extraNewUpdateItems = extraNewUpdates?.[0] || [];

  const shuffle = <T,>(arr: T[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const uniqueBySlug = (items: any[]) => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const slug = item?.slug;
      if (!slug || seen.has(slug)) return false;
      seen.add(slug);
      return true;
    });
  };

  // Get a larger pool for each rule
  const [movieTopicPool, tvTopicPool] = await Promise.all([
    api.getTopicItems("phim-le", 20),
    api.getTopicItems("phim-bo", 20),
  ]);

  const imdbCandidatesPool = await Promise.all(
    newUpdatesItems.slice(0, 10).map(async (m: any) => {
      try {
        const d = await api.get(m.slug);
        return d.movie;
      } catch {
        return m;
      }
    })
  );

  const getRating = (m: any) =>
    Number(m?.imdb?.rating ?? m?.tmdb?.vote_average ?? 0);

  const pickRandom = (items: any[], count: number, exclude: Set<string>) => {
    return shuffle(items || [])
      .filter((m) => m?.slug && !exclude.has(m.slug))
      .slice(0, count);
  };

  const excludeSlugs = new Set<string>();

  // Rule 1: High IMDb movie
  const imdbCandidates = (imdbCandidatesPool || []).filter((m) => getRating(m) > 7);
  const [imdbMovie] = pickRandom(
    imdbCandidates.length ? imdbCandidates : imdbCandidatesPool,
    1,
    excludeSlugs
  );
  if (imdbMovie?.slug) excludeSlugs.add(imdbMovie.slug);

  // Rule 2: Newest update (random from first few)
  const [newestMovie] = pickRandom(newUpdatesItems.slice(0, 5), 1, excludeSlugs);
  if (newestMovie?.slug) excludeSlugs.add(newestMovie.slug);

  // Rule 3: Random movie from "Phim lẻ" topic pool
  const [movieFromTopic] = pickRandom(movieTopicPool, 1, excludeSlugs);
  if (movieFromTopic?.slug) excludeSlugs.add(movieFromTopic.slug);

  // Rule 4: Random TV show from "Phim bộ" topic pool
  const [tvFromTopic] = pickRandom(tvTopicPool, 1, excludeSlugs);
  if (tvFromTopic?.slug) excludeSlugs.add(tvFromTopic.slug);

  // Rule 5: Extra random pick from new updates to fill 5 items if needed
  const [extraRandom] = pickRandom(newUpdatesItems, 1, excludeSlugs);
  if (extraRandom?.slug) excludeSlugs.add(extraRandom.slug);

  const newUpdatesPool = uniqueBySlug([
    ...newUpdatesItems,
    ...extraNewUpdateItems,
  ]);

  const newUpdatesForSection = newUpdatesPool.slice(0, 20);

  const fallbackHeroes = uniqueBySlug(
    [
      imdbMovie ? { ...imdbMovie, badgeType: "imdb" } : null,
      newestMovie ? { ...newestMovie, badgeText: "Mới cập nhật", badgeType: "new" } : null,
      movieFromTopic ? { ...movieFromTopic, badgeText: "Phim điện ảnh", badgeType: "movie" } : null,
      tvFromTopic ? { ...tvFromTopic, badgeText: "Chương trình truyền hình", badgeType: "tv" } : null,
      extraRandom ? { ...extraRandom, badgeText: "Đề xuất", badgeType: "recommend" } : null,
    ].filter(Boolean)
  );

  return (
    <main className="mx-auto max-w-screen-2xl material-surface min-h-screen bg-black">
      <Header
        categories={categories}
        countries={countries}
        topics={topics}
      />
      
      <ForYouHero fallbackMovies={fallbackHeroes} />

      <div className="space-y-4 md:space-y-6 lg:space-y-8 pb-32 relative z-20">
        <div className="px-4">
          <ForYouSection limit={20} initialVisible={6} />
        </div>

        <NewUpdatesSection movies={newUpdatesForSection} initialVisible={12} />
        
        <div className="px-4">
          <RecentlyWatched limit={20} />
        </div>

        <div className="space-y-6 md:space-y-8 lg:space-y-10 px-4">
          {topicsWithMovies.map((topicData: any) => (
            <TopicSection
              key={topicData.slug}
              topic={topicData}
              movies={(topicData.movies || []).slice(0, 20)}
              initialVisible={12}
            />
          ))}
        </div>
      </div>
      <Footer />
      <ScrollToTopFAB />
    </main>
  );
}
