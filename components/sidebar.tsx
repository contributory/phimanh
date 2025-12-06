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
  Play
} from "lucide-react";

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
  const searchParams = useSearchParams();
  const [expandedSections, setExpandedSections] = useState({
    genres: false,
    countries: false,
    years: false,
  });
  const [mounted, setMounted] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  const isActiveLink = (href: string) => pathname === href;
  const isActiveTopic = (topicSlug: string) => pathname === `/topic/${topicSlug}`;
  const isActiveCategory = (categorySlug: string) => pathname === `/category/${categorySlug}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    hideLoading();
  }, [pathname]);

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
    onClose();
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
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
          ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 font-semibold"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
    >
      <div className={`p-2 rounded-lg ${isActive
          ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
        }`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="flex-1">{label}</span>
      {isActive && (
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
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
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
          <Icon className="w-4 h-4" />
        </div>
        <span className="flex-1 text-left font-medium">{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {isExpanded && (
        <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1 animate-in slide-in-from-top-2 duration-200">
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
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
        }`}
    >
      <ChevronRight className="w-3 h-3" />
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
        className={`fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">
                Phim Ảnh
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Khám phá phim hay
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Main Navigation */}
          <div className="space-y-1">
            <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Điều hướng
            </p>
            <NavItem
              href="/"
              icon={Home}
              label="Trang Chủ"
              isActive={isActiveLink("/")}
              onClick={() => handleLinkClick("/")}
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
              label="Đã Xem Gần Đây"
              isActive={isActiveLink("/recently")}
              onClick={() => handleLinkClick("/recently")}
            />
          </div>

          {/* Topics Section */}
          <div className="pt-4 space-y-1">
            <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Danh mục phim
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

          {/* Categories Section */}
          <div className="pt-4">
            <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Khám phá
            </p>

            <CollapsibleSection
              icon={Layers}
              label="Thể Loại"
              isExpanded={expandedSections.genres}
              onToggle={() => toggleSection("genres")}
            >
              {categories.slice(0, 15).map((cat) => (
                <SubNavItem
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  label={cat.name}
                  isActive={isActiveCategory(cat.slug)}
                />
              ))}
              {categories.length > 15 && (
                <Link
                  href="/filter"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Xem tất cả ({categories.length})
                </Link>
              )}
            </CollapsibleSection>

            <CollapsibleSection
              icon={Globe}
              label="Quốc Gia"
              isExpanded={expandedSections.countries}
              onToggle={() => toggleSection("countries")}
            >
              {countries.slice(0, 12).map((country) => (
                <SubNavItem
                  key={country.slug}
                  href={`/filter?country=${country.slug}`}
                  label={country.name}
                  isActive={false}
                />
              ))}
            </CollapsibleSection>

            <CollapsibleSection
              icon={Calendar}
              label="Năm Phát Hành"
              isExpanded={expandedSections.years}
              onToggle={() => toggleSection("years")}
            >
              {YEAR_OPTIONS.map((year) => (
                <SubNavItem
                  key={year.value}
                  href={`/filter?year=${year.value}`}
                  label={year.label}
                  isActive={false}
                />
              ))}
            </CollapsibleSection>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
              <Film className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Phim Ảnh v2.0
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                © 2024 All rights reserved
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (!mounted) return null;

  return createPortal(sidebarContent, document.getElementById('sidebar-root') || document.body);
}