"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import HLS from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  ArrowLeft,
  Loader2,
  SkipForward,
  SkipBack,
  ChevronsRight,
  ChevronsLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

interface VideoPlayerProps {
  videoUrl: string;
  autoplay?: boolean;
  poster?: string;
  onError?: (error: any) => void;
  onEnded?: () => void;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const VideoPlayer = ({
  videoUrl,
  autoplay = true,
  poster,
  onError,
  onEnded,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<HLS | null>(null);
  const router = useRouter();

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState<number>(-1); // -1 is auto
  const [qualities, setQualities] = useState<{ height: number, level: number }[]>([]);

  // Double tap state
  const [skipAnimation, setSkipAnimation] = useState<{ side: 'left' | 'right', id: number } | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // HLS and Video Setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl || videoUrl.trim() === '') {
      setIsLoading(false);
      setError(null);
      return;
    }

    setError(null);
    setIsLoading(true);

    const initHls = () => {
      if (HLS.isSupported()) {
        const hls = new HLS({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          startFragPrefetch: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;

        hls.on(HLS.Events.MANIFEST_PARSED, (event, data) => {
          console.log("Manifest parsed", data);
          setIsLoading(false);

          // Get available qualities
          const availableQualities = data.levels.map((l, index) => ({
            height: l.height,
            level: index
          })).sort((a, b) => b.height - a.height);
          setQualities(availableQualities);

          if (autoplay) {
            video.play().catch((e) => {
              if (e.name !== 'AbortError') console.error('Autoplay failed:', e);
            });
          }
        });

        hls.on(HLS.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case HLS.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case HLS.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                setError("Không thể tải video. Vui lòng thử lại.");
                setIsLoading(false);
                onError?.(data);
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          if (autoplay) video.play();
        });
      }
    };

    initHls();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.src = '';
    };
  }, [videoUrl, autoplay, onError]);

  // Event Listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onDurationChange = () => setDuration(video.duration);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onEndedEvent = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('ended', onEndedEvent);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('ended', onEndedEvent);
    };
  }, [onEnded]);

  // Controls Visibility
  const showControlsHandler = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
      showControlsHandler();
    }
  }, [isPlaying, showControlsHandler]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      // Prevent default scrolling for space and arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          togglePlay();
          break;
        case 'ArrowRight':
        case 'KeyL':
          skip(10);
          break;
        case 'ArrowLeft':
        case 'KeyJ':
          skip(-10);
          break;
        case 'ArrowUp':
          handleVolumeChange([Math.min(volume + 0.1, 1)]);
          break;
        case 'ArrowDown':
          handleVolumeChange([Math.max(volume - 0.1, 0)]);
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyM':
          toggleMute();
          break;
      }
      showControlsHandler();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, showControlsHandler]);

  // Actions
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) setVolume(0);
      else setVolume(1);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleQualityChange = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setQuality(level);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  // Smart Click Handler (Double tap detection)
  const handleSmartClick = (e: React.MouseEvent<HTMLDivElement>, side: 'left' | 'right' | 'center') => {
    e.stopPropagation();
    const now = Date.now();
    const timeDiff = now - lastClickTimeRef.current;

    if (timeDiff < 300) {
      // Double click detected
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }

      if (side === 'left') {
        skip(-10);
        setSkipAnimation({ side: 'left', id: now });
      } else if (side === 'right') {
        skip(10);
        setSkipAnimation({ side: 'right', id: now });
      } else {
        toggleFullscreen();
      }
    } else {
      // Single click - capture current state to decide action
      const currentControlsState = showControls;
      
      clickTimeoutRef.current = setTimeout(() => {
        // Clear any auto-hide timeout
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
          controlsTimeoutRef.current = null;
        }
        
        // Toggle based on state at time of click
        setShowControls(!currentControlsState);
        clickTimeoutRef.current = null;
      }, 300);
    }

    lastClickTimeRef.current = now;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black group overflow-hidden select-none",
        isFullscreen ? "w-screen h-screen fixed inset-0 z-50 rounded-none" : "w-full rounded-xl shadow-2xl aspect-video"
      )}
      onMouseMove={showControlsHandler}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        playsInline
      />

      {/* Gesture Zones */}
      <div className="absolute inset-0 flex z-10">
        <div
          className="w-[35%] h-full z-20"
          onClick={(e) => handleSmartClick(e, 'left')}
          onDoubleClick={(e) => e.stopPropagation()} // Prevent native double click
        />
        <div
          className="w-[30%] h-full z-20"
          onClick={(e) => handleSmartClick(e, 'center')}
          onDoubleClick={(e) => e.stopPropagation()}
        />
        <div
          className="w-[35%] h-full z-20"
          onClick={(e) => handleSmartClick(e, 'right')}
          onDoubleClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Skip Animation Overlay */}
      {skipAnimation && (
        <div
          key={skipAnimation.id}
          className={cn(
            "absolute top-0 bottom-0 flex items-center justify-center w-[40%] z-30 bg-white/10 pointer-events-none animate-in fade-in zoom-in duration-300",
            skipAnimation.side === 'left' ? "left-0 rounded-r-full" : "right-0 rounded-l-full"
          )}
          onAnimationEnd={() => setSkipAnimation(null)}
        >
          <div className="flex flex-col items-center text-white">
            {skipAnimation.side === 'left' ? (
              <>
                <ChevronsLeft className="w-12 h-12 mb-2 animate-pulse" />
                <span className="text-sm font-bold">-10 giây</span>
              </>
            ) : (
              <>
                <ChevronsRight className="w-12 h-12 mb-2 animate-pulse" />
                <span className="text-sm font-bold">+10 giây</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
          <div className="text-center p-4">
            <p className="text-red-500 font-bold mb-2">Lỗi</p>
            <p className="text-white text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className={cn(
        "absolute top-4 left-4 z-40 transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 backdrop-blur-sm"
          onClick={handleBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Dimming Overlay */}
      <div className={cn(
        "absolute inset-0 bg-black/40 z-30 transition-opacity duration-300 pointer-events-none",
        showControls ? "opacity-100" : "opacity-0"
      )} />

      {/* Center Controls Overlay */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center gap-24 z-40 transition-opacity duration-300 pointer-events-none",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); skip(-10); }}
          className="text-white hover:bg-transparent hover:text-white/80 w-24 h-24 rounded-full pointer-events-auto"
        >
          <SkipBack className="w-12 h-12" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="text-white hover:bg-transparent hover:text-white/80 w-32 h-32 rounded-full pointer-events-auto"
        >
          {isPlaying ? <Pause className="w-16 h-16 fill-white" /> : <Play className="w-16 h-16 fill-white ml-2" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); skip(10); }}
          className="text-white hover:bg-transparent hover:text-white/80 w-24 h-24 rounded-full pointer-events-auto"
        >
          <SkipForward className="w-12 h-12" />
        </Button>
      </div>

      {/* Controls Overlay */}
      <div className={cn(
        "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 z-30 pointer-events-none",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        {/* Progress Bar Container */}
        <div className="px-4 pb-0 group/progress pointer-events-auto">
          {/* Hover Preview could go here */}
          <div className="relative h-1.5 w-full cursor-pointer touch-none select-none flex items-center">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="z-20 py-4" // Add padding to make hit area larger
            />
            {/* Buffered Bar */}
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-white/30 rounded-full pointer-events-none"
              style={{ width: `${(buffered / duration) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls Bar */}
        <div className="px-4 pb-4 pt-2 flex items-center justify-between gap-4 pointer-events-auto">
          {/* Left Controls */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20">
              {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
            </Button>

            <div className="flex items-center gap-1 group/volume">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20 w-8 h-8">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 ease-in-out">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>

            <div className="text-white text-xs md:text-sm font-medium tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Settings Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-gray-800 text-white backdrop-blur-md w-56">
                <DropdownMenuLabel>Cài đặt</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />

                {/* Speed Submenu */}
                <DropdownMenuLabel className="text-xs text-gray-400 mt-2">Tốc độ phát</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={playbackRate.toString()} onValueChange={(v) => handlePlaybackRateChange(parseFloat(v))}>
                  <DropdownMenuRadioItem value="0.5">0.5x</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="1">Chuẩn</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="1.5">1.5x</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="2">2.0x</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                {/* Quality Submenu (if HLS) */}
                {qualities.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-gray-700 my-2" />
                    <DropdownMenuLabel className="text-xs text-gray-400">Chất lượng</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={quality.toString()} onValueChange={(v) => handleQualityChange(parseInt(v))}>
                      <DropdownMenuRadioItem value="-1">Tự động</DropdownMenuRadioItem>
                      {qualities.map((q) => (
                        <DropdownMenuRadioItem key={q.level} value={q.level.toString()}>
                          {q.height}p
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

