"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

interface VideoState {
  videoUrl: string | null;
  movieTitle: string | null;
  movieSlug: string | null;
  poster: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isMinimized: boolean;
  activeSubtitle: string | null;
}

interface VideoContextType {
  state: VideoState;
  setVideo: (url: string, title?: string, poster?: string, slug?: string) => void;
  updateState: (updates: Partial<VideoState>) => void;
  clearVideo: () => void;
  toggleMinimize: (val?: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<VideoState>({
    videoUrl: null,
    movieTitle: null,
    movieSlug: null,
    poster: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
    isMinimized: false,
    activeSubtitle: null,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const setVideo = useCallback((url: string, title?: string, poster?: string, slug?: string) => {
    setState((prev) => ({
      ...prev,
      videoUrl: url,
      movieTitle: title || null,
      movieSlug: slug || null,
      poster: poster || null,
      isPlaying: true,
      isMinimized: false,
    }));
  }, []);

  const updateState = useCallback((updates: Partial<VideoState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearVideo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      videoUrl: null,
      movieTitle: null,
      poster: null,
      isPlaying: false,
    }));
  }, []);

  const toggleMinimize = useCallback((val?: boolean) => {
    setState((prev) => ({
      ...prev,
      isMinimized: val !== undefined ? val : !prev.isMinimized,
    }));
  }, []);

  return (
    <VideoContext.Provider value={{ state, setVideo, updateState, clearVideo, toggleMinimize, videoRef }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideoContext must be used within a VideoProvider");
  }
  return context;
};
