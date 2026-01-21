'use client';

import Link from 'next/link';
import { Calendar, Tag, MapPin, Users } from 'lucide-react';
import { decodeHtmlEntities } from '@/lib/utils';

interface Movie {
  name: string;
  origin_name?: string;
  content?: string;
  year?: number;
  category?: Array<{ name: string; slug: string }>;
  country?: Array<{ name: string; slug: string }>;
  actor?: string[];
  director?: string[];
  episode_current?: string;
  episode_total?: string;
  time?: string;
  lang?: string;
  quality?: string;
}

// SEO-optimized movie description
interface MovieSEODescriptionProps {
  movie: Movie;
}

export function MovieSEODescription({ movie }: MovieSEODescriptionProps) {
  const generateSEODescription = () => {
    const elements = [];
    
    // Movie title with original name
    elements.push(`Xem phim ${movie.name}`);
    if (movie.origin_name) {
      elements.push(`(${movie.origin_name})`);
    }
    
    // Quality and language
    if (movie.quality) {
      elements.push(`chất lượng ${movie.quality}`);
    }
    if (movie.lang?.includes('Vietsub')) {
      elements.push('Vietsub');
    }
    if (movie.lang?.includes('Thuyết minh')) {
      elements.push('Thuyết minh');
    }
    
    // Episode info
    if (movie.episode_current && movie.episode_total) {
      elements.push(`tập ${movie.episode_current}/${movie.episode_total}`);
    }
    
    elements.push('miễn phí tại Phim Ảnh');
    
    return elements.join(' ');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mt-6">
      <h2 className="text-xl font-bold mb-4">Thông tin phim</h2>
      
      {/* SEO-optimized description */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {generateSEODescription()}
        </p>
      </div>

      {/* Movie details with SEO keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {movie.year && (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Năm sản xuất:</span>
            <span className="ml-1 font-medium">{movie.year}</span>
          </div>
        )}
        
        {movie.country && movie.country.length > 0 && (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Quốc gia:</span>
            <div className="ml-1 flex flex-wrap gap-1">
              {movie.country.map((country, index) => (
                <span key={country.slug}>
                  <Link 
                    href={`/?country=${country.slug}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    title={`Phim ${country.name}`}
                  >
                    {country.name}
                  </Link>
                  {index < movie.country!.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {movie.category && movie.category.length > 0 && (
          <div className="flex items-start">
            <Tag className="w-4 h-4 mr-2 text-purple-500 mt-0.5" />
            <span className="text-gray-600 dark:text-gray-400">Thể loại:</span>
            <div className="ml-1 flex flex-wrap gap-1">
              {movie.category.map((cat, index) => (
                <span key={cat.slug}>
                  <Link 
                    href={`/?category=${cat.slug}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    title={`Phim ${cat.name}`}
                  >
                    {cat.name}
                  </Link>
                  {index < movie.category!.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {(movie.actor && movie.actor.length > 0) && (
          <div className="flex items-start">
            <Users className="w-4 h-4 mr-2 text-orange-500 mt-0.5" />
            <span className="text-gray-600 dark:text-gray-400">Diễn viên:</span>
            <div className="ml-1 text-sm">
              {movie.actor.slice(0, 3).join(', ')}
              {movie.actor.length > 3 && '...'}
            </div>
          </div>
        )}
      </div>

      {/* Movie content/plot with SEO optimization */}
      {movie.content && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <h3 className="font-medium mb-2">Nội dung phim {movie.name}</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {decodeHtmlEntities(movie.content)}
          </p>
        </div>
      )}
    </div>
  );
}

// SEO-optimized category page content
interface CategorySEOContentProps {
  categoryName: string;
  categorySlug: string;
  movieCount?: number;
  description?: string;
}

