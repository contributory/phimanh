"use client";

import EnhancedButton from "@/components/ui/enhanced-button";
import EnhancedInput from "@/components/ui/enhanced-input";
import { MaterialRipple, MaterialModal } from "@/components/ui/material-animations";
import { useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/theme-toggle";
import FilterPanel from "@/components/movie/filter-panel";
import Sidebar from "@/components/sidebar";
import Link from 'next/link';
import { useLoading } from "@/components/ui/loading-context";
import { Search, Menu, X } from "lucide-react";

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
    <nav className="sticky top-0 z-40 w-full glass-morphism material-elevation-2">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <MaterialRipple>
            <h1
              onClick={() => {
                showLoading();
                try {
                  router.push("/");
                } finally {
                  hideLoading();
                }
              }}
              className="text-2xl font-extrabold cursor-pointer mr-6 gradient-primary bg-clip-text text-transparent hover:scale-105 material-transition"
            >
              Phim Ảnh
            </h1>
          </MaterialRipple>
          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-6 mx-6">
            <MaterialRipple>
              <EnhancedButton
                variant="text"
                size="small"
                onClick={() => {
                  showLoading();
                  try {
                    router.push("/new-updates");
                  } finally {
                    hideLoading();
                  }
                }}
                className={isActiveLink("/new-updates") ? "text-primary" : ""}
              >
                Mới cập nhật
              </EnhancedButton>
            </MaterialRipple>
            {topics?.map((topic) => (
              <MaterialRipple key={topic.slug}>
                <EnhancedButton
                  variant="text"
                  size="small"
                  onClick={() => {
                    showLoading();
                    try {
                      router.push(`/?topic=${topic.slug}`);
                    } finally {
                      hideLoading();
                    }
                  }}
                  className={isActiveTopic(topic.slug) ? "text-primary" : ""}
                >
                  {topic.name}
                </EnhancedButton>
              </MaterialRipple>
            ))}
            <MaterialRipple>
              <EnhancedButton
                variant="text"
                size="small"
                onClick={() => {
                  showLoading();
                  router.push("/recently");
                }}
                className={isActiveLink("/recently") ? "text-primary" : ""}
              >
                Đã Xem Gần Đây
              </EnhancedButton>
            </MaterialRipple>
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
          <EnhancedButton
            variant="text"
            size="small"
            onClick={() => setShowSidebar(!showSidebar)}
            icon={<Menu />}
          />
          <ThemeToggle />
          <EnhancedButton
            variant="text"
            size="small"
            onClick={() => setShowSearch(!showSearch)}
            icon={<Search />}
          />
          {/* Mobile Filter Button */}
          <div className="md:hidden">
            <FilterPanel
              categories={categories}
              countries={countries}
            />
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
        <form onSubmit={handleSearch} className="w-full max-w-xl">
          <div className="flex gap-3 relative">
            <EnhancedInput
              variant="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Tìm phim theo tên, thể loại, năm..."
              clearable
              autoFocus
              icon={<Search />}
              className="flex-1"
            />
            <EnhancedButton
              type="submit"
              variant="contained"
              icon={<Search />}
            >
              Tìm
            </EnhancedButton>
            <EnhancedButton
              type="button"
              variant="outlined"
              icon={<X />}
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
                setSuggestions([]);
                setShowSuggestions(false);
              }}
            />
          </div>
          {/* Enhanced Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-3 material-surface material-elevation-2 rounded-xl z-50 max-h-80 overflow-auto material-scrollbar">
              {suggestions.map((item, idx) => (
                <MaterialRipple key={item.slug}>
                  <div
                    className={`flex items-center gap-4 px-4 py-3 cursor-pointer material-transition ${
                      highlightedIndex === idx
                        ? "bg-primary/10"
                        : "hover:bg-muted/50"
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
                      src={item.poster_url}
                      alt={item.name}
                      className="w-12 h-16 object-cover rounded-lg material-elevation-1"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-base line-clamp-1">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.year} • {item.category?.map((cat: any) => cat.name).join(", ")}
                      </div>
                    </div>
                  </div>
                </MaterialRipple>
              ))}
            </div>
          )}
        </form>
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
