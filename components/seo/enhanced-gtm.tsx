'use client';

import { useEffect, useState } from 'react';
import ClientOnly from '../ui/client-only';

// Enhanced GTM tracking for SEO - works with existing GTM-WP2MWVB8
export default function EnhancedGTMTracking() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Wait for GTM to load then add enhanced SEO tracking
    const addEnhancedTracking = () => {
      if (typeof window !== 'undefined' && window.dataLayer) {
        // Core Web Vitals tracking for SEO
        import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
          function sendToGTM(metric: any) {
            if (window.dataLayer) {
              window.dataLayer.push({
                event: 'web_vitals',
                metric_name: metric.name,
                metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                metric_id: metric.id,
                metric_delta: metric.delta,
                custom_parameter_seo: true
              });
            }
          }
          
          onCLS(sendToGTM);
          onINP(sendToGTM);
          onFCP(sendToGTM);
          onLCP(sendToGTM);
          onTTFB(sendToGTM);
        }).catch(() => {
          // Silently fail if web-vitals can't be loaded
        });

        // Enhanced SEO event tracking with safety checks
        window.trackMovieView = (movieName: string, movieSlug: string) => {
          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'movie_view',
              movie_name: movieName,
              movie_slug: movieSlug,
              event_category: 'engagement',
              event_label: movieName,
              custom_parameter_seo: true
            });
          }
        };

        window.trackSearchQuery = (searchQuery: string, resultsCount: number) => {
          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'search',
              search_term: searchQuery,
              results_count: resultsCount,
              event_category: 'search',
              custom_parameter_seo: true
            });
          }
        };

        window.trackCategoryView = (categoryName: string, categorySlug: string) => {
          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'category_view',
              category_name: categoryName,
              category_slug: categorySlug,
              event_category: 'navigation',
              custom_parameter_seo: true
            });
          }
        };

        // Performance monitoring for SEO with safety checks
        const setupPerformanceMonitoring = () => {
          try {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            const paintEntries = performance.getEntriesByType('paint');
            
            if (navigation && window.dataLayer) {
              const metrics = {
                page_load_time: navigation.loadEventEnd - navigation.loadEventStart,
                dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                first_paint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
                first_contentful_paint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
              };
              
              Object.entries(metrics).forEach(([key, value]) => {
                if (window.dataLayer) {
                  window.dataLayer.push({
                    event: 'performance_metric',
                    metric_name: key,
                    metric_value: Math.round(value),
                    event_category: 'performance',
                    custom_parameter_seo: true
                  });
                }
              });
            }
          } catch (error) {
            // Silently fail if performance APIs are not available
          }
        };

        if (document.readyState === 'complete') {
          setTimeout(setupPerformanceMonitoring, 1000);
        } else {
          window.addEventListener('load', () => {
            setTimeout(setupPerformanceMonitoring, 1000);
          });
        }
      }
    };

    // Wait for GTM to be ready with timeout
    const checkGTM = (attempts = 0) => {
      if (window.dataLayer) {
        addEnhancedTracking();
      } else if (attempts < 50) { // Max 5 seconds
        setTimeout(() => checkGTM(attempts + 1), 100);
      }
    };

    // Only run on client side after mount
    if (isMounted) {
      setTimeout(checkGTM, 1000);
    }
  }, [isMounted]);

  // Don't render anything on server side
  return <ClientOnly>{null}</ClientOnly>;
}

// Type declarations for global functions
declare global {
  interface Window {
    dataLayer: any[];
    trackMovieView: (movieName: string, movieSlug: string) => void;
    trackSearchQuery: (searchQuery: string, resultsCount: number) => void;
    trackCategoryView: (categoryName: string, categorySlug: string) => void;
  }
}