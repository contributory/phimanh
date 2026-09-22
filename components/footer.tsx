"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#070707] py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center md:items-start">
            <span className="mb-2 text-2xl font-bold tracking-[-0.04em] text-zinc-100">
              PHIMANH
            </span>
            <p className="max-w-xs text-center text-sm leading-6 text-zinc-400 md:text-left">
              Trải nghiệm điện ảnh chất lượng cao với giao diện tối giản và chuyên nghiệp.
            </p>
          </div>

          <div className="flex gap-8 text-sm font-medium text-zinc-400">
            <Link href="/" className="transition-colors hover:text-white">
              Trang chủ
            </Link>
            <Link href="/new-updates" className="transition-colors hover:text-white">
              Mới cập nhật
            </Link>
            <Link href="/recently" className="transition-colors hover:text-white">
              Đã xem
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-8 text-center">
          <p className="text-xs font-medium leading-5 text-zinc-500">
            © {new Date().getFullYear()} PHIMANH. Trang web dành cho mục đích giáo dục, chúng tôi không lưu trữ và không chịu trách nhiệm cho nội dung xuất hiện trên trang web này.
          </p>
        </div>
      </div>
    </footer>
  );
}
