"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full mt-12 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="w-full flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Phim Ảnh
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
            Khám phá kho tàng phim ảnh chất lượng cao với hình ảnh và âm thanh hoàn hảo
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Trang chủ
            </Link>
            <span className="text-gray-300 dark:text-gray-700">___</span>
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 w-full max-w-md">
            <p className="text-center text-xs text-gray-500 dark:text-gray-500">
              © {new Date().getFullYear()} Phim Ảnh. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
