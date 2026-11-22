"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

/* Material 3 side sheet tokens — see --m3-* in app/globals.css. */
const NAV_ITEM =
  "group flex h-14 w-full items-center gap-3 rounded-full px-4 text-[14px] font-medium leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--m3-primary)]";
const navItemTone = (active: boolean) =>
  active
    ? "bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)]"
    : "text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-state-hover)] hover:text-[var(--m3-on-surface)]";

const SECTION_LABEL =
  "px-4 pb-1 pt-4 text-[12px] font-medium leading-4 tracking-[0.5px] text-[var(--m3-on-surface-variant)]";

const CHIP =
  "flex h-8 min-w-0 items-center gap-1.5 rounded-[8px] border px-3 text-[13px] font-medium leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--m3-primary)]";
const chipTone = (active: boolean) =>
  active
    ? "border-transparent bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)]"
    : "border-[var(--m3-outline-variant)] text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-state-hover)] hover:text-[var(--m3-on-surface)]";

const FILLED_BUTTON =
  "flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[var(--m3-primary)] px-6 text-[14px] font-medium leading-5 text-[var(--m3-on-primary)] transition-[filter,box-shadow] hover:brightness-110 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--m3-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--m3-surface-container)]";

const FIELD =
  "flex h-14 w-full items-center justify-between rounded-[4px] border border-[var(--m3-outline)] bg-transparent px-4 text-[15px] text-[var(--m3-on-surface)] shadow-none ring-0 transition-colors hover:border-[var(--m3-on-surface)] focus:border-[var(--m3-primary)] focus:ring-0 data-[placeholder]:text-[var(--m3-on-surface-variant)]";

const MENU =
  "z-[250] max-h-[min(18rem,var(--radix-select-content-available-height))] rounded-[4px] border-0 bg-[var(--m3-surface-container)] text-[var(--m3-on-surface)] [box-shadow:var(--m3-elevation-2)]";

const MENU_ITEM =
  "h-12 rounded-[4px] px-3 text-[14px] font-normal leading-5 text-[var(--m3-on-surface)] focus:bg-[var(--m3-state-hover)] focus:text-[var(--m3-on-surface)]";

interface SheetSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

