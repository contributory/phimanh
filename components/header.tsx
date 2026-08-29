"use client";

import { MaterialRipple } from "@/components/ui/material-animations";
import { useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/theme-toggle";
import Sidebar from "@/components/sidebar";
import Link from "next/link";
import { useLoading } from "@/components/ui/loading-context";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { Suspense } from "react";

interface HeaderProps {
  categories?: { slug: string; name: string }[];
  countries?: { slug: string; name: string }[];
  topics?: { slug: string; name: string }[];
}

export default function Header({
  categories = [],
  countries = [],
  topics = [],
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const isActiveLink = (href: string) => pathname === href;
  const isActiveTopic = (topicSlug: string) =>
    pathname === `/topic/${topicSlug}`;
  const isActiveCountry = (countrySlug: string) =>
    pathname === `/country/${countrySlug}`;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showLoading();
      await router.push(
        `/search?query=${encodeURIComponent(searchQuery.trim())}`,
      );
      closeSearch();
    }
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
    <nav className={`fixed top-0 z-[100] w-full transition-all duration-500 ${scrolled ? 'bg-background/98 backdrop-blur-xl shadow-2xl border-b border-border' : 'bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-sm'}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <div
            onClick={() => {
              showLoading();
              router.push("/");
            }}
            className="flex items-center cursor-pointer"
          >
            <span className="text-3xl font-black text-[#E50914] tracking-tighter uppercase drop-shadow-lg hover:scale-105 transition-transform duration-300">
              PHIMANH
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/new-updates"
              className={`nav-link text-xs font-black transition-colors uppercase tracking-[0.2em] ${
                isActiveLink("/new-updates")
                  ? "text-[#E50914]"
                  : "text-muted-foreground/80 hover:text-white"
              }`}
            >
              Mới nhất
            </Link>

            <Link
              href="/foryou"
              className={`nav-link text-xs font-black transition-colors uppercase tracking-[0.2em] ${
                isActiveLink("/foryou")
                  ? "text-[#E50914]"
                  : "text-muted-foreground/80 hover:text-white"
              }`}
            >
              Dành cho bạn
            </Link>

            <div className="relative group/dropdown">
              <button
                className={`nav-link flex items-center gap-1 text-xs font-black transition-colors uppercase tracking-[0.2em] ${
                  topics.some((t) => isActiveTopic(t.slug))
                    ? "text-[#E50914]"
                    : "text-muted-foreground/80 hover:text-white"
                }`}
              >
                <span>Danh mục</span>
                <ChevronDown className="w-4 h-4 transition-transform group-hover/dropdown:rotate-180" />
              </button>

              <div className="absolute top-full left-0 mt-2 w-56 py-3 bg-card/98 backdrop-blur-xl border border-border opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 z-50 shadow-2xl rounded-sm">
                {topics.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`/topic/${topic.slug}`}
                    className={`block px-5 py-3 text-xs font-bold transition-all uppercase tracking-widest ${
                      isActiveTopic(topic.slug)
                        ? "text-[#E50914] bg-primary/10"
                        : "text-muted-foreground hover:text-white hover:bg-accent/50"
                    }`}
                  >
                    {topic.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/recently"
              className={`nav-link text-xs font-black transition-colors uppercase tracking-[0.2em] ${
                isActiveLink("/recently")
                  ? "text-[#E50914]"
                  : "text-muted-foreground/80 hover:text-white"
              }`}
            >
              Đã xem
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setShowSearch(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className="text-muted-foreground/70 hover:text-white transition-colors hover:scale-110 transform duration-200"
          >
            <Search className="w-5 h-5" />
          </button>

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-muted-foreground/70 hover:text-white transition-colors hover:scale-110 transform duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="fixed inset-0 z-[60] bg-background/98 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="container mx-auto px-6 py-12">
            <div className="flex justify-end mb-12">
              <button
                onClick={closeSearch}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-10 h-10" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="relative border-b-2 border-border focus-within:border-primary transition-colors">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-muted-foreground/60" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full bg-transparent pl-14 pr-4 py-6 text-3xl md:text-5xl text-foreground outline-none placeholder:text-muted-foreground/40 font-black tracking-tighter"
                />
              </div>
            </form>
          </div>
        </div>
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
  );
}
