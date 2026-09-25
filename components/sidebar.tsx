"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Filter,
  Globe2,
  Heart,
  Home,
  Layers3,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import { useLoading } from "@/components/ui/loading-context";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: { slug: string; name: string }[];
  countries?: { slug: string; name: string }[];
  topics?: { slug: string; name: string }[];
}

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 20 }, (_, index) => ({
  value: String(currentYear - index),
  label: String(currentYear - index),
}));

type SectionKey = "categories" | "countries" | "years" | "filter";

export default function Sidebar({
  isOpen,
  onClose,
  categories = [],
  countries = [],
  topics = [],
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { showLoading } = useLoading();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    categories: false,
    countries: false,
    years: false,
    filter: false,
  });
  const [filters, setFilters] = useState({
    typeList: "",
    sortField: "modified.time",
    sortType: "desc",
    category: "",
    country: "",
    year: "",
    limit: "20",
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    onClose();
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const navigate = () => {
    showLoading();
    onClose();
  };

  const toggle = (key: SectionKey) => {
    setExpanded((current) => ({ ...current, [key]: !current[key] }));
  };

  const applyFilter = () => {
    const params = new URLSearchParams();
    if (filters.typeList) params.set("typeList", filters.typeList);
    if (filters.sortField) params.set("sortField", filters.sortField);
    if (filters.sortType) params.set("sortType", filters.sortType);
    if (filters.category) params.set("category", filters.category);
    if (filters.country) params.set("country", filters.country);
    if (filters.year) params.set("year", filters.year);
    if (filters.limit) params.set("limit", filters.limit);

    showLoading();
    onClose();
    router.push(`/filter?${params.toString()}`);
  };

  const primaryLinks = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/foryou", label: "Dành cho bạn", icon: Heart },
    { href: "/new-updates", label: "Mới cập nhật", icon: Sparkles },
    { href: "/recently", label: "Tiếp tục xem", icon: Clock3 },
  ];

  const sectionButton = (
    key: SectionKey,
    label: string,
    Icon: typeof Layers3,
  ) => (
    <button
      type="button"
      onClick={() => toggle(key)}
      aria-expanded={expanded[key]}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-300 transition hover:bg-white/[0.055] hover:text-white"
    >
      <Icon className="h-4 w-4 text-zinc-500" />
      <span className="flex-1">{label}</span>
      <ChevronDown
        className={`h-4 w-4 text-zinc-600 transition-transform ${expanded[key] ? "rotate-180" : ""}`}
      />
    </button>
  );

  const selectClass =
    "h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 text-xs text-zinc-200 outline-none transition focus:border-white/20 focus:bg-white/[0.055]";

  const content = (
    <>
      <button
        aria-label="Đóng menu"
        className={`fixed inset-0 z-[190] bg-black/65 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Điều hướng"
        aria-hidden={!isOpen}
        className={`fixed bottom-0 left-0 top-0 z-[200] flex w-[92vw] max-w-[390px] flex-col border-r border-white/[0.08] bg-[#090909]/98 pt-[var(--app-safe-top)] shadow-[30px_0_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"}`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-white/[0.07] px-4">
          <div>
            <div className="text-[17px] font-bold tracking-[-0.04em] text-white">
              PHIMANH
            </div>
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-600">
              Điều hướng
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Đóng sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-1">
            {primaryLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={navigate}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-white/[0.09] text-white" : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"}`}
                >
                  {active && (
                    <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-white" />
                  )}
                  <Icon className={`h-4 w-4 ${active ? "text-white" : "text-zinc-600 group-hover:text-zinc-300"}`} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {topics.length > 0 && (
            <section className="mt-6 border-t border-white/[0.06] pt-5">
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                Danh mục nổi bật
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {topics.map((topic) => {
                  const active = pathname === `/topic/${topic.slug}`;
                  return (
                    <Link
                      key={topic.slug}
                      href={`/topic/${topic.slug}`}
                      onClick={navigate}
                      className={`flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition ${active ? "border-white/20 bg-white/[0.09] text-white" : "border-white/[0.05] bg-white/[0.02] text-zinc-500 hover:border-white/10 hover:bg-white/[0.05] hover:text-zinc-200"}`}
                    >
                      <Play className="h-3 w-3 shrink-0" />
                      <span className="truncate">{topic.name}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <section className="mt-6 space-y-1 border-t border-white/[0.06] pt-5">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
              Duyệt nhanh
            </p>

            {sectionButton("categories", "Thể loại", Layers3)}
            {expanded.categories && (
              <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                {categories.map((item) => {
                  const href = `/category/${item.slug}`;
                  const active = pathname === href;
                  return (
                    <Link
                      key={item.slug}
                      href={href}
                      onClick={navigate}
                      className={`truncate rounded-lg px-2.5 py-2 text-xs transition ${active ? "bg-white/[0.09] text-white" : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"}`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}

            {sectionButton("countries", "Quốc gia", Globe2)}
            {expanded.countries && (
              <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                {countries.map((item) => {
                  const href = `/country/${item.slug}`;
                  const active = pathname === href;
                  return (
                    <Link
                      key={item.slug}
                      href={href}
                      onClick={navigate}
                      className={`truncate rounded-lg px-2.5 py-2 text-xs transition ${active ? "bg-white/[0.09] text-white" : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"}`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}

            {sectionButton("years", "Năm phát hành", CalendarDays)}
            {expanded.years && (
              <div className="grid grid-cols-4 gap-1.5 px-2 pb-2">
                {YEAR_OPTIONS.map((year) => {
                  const href = `/year/${year.value}`;
                  const active = pathname === href;
                  return (
                    <Link
                      key={year.value}
                      href={href}
                      onClick={navigate}
                      className={`rounded-lg border px-2 py-2 text-center text-[11px] font-medium transition ${active ? "border-white/20 bg-white/[0.09] text-white" : "border-white/[0.05] text-zinc-500 hover:border-white/10 hover:bg-white/[0.05] hover:text-zinc-200"}`}
                    >
                      {year.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-6 border-t border-white/[0.06] pt-5">
            {sectionButton("filter", "Bộ lọc chi tiết", Filter)}
            {expanded.filter && (
              <div className="mt-2 space-y-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    aria-label="Loại phim"
                    value={filters.typeList}
                    onChange={(event) => setFilters({ ...filters, typeList: event.target.value })}
                    className={selectClass}
                  >
                    <option value="">Mọi loại</option>
                    <option value="phim-bo">Phim bộ</option>
                    <option value="phim-le">Phim lẻ</option>
                    <option value="tv-shows">TV Shows</option>
                    <option value="hoat-hinh">Hoạt hình</option>
                  </select>
                  <select
                    aria-label="Thứ tự"
                    value={filters.sortType}
                    onChange={(event) => setFilters({ ...filters, sortType: event.target.value })}
                    className={selectClass}
                  >
                    <option value="desc">Mới trước</option>
                    <option value="asc">Cũ trước</option>
                  </select>
                </div>

                <select
                  aria-label="Thể loại"
                  value={filters.category}
                  onChange={(event) => setFilters({ ...filters, category: event.target.value })}
                  className={selectClass}
                >
                  <option value="">Mọi thể loại</option>
                  {categories.map((item) => (
                    <option key={item.slug} value={item.slug}>{item.name}</option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    aria-label="Quốc gia"
                    value={filters.country}
                    onChange={(event) => setFilters({ ...filters, country: event.target.value })}
                    className={selectClass}
                  >
                    <option value="">Mọi quốc gia</option>
                    {countries.map((item) => (
                      <option key={item.slug} value={item.slug}>{item.name}</option>
                    ))}
                  </select>
                  <select
                    aria-label="Năm"
                    value={filters.year}
                    onChange={(event) => setFilters({ ...filters, year: event.target.value })}
                    className={selectClass}
                  >
                    <option value="">Mọi năm</option>
                    {YEAR_OPTIONS.map((year) => (
                      <option key={year.value} value={year.value}>{year.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={applyFilter}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white text-xs font-semibold text-black transition hover:bg-zinc-200"
                >
                  Áp dụng bộ lọc
                  <Filter className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="border-t border-white/[0.06] px-4 py-3 text-[10px] leading-4 text-zinc-700">
          Nội dung được tổ chức theo thể loại, quốc gia và năm để truy cập nhanh hơn.
        </div>
      </aside>
    </>
  );

  if (!mounted) return null;

  return createPortal(
    content,
    document.getElementById("sidebar-root") || document.body,
  );
}
