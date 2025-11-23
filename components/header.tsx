"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/theme-toggle";
import FilterPanel from "@/components/movie/filter-panel";
import Sidebar from "@/components/sidebar";
import Link from 'next/link';
import { useLoading } from "@/components/ui/loading-context";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const { showLoading, hideLoading } = useLoading();
  const [showSidebar, setShowSidebar] = useState(false);

  const isActiveLink = (href: string) => {
    return pathname === href;
  };

  const isActiveTopic = (topicSlug: string) => {
    return pathname === "/" && searchParams.get("topic") === topicSlug;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showLoading();
      try {
        await router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
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
        const res = await fetch(`https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(searchQuery.trim())}&limit=6`);
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
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/95 shadow-lg">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center">
          <h1
            onClick={() => {
              showLoading();
              try {
                router.push("/");
              } finally {
                hideLoading();
              }
            }}
            className="text-2xl font-extrabold cursor-pointer mr-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Phim Ảnh
          </h1>
          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-6 mx-6">
            <button
              onClick={() => {
                showLoading();
                try {
                  router.push("/new-updates");
                } finally {
                  hideLoading();
                }
              }}
              className={`text-sm font-medium transition-colors ${
                isActiveLink("/new-updates")
                  ? "text-blue-60 dark:text-blue-400"
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              }`}
            >
              Mới cập nhật
            </button>
            {topics?.map((topic) => (
              <button
                key={topic.slug}
                onClick={() => {
                  showLoading();
                  try {
                    router.push(`/?topic=${topic.slug}`);
                  } finally {
                    hideLoading();
                  }
                }}
                className={`text-sm font-medium transition-colors ${
                  isActiveTopic(topic.slug)
                    ? "text-blue-60 dark:text-blue-400"
                    : "text-gray-700 hover:text-blue-60 dark:text-gray-300 dark:hover:text-blue-400"
                }`}
              >
                {topic.name}
              </button>
            ))}
            <button
              onClick={() => {
                showLoading();
                router.push("/recently");
              }}
              className={`text-sm font-medium transition-colors ${
                isActiveLink("/recently")
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              }`}
            >
              Đã Xem Gần Đây
            </button>
          </div>
          {/* Desktop Filter */}
          <div className="hidden md:flex">
            <FilterPanel
              categories={categories}
              countries={countries}
            />
          </div>
       </div>
       <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </Button>
          {/* Mobile Filter Button */}
          <div className="md:hidden">
            <FilterPanel
              categories={categories}
              countries={countries}
            />
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20">
          <form
            onSubmit={handleSearch}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-xl mx-4 relative"
          >
            <div className="flex gap-2 relative">
              <Input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Tìm phim theo tên, thể loại, năm..."
                className="flex-1"
                autoFocus
                autoComplete="off"
              />
              <Button type="submit" size="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-80 overflow-auto">
                {suggestions.map((item, idx) => (
                  <li
                    key={item.slug}
                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${highlightedIndex === idx ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
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
                    <img src={item.poster_url} alt={item.name} className="w-10 h-14 object-cover rounded-lg border-gray-200 dark:border-gray-700" />
                    <div className="flex-1">
                      <div className="font-semibold text-base text-gray-900 dark:text-white line-clamp-1">{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.year} • {item.category?.map((cat: any) => cat.name).join(", ")}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </form>
        </div>
      )}

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