/* Material 3 outlined text field backed by the Radix listbox. */
function SheetSelect({ id, label, value, onChange, options }: SheetSelectProps) {
  return (
    <div className="min-w-0 space-y-1.5">
      <span
        id={`${id}-label`}
        className="block truncate text-[12px] font-medium leading-4 text-[var(--m3-on-surface-variant)]"
      >
        {label}
      </span>
      <Select
        value={value || "all"}
        onValueChange={(next) => onChange(next === "all" ? "" : next)}
      >
        <SelectTrigger aria-labelledby={`${id}-label`} className={FIELD}>
          <SelectValue placeholder={options[0]?.label} />
        </SelectTrigger>
        <SelectContent className={MENU}>
          {options.map((option) => (
            <SelectItem key={option.value} className={MENU_ITEM} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

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

  const sheetRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

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

  // Move focus into the sheet on open and restore it on close (M3 modal behaviour).
  useEffect(() => {
    if (!isOpen) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(timer);
      lastFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  // Keep Tab inside the sheet while it is open.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    // Radix listboxes trap focus themselves while open.
    if (document.querySelector('[role="listbox"]')) return;

    const container = sheetRef.current;
    if (!container) return;

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.getClientRects().length > 0);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

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
      aria-controls={`side-sheet-section-${key}`}
      className={`${NAV_ITEM} ${navItemTone(false)}`}
    >
      <Icon className="h-6 w-6 shrink-0" />
      <span className="flex-1 truncate text-left">{label}</span>
      <ChevronDown
        className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
          expanded[key] ? "rotate-180" : ""
        }`}
      />
    </button>
  );

  const content = (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[190] bg-[var(--m3-scrim)] ${
          isOpen
            ? "opacity-100 [transition:opacity_400ms_var(--m3-motion-emphasized-decelerate)]"
            : "pointer-events-none opacity-0 [transition:opacity_200ms_var(--m3-motion-emphasized-accelerate)]"
        }`}
      />

      <aside
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-sheet-title"
        aria-describedby="side-sheet-description"
        aria-hidden={!isOpen}
        inert={!isOpen}
        onKeyDown={handleKeyDown}
        className={`fixed bottom-0 left-0 top-0 z-[200] flex w-[min(88vw,360px)] max-w-[400px] flex-col overflow-hidden rounded-r-[16px] bg-[var(--m3-surface-container-low)] pt-[calc(var(--app-safe-top)+16px)] text-[var(--m3-on-surface)] [box-shadow:var(--m3-elevation-1)] will-change-transform ${
          isOpen
            ? "translate-x-0 [transition:transform_400ms_var(--m3-motion-emphasized-decelerate)]"
            : "pointer-events-none -translate-x-full [transition:transform_200ms_var(--m3-motion-emphasized-accelerate)]"
        }`}
      >
        <div className="flex items-start justify-between gap-3 px-6 pb-3">
          <div className="min-w-0">
            <h2
              id="side-sheet-title"
              className="text-[22px] font-normal leading-7 text-[var(--m3-on-surface)]"
            >
              PHIMANH
            </h2>
            <p
              id="side-sheet-description"
              className="mt-1 text-[14px] leading-5 text-[var(--m3-on-surface-variant)]"
            >
              Khám phá phim theo thể loại, quốc gia và năm.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng điều hướng"
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--m3-on-surface-variant)] transition-colors hover:bg-[var(--m3-state-hover)] hover:text-[var(--m3-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--m3-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-6 h-px bg-[var(--m3-outline-variant)]" />

        <div className="flex-1 overflow-y-auto pb-2 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <nav aria-label="Điều hướng chính" className="px-3 py-1">
            <div className="space-y-0.5">
              {primaryLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={navigate}
                    aria-current={active ? "page" : undefined}
                    className={`${NAV_ITEM} ${navItemTone(active)}`}
                  >
                    <Icon className="h-6 w-6 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {topics.length > 0 && (
            <>
              <div className="mx-6 my-2 h-px bg-[var(--m3-outline-variant)]" />
              <section className="px-3">
                <p className={SECTION_LABEL}>Danh mục nổi bật</p>
                <div className="grid grid-cols-2 gap-2 px-1 pb-1">
                  {topics.map((topic) => {
                    const active = pathname === `/topic/${topic.slug}`;
                    return (
                      <Link
                        key={topic.slug}
                        href={`/topic/${topic.slug}`}
                        onClick={navigate}
                        className={`${CHIP} ${chipTone(active)}`}
                      >
                        <Play className="h-4 w-4 shrink-0" />
                        <span className="truncate">{topic.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          <div className="mx-6 my-2 h-px bg-[var(--m3-outline-variant)]" />

          <section className="px-3">
            <p className={SECTION_LABEL}>Duyệt nhanh</p>

            {sectionButton("categories", "Thể loại", Layers3)}
            <div id="side-sheet-section-categories" hidden={!expanded.categories}>
              <div className="grid grid-cols-2 gap-2 px-2 pb-2">
                {categories.map((item) => {
                  const href = `/category/${item.slug}`;
                  const active = pathname === href;
                  return (
                    <Link
                      key={item.slug}
                      href={href}
                      onClick={navigate}
                      className={`${CHIP} ${chipTone(active)}`}
                    >
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {sectionButton("countries", "Quốc gia", Globe2)}
            <div id="side-sheet-section-countries" hidden={!expanded.countries}>
              <div className="grid grid-cols-2 gap-2 px-2 pb-2">
                {countries.map((item) => {
                  const href = `/country/${item.slug}`;
                  const active = pathname === href;
                  return (
                    <Link
                      key={item.slug}
                      href={href}
                      onClick={navigate}
                      className={`${CHIP} ${chipTone(active)}`}
                    >
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {sectionButton("years", "Năm phát hành", CalendarDays)}
            <div id="side-sheet-section-years" hidden={!expanded.years}>
              <div className="grid grid-cols-4 gap-2 px-2 pb-2">
                {YEAR_OPTIONS.map((year) => {
                  const href = `/year/${year.value}`;
                  const active = pathname === href;
                  return (
                    <Link
                      key={year.value}
                      href={href}
                      onClick={navigate}
                      className={`${CHIP} justify-center px-0 ${chipTone(active)}`}
                    >
                      {year.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="mx-6 my-2 h-px bg-[var(--m3-outline-variant)]" />

          <section className="px-3 pb-4">
            {sectionButton("filter", "Bộ lọc chi tiết", Filter)}
            <div id="side-sheet-section-filter" hidden={!expanded.filter}>
              <div className="mx-1 mt-2 space-y-4 rounded-[12px] bg-[var(--m3-surface-container)] p-4">
                <div className="grid grid-cols-2 gap-3">
                  <SheetSelect
                    id="filter-type"
                    label="Loại phim"
                    value={filters.typeList}
                    onChange={(value) => setFilters({ ...filters, typeList: value })}
                    options={[
                      { value: "all", label: "Mọi loại" },
                      { value: "phim-bo", label: "Phim bộ" },
                      { value: "phim-le", label: "Phim lẻ" },
                      { value: "tv-shows", label: "TV Shows" },
                      { value: "hoat-hinh", label: "Hoạt hình" },
                    ]}
                  />
                  <SheetSelect
                    id="filter-sort"
                    label="Thứ tự"
                    value={filters.sortType}
                    onChange={(value) => setFilters({ ...filters, sortType: value })}
                    options={[
                      { value: "desc", label: "Mới trước" },
                      { value: "asc", label: "Cũ trước" },
                    ]}
                  />
                </div>

                <SheetSelect
                  id="filter-category"
                  label="Thể loại"
                  value={filters.category}
                  onChange={(value) => setFilters({ ...filters, category: value })}
                  options={[
                    { value: "all", label: "Mọi thể loại" },
                    ...categories.map((item) => ({ value: item.slug, label: item.name })),
                  ]}
                />

                <div className="grid grid-cols-2 gap-3">
                  <SheetSelect
                    id="filter-country"
                    label="Quốc gia"
                    value={filters.country}
                    onChange={(value) => setFilters({ ...filters, country: value })}
                    options={[
                      { value: "all", label: "Mọi quốc gia" },
                      ...countries.map((item) => ({ value: item.slug, label: item.name })),
                    ]}
                  />
                  <SheetSelect
                    id="filter-year"
                    label="Năm"
                    value={filters.year}
                    onChange={(value) => setFilters({ ...filters, year: value })}
                    options={[
                      { value: "all", label: "Mọi năm" },
                      ...YEAR_OPTIONS.map((year) => ({ value: year.value, label: year.label })),
                    ]}
                  />
                </div>

                <button type="button" onClick={applyFilter} className={FILLED_BUTTON}>
                  Áp dụng bộ lọc
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-[var(--m3-outline-variant)] px-6 py-4 text-[12px] leading-4 text-[var(--m3-on-surface-variant)] opacity-70">
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
