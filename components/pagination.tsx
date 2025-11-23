"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

export default function PaginationComponent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = React.useState(false);
  const [pageInfo, setPageInfo] = React.useState<any>(null);

  React.useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.matchMedia("(max-width: 640px)").matches);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    const index = Number(searchParams.get("index")) || 1;
    const category = searchParams.get("category");
    const topic = searchParams.get("topic");
    const typeList = searchParams.get("typeList");
    const sortField = searchParams.get("sortField");
    const sortType = searchParams.get("sortType");
    const sortLang = searchParams.get("sortLang");
    const country = searchParams.get("country");
    const year = searchParams.get("year");
    const limit = searchParams.get("limit");

    // Check if advanced filters are being used
    const hasAdvancedFilters = typeList || sortField || (category && typeList);

    let url: string;
    if (hasAdvancedFilters) {
      // Use advanced filter API
      const type = typeList || "phim-bo";
      const field = sortField || "modified.time";
      const type_sort = sortType || "desc";
      const lang = sortLang || "vietsub";
      const lim = limit || "10";

      url = `https://phimapi.com/v1/api/danh-sach/${type}?page=${index}&sort_field=${field}&sort_type=${type_sort}&limit=${lim}`;
      if (lang) url += `&sort_lang=${lang}`;
      if (category) url += `&category=${category}`;
      if (country) url += `&country=${country}`;
      if (year) url += `&year=${year}`;
    } else if (category) {
      url = `https://phimapi.com/v1/api/the-loai/${category}?page=${index}`;
    } else if (topic) {
      url = `https://phimapi.com/v1/api/danh-sach/${topic}?page=${index}`;
    } else {
      url = `https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${index}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // Handle different response structures
        if (hasAdvancedFilters || category || topic) {
          setPageInfo(data.data.params.pagination);
        } else {
          setPageInfo(data.pagination);
        }
      })
      .catch(() => {
        setPageInfo(null);
      });
  }, [searchParams]);

  const createQueryString = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("index", page.toString());
    return params.toString();
  };

  if (!pageInfo) return null;

  const getVisiblePages = () => {
    const totalPages = pageInfo.totalPages;
    const currentPage = pageInfo.currentPage;
    const delta = isMobile ? 1 : 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <Pagination>
      <PaginationContent className="justify-center gap-2 py-4">
        <PaginationItem>
          <PaginationPrevious
            href={`${pathname}?${createQueryString(
              Math.max(1, pageInfo.currentPage - 1)
            )}`}
            isActive={pageInfo.currentPage > 1}
            className="rounded-lg px-3 py-1 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          />
        </PaginationItem>

        {getVisiblePages().map((page, index) =>
          page === "..." ? (
            <PaginationItem key={index}>
              <PaginationEllipsis className="px-2 text-gray-400" />
            </PaginationItem>
          ) : (
            <PaginationItem key={index}>
              <PaginationLink
                href={`${pathname}?${createQueryString(page as number)}`}
                isActive={pageInfo.currentPage === page}
                className={`rounded-lg px-3 py-1 font-medium transition-colors ${pageInfo.currentPage === page ? "bg-blue-600 text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"}`}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href={`${pathname}?${createQueryString(
              Math.min(pageInfo.totalPages, pageInfo.currentPage + 1)
            )}`}
            isActive={pageInfo.currentPage < pageInfo.totalPages}
            className="rounded-lg px-3 py-1 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
