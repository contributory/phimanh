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
  ChevronsLeft,
  PictureInPicture2,
  Check,
  Subtitles,
  Volume2 as VolumeIcon,
  Languages
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useLoading } from "@/components/ui/loading-context";
import { useVideoContext } from "@/components/providers/video-provider";
import { searchSubtitles, Subtitle } from "@/services/subtitles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

interface VideoPlayerProps {
  videoUrl: string;
  autoplay?: boolean;
  poster?: string;
  movieTitle?: string;
  movieSlug?: string;
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
  movieTitle,
  movieSlug,
  onError,
  onEnded,
}: VideoPlayerProps) => {
  const { state: globalState, setVideo, updateState: updateGlobalState, videoRef: globalVideoRef } = useVideoContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<HLS | null>(null);
  const router = useRouter();
  const { showLoading } = useLoading();

  // local state that mirrors global state for UI response
  const [isPlaying, setIsPlaying] = useState(globalState.isPlaying);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(globalState.currentTime);
  const [duration, setDuration] = useState(globalState.duration);
  const [volume, setVolume] = useState(globalState.volume);
  const [isMuted, setIsMuted] = useState(globalState.isMuted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isPiPSupported, setIsPiPSupported] = useState(false);

  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true);
    setIsPiPSupported(typeof document !== "undefined" && !!document.pictureInPictureEnabled);
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(globalState.playbackRate);
  const [quality, setQuality] = useState<number>(-1); // -1 is auto
  const [qualities, setQualities] = useState<{ height: number, level: number }[]>([]);

  // Use global video ref instead of local one
  const videoRef = globalVideoRef;

  // Initialize global state with current video info
  useEffect(() => {
    if (videoUrl && videoUrl !== globalState.videoUrl) {
      setVideo(videoUrl, movieTitle, poster, movieSlug);
    }
  }, [videoUrl, movieTitle, poster, movieSlug, setVideo, globalState.videoUrl]);

  // Subtitle & TTS State
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [currentSubText, setCurrentSubText] = useState("");
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize TTS
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Fetch Subtitles
  useEffect(() => {
    const fetchSubs = async () => {
      if (movieTitle) {
        const results = await searchSubtitles(movieTitle);
        setSubtitles(results);
      }
    };
    fetchSubs();
  }, [movieTitle]);

  // Handle Subtitle Text Changes for TTS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isTTSEnabled || !synthRef.current) return;

    const onTrackChange = (event: Event) => {
      const track = event.target as TextTrack;
      if (track.mode === 'showing') {
        const onCueChange = () => {
          if (track.activeCues && track.activeCues.length > 0) {
            const cue = track.activeCues[0] as VTTCue;
            const text = cue.text.replace(/<[^>]*>/g, ''); // Remove HTML tags
            if (text !== currentSubText) {
              setCurrentSubText(text);
              speak(text);
            }
          }
        };
        track.oncuechange = onCueChange;
      }
    };

    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      track.addEventListener('cuechange', () => {
        if (track.mode === 'showing' && track.activeCues && track.activeCues.length > 0) {
          const cue = track.activeCues[0] as VTTCue;
          const text = cue.text.replace(/<[^>]*>/g, '');
          setCurrentSubText(text);
          speak(text);
        }
      });
    }
  }, [isTTSEnabled]);

  const speak = (text: string) => {
    if (!synthRef.current || !isTTSEnabled) return;
    
    // Cancel previous speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN'; // Set to Vietnamese
    utterance.rate = playbackRate;
    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handleSubtitleChange = (subId: string | null) => {
    const video = videoRef.current;
    if (!video) return;

    // Remove existing tracks
    const existingTracks = video.querySelectorAll('track');
    existingTracks.forEach(track => track.remove());

    setActiveSubtitle(subId);

    if (subId) {
      const selectedSub = subtitles.find(s => s.id === subId);
      if (selectedSub) {
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = selectedSub.label;
        track.srclang = selectedSub.lang;
        track.src = selectedSub.url;
        track.default = true;
        video.appendChild(track);
        
        // Ensure track is showing
        setTimeout(() => {
          if (video.textTracks.length > 0) {
            video.textTracks[0].mode = 'showing';
          }
        }, 100);
      }
    }
  };

  // Double tap state
  const [skipAnimation, setSkipAnimation] = useState<{ side: 'left' | 'right', id: number } | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleBack = async () => {
    showLoading();
    if (videoRef.current && isPlaying && document.pictureInPictureEnabled) {
      try {
        await videoRef.current.requestPictureInPicture();
      } catch (err) {
        console.error("Auto PiP failed:", err);
      }
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // Sync local UI with global state changes
  useEffect(() => {
    setIsPlaying(globalState.isPlaying);
    setCurrentTime(globalState.currentTime);
    setDuration(globalState.duration);
    // update loading state based on global activity if needed
  }, [globalState.isPlaying, globalState.currentTime, globalState.duration]);

  // HLS and Video Setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl || videoUrl.trim() === '') {
      setIsLoading(false);
      setError(null);
      return;
    }

    // If this video is already being handled by GlobalPlayer, we don't re-init HLS here
    // But we might need to attach the video to our UI container if it was moved.
    // In this implementation, the <video> stays in GlobalPlayer and we just move it visually
    // or we can have the video element move between containers using appendChild.

    setIsLoading(false); 
  }, [videoUrl]);

  // Sync volume/mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, videoRef]);

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

  // Fullscreen change event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFullscreen) {
        setIsFullscreen(false);

        // Unlock orientation when exiting fullscreen via browser controls
        if (screen.orientation && (screen.orientation as any).unlock) {
          try {
            (screen.orientation as any).unlock();
          } catch (err) {
            console.log('Screen orientation unlock failed:', err);
          }
        }
      } else {
        setIsFullscreen(true);
      }
    };

    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    events.forEach(event => document.addEventListener(event, handleFullscreenChange));
    
    return () => {
      events.forEach(event => document.removeEventListener(event, handleFullscreenChange));
    };
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

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
          setSkipAnimation({ side: 'right', id: Date.now() });
          break;
        case 'ArrowLeft':
        case 'KeyJ':
          skip(-10);
          setSkipAnimation({ side: 'left', id: Date.now() });
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
      // showControlsHandler(); // Removed to prevent controls from showing on key press
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

    try {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFullscreen) {
        // Exit PiP if entering fullscreen
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        }

        const el = containerRef.current;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if ((el as any).webkitRequestFullscreen) {
          await (el as any).webkitRequestFullscreen();
        } else if ((el as any).mozRequestFullScreen) {
          await (el as any).mozRequestFullScreen();
        } else if ((el as any).msRequestFullscreen) {
          await (el as any).msRequestFullscreen();
        }
        
        setIsFullscreen(true);

        // Lock orientation to landscape on mobile
        if (screen.orientation && (screen.orientation as any).lock) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch (err) {
            console.log('Screen orientation lock failed:', err);
          }
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        
        setIsFullscreen(false);

        // Unlock orientation
        if (screen.orientation && (screen.orientation as any).unlock) {
          try {
            (screen.orientation as any).unlock();
          } catch (err) {
            console.log('Screen orientation unlock failed:', err);
          }
        }
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP toggle failed:", err);
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
        if (!currentControlsState) {
          showControlsHandler();
        } else {
          setShowControls(false);
        }
        clickTimeoutRef.current = null;
      }, 300);
    }

    lastClickTimeRef.current = now;
  };

  const isActuallyFullscreen = isClient && !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );

  return (
    <div
      ref={containerRef}
      id="video-player-container"
      className={cn(
        "relative bg-black group overflow-hidden select-none",
        isFullscreen ? "w-screen h-screen fixed inset-0 z-[99999]" : "w-full aspect-video",
        !showControls && isPlaying && "cursor-none"
      )}
      onMouseMove={(e) => {
        if (e.movementX !== 0 || e.movementY !== 0) {
          showControlsHandler();
        }
      }}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element Placeholder Container */}
      <div id="video-portal" className="w-full h-full" />

      {/* Gesture Zones */}
      <div className="absolute inset-0 flex z-[10]">
        <div
          className="w-[35%] h-full z-[20]"
          onClick={(e) => handleSmartClick(e, 'left')}
          onDoubleClick={(e) => e.stopPropagation()} // Prevent native double click
        />
        <div
          className="w-[30%] h-full z-[20]"
          onClick={(e) => handleSmartClick(e, 'center')}
          onDoubleClick={(e) => e.stopPropagation()}
        />
        <div
          className="w-[35%] h-full z-[20]"
          onClick={(e) => handleSmartClick(e, 'right')}
          onDoubleClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Skip Animation Overlay */}
      {skipAnimation && (
        <div
          key={skipAnimation.id}
          className={cn(
            "absolute top-0 bottom-0 flex items-center justify-center w-[40%] z-[30] bg-white/10 pointer-events-none animate-in fade-in zoom-in duration-300",
            skipAnimation.side === 'left' ? "left-0 rounded-r-full" : "right-0 rounded-l-full"
          )}
          onAnimationEnd={() => setSkipAnimation(null)}
        >
          <div className="flex flex-col items-center text-white">
            {skipAnimation.side === 'left' ? (
              <>
                <ChevronsLeft className="w-8 h-8 sm:w-12 sm:h-12 mb-1 sm:mb-2 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold">-10 giây</span>
              </>
            ) : (
              <>
                <ChevronsRight className="w-8 h-8 sm:w-12 sm:h-12 mb-1 sm:mb-2 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold">+10 giây</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-[20] pointer-events-none">
          <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-white animate-spin" />
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-[30]">
          <div className="text-center p-4">
            <p className="text-red-500 font-bold mb-2">Lỗi</p>
            <p className="text-white text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className={cn(
        "absolute top-0 inset-x-0 z-[40] flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3",
        "bg-gradient-to-b from-black/70 to-transparent transition-all duration-300",
        showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Quay lại"
          className="shrink-0 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 sm:w-10 sm:h-10 backdrop-blur-sm"
          onClick={handleBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        {movieTitle && (
          <p className="min-w-0 truncate text-white text-sm sm:text-base font-medium drop-shadow">
            {movieTitle}
          </p>
        )}
      </div>

      {/* Dimming Overlay */}
      <div className={cn(
        "absolute inset-0 bg-black/40 z-[30] transition-opacity duration-300 pointer-events-none",
        showControls ? "opacity-100" : "opacity-0"
      )} />

      {/* Center Controls Overlay */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center gap-8 sm:gap-16 md:gap-24 z-[40] transition-opacity duration-300 pointer-events-none",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Lùi 10 giây"
          onClick={(e) => { e.stopPropagation(); skip(-10); }}
          className="text-white hover:bg-white/10 active:scale-95 transition-transform w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full pointer-events-auto"
        >
          <SkipBack className="w-6 h-6 sm:w-9 sm:h-9 md:w-11 md:h-11" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label={isPlaying ? "Tạm dừng" : "Phát"}
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="text-white hover:bg-white/10 active:scale-95 transition-transform w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full pointer-events-auto"
        >
          {isPlaying
            ? <Pause className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 fill-white" />
            : <Play className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 fill-white ml-1" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Tua 10 giây"
          onClick={(e) => { e.stopPropagation(); skip(10); }}
          className="text-white hover:bg-white/10 active:scale-95 transition-transform w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full pointer-events-auto"
        >
          <SkipForward className="w-6 h-6 sm:w-9 sm:h-9 md:w-11 md:h-11" />
        </Button>
      </div>

      {/* Controls Overlay */}
      <div className={cn(
        "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 z-[30] pointer-events-none",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        {/* Progress Bar Container */}
        <div className="px-2 sm:px-4 pb-0 group/progress pointer-events-auto">
          <div className="relative w-full cursor-pointer touch-none select-none flex items-center">
            {/* Buffered Bar */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-white/20 rounded-full overflow-hidden pointer-events-none">
              <div
                className="h-full bg-white/40"
                style={{ width: duration ? `${Math.min((buffered / duration) * 100, 100)}%` : "0%" }}
              />
            </div>
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              aria-label="Tiến trình phát"
              className="relative z-[20] py-4"
              trackClassName="h-1 bg-transparent transition-[height] duration-200 group-hover/progress:h-1.5"
              rangeClassName="bg-red-600"
              thumbClassName="h-3.5 w-3.5 border-0 bg-red-600 opacity-0 transition-opacity max-sm:opacity-100 group-hover/progress:opacity-100 focus-visible:opacity-100"
            />
          </div>
        </div>

        {/* Controls Bar */}
        <div className="px-2 sm:px-4 pb-2 sm:pb-4 pt-1 sm:pt-2 flex items-center justify-between gap-2 sm:gap-4 pointer-events-auto">
          {/* Left Controls */}
          <div className="flex min-w-0 items-center gap-1 sm:gap-2 md:gap-3">
            <Button variant="ghost" size="icon" aria-label={isPlaying ? "Tạm dừng" : "Phát"} onClick={togglePlay} className="text-white hover:bg-white/20 w-9 h-9 sm:w-10 sm:h-10">
              {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-white" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />}
            </Button>

            <div className="flex items-center gap-1 group/volume">
              <Button variant="ghost" size="icon" aria-label={isMuted || volume === 0 ? "Bật tiếng" : "Tắt tiếng"} onClick={toggleMute} className="text-white hover:bg-white/20 w-9 h-9 sm:w-8 sm:h-8">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <div className="hidden sm:block w-0 overflow-hidden transition-all duration-300 ease-in-out group-hover/volume:w-20 group-focus-within/volume:w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  aria-label="Âm lượng"
                  className="w-20"
                  trackClassName="h-1 bg-white/30"
                  rangeClassName="bg-white"
                  thumbClassName="h-3 w-3 border-0 bg-white"
                />
              </div>
            </div>

            <div className="text-white text-[11px] sm:text-sm font-medium tabular-nums whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            {/* Settings Menu */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Cài đặt" className="text-white hover:bg-white/20 w-9 h-9 sm:w-10 sm:h-10">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                container={isActuallyFullscreen ? containerRef.current : undefined}
                className="bg-black/90 border-gray-800 text-white backdrop-blur-md w-56 sm:w-64 max-h-[60vh] sm:max-h-[80vh] overflow-y-auto custom-scrollbar z-[10002]"
              >
                <DropdownMenuLabel>Cài đặt</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />

                  {/* Speed Submenu */}
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">Tốc độ phát</DropdownMenuLabel>
                  <div className="grid grid-cols-2 gap-1 p-1">
                    {[0.5, 1, 1.5, 2].map((rate) => (
                      <DropdownMenuItem
                        key={rate}
                        onClick={() => handlePlaybackRateChange(rate)}
                        className={cn(
                          "flex items-center justify-center cursor-pointer transition-colors text-xs py-2 rounded-md",
                          playbackRate === rate ? "bg-red-600/20 text-red-500 font-bold border border-red-500/50" : "hover:bg-white/10 border border-transparent"
                        )}
                      >
                        <span>{rate === 1 ? "Chuẩn" : `${rate}x`}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>

                  {/* Quality Submenu (if HLS) */}
                  {qualities.length > 0 && (
                    <>
                      <DropdownMenuSeparator className="bg-gray-800 my-2" />
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gray-500">Chất lượng</DropdownMenuLabel>
                      <div className="grid grid-cols-3 gap-1 p-1">
                        <DropdownMenuItem
                          onClick={() => handleQualityChange(-1)}
                          className={cn(
                            "flex items-center justify-center cursor-pointer transition-colors text-[10px] py-1.5 rounded-md border",
                            quality === -1 ? "bg-red-600/20 text-red-500 font-bold border-red-500/50" : "hover:bg-white/10 border-transparent"
                          )}
                        >
                          <span>Auto</span>
                        </DropdownMenuItem>
                        {qualities.map((q) => (
                          <DropdownMenuItem
                            key={q.level}
                            onClick={() => handleQualityChange(q.level)}
                            className={cn(
                              "flex items-center justify-center cursor-pointer transition-colors text-[10px] py-1.5 rounded-md border",
                              quality === q.level ? "bg-red-600/20 text-red-500 font-bold border-red-500/50" : "hover:bg-white/10 border-transparent"
                            )}
                          >
                            <span>{q.height}p</span>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Subtitles & TTS */}
                  <DropdownMenuSeparator className="bg-gray-800 my-2" />
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gray-500">Phụ đề & TTS</DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <DropdownMenuCheckboxItem
                      checked={isTTSEnabled}
                      onCheckedChange={setIsTTSEnabled}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <VolumeIcon className="w-4 h-4" />
                        <span>Đọc phụ đề (TTS)</span>
                      </div>
                    </DropdownMenuCheckboxItem>
                    
                    <DropdownMenuSeparator className="bg-gray-800 my-1" />
                    
                    <DropdownMenuItem
                      onClick={() => handleSubtitleChange(null)}
                      className={cn(
                        "flex items-center justify-between cursor-pointer transition-colors",
                        activeSubtitle === null ? "bg-red-600/20 text-red-500 font-bold" : "hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Subtitles className="w-4 h-4" />
                        <span>Tắt phụ đề</span>
                      </div>
                      {activeSubtitle === null && <Check className="w-4 h-4" />}
                    </DropdownMenuItem>

                    {subtitles.map((sub) => (
                      <DropdownMenuItem
                        key={sub.id}
                        onClick={() => handleSubtitleChange(sub.id)}
                        className={cn(
                          "flex items-center justify-between cursor-pointer transition-colors",
                          activeSubtitle === sub.id ? "bg-red-600/20 text-red-500 font-bold" : "hover:bg-white/10"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Languages className="w-4 h-4" />
                          <span className="truncate max-w-[150px]">{sub.label}</span>
                        </div>
                        {activeSubtitle === sub.id && <Check className="w-4 h-4" />}
                      </DropdownMenuItem>
                    ))}

                    {subtitles.length === 0 && (
                      <div className="px-2 py-1 text-xs text-gray-500 italic">
                        Không tìm thấy phụ đề
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {isPiPSupported && (
              <Button variant="ghost" size="icon" aria-label="Thu nhỏ (PiP)" onClick={togglePiP} className="hidden sm:inline-flex text-white hover:bg-white/20 w-9 h-9 sm:w-10 sm:h-10">
                <PictureInPicture2 className="w-5 h-5" />
              </Button>
            )}

            <Button variant="ghost" size="icon" aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"} onClick={toggleFullscreen} className="text-white hover:bg-white/20 w-9 h-9 sm:w-10 sm:h-10">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
