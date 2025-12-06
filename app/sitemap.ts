import { MetadataRoute } from "next";
import PhimApi from "@/libs/phimapi.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://phimanh.netlify.app"; // Unified base URL
  const api = new PhimApi();

  try {
    const [newMovies] = await api.newAdding();
    const categories = await api.listCategories();
    const topics = api.listTopics();

    // Main site routes with optimized priorities
    const routes = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/new-updates`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/recently`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      },
    ];

    // Topic routes - important for SEO
    const topicRoutes = topics.map((topic: any) => ({
      url: `${baseUrl}/topic/${topic.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    // Category routes - important for SEO
    const categoryRoutes = categories.map((category: any) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    // Movie routes - limit to recent movies for better performance
    const movieRoutes = newMovies.slice(0, 1000).map((movie: any) => ({
      url: `${baseUrl}/watch?slug=${movie.slug}`,
      lastModified: movie.modified_time
        ? new Date(movie.modified_time)
        : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [...routes, ...topicRoutes, ...categoryRoutes, ...movieRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return basic sitemap if API fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1.0,
      },
    ];
  }
}
