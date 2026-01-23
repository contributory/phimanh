"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface LoadingContextType {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
  setSuspenseLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [isSuspenseLoading, setIsSuspenseLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isLoading = isRouteLoading || isSuspenseLoading;

  const showLoading = () => {
    setIsRouteLoading(true);
    if (typeof window !== 'undefined') {
      window.__globalLoading = true;
    }
  };

  const hideLoading = () => {
    setIsRouteLoading(false);
    // Only set window flag to false if we are not in suspense loading either
    if (typeof window !== 'undefined' && !isSuspenseLoading) {
      window.__globalLoading = false;
    }
  };

  const setSuspenseLoading = (loading: boolean) => {
    setIsSuspenseLoading(loading);
    if (typeof window !== 'undefined') {
      window.__globalLoading = loading || isRouteLoading;
    }
  };

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      showLoading, 
      hideLoading,
      setSuspenseLoading
    }}>
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
