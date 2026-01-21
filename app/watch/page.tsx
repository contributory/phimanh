import PhimApi from "@/services/phimapi.com";
import Description from "@/components/movie/description";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { MovieStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data";
import Breadcrumb, { useBreadcrumb } from "@/components/seo/breadcrumb";
import { decodeHtmlEntities } from "@/lib/utils";

export async function generateMetadata({ searchParams }: any) {
  const { slug } = await searchParams;
  const api = new PhimApi();
  const { movie } = await api.get(slug);
  const cleanDescription = movie.content ? decodeHtmlEntities(movie.content) : "";

  return {
    title: `${movie.name} - Xem phim HD chất lượng cao | Phim Ảnh`,
    description: cleanDescription ? cleanDescription.substring(0, 160) + '...' : `Xem phim ${movie.name} ${movie.origin_name ? `(${movie.origin_name})` : ''} HD chất lượng cao miễn phí tại Phim Ảnh.`,
    keywords: [
      movie.name,
      movie.origin_name,
      `phim ${movie.name}`,
      `xem phim ${movie.name}`,
      `${movie.name} vietsub`,
      `${movie.name} thuyết minh`,
      'phim HD',
      'phim chất lượng cao',
      'xem phim miễn phí',
      ...movie.category?.map((cat: any) => `phim ${cat.name}`) || [],
      ...movie.country?.map((country: any) => `phim ${country.name}`) || []
    ].join(', '),
    openGraph: {
      title: `${movie.name} - Xem phim HD chất lượng cao`,
      description: cleanDescription ? cleanDescription.substring(0, 200) : `Xem phim ${movie.name} HD chất lượng cao miễn phí`,
      images: [
        {
          url: movie.poster_url,
          width: 300,
          height: 450,
          alt: `Poster phim ${movie.name}`,
        },
        ...(movie.thumb_url ? [{
          url: movie.thumb_url,
          width: 1200,
          height: 630,
          alt: `Hình ảnh phim ${movie.name}`,
        }] : [])
      ],
      type: 'video.movie',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${movie.name} - Xem phim HD chất lượng cao`,
      description: cleanDescription ? cleanDescription.substring(0, 200) : `Xem phim ${movie.name} HD chất lượng cao miễn phí`,
      images: [movie.thumb_url || movie.poster_url],
    },
  };
}

export default async function WatchPage({ searchParams }: any) {
  const { slug } = await searchParams;
  const api = new PhimApi();
  const [categories, { movie, server }, countries] = await Promise.all([
    api.listCategories(),
    api.get(slug),
    api.listCountries(),
  ]);

  const { generateMovieBreadcrumb } = useBreadcrumb();
  const breadcrumbItems = generateMovieBreadcrumb(movie.name, slug);
  
  const structuredBreadcrumbItems = breadcrumbItems.map(item => ({
    name: item.name,
    url: `https://phimanh.netlify.app${item.url}`
  }));

  return (
    <>
      {/* Structured Data */}
      <MovieStructuredData
        movie={movie}
        url={`https://phimanh.netlify.app/watch?slug=${slug}`}
      />
      <BreadcrumbStructuredData items={structuredBreadcrumbItems} />
      
      <main className="min-h-screen relative bg-background">
        <div className="relative z-10 mx-auto w-full">
          <Header
            categories={categories}
            countries={countries}
          />
          
          <div className="max-w-[1600px] mx-auto">
            <Description movie={movie} serverData={server} slug={slug} thumb_url={movie.thumb_url} />
          </div>
          <Footer />
        </div>
      </main>
    </>
  );
}