export function CategorySEOContent({ 
  categoryName, 
  categorySlug, 
  movieCount,
  description 
}: CategorySEOContentProps) {
  const defaultDescription = `Khám phá kho tàng phim ${categoryName} chất lượng HD tại Phim Ảnh. ${movieCount ? `Hơn ${movieCount} bộ phim` : 'Nhiều bộ phim'} ${categoryName} hay nhất được cập nhật liên tục, xem miễn phí với phụ đề Việt Nam.`;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg mb-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Phim {categoryName} - Xem Online Chất Lượng HD
      </h1>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {description || defaultDescription}
      </p>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-white dark:bg-gray-600 rounded-full text-sm font-medium">
          #{categoryName.toLowerCase().replace(/\s+/g, '')}
        </span>
        <span className="px-3 py-1 bg-white dark:bg-gray-600 rounded-full text-sm">
          Phim HD
        </span>
        <span className="px-3 py-1 bg-white dark:bg-gray-600 rounded-full text-sm">
          Miễn phí
        </span>
        {movieCount && (
          <span className="px-3 py-1 bg-white dark:bg-gray-600 rounded-full text-sm">
            {movieCount}+ phim
          </span>
        )}
      </div>
    </div>
  );
}

// SEO FAQ component for movies
interface MovieFAQProps {
  movie: Movie;
}

export function MovieFAQ({ movie }: MovieFAQProps) {
  const faqs = [
    {
      question: `Phim ${movie.name} có phụ đề Việt Nam không?`,
      answer: `Có, bạn có thể xem phim ${movie.name} với phụ đề Việt Nam chất lượng cao tại Phim Ảnh. Chúng tôi cung cấp nhiều tùy chọn ngôn ngữ cho trải nghiệm tốt nhất.`
    },
    {
      question: `Xem phim ${movie.name} ở đâu chất lượng tốt nhất?`,
      answer: `Phim Ảnh cung cấp phim ${movie.name} với chất lượng HD, Full HD, và 4K. Bạn có thể xem hoàn toàn miễn phí mà không cần đăng ký tài khoản.`
    },
    {
      question: `Phim ${movie.name} thuộc thể loại gì?`,
      answer: `Phim ${movie.name} thuộc thể loại ${movie.category?.map(c => c.name).join(', ') || 'đang cập nhật'}. Đây là một bộ phim hay và được đánh giá cao.`
    }
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Câu hỏi thường gặp về phim {movie.name}</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-2 text-lg">{faq.question}</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Homepage SEO content
export function HomepageSEOContent() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="mt-12 prose dark:prose-invert max-w-none">
      <h2 className="text-2xl font-bold mb-4">
        Phim Ảnh - Website Xem Phim Online Chất Lượng Cao Hàng Đầu {currentYear}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-3">Tại sao chọn Phim Ảnh?</h3>
          <ul className="space-y-2 text-sm">
            <li>✅ Hơn 50,000+ bộ phim chất lượng HD, Full HD, 4K</li>
            <li>✅ Cập nhật phim mới nhất hàng ngày</li>
            <li>✅ Phụ đề Việt Nam và Thuyết minh chuyên nghiệp</li>
            <li>✅ Xem phim hoàn toàn miễn phí</li>
            <li>✅ Không cần đăng ký tài khoản</li>
            <li>✅ Giao diện thân thiện, tương thích mọi thiết bị</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-3">Thể loại phim đa dạng</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Phim Ảnh sở hữu kho phim đa dạng với đầy đủ các thể loại từ phim hành động, 
            tình cảm, kinh dị, hài hước, phim bộ Trung Quốc, Hàn Quốc, Thái Lan, 
            anime Nhật Bản đến phim Hollywood bom tấn. Tất cả đều được cập nhật 
            thường xuyên với chất lượng tốt nhất.
          </p>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              'Phim hành động', 'Phim tình cảm', 'Phim kinh dị', 
              'Phim hài hước', 'Phim bộ', 'Anime', 'Phim chiếu rạp'
            ].map((genre) => (
              <span key={genre} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}