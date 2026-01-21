"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import HLS from "hls.js";
import { X, Maximize2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useVideoContext } from "@/components/providers/video-provider";
import { getPlaybackProgress, savePlaybackProgress, clearPlaybackProgress } from "@/lib/user-experience";

const GlobalPlayer = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { state, updateState, clearVideo, toggleMinimize, videoRef } = useVideoContext();
  const hlsRef = useRef<HLS | null>(null);
  const [showControls, setShowControls] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const isInitialSeekDone = useRef<boolean>(false);

  const isWatchPage = pathname?.startsWith("/watch");
  const shouldShow = state.videoUrl !== null;
  const isMinimized = state.isMinimized || !isWatchPage;

  const handleMaximize = () => {
    if (state.movieSlug) {
      toggleMinimize(false);
      router.push(`/watch?slug=${state.movieSlug}`);
    }
  };

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !state.videoUrl) return;

    if (HLS.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      const hls = new HLS({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(state.videoUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;
      hls.on(HLS.Events.MANIFEST_PARSED, () => {
        if (state.isPlaying) {
          // Resume from saved progress if not already done
          if (!isInitialSeekDone.current && state.movieSlug) {
            const savedTime = getPlaybackProgress(state.movieSlug);
            if (savedTime > 0) {
              video.currentTime = savedTime;
              updateState({ currentTime: savedTime });
            }
            isInitialSeekDone.current = true;
          }
          video.play();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = state.videoUrl;
      
      // For native HLS (Safari/iOS)
      video.onloadedmetadata = () => {
        if (!isInitialSeekDone.current && state.movieSlug) {
          const savedTime = getPlaybackProgress(state.movieSlug);
          if (savedTime > 0) {
            video.currentTime = savedTime;
            updateState({ currentTime: savedTime });
          }
          isInitialSeekDone.current = true;
        }
        if (state.isPlaying) video.play();
      };
    }
  }, [state.videoUrl, videoRef]);

  // Reset initial seek flag when movie changes
  useEffect(() => {
    isInitialSeekDone.current = false;
  }, [state.movieSlug]);

  // Visibility Change - Native PiP Logic
  useEffect(() => {
    const handleVisibilityChange = async () => {
      const video = videoRef.current;
      if (!video || !state.isPlaying) return;

      if (document.visibilityState === "hidden") {
        if (document.pictureInPictureEnabled && !document.pictureInPictureElement) {
          try {
            await video.requestPictureInPicture();
          } catch (e) {
            console.error("Failed to enter PiP", e);
          }
        }
      } else {
        if (document.pictureInPictureElement) {
          try {
            await document.exitPictureInPicture();
          } catch (e) {
            console.error("Failed to exit PiP", e);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [state.isPlaying, videoRef]);

  // Sync state with video element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => updateState({ isPlaying: true });
    const onPause = () => updateState({ isPlaying: false });
    const onTimeUpdate = () => {
      const currentTime = video.currentTime;
      updateState({ currentTime });
      
      // Throttled save every 30 seconds
      const now = Date.now();
      if (now - lastSaveTimeRef.current > 30000 && state.movieSlug) {
        savePlaybackProgress(state.movieSlug, currentTime, video.duration);
        lastSaveTimeRef.current = now;
      }
    };
    const onDurationChange = () => updateState({ duration: video.duration });
    const onEnded = () => {
      if (state.movieSlug) {
        clearPlaybackProgress(state.movieSlug);
      }
      updateState({ isPlaying: false });
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("ended", onEnded);
    };
  }, [videoRef, updateState, state.movieSlug]);

  // Move video element between containers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const moveVideo = () => {
      const portal = document.getElementById("video-portal");
      const container = containerRef.current;

      console.log("Moving video, isMinimized:", isMinimized, "portal:", !!portal, "container:", !!container);

      if (!isMinimized && portal) {
        portal.appendChild(video);
        video.className = "w-full h-full object-contain";
      } else if (container) {
        container.insertBefore(video, container.firstChild);
        video.className = "w-full h-full object-contain";
      }
    };

    // Run immediately
    moveVideo();

    // Also run after a short delay to handle navigation/rendering timing
    const timeoutId = setTimeout(moveVideo, 100);
    const timeoutId2 = setTimeout(moveVideo, 500);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
    };
  }, [isMinimized, state.videoUrl, videoRef, pathname]);

  if (!shouldShow) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-[10001] transition-all duration-500 ease-in-out bg-black overflow-hidden shadow-2xl",
        isMinimized
          ? "bottom-4 right-4 w-72 md:w-80 aspect-video rounded-xl"
          : "inset-0 w-full h-full pointer-events-none opacity-0 invisible"
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        crossOrigin="anonymous"
      />

      {/* Mini Player Controls */}
      {isMinimized && (
        <div
          className={cn(
            "absolute inset-0 bg-black/40 flex flex-col transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex justify-between p-2">
            <button
              onClick={() => {
                clearVideo();
              }}
              className="text-white hover:bg-white/20 p-1 rounded-full"
            >
              <X size={18} />
            </button>
            <div className="flex gap-1">
              <button
                onClick={handleMaximize}
                className="text-white hover:bg-white/20 p-1 rounded-full"
              >
                <Maximize2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-transparent"
              onClick={() => {
                if (videoRef.current?.paused) videoRef.current.play();
                else videoRef.current?.pause();
              }}
            >
              {state.isPlaying ? <Pause fill="white" /> : <Play fill="white" />}
            </Button>
          </div>

          <div className="px-2 pb-2">
            <p className="text-white text-[10px] truncate font-medium">
              {state.movieTitle || "Đang phát..."}
            </p>
            <div className="h-1 bg-white/20 w-full mt-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${(state.currentTime / state.duration) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalPlayer;
