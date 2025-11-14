"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-700 bg-gray-900 py-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="w-full flex flex-col items-center justify-center py-0">
          <p className="text-base text-gray-300 dark:text-gray-300 font-bold mb-0">
            © {new Date().getFullYear()} Rạp Phim Chill. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-400 font-semibold">
            Thiết kế & phát triển bởi <span className="font-bold text-blue-400">Kim Đình Phương</span> cùng <span className="font-bold text-purple-400">StarFall Org</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
