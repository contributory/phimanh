"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface LoadingContextType {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showLoading = () => {
    setIsLoading(true);
    // Only set global loading flag on client side after mount
    if (isMounted && typeof window !== 'undefined') {
      window.__globalLoading = true;
    }
  };

  const hideLoading = () => {
    setIsLoading(false);
    // Only set global loading flag on client side after mount
    if (isMounted && typeof window !== 'undefined') {
      window.__globalLoading = false;
    }
  };

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}