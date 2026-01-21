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

  coldResults.forEach((result) => {
    if (result.status === "fulfilled") coldPool.push(...extractItems(result.value));
  });

  const coldUnique = takeUnique(coldPool, (m: any) => m?.slug);
  return shuffle(coldUnique).slice(0, limit);
};

export async function buildForYouList(
  recentlyWatched: BasicMovie[] = [],
  limit: number
): Promise<any[]> {
  const api = new PhimApi();
  const seeds = (recentlyWatched || []).filter((m) => m?.slug).slice(0, 5);

  if (seeds.length === 0) {
    return buildColdStartList(limit);
  }

  const seedDetails = await Promise.allSettled(
    seeds.map((seed) => api.get(seed.slug as string))
  );

  const seedMovies: BasicMovie[] = seedDetails
    .map((result, index) => {
      if (result.status === "fulfilled" && result.value?.movie) {
        return result.value.movie;
      }
      return seeds[index];
    })
    .filter((m): m is BasicMovie => Boolean(m));

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

  const tasks: Promise<any>[] = [];

  categorySlugs.forEach((slug) => tasks.push(api.byCategory(slug, 1)));
  countrySlugs.forEach((slug) =>
    tasks.push(api.getFilteredList({ country: slug, limit: limit * 2 }))
  );
  yearValues.forEach((year) =>
    tasks.push(api.getFilteredList({ year, limit: limit * 2 }))
  );
  typeSlugs.forEach((type) => tasks.push(api.byTopic(type, 1)));
  tasks.push(api.newAdding(1));

  const results = await Promise.allSettled(tasks);
  const candidatePool: any[] = [];

  results.forEach((result) => {
    if (result.status !== "fulfilled") return;
    candidatePool.push(...extractItems(result.value));
  });

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
