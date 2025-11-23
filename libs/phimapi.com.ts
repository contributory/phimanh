export default class PhimApi {
  private apiUrl = " https://phimapi.com";
  constructor() {
    this.apiUrl = "https://phimapi.com";
  }

  async get(slug: string): Promise<{ movie: any; server: any[] }> {
    const url = `${this.apiUrl}/phim/${slug}`;
    const response = await fetch(url, {
      headers: {
        Referer: "https://phimanh.netlify.app",
        "User-Agent": "phimanh-bot/1.0",
      },
    });
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
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
    const response = await fetch(url, {
      headers: {
        Referer: "https://phimanh.netlify.app",
        "User-Agent": "phimanh-bot/1.0",
      },
    });
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    return data;
  }

  async listCountries(): Promise<any> {
    const url = `${this.apiUrl}/quoc-gia`;
    const response = await fetch(url, {
      headers: {
        Referer: "https://phimanh.netlify.app",
        "User-Agent": "phimanh-bot/1.0",
      },
    });
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    return data;
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
    const response = await fetch(url, {
      headers: {
        Referer: "https://phimanh.netlify.app",
        "User-Agent": "phimanh-bot/1.0",
      },
    });
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    return [data.items, data.pagination];
  }

  async search(query: string, index: number = 1): Promise<any> {
    const url = `${this.apiUrl}/v1/api/tim-kiem?keyword=${query}&limit=20&page=${index}`;
    const response = await fetch(url, {
      headers: {
        Referer: "https://phimanh.netlify.app",
        "User-Agent": "phimanh-bot/1.0",
      },
    });
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    return [data.data.items, data.data.params.pagination];
  }

  async byCategory(slug: string, index: number = 1): Promise<any> {
    const url = `${this.apiUrl}/v1/api/the-loai/${slug}?page=${index}&limit=20`;
    const response = await fetch(url, {
      headers: {
        Referer: "https://phimanh.netlify.app",
        "User-Agent": "phimanh-bot/1.0",
      },
    });
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    return [data.data.items, data.data.params.pagination];
  }

  async byTopic(slug: string, index: number = 1): Promise<any> {
    const url = `${this.apiUrl}/v1/api/danh-sach/${slug}?page=${index}&limit=20`;
    const response = await fetch(url, {
      headers: {
        Referer: "https://phimanh.netlify.app",
        "User-Agent": "phimanh-bot/1.0",
      },
    });
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    return [data.data.items, data.data.params.pagination];
  }

  async getTopicItems(slug: string, limit: number = 6): Promise<any[]> {
    const url = `${this.apiUrl}/v1/api/danh-sach/${slug}?page=1&limit=${limit}`;
    const response = await fetch(url, {
      headers: {
        Referer: "https://phimanh.netlify.app",
        "User-Agent": "phimanh-bot/1.0",
      },
    });
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
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

    const response = await fetch(url, {
      headers: {
        Referer: "https://phimanh.netlify.app",
        "User-Agent": "phimanh-bot/1.0",
      },
    });
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    return [data.data.items, data.data.params.pagination];
  }
}
