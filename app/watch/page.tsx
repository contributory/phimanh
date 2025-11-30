import PhimApi from "@/libs/phimapi.com";
import Description from "@/components/movie/description";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { MovieStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data";
import Breadcrumb, { useBreadcrumb } from "@/components/seo/breadcrumb";

export async function generateMetadata({ searchParams }: any) {
  const { slug } = await searchParams;
  const api = new PhimApi();
  const { movie } = await api.get(slug);
  return {
    title: `${movie.name} - Xem phim HD chất lượng cao | Phim Ảnh`,
    description: movie.content ? movie.content.substring(0, 160) + '...' : `Xem phim ${movie.name} ${movie.origin_name ? `(${movie.origin_name})` : ''} HD chất lượng cao miễn phí tại Phim Ảnh.`,
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
      ...movie.category?.map(cat => `phim ${cat.name}`) || [],
      ...movie.country?.map(country => `phim ${country.name}`) || []
    ].join(', '),
    openGraph: {
      title: `${movie.name} - Xem phim HD chất lượng cao`,
      description: movie.content ? movie.content.substring(0, 200) : `Xem phim ${movie.name} HD chất lượng cao miễn phí`,
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
      description: movie.content ? movie.content.substring(0, 200) : `Xem phim ${movie.name} HD chất lượng cao miễn phí`,
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
    <div className="dark">
      {/* Structured Data */}
      <MovieStructuredData
        movie={movie}
        url={`https://phimanh.netlify.app/watch?slug=${slug}`}
      />
      <BreadcrumbStructuredData items={structuredBreadcrumbItems} />
      
      <main className="min-h-screen relative">
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${movie.poster_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        <div className="relative z-10 mx-auto max-w-screen-2xl px-4">
          <Header
            categories={categories}
            countries={countries}
          />
          
          {/* Breadcrumb Navigation */}
          <div className="relative z-20 bg-black/50 backdrop-blur-sm px-4 py-2">
            <Breadcrumb items={breadcrumbItems} className="text-white/80" />
          </div>
          <Description movie={movie} serverData={server} slug={slug} thumb_url={movie.thumb_url} />
          <Footer />
        </div>
      </main>
    </div>
  );
}
