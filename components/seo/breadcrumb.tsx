import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  url: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4 ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight className="w-3 h-3 mx-2 text-gray-400" aria-hidden="true" />
            )}
            
            {index === 0 ? (
              <Link 
                href={item.url}
                className="inline-flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                aria-label="Trang chủ"
              >
                <Home className="w-3 h-3 mr-1" />
                {item.name}
              </Link>
            ) : item.current || index === items.length - 1 ? (
              <span 
                className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px]"
                aria-current="page"
                title={item.name}
              >
                {item.name}
              </span>
            ) : (
              <Link 
                href={item.url}
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors truncate max-w-[150px]"
                title={item.name}
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Hook để generate breadcrumb items
export function useBreadcrumb() {
  const generateMovieBreadcrumb = (movieName: string, slug: string): BreadcrumbItem[] => [
    { name: 'Trang chủ', url: '/' },
    { name: 'Xem phim', url: '/watch' },
    { name: movieName, url: `/watch?slug=${slug}`, current: true }
  ];

  const generateCategoryBreadcrumb = (categoryName: string, categorySlug: string): BreadcrumbItem[] => [
    { name: 'Trang chủ', url: '/' },
    { name: 'Thể loại', url: '/' },
    { name: categoryName, url: `/?category=${categorySlug}`, current: true }
  ];

  const generateTopicBreadcrumb = (topicName: string, topicSlug: string): BreadcrumbItem[] => [
    { name: 'Trang chủ', url: '/' },
    { name: 'Chủ đề', url: '/' },
    { name: topicName, url: `/?topic=${topicSlug}`, current: true }
  ];

  const generateSearchBreadcrumb = (query: string): BreadcrumbItem[] => [
    { name: 'Trang chủ', url: '/' },
    { name: 'Tìm kiếm', url: '/search' },
    { name: `"${query}"`, url: `/search?query=${encodeURIComponent(query)}`, current: true }
  ];

  return {
    generateMovieBreadcrumb,
    generateCategoryBreadcrumb,
    generateTopicBreadcrumb,
    generateSearchBreadcrumb
  };
}