"use client";

import { MaterialRipple } from "@/components/ui/material-animations";
import { useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Link from "next/link";
import { useLoading } from "@/components/ui/loading-context";
import { Search, Menu, X, ChevronDown, ArrowRight, Clock3 } from "lucide-react";
import { Suspense } from "react";

interface HeaderProps {
  categories?: { slug: string; name: string }[];
  countries?: { slug: string; name: string }[];
  topics?: { slug: string; name: string }[];
}

function HeaderContent({
  categories = [],
  countries = [],
  topics = [],
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("query") || "";
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showLoading } = useLoading();
  const [showSidebar, setShowSidebar] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showSearch) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSearch]);

  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  const syncQueryToUrl = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    const normalized = value.trim();

    if (normalized) params.set("query", value);
    else params.delete("query");

    if (pathname === "/search") params.delete("index");

    const nextUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState(null, "", nextUrl);
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const updateSearchQuery = (value: string) => {
    setSearchQuery(value);
    syncQueryToUrl(value);
  };

  const clearSearch = () => {
    updateSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const isActiveLink = (href: string) => pathname === href;
  const isActiveTopic = (topicSlug: string) =>
    pathname === `/topic/${topicSlug}`;
  const isActiveCountry = (countrySlug: string) =>
    pathname === `/country/${countrySlug}`;

  const runSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;

    const target = `/search?query=${encodeURIComponent(query)}`;
    showLoading();
    closeSearch();

    if (pathname === "/search") {
      window.history.replaceState(null, "", target);
      router.refresh();
      return;
    }

    router.push(target);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch();
  };

  const openSuggestion = (movie: any) => {
    if (!movie?.slug) return;
    const params = new URLSearchParams();
    params.set("slug", movie.slug);
    if (searchQuery.trim()) params.set("query", searchQuery.trim());
    showLoading();
    closeSearch();
    router.push(`/watch?${params.toString()}`);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const res = await fetch(
          `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(
            searchQuery.trim(),
          )}&limit=6`,
        );
        const data = await res.json();
        setSuggestions(data.data.items || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <>
      <div
        aria-hidden="true"
        className="h-[var(--app-header-safe-height)] w-full shrink-0"
      />
      <nav className={`fixed inset-x-0 top-0 z-[100] w-full pt-[var(--app-safe-top)] transition-all duration-300 ${scrolled ? 'border-b border-white/[0.06] bg-[#070707]/88 backdrop-blur-xl' : 'bg-gradient-to-b from-black/75 via-black/35 to-transparent'}`}>
        <div className="mx-auto flex h-[var(--app-header-height)] w-full max-w-[1500px] items-center justify-between px-4 md:px-8 lg:px-10">
        <div className="flex items-center gap-10">
          <div
            onClick={() => {
              showLoading();
              router.push("/");
            }}
            className="flex items-center cursor-pointer"
          >
            <span className="text-[22px] font-bold tracking-[-0.04em] text-white transition-opacity duration-200 hover:opacity-80">
              PHIMANH
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-7">
            <Link
              href="/new-updates"
              className={`nav-link text-sm font-medium transition-colors ${
                isActiveLink("/new-updates")
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Mới nhất
            </Link>

            <Link
              href="/foryou"
              className={`nav-link text-sm font-medium transition-colors ${
                isActiveLink("/foryou")
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Dành cho bạn
            </Link>

            <div className="relative group/dropdown">
              <button
                className={`nav-link flex items-center gap-1 text-sm font-medium transition-colors ${
                  topics.some((t) => isActiveTopic(t.slug))
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>Danh mục</span>
                <ChevronDown className="w-4 h-4 transition-transform group-hover/dropdown:rotate-180" />
              </button>

              <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-white/[0.08] bg-zinc-950/95 py-2 opacity-0 invisible shadow-2xl backdrop-blur-xl transition-all duration-200 group-hover/dropdown:visible group-hover/dropdown:opacity-100">
                {topics.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`/topic/${topic.slug}`}
                    className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActiveTopic(topic.slug)
                        ? "bg-white/[0.06] text-white"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    {topic.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/recently"
              className={`nav-link text-sm font-medium transition-colors ${
                isActiveLink("/recently")
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Tiếp tục xem
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setShowSearch(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            aria-label="Mở tìm kiếm"
            className={`flex h-9 items-center gap-2 rounded-full border px-2.5 text-sm transition md:min-w-[140px] md:max-w-[220px] ${
              showSearch
                ? "border-white/15 bg-white/[0.09] text-white"
                : "border-white/[0.07] bg-white/[0.035] text-zinc-400 hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            <Search className="h-4.5 w-4.5 shrink-0" />
            <span className="hidden min-w-0 flex-1 truncate text-left md:block">
              {urlQuery || "Tìm kiếm"}
            </span>
          </button>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.07] hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {showSearch && (
        <>
          <button
            aria-label="Đóng tìm kiếm"
            onClick={closeSearch}
            className="fixed inset-0 z-[55] cursor-default bg-black/55 backdrop-blur-[2px]"
          />
          <div className="fixed left-0 right-0 top-[var(--app-header-safe-height)] z-[60] px-3 sm:px-4 md:px-8">
            <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111111] shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
              <form onSubmit={handleSearch} className="p-3 sm:p-4">
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1.5 transition focus-within:border-white/20 focus-within:bg-white/[0.055]">
                  <Search className="ml-2 h-5 w-5 shrink-0 text-zinc-500" />
                  <input
                    ref={inputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => updateSearchQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Tên phim, diễn viên hoặc từ khóa..."
                    autoComplete="off"
                    className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-[15px] font-medium text-white outline-none placeholder:text-zinc-500 sm:text-base"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
                      aria-label="Xóa từ khóa"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!searchQuery.trim()}
                    className="hidden h-9 shrink-0 items-center gap-1.5 rounded-lg bg-white px-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-35 sm:flex"
                  >
                    Tìm kiếm
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-zinc-500">
                  <span>Nhập ít nhất 2 ký tự để xem gợi ý</span>
                  <span className="hidden sm:inline">Enter để tìm · Esc để đóng</span>
                </div>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div className="border-t border-white/[0.07] p-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    Gợi ý
                  </div>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {suggestions.map((movie: any) => {
                      const poster = movie.poster_url || movie.thumb_url;
                      const posterUrl = poster?.startsWith("http")
                        ? poster
                        : poster
                          ? `https://phimimg.com/${poster}`
                          : "/placeholder-movie.png";

                      return (
                        <button
                          key={movie.slug}
                          type="button"
                          onClick={() => openSuggestion(movie)}
                          className="flex min-w-0 items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-white/[0.055]"
                        >
                          <img
                            src={posterUrl}
                            alt=""
                            className="h-14 w-10 shrink-0 rounded-md object-cover bg-zinc-900"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-zinc-100">
                              {movie.name}
                            </span>
                            <span className="mt-1 block truncate text-xs text-zinc-500">
                              {[movie.origin_name, movie.year].filter(Boolean).join(" · ")}
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-white/[0.07] p-3 sm:hidden">
                <button
                  type="button"
                  onClick={runSearch}
                  disabled={!searchQuery.trim()}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black disabled:opacity-35"
                >
                  Tìm kiếm
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <Suspense fallback={null}>
        <Sidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          categories={categories}
          countries={countries}
          topics={topics}
        />
      </Suspense>
      </nav>
    </>
  );
}

export default function Header(props: HeaderProps) {
  return (
    <Suspense fallback={null}>
      <HeaderContent {...props} />
    </Suspense>
  );
}
