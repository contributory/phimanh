import { MetadataRoute } from "next";
import PhimApi from "@/libs/phimapi.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://phimanh.netlify.app";
  const api = new PhimApi();

  const [newMovies] = await api.newAdding();
  const categories = await api.listCategories();
  const topics = api.listTopics();

  const routes = ["", "/search", "/new-updates", "/recently", "/watch"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    })
  );

  const topicRoutes = topics.map((topic) => ({
    url: `${baseUrl}/?topic=${topic.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const categoryRoutes = categories.map((category: any) => ({
    url: `${baseUrl}/?category=${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const movieRoutes = newMovies.map((movie: any) => ({
    url: `${baseUrl}/watch?slug=${movie.slug}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...routes, ...topicRoutes, ...categoryRoutes, ...movieRoutes];
}
