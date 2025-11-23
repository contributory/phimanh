"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLoading } from "@/components/ui/loading-context";

export default function BackButton() {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();

  const handleBack = () => {
    showLoading();
    try {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
    } finally {
      hideLoading();
    }
  };

  return (
    <Button
      onClick={handleBack}
      variant="outline"
      className="gap-2 mb-4 hover:bg-blue-50 dark:hover:bg-blue-950 border-blue-200 dark:border-blue-800"
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
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
      Quay Lại
    </Button>
  );
}
