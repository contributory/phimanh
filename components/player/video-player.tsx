"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  videoUrl: string;
  autoplay?: boolean;
  poster?: string;
  onError?: (error: any) => void;
}

const VideoPlayer = ({
  videoUrl,
  autoplay = true,
  poster,
  onError,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      const player = videojs(
        videoRef.current,
        {
          controls: true,
          responsive: true,
          fluid: true,
          aspectRatio: "16:9",
          autoplay,
          preload: "auto",
          playsinline: true,
          html5: {
            vhs: {
              overrideNative: true,
            },
            nativeAudioTracks: false,
            nativeVideoTracks: false,
          },
          controlBar: {
            volumePanel: {
              inline: false,
            },
            pictureInPictureToggle: true,
            fullscreenToggle: true,
          },
        },
        () => {
          // Player is ready
          setIsLoading(false);
        }
      );

      // Error handling
      player.on("error", () => {
        const error = player.error();
        const errorMessage =
          error?.message || "An error occurred while loading the video";
        setError(errorMessage);
        setIsLoading(false);
        onError?.(error);
      });

      // Loading states
      player.on("loadstart", () => setIsLoading(true));
      player.on("canplay", () => setIsLoading(false));
      player.on("waiting", () => setIsLoading(true));
      player.on("playing", () => setIsLoading(false));

      playerRef.current = player;
    }
  }, [autoplay, onError]);

  // Update source when videoUrl changes
  useEffect(() => {
    const player = playerRef.current;

    if (player && videoUrl) {
      setError(null);
      setIsLoading(true);

      player.src({
        src: videoUrl,
        type: "application/x-mpegURL",
      });

      if (autoplay && player) {
        player.ready(() => {
          player?.play()?.catch((err) => {
            console.warn("Autoplay was prevented:", err);
          });
        });
      }
    }
  }, [videoUrl, autoplay]);

  // Cleanup on unmount
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl">
      {/* Loading Indicator */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-sm font-medium">Đang tải...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-white text-base font-semibold">
              Lỗi phát video
            </p>
            <p className="text-gray-300 text-sm max-w-md">{error}</p>
          </div>
        </div>
      )}

      {/* Video Element */}
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-theme-city"
          poster={poster}
          playsInline
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
