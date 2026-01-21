"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-zinc-800 bg-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-2xl font-black text-primary tracking-tighter uppercase mb-2">
              PHIMANH
            </span>
            <p className="text-zinc-500 text-sm max-w-xs text-center md:text-left">
              Trải nghiệm điện ảnh chất lượng cao với giao diện tối giản và chuyên nghiệp.
            </p>
          </div>

          <div className="flex gap-8 text-sm font-bold uppercase tracking-widest text-zinc-400">
            <Link href="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link href="/new-updates" className="hover:text-primary transition-colors">
              Mới cập nhật
            </Link>
            <Link href="/recently" className="hover:text-primary transition-colors">
              Đã xem
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-900 text-center">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} PHIMANH. Giao diện được thiết kế tối giản cho trải nghiệm tốt nhất.
          </p>
        </div>
      </div>
    </footer>
  );
}
