"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import HLS from 'hls.js';

interface VideoPlayerProps {
  videoUrl: string;
  autoplay?: boolean;
  poster?: string;
  onError?: (error: any) => void;
  onEnded?: () => void;
}

const VideoPlayer = ({
  videoUrl,
  autoplay = true,
  poster,
  onError,
  onEnded,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<HLS | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl || videoUrl.trim() === '') {
      setIsLoading(false);
      setError(null);
      return;
    }

    setError(null);
    setIsLoading(true);

    if (HLS.isSupported()) {
      const hls = new HLS({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(HLS.Events.MANIFEST_PARSED, () => {
        console.log("Manifest parsed");
        setIsLoading(false);
        if (autoplay) {
          video.play().catch((e) => {
            if (e.name !== 'AbortError') {
              console.error('Autoplay failed:', e);
            }
          });
        }
      });

      hls.on(HLS.Events.ERROR, (event, data) => {
        if (!data || Object.keys(data).length === 0) {
          console.warn("HLS Error event triggered with no data");
          return;
        }
        console.error("HLS Error:", event, data);
        if (data?.fatal) {
          switch (data.type) {
            case HLS.ErrorTypes.NETWORK_ERROR:
              console.error('Fatal network error, attempting to recover...');
              hls.startLoad();
              break;
            case HLS.ErrorTypes.MEDIA_ERROR:
              console.error('Fatal media error, attempting to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Unrecoverable fatal error');
              setError("Không thể tải video. Vui lòng thử lại hoặc chọn tập khác.");
              setIsLoading(false);
              onError?.(data);
              break;
          }
        } else {
          // Non-fatal errors: log but continue
          console.warn('Non-fatal HLS error:', data);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (autoplay) {
          video.play();
        }
      });
    }

    const handleLoadStart = () => {
      console.log("loadstart");
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      console.log("canplay");
      setIsLoading(false);
    };

    const handleWaiting = () => {
      console.log("waiting");
      setIsLoading(true);
    };

    const handlePlaying = () => {
      console.log("playing");
      setIsLoading(false);
    };

    const handleEnded = () => {
      console.log("ended");
      onEnded?.();
    };

    const handleError = (e: any) => {
      console.error("Video error:", e);
      setError("Lỗi phát video. Vui lòng thử lại.");
      setIsLoading(false);
      onError?.(e);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.src = '';
    };
  }, [videoUrl, autoplay, onError, onEnded]);

  return (
    <div className="relative bg-black rounded-lg shadow-2xl">
      {/* Back Button Overlay */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-20 flex items-center justify-center w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        title="Quay lại"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
      </button>
      <video
        ref={videoRef}
        className="w-full h-auto rounded-lg"
        poster={poster}
        controls
        playsInline
        preload="metadata"
        disablePictureInPicture
        style={{ aspectRatio: '16/9' }}
      />
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
            <p className="text-white text-base font-semibold">Lỗi phát video</p>
            <p className="text-gray-300 text-sm max-w-md">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
