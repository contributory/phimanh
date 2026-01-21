"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/components/ui/loading-context";
import FullscreenLoading from "@/components/ui/fullscreen-loading";

const isModifiedClick = (event: MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

export default function RouteLoadingOverlay() {
  const { isLoading, showLoading, hideLoading } = useLoading();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams ? searchParams.toString() : "";

  useEffect(() => {
    hideLoading();
  }, [pathname, searchKey, hideLoading]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (isModifiedClick(event)) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      if (anchor.getAttribute("aria-disabled") === "true") return;
      if (anchor.hasAttribute("data-no-loading")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href.startsWith("javascript:")) return;

      const targetAttr = anchor.getAttribute("target");
      if (targetAttr && targetAttr !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      
      // Always show loading even if it's the same URL to give feedback on local actions/revalidations
      showLoading();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [showLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto" role="status" aria-live="polite">
      <FullscreenLoading transparent />
    </div>
  );
}
