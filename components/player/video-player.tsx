"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

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
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    setError(null);
    setIsLoading(true);

    console.log('Setting src:', videoUrl);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed');
        setIsLoading(false);
        if (autoplay) {
          video.play().catch((err) => {
            console.warn("Autoplay was prevented:", err);
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.log('HLS error:', data);
        if (data.fatal) {
          setError(data.details || "An error occurred while loading the video");
          setIsLoading(false);
          onError?.(data);
        }
      });

      video.addEventListener('loadstart', () => { console.log('loadstart'); setIsLoading(true); });
      video.addEventListener('canplay', () => { console.log('canplay'); setIsLoading(false); });
      video.addEventListener('waiting', () => { console.log('waiting'); setIsLoading(true); });
      video.addEventListener('playing', () => {
        console.log('playing');
        console.log('Video element readyState:', video.readyState);
        console.log('Video currentTime:', video.currentTime);
        console.log('Video videoWidth:', video.videoWidth, 'videoHeight:', video.videoHeight);
        setIsLoading(false);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (autoplay) {
          video.play().catch((err) => {
            console.warn("Autoplay was prevented:", err);
          });
        }
      });
      video.addEventListener('loadstart', () => { console.log('loadstart'); setIsLoading(true); });
      video.addEventListener('canplay', () => { console.log('canplay'); setIsLoading(false); });
      video.addEventListener('waiting', () => { console.log('waiting'); setIsLoading(true); });
      video.addEventListener('playing', () => {
        console.log('playing');
        console.log('Video element readyState:', video.readyState);
        console.log('Video currentTime:', video.currentTime);
        console.log('Video videoWidth:', video.videoWidth, 'videoHeight:', video.videoHeight);
        setIsLoading(false);
      });
      video.addEventListener('error', (e) => {
        console.log('Video error:', e);
        setError("An error occurred while loading the video");
        setIsLoading(false);
        onError?.(e);
      });
    } else {
      setError("HLS is not supported in this browser");
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl, autoplay, onError]);

  return (
    <div className="relative w-full bg-black rounded-lg shadow-2xl" style={{ minHeight: '200px' }}>
      <video
        ref={videoRef}
        controls
        poster={poster}
        playsInline
        className="w-full h-auto"
        style={{ display: 'block' }}
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
