export default class PhimApi {
  private apiUrl = " https://phimapi.com";
  constructor() {
    this.apiUrl = "https://phimapi.com";
  }

  async get(slug: string): Promise<{ movie: any; server: any[] }> {
    const url = `${this.apiUrl}/phim/${slug}`;
    const response = await fetch(url, {
      headers: {
        "Referer": "https://phimanh.mywire.org",
        "User-Agent": "phimanh-bot/1.0"
      }
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
        slug: "hoa-hinh",
      },
    ];
  }

  async listCategories(): Promise<any> {
    const url = `${this.apiUrl}/the-loai`;
    const response = await fetch(url, {
      headers: {
        "Referer": "https://phimanh.mywire.org",
        "User-Agent": "phimanh-bot/1.0"
      }
    });
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    return data;
  }

  async getList(
    isCategory: boolean | null,
    slug: string,
    index: number = 1,
  ): Promise<any> {
    if (isCategory === true) {
      return this.byCategory(slug, index);
    } else if (isCategory === false) {
      return this.byTopic(slug, index);
    } else {
      return this.newAdding(index);
    }
  }

  async newAdding(index: number = 1): Promise<any> {
    const url = `${this.apiUrl}/danh-sach/phim-moi-cap-nhat?page=${index}`;
    const response = await fetch(url, {
      headers: {
        "Referer": "https://phimanh.mywire.org",
        "User-Agent": "phimanh-bot/1.0"
      }
    });
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    return [data.items, data.pagination];
  }

  async search(query: string, index: number = 1): Promise<any> {
    const url = `${this.apiUrl}/v1/api/tim-kiem?keyword=${query}&limit=10&page=${index}`;
    const response = await fetch(url, {
      headers: {
        "Referer": "https://phimanh.mywire.org",
        "User-Agent": "phimanh-bot/1.0"
      }
    });
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    return [data.data.items, data.data.params.pagination];
  }

  async byCategory(slug: string, index: number = 1): Promise<any> {
    const url = `${this.apiUrl}/v1/api/the-loai/${slug}?page=${index}`;
    const response = await fetch(url, {
      headers: {
        "Referer": "https://phimanh.mywire.org",
        "User-Agent": "phimanh-bot/1.0"
      }
    });
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    return [data.data.items, data.data.params.pagination];
  }

  async byTopic(slug: string, index: number = 1): Promise<any> {
    const url = `${this.apiUrl}/v1/api/danh-sach/${slug}?page=${index}`;
    const response = await fetch(url, {
      headers: {
        "Referer": "https://phimanh.mywire.org",
        "User-Agent": "phimanh-bot/1.0"
      }
    });
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    return [data.data.items, data.data.params.pagination];
  }
}
