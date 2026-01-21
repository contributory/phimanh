"use client";

import { useRouter } from "next/navigation";
import { useLoading } from "@/components/ui/loading-context";

export default function BackButton() {
  const router = useRouter();
  const { showLoading } = useLoading();

  const handleBack = () => {
    showLoading();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-3 px-6 py-3 mb-8 bg-zinc-900/50 backdrop-blur-xl border border-white/5 text-zinc-400 hover:text-white hover:border-red-500/50 hover:bg-zinc-900 transition-all duration-300 rounded-xl group uppercase tracking-[0.2em] text-[10px] font-black"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4 transition-transform group-hover:-translate-x-1"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
      <span>Quay Lại</span>
    </button>
  );
}
