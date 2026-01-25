import PhimApi from "@/services/phimapi.com";

type BasicMovie = {
  slug?: string;
  category?: { slug: string }[];
  country?: { slug: string }[];
  year?: number | string;
  type?: string;
  name?: string;
  [key: string]: any;
};

const takeUnique = <T, K extends string | number>(
  items: T[],
  getKey: (item: T) => K | undefined | null
) => {
  const map = new Map<K, T>();
  for (const item of items) {
    const key = getKey(item);
    if (!key || map.has(key)) continue;
    map.set(key, item);
  }
  return Array.from(map.values());
};

const extractItems = (value: any): any[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    if (Array.isArray(value[0])) return value[0] || [];
    return (value[0] as any[]) || [];
  }
  if (Array.isArray(value?.data?.items)) return value.data.items;
  if (Array.isArray(value.items)) return value.items;
  return [];
};

const computeScore = (movie: BasicMovie, seeds: BasicMovie[]) => {
  const movieCategories = new Set(
    (movie.category || []).map((c) => c?.slug).filter(Boolean)
  );
  const movieCountries = new Set(
    (movie.country || []).map((c) => c?.slug).filter(Boolean)
  );
  const movieYear = movie.year ? Number(movie.year) : null;
  const movieType = movie.type;

  let score = 0;

  seeds.forEach((seed, index) => {
    const weight = seeds.length - index;
    const seedCategories = (seed.category || [])
      .map((c) => c?.slug)
      .filter(Boolean);
    const seedCountries = (seed.country || [])
      .map((c) => c?.slug)
      .filter(Boolean);
    const seedYear = seed.year ? Number(seed.year) : null;

    if (seedCategories.some((slug) => movieCategories.has(slug))) {
      score += 6 * weight;
    }
    if (seedCountries.some((slug) => movieCountries.has(slug))) {
      score += 4 * weight;
    }
    if (movieYear && seedYear && movieYear === seedYear) {
      score += 2 * weight;
    }
    if (movieType && seed.type && movieType === seed.type) {
      score += 3 * weight;
    }
  });

  return score + (movie.tmdb?.vote_average || 0) * 0.5 + Math.random() * 0.01;
};

const shuffle = <T,>(items: T[]) =>
  items
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);

const buildColdStartList = async (limit: number) => {
  try {
    console.log('Building cold start list...');
    const api = new PhimApi();

    const coldStartTasks: Promise<any>[] = [
      api.newAdding(1),
      api.byTopic("phim-bo", 1),
      api.byTopic("phim-le", 1),
      api.byTopic("hoat-hinh", 1),
      api.getFilteredList({ typeList: "phim-bo", limit: limit * 2 }),
      api.getFilteredList({ typeList: "phim-le", limit: limit * 2 }),
    ];

    const coldResults = await Promise.allSettled(coldStartTasks);
    const coldPool: any[] = [];

    coldResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        coldPool.push(...extractItems(result.value));
      } else if (result.status === "rejected") {
        console.warn(`Cold start task ${index} failed:`, result.reason);
      }
    });

    // If we got some results, use them
    if (coldPool.length > 0) {
      const coldUnique = takeUnique(coldPool, (m: any) => m?.slug);
      return shuffle(coldUnique).slice(0, limit);
    }

    // If all tasks failed, return fallback movies
    console.log('All cold start tasks failed, using fallback data');
    return api.getFallbackMoviesPublic(limit);
  } catch (error) {
    console.error('Cold start list build failed completely:', error);
    const fallbackApi = new PhimApi();
    return fallbackApi.getFallbackMoviesPublic(limit);
  }
};

