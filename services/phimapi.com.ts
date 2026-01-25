export default class PhimApi {
  private apiUrl = "https://phimapi.com";
  private CACHE_TTL = 600; // 10 minutes in seconds
  private MAX_RETRIES = 3;
  private RETRY_DELAY = 1000; // 1 second
  private REQUEST_TIMEOUT = 10000; // 10 seconds

  constructor() {
    this.apiUrl = "https://phimapi.com";
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async fetchWithCache(url: string, options: RequestInit = {}, retryCount: number = 0): Promise<any> {
    try {
      console.log(`Fetching (attempt ${retryCount + 1}):`, url);
      
      const response = await this.fetchWithTimeout(url, {
        ...options,
        headers: {
          Referer: "https://phimanh.netlify.app",
          "User-Agent": "phimanh-bot/1.0",
          "Accept": "application/json",
          ...options.headers,
        },
        next: {
          revalidate: this.CACHE_TTL,
          tags: ['api-data']
        }
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', response.status, errorText);
        
        // Retry on 5xx errors
        if (response.status >= 500 && response.status < 600 && retryCount < this.MAX_RETRIES) {
          console.log(`Retrying after ${this.RETRY_DELAY}ms... (${retryCount + 1}/${this.MAX_RETRIES})`);
          await this.sleep(this.RETRY_DELAY * (retryCount + 1));
          return this.fetchWithCache(url, options, retryCount + 1);
        }
        
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Response data received');
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      
      // Retry on network errors
      if (error instanceof Error &&
          (error.name === 'AbortError' || error.message.includes('fetch')) &&
          retryCount < this.MAX_RETRIES) {
        console.log(`Retrying after network error (${retryCount + 1}/${this.MAX_RETRIES})`);
        await this.sleep(this.RETRY_DELAY * (retryCount + 1));
        return this.fetchWithCache(url, options, retryCount + 1);
      }
      
      throw error;
    }
  }

  // Fallback data methods
  private getFallbackMovies(limit: number = 10): any[] {
    return Array.from({ length: limit }, (_, i) => ({
      slug: `fallback-movie-${i + 1}`,
      name: `Phim Mẫu ${i + 1}`,
      name_en: `Sample Movie ${i + 1}`,
      poster_url: "/placeholder-movie.png",
      thumb_url: "/placeholder-movie.png",
      year: 2024,
      category: [{ name: "Hành Động", slug: "hanh-dong" }],
      country: [{ name: "Việt Nam", slug: "viet-nam" }],
      type: "phim-le",
      quality: "HD",
      lang: "Vietsub",
      modified: { time: Date.now() }
    }));
  }

  private getFallbackPagination(): any {
    return {
      currentPage: 1,
      totalPages: 1,
      totalItems: 10,
      itemsPerPage: 10
    };
  }

  // Public method to get fallback movies (used by foryou-recommendations)
  public getFallbackMoviesPublic(limit: number = 10): any[] {
    return this.getFallbackMovies(limit);
  }

  // Loại bỏ backgroundFetch vì Next.js đã xử lý revalidate

  async get(slug: string): Promise<{ movie: any; server: any[] }> {
    try {
      const url = `${this.apiUrl}/phim/${slug}`;
      const data = await this.fetchWithCache(url);
      return {
        movie: data.movie,
        server: data.episodes,
      };
    } catch (error) {
      console.error(`Failed to get movie ${slug}:`, error);
      // Return fallback movie data
      return {
        movie: this.getFallbackMovies(1)[0],
        server: []
      };
    }
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
    try {
      const url = `${this.apiUrl}/the-loai`;
      return await this.fetchWithCache(url);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Return fallback categories
      return [
        { name: "Hành Động", slug: "hanh-dong" },
        { name: "Tình Cảm", slug: "tinh-cam" },
        { name: "Hài Hước", slug: "hai-huoc" },
        { name: "Kinh Dị", slug: "kinh-di" },
        { name: "Phiêu Lưu", slug: "phieu-luu" }
      ];
    }
  }

  async listCountries(): Promise<any> {
    try {
      const url = `${this.apiUrl}/quoc-gia`;
      return await this.fetchWithCache(url);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      // Return fallback countries
      return [
        { name: "Việt Nam", slug: "viet-nam" },
        { name: "Hàn Quốc", slug: "han-quoc" },
        { name: "Trung Quốc", slug: "trung-quoc" },
        { name: "Mỹ", slug: "my" },
        { name: "Nhật Bản", slug: "nhat-ban" }
      ];
    }
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
    try {
      const url = `${this.apiUrl}/danh-sach/phim-moi-cap-nhat-v2?page=${index}&limit=20`;
      const data = await this.fetchWithCache(url);
      return [data.items, data.pagination];
    } catch (error) {
      console.error('Failed to fetch new additions:', error);
      const fallbackMovies = this.getFallbackMovies(20);
      return [fallbackMovies, this.getFallbackPagination()];
    }
  }

  async search(query: string, index: number = 1): Promise<any> {
    try {
      // Validate input
      if (!query || query.trim() === '') {
        console.warn('Search query is empty');
        return [[], { currentPage: 1, totalPages: 1, totalItems: 0 }];
      }

      const url = `${this.apiUrl}/v1/api/tim-kiem?keyword=${encodeURIComponent(query)}&limit=20&page=${index}`;
      console.log('Search URL:', url);
      
      const data = await this.fetchWithCache(url, {
        next: { revalidate: 0 } // Disable cache for search
      });
      
      // Validate response structure
      if (!data || !data.data) {
        console.error('Invalid search response structure:', data);
        return [[], { currentPage: 1, totalPages: 1, totalItems: 0 }];
      }
      
      const items = data.data.items || [];
      const pagination = data.data.params?.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 };
      
      console.log('Search successful:', items.length, 'items found');
      return [items, pagination];
    } catch (error) {
      console.error('Search API error:', error);
      // Return empty results instead of throwing
      return [[], { currentPage: 1, totalPages: 1, totalItems: 0 }];
    }
  }

  async byCategory(slug: string, index: number = 1): Promise<any> {
    try {
      const url = `${this.apiUrl}/v1/api/the-loai/${slug}?page=${index}&limit=20`;
      const data = await this.fetchWithCache(url);
      return [data.data.items, data.data.params.pagination];
    } catch (error) {
      console.error(`Failed to fetch category ${slug}:`, error);
      const fallbackMovies = this.getFallbackMovies(20);
      return [fallbackMovies, this.getFallbackPagination()];
    }
  }

  async byTopic(slug: string, index: number = 1): Promise<any> {
    try {
      const url = `${this.apiUrl}/v1/api/danh-sach/${slug}?page=${index}&limit=20`;
      const data = await this.fetchWithCache(url);
      return [data.data.items, data.data.params.pagination];
    } catch (error) {
      console.error(`Failed to fetch topic ${slug}:`, error);
      const fallbackMovies = this.getFallbackMovies(20);
      return [fallbackMovies, this.getFallbackPagination()];
    }
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
    try {
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
    } catch (error) {
      console.error('Failed to fetch filtered list:', error);
      const fallbackMovies = this.getFallbackMovies(params.limit || 10);
      return [fallbackMovies, this.getFallbackPagination()];
    }
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
