import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GTM from "@/components/ui/GTM";
import PageTransition from "@/components/ui/page-transition";

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
    default: "Phim Ảnh - Xem phim chất lượng cao miễn phí",
    template: "%s | Phim Ảnh"
  },
  description: "Kho phim chất lượng cao, cập nhật liên tục, xem miễn phí mọi lúc mọi nơi.",
  keywords: [
    "phim ảnh", "xem phim", "phim hd", "phim miễn phí", "phim mới nhất", "anime", "phim bộ", "phim lẻ", "phim chiếu rạp"
  ],
  metadataBase: new URL("https://phimanh.mywire.org"),
  openGraph: {
    title: "Phim Ảnh - Xem phim chất lượng cao miễn phí",
    description: "Kho phim chất lượng cao, cập nhật liên tục, xem miễn phí mọi lúc mọi nơi.",
    url: "https://phimanh.netlify.app",
    siteName: "Phim Ảnh",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://phimanh.mywire.org" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GTM />
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
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
