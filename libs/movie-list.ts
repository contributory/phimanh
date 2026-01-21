type SearchParams = Record<string, string | string[] | undefined>;

export type MovieListData = {
  movies: any[];
  pageInfo: any | null;
};

type MovieListParams = {
  index?: number;
  category?: string;
  topic?: string;
  searchParams?: SearchParams;
};

const API_BASE_URL = "https://phimapi.com";
const DEFAULT_HEADERS = {
  Referer: "https://phimanh.netlify.app",
  "User-Agent": "phimanh-bot/1.0",
};

const getParam = (params: SearchParams | undefined, key: string) => {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value;
};

export async function fetchMovieList({
  index = 1,
  category,
  topic,
  searchParams,
}: MovieListParams): Promise<MovieListData> {
  const typeList = getParam(searchParams, "typeList");
  const sortField = getParam(searchParams, "sortField");
  const filterCategory = getParam(searchParams, "category");
  const filterCountry = getParam(searchParams, "country");
  const filterYear = getParam(searchParams, "year");
  const hasAdvancedFilters =
    typeList || sortField || filterCategory || filterCountry || filterYear;

  let url: string;
  if (hasAdvancedFilters) {
    const resolvedTypeList = typeList || "phim-bo";
    const resolvedSortField = sortField || "modified.time";
    const sortType = getParam(searchParams, "sortType") || "desc";
    const sortLang = getParam(searchParams, "sortLang") || "vietsub";
    const limit = getParam(searchParams, "limit") || "64";

    const urlObj = new URL(
      `${API_BASE_URL}/v1/api/danh-sach/${resolvedTypeList}`
    );
    urlObj.searchParams.set("page", String(index));
    urlObj.searchParams.set("sort_field", resolvedSortField);
    urlObj.searchParams.set("sort_type", sortType);
    urlObj.searchParams.set("limit", limit);
    if (sortLang) urlObj.searchParams.set("sort_lang", sortLang);
    if (filterCategory) urlObj.searchParams.set("category", filterCategory);
    if (filterCountry) urlObj.searchParams.set("country", filterCountry);
    if (filterYear) urlObj.searchParams.set("year", filterYear);
    url = urlObj.toString();
  } else if (category) {
    url = `${API_BASE_URL}/v1/api/the-loai/${category}?page=${index}&limit=64`;
  } else if (topic) {
    url = `${API_BASE_URL}/v1/api/danh-sach/${topic}?page=${index}&limit=64`;
  } else {
    url = `${API_BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${index}`;
  }

  try {
    const response = await fetch(url, { headers: DEFAULT_HEADERS });
    if (!response.ok) {
      return { movies: [], pageInfo: null };
    }
    const data = await response.json();
    if (hasAdvancedFilters || category || topic) {
      return {
        movies: data?.data?.items ?? [],
        pageInfo: data?.data?.params?.pagination ?? null,
      };
    }
    return {
      movies: data?.items ?? [],
      pageInfo: data?.pagination ?? null,
    };
  } catch {
    return { movies: [], pageInfo: null };
  }
}
