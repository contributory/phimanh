"use client";

import EnhancedButton from "@/components/ui/enhanced-button";
import EnhancedInput from "@/components/ui/enhanced-input";
import {
  MaterialRipple,
  MaterialModal,
} from "@/components/ui/material-animations";
import { useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/theme-toggle";
import FilterPanel from "@/components/movie/filter-panel";
import Sidebar from "@/components/sidebar";
import Link from "next/link";
import { useLoading } from "@/components/ui/loading-context";
import { Search, Menu, X, Film, Sparkles, Clock, Play, ChevronDown } from "lucide-react";

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
  const searchParams = useSearchParams();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showTopicsDropdown, setShowTopicsDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showLoading, hideLoading } = useLoading();
  const [showSidebar, setShowSidebar] = useState(false);

  const isActiveLink = (href: string) => {
    return pathname === href;
  };

  const isActiveTopic = (topicSlug: string) => {
    return pathname === `/topic/${topicSlug}`;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showLoading();
      try {
        await router.push(
          `/search?query=${encodeURIComponent(searchQuery.trim())}`
        );
      } finally {
        hideLoading();
        setShowSearch(false);
        setSearchQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  // Fetch suggestions as user types
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
    fetchSuggestions();
  }, [searchQuery]);

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      const selected = suggestions[highlightedIndex];
      if (selected) {
        showLoading();
        try {
          router.push(`/watch?slug=${selected.slug}`);
        } finally {
          hideLoading();
          setShowSearch(false);
          setSearchQuery("");
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full">
      {/* Main Header Bar */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-black/5">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Left Section: Logo & Navigation */}
          <div className="flex items-center gap-2 md:gap-6">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <MaterialRipple>
              <div
                onClick={() => {
                  showLoading();
                  router.push("/");
                  hideLoading();
                }}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-105">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <span className="hidden sm:block text-xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Phim Ảnh
                </span>
              </div>
            </MaterialRipple>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {/* New Updates */}
              <Link
                href="/new-updates"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${isActiveLink("/new-updates")
                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Mới cập nhật</span>
              </Link>

              {/* Topics Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowTopicsDropdown(!showTopicsDropdown)}
                  onBlur={() => setTimeout(() => setShowTopicsDropdown(false), 200)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${topics.some(t => isActiveTopic(t.slug))
                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  <Play className="w-4 h-4" />
                  <span>Danh mục</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTopicsDropdown ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {showTopicsDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    {topics.map((topic) => (
                      <Link
                        key={topic.slug}
                        href={`/topic/${topic.slug}`}
                        className={`block px-4 py-2.5 text-sm font-medium transition-colors ${isActiveTopic(topic.slug)
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                      >
                        {topic.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Recently Watched */}
              <Link
                href="/recently"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${isActiveLink("/recently")
                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                <Clock className="w-4 h-4" />
                <span>Đã xem</span>
              </Link>

              {/* Filter Panel */}
              <FilterPanel categories={categories} countries={countries} />
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button - Clickable on all devices */}
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all"
              aria-label="Tìm kiếm phim"
            >
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-300">Tìm kiếm...</span>
              <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 text-xs font-medium bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-gray-500">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Desktop Menu Button */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="hidden md:flex p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Filter */}
            <div className="lg:hidden">
              <FilterPanel categories={categories} countries={countries} />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Modal */}
      <MaterialModal
        open={showSearch}
        onClose={() => {
          setShowSearch(false);
          setSearchQuery("");
          setSuggestions([]);
          setShowSuggestions(false);
        }}
      >
        <div className="w-full max-w-2xl max-h-[85vh] flex flex-col">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tìm kiếm phim</h2>
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search Input with inline button */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tên phim..."
                className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-gray-400"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex-shrink-0"
              aria-label="Tìm kiếm"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Suggestions - Scrollable */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-4 flex-1 overflow-hidden">
              <p className="text-sm text-gray-500 mb-2">Kết quả nhanh ({suggestions.length})</p>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[50vh]">
                {suggestions.map((item, idx) => (
                  <div
                    key={`${item.slug}-${idx}`}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${highlightedIndex === idx
                        ? "bg-blue-50 dark:bg-blue-900/30"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    onMouseDown={() => {
                      showLoading();
                      router.push(`/watch?slug=${item.slug}`);
                      hideLoading();
                      setShowSearch(false);
                      setSearchQuery("");
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                  >
                    <img
                      src={item.poster_url?.startsWith("http") ? item.poster_url : `https://phimimg.com/${item.poster_url}`}
                      alt={item.name}
                      className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1 text-sm">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {item.year} • {item.category?.map((cat: any) => cat.name).join(", ")}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded flex-shrink-0">
                      {item.quality || "HD"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!showSuggestions && !searchQuery && (
            <div className="mt-6 text-center text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nhập tên phim để tìm kiếm</p>
            </div>
          )}

          {/* Keyboard hints - Desktop only */}
          <div className="hidden sm:flex mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↑↓</kbd>
              chọn
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Enter</kbd>
              xác nhận
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">ESC</kbd>
              đóng
            </span>
          </div>
        </div>
      </MaterialModal>

      {/* Sidebar */}
      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        categories={categories}
        countries={countries}
        topics={topics}
      />
    </nav>
  );
}

