'use client';

import Script from 'next/script';

// Google Analytics 4
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
}

// Search Console verification
export function SearchConsoleVerification({ verificationCode }: { verificationCode: string }) {
  return (
    <meta name="google-site-verification" content={verificationCode} />
  );
}

// Bing Webmaster Tools
export function BingVerification({ verificationCode }: { verificationCode: string }) {
  return (
    <meta name="msvalidate.01" content={verificationCode} />
  );
}

// Facebook Domain Verification
export function FacebookDomainVerification({ verificationCode }: { verificationCode: string }) {
  return (
    <meta name="facebook-domain-verification" content={verificationCode} />
  );
}

// Google AdSense (nếu cần)
export function GoogleAdSense({ publisherId }: { publisherId: string }) {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

// Core Web Vitals tracking
export function WebVitalsTracking() {
  return (
    <Script id="web-vitals" strategy="afterInteractive">
      {`
        function sendToAnalytics(metric) {
          if (window.gtag) {
            gtag('event', metric.name, {
              custom_parameter_1: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
              custom_parameter_2: metric.id,
              custom_parameter_3: metric.delta,
            });
          }
        }

        // Load web-vitals library and track metrics
        import('https://unpkg.com/web-vitals@3/dist/web-vitals.js').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
          onCLS(sendToAnalytics);
          onFID(sendToAnalytics);
          onFCP(sendToAnalytics);
          onLCP(sendToAnalytics);
          onTTFB(sendToAnalytics);
        });
      `}
    </Script>
  );
}

// Type declarations for global functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Movie viewing analytics
export function trackMovieView(movieName: string, movieSlug: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'movie_view', {
      movie_name: movieName,
      movie_slug: movieSlug,
      event_category: 'engagement',
      event_label: movieName
    });
  }
}

// Search analytics
export function trackSearch(searchQuery: string, resultsCount: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchQuery,
      results_count: resultsCount,
      event_category: 'search'
    });
  }
}

// Category/Topic view analytics
export function trackCategoryView(categoryName: string, categorySlug: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'category_view', {
      category_name: categoryName,
      category_slug: categorySlug,
      event_category: 'navigation'
    });
  }
}

// Performance monitoring for SEO
export function SEOPerformanceMonitor() {
  return (
    <Script id="seo-performance-monitor" strategy="afterInteractive">
      {`
        // Monitor page load performance
        window.addEventListener('load', function() {
          const navigation = performance.getEntriesByType('navigation')[0];
          const paintEntries = performance.getEntriesByType('paint');
          
          // Track key performance metrics for SEO
          const metrics = {
            'page_load_time': navigation.loadEventEnd - navigation.loadEventStart,
            'dom_content_loaded': navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            'first_paint': paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
            'first_contentful_paint': paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
          };
          
          // Send to analytics if available
          if (window.gtag) {
            Object.entries(metrics).forEach(([key, value]) => {
              window.gtag('event', 'performance_metric', {
                metric_name: key,
                metric_value: Math.round(value),
                event_category: 'performance'
              });
            });
          }
        });
        
        // Monitor Core Web Vitals impact on SEO
        function observeWebVitals() {
          if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((entryList) => {
              const entries = entryList.getEntries();
              const lastEntry = entries[entries.length - 1];
              if (window.gtag && lastEntry.startTime) {
                window.gtag('event', 'lcp_measurement', {
                  value: Math.round(lastEntry.startTime),
                  event_category: 'web_vitals'
                });
              }
            });
            
            try {
              lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
              console.log('LCP observation not supported');
            }
          }
        }
        
        observeWebVitals();
      `}
    </Script>
  );
}

// Comprehensive SEO Analytics component
interface SEOAnalyticsProps {
  googleAnalyticsId?: string;
  googleSearchConsoleId?: string;
  bingVerificationId?: string;
  facebookDomainVerificationId?: string;
  enableWebVitals?: boolean;
  enablePerformanceMonitoring?: boolean;
}

export default function SEOAnalytics({
  googleAnalyticsId,
  googleSearchConsoleId,
  bingVerificationId,
  facebookDomainVerificationId,
  enableWebVitals = true,
  enablePerformanceMonitoring = true
}: SEOAnalyticsProps) {
  return (
    <>
      {googleAnalyticsId && <GoogleAnalytics measurementId={googleAnalyticsId} />}
      {googleSearchConsoleId && <SearchConsoleVerification verificationCode={googleSearchConsoleId} />}
      {bingVerificationId && <BingVerification verificationCode={bingVerificationId} />}
      {facebookDomainVerificationId && <FacebookDomainVerification verificationCode={facebookDomainVerificationId} />}
      {enableWebVitals && <WebVitalsTracking />}
      {enablePerformanceMonitoring && <SEOPerformanceMonitor />}
    </>
  );
}