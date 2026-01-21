"use client";

import {
  MaterialRipple,
} from "@/components/ui/material-animations";
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

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const isActiveLink = (href: string) => pathname === href;
  const isActiveTopic = (topicSlug: string) => pathname === `/topic/${topicSlug}`;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showLoading();
      await router.push(
        `/search?query=${encodeURIComponent(searchQuery.trim())}`
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
            searchQuery.trim()
          )}&limit=6`
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
    <nav className="sticky top-0 z-[100] w-full">
      <div className="backdrop-blur-xl bg-background/80 border-b border-border shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center">
            <div
              onClick={() => {
                showLoading();
                router.push("/");
              }}
              className="flex items-center cursor-pointer mr-10"
            >
              <span className="text-2xl font-black text-red-600 tracking-tighter uppercase">
                PHIMANH
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              <Link
                href="/new-updates"
                className={`text-xs font-black transition-colors uppercase tracking-[0.2em] ${
                  isActiveLink("/new-updates") ? "text-red-600" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mới nhất
              </Link>

              <Link
                href="/foryou"
                className={`text-xs font-black transition-colors uppercase tracking-[0.2em] ${
                  isActiveLink("/foryou") ? "text-red-600" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dành cho bạn
              </Link>

              <div className="relative group/dropdown">
                <button
                  className={`flex items-center gap-1 text-xs font-black transition-colors uppercase tracking-[0.2em] ${
                    topics.some((t) => isActiveTopic(t.slug)) ? "text-red-600" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Danh mục</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                <div className="absolute top-full left-0 mt-0 w-48 py-2 bg-popover border border-border opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-50 shadow-xl">
                  {topics.map((topic) => (
                    <Link
                      key={topic.slug}
                      href={`/topic/${topic.slug}`}
                      className={`block px-4 py-3 text-xs font-bold transition-colors uppercase tracking-widest ${
                        isActiveTopic(topic.slug)
                          ? "text-red-600 bg-accent"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {topic.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/recently"
                className={`text-xs font-black transition-colors uppercase tracking-[0.2em] ${
                  isActiveLink("/recently") ? "text-red-600" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Đã xem
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setShowSearch(true);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="fixed inset-0 z-[60] bg-background/98 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="container mx-auto px-6 py-12">
            <div className="flex justify-end mb-12">
              <button onClick={closeSearch} className="text-muted-foreground hover:text-foreground transition-colors">
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
                  className="w-full bg-transparent pl-14 pr-4 py-6 text-3xl md:text-5xl text-foreground outline-none placeholder:text-muted-foreground/40 font-black uppercase tracking-tighter"
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
