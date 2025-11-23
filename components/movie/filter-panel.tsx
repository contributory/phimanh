"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface FilterPanelProps {
  categories?: { slug: string; name: string }[];
  countries?: { slug: string; name: string }[];
}

const TYPE_LIST_OPTIONS = [
  { value: "phim-bo", label: "Phim Bộ" },
  { value: "phim-le", label: "Phim Lẻ" },
  { value: "tv-shows", label: "TV Shows" },
  { value: "hoat-hinh", label: "Hoạt Hình" },
  { value: "phim-vietsub", label: "Phim Vietsub" },
  { value: "phim-thuyet-minh", label: "Phim Thuyết Minh" },
  { value: "phim-long-tieng", label: "Phim Lồng Tiếng" },
];

const SORT_FIELD_OPTIONS = [
  { value: "modified.time", label: "Thời gian cập nhật" },
  { value: "_id", label: "ID Phim" },
  { value: "year", label: "Năm phát hành" },
];

const SORT_TYPE_OPTIONS = [
  { value: "desc", label: "Gi��m dần" },
  { value: "asc", label: "Tăng dần" },
];

const SORT_LANG_OPTIONS = [
  { value: "vietsub", label: "Vietsub" },
  { value: "thuyet-minh", label: "Thuyết Minh" },
  { value: "long-tieng", label: "Lồng Tiếng" },
];

const LIMIT_OPTIONS = [
  { value: "20", label: "20" },
  { value: "10", label: "10" },
  { value: "30", label: "30" },
  { value: "40", label: "40" },
  { value: "50", label: "50" },
  { value: "64", label: "64" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

const FilterPanel = ({ categories = [], countries = [] }: FilterPanelProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    typeList: searchParams.get("typeList") || "phim-bo",
    sortField: searchParams.get("sortField") || "modified.time",
    sortType: searchParams.get("sortType") || "desc",
    sortLang: searchParams.get("sortLang") || "vietsub",
    category: searchParams.get("category") || "",
    country: searchParams.get("country") || "",
    year: searchParams.get("year") || "",
    limit: searchParams.get("limit") || "10",
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const YEAR_OPTIONS = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1970 + 1 }, (_, i) => ({
      value: String(currentYear - i),
      label: String(currentYear - i),
    }));
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = async () => {
    setIsOpen(false);
    const params = new URLSearchParams();
    params.set("typeList", filters.typeList);
    params.set("sortField", filters.sortField);
    params.set("sortType", filters.sortType);
    params.set("sortLang", filters.sortLang);
    if (filters.category) params.set("category", filters.category);
    if (filters.country) params.set("country", filters.country);
    if (filters.year) params.set("year", filters.year);
    params.set("limit", filters.limit);

    await router.push(`/?${params.toString()}`);
  };

  const resetFilters = async () => {
    setIsOpen(false);
    await router.push("/");
  };

  const hasActiveFilters =
    filters.typeList !== "phim-bo" ||
    filters.category ||
    filters.country ||
    filters.year ||
    filters.sortField !== "modified.time" ||
    filters.sortType !== "desc" ||
    filters.sortLang !== "vietsub" ||
    filters.limit !== "10";

  return (
    <div>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="icon"
        className={`md:w-auto md:px-3 ${
          hasActiveFilters ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : ""
        }`}
        title="Bộ Lọc Nâng Cao"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      </Button>

      <div
        className={`fixed left-4 right-4 top-20 z-50 max-h-[calc(100vh-120px)] overflow-y-auto p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 space-y-4 md:absolute md:left-0 md:right-auto md:top-full md:w-96 md:mt-2 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bộ Lọc Nâng Cao
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type List */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Loại Phim
            </label>
            <Select
              value={filters.typeList}
              onValueChange={(value) => handleFilterChange("typeList", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_LIST_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Field */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Sắp Xếp Theo
            </label>
            <Select
              value={filters.sortField}
              onValueChange={(value) => handleFilterChange("sortField", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_FIELD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Type */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Kiểu Sắp Xếp
            </label>
            <Select
              value={filters.sortType}
              onValueChange={(value) => handleFilterChange("sortType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Language */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Ngôn Ngữ
            </label>
            <Select
              value={filters.sortLang}
              onValueChange={(value) => handleFilterChange("sortLang", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_LANG_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Thể Loại
            </label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) =>
                handleFilterChange("category", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Quốc Gia
            </label>
            <Select
              value={filters.country || "all"}
              onValueChange={(value) =>
                handleFilterChange("country", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country.slug} value={country.slug}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Năm Phát Hành
            </label>
            <Select
              value={filters.year || "all"}
              onValueChange={(value) =>
                handleFilterChange("year", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {YEAR_OPTIONS.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Limit */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Số Lượng
            </label>
            <Select
              value={filters.limit}
              onValueChange={(value) => handleFilterChange("limit", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={resetFilters} disabled={isLoading}>
            Đặt Lại
          </Button>
          <Button
            onClick={applyFilters}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? "Đang Tải..." : "Áp Dụng"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(FilterPanel);
