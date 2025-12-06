import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* SEO Optimizations */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "phimimg.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enhanced Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Hydration optimization
  reactStrictMode: false, // Disable strict mode to prevent double hydration issues

  // Bundle optimization
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lucide-react'],
  },



  // Security headers for better SEO
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // SEO-friendly redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
