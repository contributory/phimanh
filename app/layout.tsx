import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GTM from "@/components/ui/GTM";
import PageTransition from "@/components/ui/page-transition";
import { LoadingProvider } from "@/components/ui/loading-context";
import { WebsiteStructuredData, OrganizationStructuredData } from "@/components/seo/structured-data";
import EnhancedGTMTracking from "@/components/seo/enhanced-gtm";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Phim Ảnh - Xem phim HD chất lượng cao miễn phí 2024",
    template: "%s | Phim Ảnh"
  },
  description: "Kho phim ảnh HD chất lượng cao với hơn 50,000+ bộ phim thuộc mọi thể loại. Xem phim online miễn phí, cập nhật phim mới nhất 2024 hàng ngày.",
  keywords: [
    "phim ảnh", "xem phim HD", "phim chất lượng cao", "phim miễn phí 2024", "phim mới nhất",
    "phim bộ Trung Quốc", "phim Hàn Quốc", "phim Thái Lan", "anime vietsub",
    "phim lẻ chiếu rạp", "phim hành động", "phim tình cảm", "phim kinh dị",
    "xem phim online", "phim hay 2024", "phimanhd"
  ],
  metadataBase: new URL("https://phimanh.netlify.app"),
  
  // Enhanced Open Graph
  openGraph: {
    title: "Phim Ảnh - Kho phim HD chất lượng cao miễn phí",
    description: "Khám phá hơn 50,000+ bộ phim HD chất lượng cao thuộc mọi thể loại. Cập nhật phim mới 2024 hàng ngày, xem miễn phí không quảng cáo.",
    url: "https://phimanh.netlify.app",
    siteName: "Phim Ảnh",
    type: "website",
    locale: "vi_VN",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Phim Ảnh - Xem phim HD chất lượng cao miễn phí",
      },
    ],
  },
  
  // Enhanced Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@phimanh",
    title: "Phim Ảnh - Xem phim HD chất lượng cao miễn phí",
    description: "Kho phim ảnh HD chất lượng cao với hơn 50,000+ bộ phim thuộc mọi thể loại.",
    images: ["/twitter-image.jpg"],
  },
  
  // Additional metadata
  applicationName: "Phim Ảnh",
  referrer: "origin-when-cross-origin",
  creator: "Phim Ảnh Team",
  publisher: "Phim Ảnh",
  category: "Entertainment",
  classification: "Movie Streaming Website",
  
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Verification
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  
  // Additional SEO
  alternates: {
    canonical: "https://phimanh.netlify.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://phimanh.netlify.app" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/favicon.ico" />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = null;
                  var systemTheme = 'light';
                  
                  // Only access localStorage if available
                  if (typeof Storage !== 'undefined') {
                    try {
                      savedTheme = localStorage.getItem('theme');
                    } catch (e) {
                      // localStorage not available or blocked
                    }
                  }
                  
                  // Only check system preference if matchMedia is available
                  if (typeof window !== 'undefined' && window.matchMedia) {
                    try {
                      systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    } catch (e) {
                      // matchMedia not available
                    }
                  }
                  
                  var theme = savedTheme || systemTheme;
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  // Fallback: do nothing
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <GTM />
        <EnhancedGTMTracking />
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WP2MWVB8"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        {/* Structured Data */}
        <WebsiteStructuredData url="https://phimanh.netlify.app" />
        <OrganizationStructuredData url="https://phimanh.netlify.app" />
        
        <LoadingProvider>
          <PageTransition>
            {children}
          </PageTransition>
        </LoadingProvider>
        {/* Global Sidebar - may be modified by browser extensions */}
        <div id="sidebar-root" suppressHydrationWarning></div>
      </body>
    </html>
  );
}
