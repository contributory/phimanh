"use client";

import { useEffect } from "react";
import { useLoading } from "@/components/ui/loading-context";

export default function Loading() {
  const { setSuspenseLoading } = useLoading();

  useEffect(() => {
    setSuspenseLoading(true);
    return () => setSuspenseLoading(false);
  }, [setSuspenseLoading]);

  // Render nothing as RouteLoadingOverlay (in layout.tsx) will handle the UI
  // based on the global isLoading state.
  return null;
}
