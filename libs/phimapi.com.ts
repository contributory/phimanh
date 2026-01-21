export default class PhimApi {
  private apiUrl = " https://phimapi.com";
  private cache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_TTL = 1000 * 60 * 10; // 10 minutes

  constructor() {
    this.apiUrl = "https://phimapi.com";
  }

  private async fetchWithCache(url: string, options: RequestInit = {}): Promise<any> {
    const cacheKey = url;
    const now = Date.now();
    const cached = this.cache.get(cacheKey);

    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      // Re-fetch in background to update cache (stale-while-revalidate)
      this.backgroundFetch(url, options);
      return cached.data;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        Referer: "https://phimanh.netlify.app",
        "User-Agent": "phimanh-bot/1.0",
        ...options.headers,
      },
    });

    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    this.cache.set(cacheKey, { data, timestamp: now });
    return data;
  }

  private async backgroundFetch(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Referer: "https://phimanh.netlify.app",
          "User-Agent": "phimanh-bot/1.0",
          ...options.headers,
        },
      });
      if (response.ok) {
        const data = await response.json();
        this.cache.set(url, { data, timestamp: Date.now() });
      }
    } catch (e) {
      console.error("Background fetch failed", e);
    }
  }

  async get(slug: string): Promise<{ movie: any; server: any[] }> {
    const url = `${this.apiUrl}/phim/${slug}`;
    const data = await this.fetchWithCache(url);
    return {
      movie: data.movie,
      server: data.episodes,
    };
  }

  listTopics(): any[] {
    return [
      {
        name: "Chương Trình Truyền Hình",
        slug: "phim-bo",
      },
      {
        name: "Phim Điện Ảnh",
        slug: "phim-le",
      },
      {
        name: "Phim Hoạt Hình",
        slug: "hoat-hinh",
      },
    ];
  }

  async listCategories(): Promise<any> {
    const url = `${this.apiUrl}/the-loai`;
    return this.fetchWithCache(url);
  }

  async listCountries(): Promise<any> {
    const url = `${this.apiUrl}/quoc-gia`;
    return this.fetchWithCache(url);
  }

  async getList(
    isCategory: boolean | null | undefined,
    slug: string | null | undefined,
    index: number = 1
  ): Promise<any> {
    if (isCategory === true && slug) {
      return this.byCategory(slug, index);
    } else if (isCategory === false && slug) {
      return this.byTopic(slug, index);
    } else {
      return this.newAdding(index);
    }
  }

  async newAdding(index: number = 1): Promise<any> {
    const url = `${this.apiUrl}/danh-sach/phim-moi-cap-nhat-v2?page=${index}&limit=20`;
    const data = await this.fetchWithCache(url);
    return [data.items, data.pagination];
  }

  async search(query: string, index: number = 1): Promise<any> {
    const url = `${this.apiUrl}/v1/api/tim-kiem?keyword=${query}&limit=20&page=${index}`;
    const data = await this.fetchWithCache(url);
    return [data.data.items, data.data.params.pagination];
  }

  async byCategory(slug: string, index: number = 1): Promise<any> {
    const url = `${this.apiUrl}/v1/api/the-loai/${slug}?page=${index}&limit=20`;
    const data = await this.fetchWithCache(url);
    return [data.data.items, data.data.params.pagination];
  }

  async byTopic(slug: string, index: number = 1): Promise<any> {
    const url = `${this.apiUrl}/v1/api/danh-sach/${slug}?page=${index}&limit=20`;
    const data = await this.fetchWithCache(url);
    return [data.data.items, data.data.params.pagination];
  }

  async getTopicItems(slug: string, limit: number = 6): Promise<any[]> {
    const url = `${this.apiUrl}/v1/api/danh-sach/${slug}?page=1&limit=${limit}`;
    const data = await this.fetchWithCache(url);
    return data.data.items.slice(0, limit);
  }

  async getFilteredList(params: {
    typeList?: string;
    page?: number;
    sortField?: string;
    sortType?: string;
    sortLang?: string;
    category?: string;
    country?: string;
    year?: number;
    limit?: number;
  }): Promise<any> {
    const {
      typeList = "phim-bo",
      page = 1,
      sortField = "modified.time",
      sortType = "desc",
      sortLang = "vietsub",
      category,
      country,
      year,
      limit = 10,
    } = params;

    let url = `${this.apiUrl}/v1/api/danh-sach/${typeList}?page=${page}&sort_field=${sortField}&sort_type=${sortType}&limit=${limit}`;

    if (sortLang) url += `&sort_lang=${sortLang}`;
    if (category) url += `&category=${category}`;
    if (country) url += `&country=${country}`;
    if (year) url += `&year=${year}`;

    const data = await this.fetchWithCache(url);
    return [data.data.items, data.data.params.pagination];
  }

  async getRecommended(movie: any): Promise<any[]> {
    try {
      const requests = [];

      // 1. Same category (primary)
      if (movie.category?.[0]?.slug) {
        requests.push(this.byCategory(movie.category[0].slug, 1));
      }

      // 2. Same country
      if (movie.country?.[0]?.slug) {
        requests.push(this.getFilteredList({ country: movie.country[0].slug, limit: 10 }));
      }

      // 3. Same year
      if (movie.year) {
        requests.push(this.getFilteredList({ year: movie.year, limit: 10 }));
      }

      // 4. Same topic/type (phim-bo, phim-le, hoat-hinh)
      if (movie.type) {
        requests.push(this.byTopic(movie.type, 1));
      }

      const results = await Promise.allSettled(requests);
      let allMovies: any[] = [];

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const items = result.value[0] || [];
          allMovies = [...allMovies, ...items];
        }
      });

      // Remove duplicates and the current movie
      const uniqueMovies = Array.from(
        new Map(allMovies.map((m) => [m.slug, m])).values()
      ).filter((m) => m.slug !== movie.slug);

      // Shuffle results for variety
      return uniqueMovies.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      return [];
    }
  }
}
