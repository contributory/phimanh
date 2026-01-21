"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/components/ui/loading-context";
import {
  Home,
  Sparkles,
  Film,
  Clock,
  Layers,
  Globe,
  Calendar,
  ChevronDown,
  ChevronRight,
  X,
  Play,
  Filter,
  Heart,
  Sun,
  Moon,
  Monitor
} from "lucide-react";
import { useMaterialTheme } from "@/components/providers/material-theme-provider";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: { slug: string; name: string }[];
  countries?: { slug: string; name: string }[];
  topics?: { slug: string; name: string }[];
}

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

export default function Sidebar({
  isOpen,
  onClose,
  categories = [],
  countries = [],
  topics = [],
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useMaterialTheme();
  const searchParams = useSearchParams();
  const [expandedSections, setExpandedSections] = useState({
    genres: false,
    countries: false,
    years: false,
    advancedFilter: false,
  });
  const [filters, setFilters] = useState({
    typeList: "",
    sortField: "modified.time",
    sortType: "desc",
    sortLang: "",
    category: "",
    country: "",
    year: "",
    limit: "20",
  });
  const [mounted, setMounted] = useState(false);
  const { showLoading } = useLoading();

  const isActiveLink = (href: string) => pathname === href;
  const isActiveTopic = (topicSlug: string) => pathname === `/topic/${topicSlug}`;
  const isActiveCategory = (categorySlug: string) => pathname === `/category/${categorySlug}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleLinkClick = (path: string) => {
    showLoading();
    router.push(path);
  };

  const handleApplyFilter = () => {
    showLoading();
    const params = new URLSearchParams();
    if (filters.typeList) params.set("typeList", filters.typeList);
    params.set("sortField", filters.sortField);
    params.set("sortType", filters.sortType);
    if (filters.sortLang) params.set("sortLang", filters.sortLang);
    if (filters.category) params.set("category", filters.category);
    if (filters.country) params.set("country", filters.country);
    if (filters.year) params.set("year", filters.year);
    params.set("limit", filters.limit);

    router.push(`/filter?${params.toString()}`);
  };

  const NavItem = ({
    href,
    icon: Icon,
    label,
    isActive,
    onClick
  }: {
    href: string;
    icon: any;
    label: string;
    isActive: boolean;
    onClick?: () => void;
  }) => (
    <Link
      href={href}
      onClick={onClick ? (e) => { e.preventDefault(); onClick(); } : undefined}
      className={`flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-200 group relative ${isActive
          ? "bg-accent/50 text-red-600 font-black"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
    >
      <div className={`p-2 transition-colors ${isActive
          ? "text-red-600"
          : "text-muted-foreground group-hover:text-foreground"
        }`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="flex-1 text-xs uppercase tracking-[0.2em]">{label}</span>
      {isActive && (
        <div className="w-1 h-6 bg-red-600 absolute left-0" />
      )}
    </Link>
  );

  const CollapsibleSection = ({
    icon: Icon,
    label,
    isExpanded,
    onToggle,
    children,
  }: {
    icon: any;
    label: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className="flex items-center gap-3 w-full px-4 py-3 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors group"
      >
        <div className="p-2 text-muted-foreground group-hover:text-foreground transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <span className="flex-1 text-left text-xs font-black uppercase tracking-[0.2em]">{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {isExpanded && (
        <div className="bg-accent/50 border-y border-border space-y-1 animate-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );

  const SubNavItem = ({
    href,
    label,
    isActive
  }: {
    href: string;
    label: string;
    isActive: boolean;
  }) => (
    <Link
      href={href}
      onClick={() => handleLinkClick(href)}
      className={`flex items-center gap-2 px-12 py-3 text-[10px] transition-colors uppercase tracking-widest ${isActive
          ? "bg-red-600/10 text-red-600 font-bold"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
    >
      <span>{label}</span>
    </Link>
  );

  const sidebarContent = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-[80%] md:w-[400px] lg:w-[500px] bg-background border-r border-border shadow-2xl z-[200] transform transition-transform duration-500 ease-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl font-black text-red-600 tracking-tighter uppercase">
              PHIMANH
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-accent transition-colors group"
          >
            <X className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground group-hover:text-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-10 space-y-10 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Theme Selection - Mobile only (sm and down) but nice for all */}
          <div className="px-8 space-y-4">
            <p className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.4em]">
              Giao diện
            </p>
            <div className="flex p-1 bg-accent/50 rounded-lg border border-border">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                  theme === 'light' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Sáng</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                  theme === 'dark' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Tối</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                  theme === 'system' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Máy</span>
              </button>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="space-y-2">
            <p className="px-8 mb-6 text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.4em]">
              Khám phá
            </p>
            <NavItem
              href="/"
              icon={Home}
              label="Trang Chủ"
              isActive={isActiveLink("/")}
              onClick={() => handleLinkClick("/")}
            />
            <NavItem
              href="/foryou"
              icon={Heart}
              label="Dành Cho Bạn"
              isActive={isActiveLink("/foryou")}
              onClick={() => handleLinkClick("/foryou")}
            />
            <NavItem
              href="/new-updates"
              icon={Sparkles}
              label="Mới Cập Nhật"
              isActive={isActiveLink("/new-updates")}
              onClick={() => handleLinkClick("/new-updates")}
            />
            <NavItem
              href="/recently"
              icon={Clock}
              label="Đã Xem"
              isActive={isActiveLink("/recently")}
              onClick={() => handleLinkClick("/recently")}
            />
          </div>

          {/* Topics Section */}
          <div className="space-y-2">
            <p className="px-8 mb-6 text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.4em]">
              Danh mục
            </p>
            {topics.map((topic) => (
              <NavItem
                key={topic.slug}
                href={`/topic/${topic.slug}`}
                icon={Play}
                label={topic.name}
                isActive={isActiveTopic(topic.slug)}
                onClick={() => handleLinkClick(`/topic/${topic.slug}`)}
              />
            ))}
          </div>

          {/* Advanced Filter Section */}
          <div className="space-y-4">
            <div className="px-8 flex items-center justify-between">
              <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                Bộ lọc
              </p>
              <button
                onClick={() => toggleSection("advancedFilter")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all uppercase tracking-wider ${
                  expandedSections.advancedFilter ? "bg-foreground text-background" : "bg-primary text-primary-foreground hover:bg-red-700"
                }`}
              >
                <Filter className="w-3 h-3" />
                <span className="text-[10px] font-black">{expandedSections.advancedFilter ? "Đóng Lọc" : "Lọc Chi Tiết"}</span>
              </button>
            </div>

            {expandedSections.advancedFilter && (
              <div className="mx-8 p-6 bg-accent/30 border border-border space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Loại Phim</label>
                    <select
                      value={filters.typeList}
                      onChange={(e) => setFilters({...filters, typeList: e.target.value})}
                      className="w-full bg-background border border-border text-foreground text-xs p-3 outline-none focus:border-red-600 transition-colors"
                    >
                      <option value="">Tất Cả</option>
                      <option value="phim-bo">Phim Bộ</option>
                      <option value="phim-le">Phim Lẻ</option>
                      <option value="tv-shows">TV Shows</option>
                      <option value="hoat-hinh">Hoạt Hình</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sắp Xếp</label>
                      <select
                        value={filters.sortField}
                        onChange={(e) => setFilters({...filters, sortField: e.target.value})}
                        className="w-full bg-background border border-border text-foreground text-xs p-3 outline-none focus:border-red-600 transition-colors"
                      >
                        <option value="modified.time">Cập Nhật</option>
                        <option value="_id">ID</option>
                        <option value="year">Năm</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Thứ Tự</label>
                      <select
                        value={filters.sortType}
                        onChange={(e) => setFilters({...filters, sortType: e.target.value})}
                        className="w-full bg-background border border-border text-foreground text-xs p-3 outline-none focus:border-red-600 transition-colors"
                      >
                        <option value="desc">Giảm Dần</option>
                        <option value="asc">Tăng Dần</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Quốc Gia</label>
                    <select
                      value={filters.country}
                      onChange={(e) => setFilters({...filters, country: e.target.value})}
                      className="w-full bg-background border border-border text-foreground text-xs p-3 outline-none focus:border-red-600 transition-colors"
                    >
                      <option value="">Tất Cả Quốc Gia</option>
                      {countries.map(c => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Thể Loại</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({...filters, category: e.target.value})}
                      className="w-full bg-background border border-border text-foreground text-xs p-3 outline-none focus:border-red-600 transition-colors"
                    >
                      <option value="">Tất Cả Thể Loại</option>
                      {categories.map(c => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Năm</label>
                    <select
                      value={filters.year}
                      onChange={(e) => setFilters({...filters, year: e.target.value})}
                      className="w-full bg-background border border-border text-foreground text-xs p-3 outline-none focus:border-red-600 transition-colors"
                    >
                      <option value="">Tất Cả Năm</option>
                      {YEAR_OPTIONS.map(y => (
                        <option key={y.value} value={y.value}>{y.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleApplyFilter}
                  className="w-full py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-colors shadow-lg shadow-primary/20"
                >
                  Áp Dụng Bộ Lọc
                </button>
              </div>
            )}

            <CollapsibleSection
              icon={Layers}
              label="Thể Loại"
              isExpanded={expandedSections.genres}
              onToggle={() => toggleSection("genres")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 py-4">
                {categories.map((cat) => (
                  <SubNavItem
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    label={cat.name}
                    isActive={isActiveCategory(cat.slug)}
                  />
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              icon={Globe}
              label="Quốc Gia"
              isExpanded={expandedSections.countries}
              onToggle={() => toggleSection("countries")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 py-4">
                {countries.map((country) => (
                  <SubNavItem
                    key={country.slug}
                    href={`/filter?country=${country.slug}`}
                    label={country.name}
                    isActive={false}
                  />
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              icon={Calendar}
              label="Năm"
              isExpanded={expandedSections.years}
              onToggle={() => toggleSection("years")}
            >
              <div className="grid grid-cols-3 px-8 py-6 gap-3">
                {YEAR_OPTIONS.map((year) => (
                  <Link
                    key={year.value}
                    href={`/filter?year=${year.value}`}
                    onClick={() => handleLinkClick(`/filter?year=${year.value}`)}
                    className="flex items-center justify-center py-3 text-[11px] border border-border text-muted-foreground hover:border-red-600 hover:text-foreground transition-all uppercase tracking-widest font-bold"
                  >
                    {year.label}
                  </Link>
                ))}
              </div>
            </CollapsibleSection>
          </div>
        </nav>
      </div>
    </>
  );

  if (!mounted) return null;

  return createPortal(sidebarContent, document.getElementById('sidebar-root') || document.body);
}