export async function buildForYouList(
  recentlyWatched: BasicMovie[] = [],
  limit: number
): Promise<any[]> {
  try {
    console.log('Building For You list...');
    const api = new PhimApi();
    const seeds = (recentlyWatched || []).filter((m) => m?.slug).slice(0, 5);

    if (seeds.length === 0) {
      console.log('No seeds found, building cold start list');
      return await buildColdStartList(limit);
    }

    console.log(`Processing ${seeds.length} seeds...`);
    const seedDetails = await Promise.allSettled(
      seeds.map((seed) => api.get(seed.slug as string))
    );

    const seedMovies: BasicMovie[] = seedDetails
      .map((result, index) => {
        if (result.status === "fulfilled" && result.value?.movie) {
          return result.value.movie;
        }
        if (result.status === "rejected") {
          console.warn(`Failed to get seed details for seed ${index}:`, result.reason);
        }
        return seeds[index];
      })
      .filter((m): m is BasicMovie => Boolean(m));

    if (seedMovies.length === 0) {
      console.log('No valid seed movies, falling back to cold start');
      return await buildColdStartList(limit);
    }

    const categorySlugs = new Set<string>();
    const countrySlugs = new Set<string>();
    const yearValues = new Set<number>();
    const typeSlugs = new Set<string>();

    seedMovies.forEach((movie) => {
      (movie.category || []).forEach((c) => c?.slug && categorySlugs.add(c.slug));
      (movie.country || []).forEach((c) => c?.slug && countrySlugs.add(c.slug));
      if (movie.year) yearValues.add(Number(movie.year));
      if (movie.type) typeSlugs.add(movie.type);
    });

    console.log(`Categories: ${categorySlugs.size}, Countries: ${countrySlugs.size}, Years: ${yearValues.size}, Types: ${typeSlugs.size}`);

    const tasks: Promise<any>[] = [];

    // Limit the number of concurrent tasks to avoid overwhelming the API
    const maxCategoryTasks = Math.min(categorySlugs.size, 3);
    const categoryArray = Array.from(categorySlugs).slice(0, maxCategoryTasks);
    categoryArray.forEach((slug) => tasks.push(api.byCategory(slug, 1)));

    const maxCountryTasks = Math.min(countrySlugs.size, 2);
    const countryArray = Array.from(countrySlugs).slice(0, maxCountryTasks);
    countryArray.forEach((slug) =>
      tasks.push(api.getFilteredList({ country: slug, limit: limit * 2 }))
    );

    const maxYearTasks = Math.min(yearValues.size, 2);
    const yearArray = Array.from(yearValues).slice(0, maxYearTasks);
    yearArray.forEach((year) =>
      tasks.push(api.getFilteredList({ year, limit: limit * 2 }))
    );

    const maxTypeTasks = Math.min(typeSlugs.size, 2);
    const typeArray = Array.from(typeSlugs).slice(0, maxTypeTasks);
    typeArray.forEach((type) => tasks.push(api.byTopic(type, 1)));

    tasks.push(api.newAdding(1));

    console.log(`Executing ${tasks.length} recommendation tasks...`);
    const results = await Promise.allSettled(tasks);
    const candidatePool: any[] = [];
    let failedTasks = 0;

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        candidatePool.push(...extractItems(result.value));
      } else if (result.status === "rejected") {
        failedTasks++;
        console.warn(`Recommendation task ${index} failed:`, result.reason);
      }
    });

    console.log(`${failedTasks}/${tasks.length} tasks failed, got ${candidatePool.length} candidates`);

    // If we got some candidates, use them
    if (candidatePool.length > 0) {
      const seedSlugs = new Set(seedMovies.map((m) => m.slug).filter(Boolean));
      const uniqueCandidates = takeUnique(candidatePool, (m: any) => m?.slug).filter(
        (m) => m?.slug && !seedSlugs.has(m.slug)
      );

      const scored = uniqueCandidates
        .map((movie) => ({
          movie,
          score: computeScore(movie, seedMovies),
        }))
        .sort((a, b) => b.score - a.score);

      let selected = scored.slice(0, limit).map((item) => item.movie);

      if (selected.length < limit) {
        console.log(`Need ${limit - selected.length} more movies from cold start`);
        const coldStart = await buildColdStartList(limit * 2);
        const fallbackMovies = coldStart.filter(
          (m) =>
            m?.slug &&
            !seedSlugs.has(m.slug) &&
            !selected.some((s) => s.slug === m.slug)
        );
        selected = [...selected, ...fallbackMovies].slice(0, limit);
      }

      return selected;
    }

    // If all tasks failed, return cold start list
    console.log('All recommendation tasks failed, using cold start');
    return await buildColdStartList(limit);
  } catch (error) {
    console.error('For You list build failed completely:', error);
    const fallbackApi = new PhimApi();
    return fallbackApi.getFallbackMoviesPublic(limit);
  }
}
