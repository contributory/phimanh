"use client";

import { useState, useEffect } from "react";
import Episode from "./episode";
import VideoPlayer from "../player/video-player";
import EmbedPlayer from "../player/embed-player";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Play, Calendar, Clock, Globe, Film, ChevronRight, ChevronDown, Star, Users, Clapperboard, Tag, Sparkles, Heart } from "lucide-react";
import Link from "next/link";
import { cn, decodeHtmlEntities } from "@/lib/utils";

interface DescriptionProps {
  movie: any;
  serverData: any;
  slug: string;
  thumb_url?: string;
  relatedMovies?: any[];
}

export default function Description({ movie, serverData, slug, thumb_url, relatedMovies = [] }: DescriptionProps) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [currentEpisodeUrl, setCurrentEpisodeUrl] = useState("");
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<{
    server: number;
    episode: number;
  } | null>(null);
  const [playerMode, setPlayerMode] = useState<'m3u8' | 'embed'>('m3u8');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const handleServerChange = (serverIndex: number) => {
    setCurrentEpisodeIndex({ server: serverIndex, episode: 0 });
    if (serverData && serverData[serverIndex]?.server_data?.length > 0) {
      const firstEpisode = serverData[serverIndex].server_data[0];
      if (playerMode === 'm3u8' && firstEpisode?.link_m3u8) {
        setCurrentEpisodeUrl(firstEpisode.link_m3u8);
      } else if (playerMode === 'embed' && firstEpisode?.link_embed) {
        setCurrentEpisodeUrl(firstEpisode.link_embed);
      }
    }
  };

  const handleSelectEpisode = (
    link: string,
    serverIndex: number,
    episodeIndex: number
  ) => {
    setCurrentEpisodeUrl(link);
    setCurrentEpisodeIndex({ server: serverIndex, episode: episodeIndex });
  };

  // Save movie to recently watched
  useEffect(() => {
    const Cookies = require('js-cookie');
    const recentlyWatched = JSON.parse(Cookies.get('recentlyWatched') || '[]');
    const movieEntry = {
      slug: movie.slug,
      name: movie.name,
      poster_url: movie.poster_url,
      year: movie.year,
      quality: movie.quality,
      timestamp: Date.now(),
    };
    const filtered = recentlyWatched.filter((m: any) => m.slug !== movie.slug);
    filtered.unshift(movieEntry);
    const updated = filtered.slice(0, 10);
    Cookies.set('recentlyWatched', JSON.stringify(updated), { expires: 30 });
  }, [movie.slug]);

  // Fetch recommendations based on multiple factors
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // We use the same API instance or a fetch call to an internal/external API
        // For simplicity and speed, we use the public API directly or a helper
        const res = await fetch(`https://phimapi.com/phim/${movie.slug}`);
        const fullMovieData = await res.json();
        
        const category = movie.category?.[0]?.slug;
        const country = movie.country?.[0]?.slug;
        const year = movie.year;
        const type = fullMovieData.movie?.type || 'phim-moi';

        const urls = [
          category ? `https://phimapi.com/v1/api/the-loai/${category}?limit=10` : null,
          country ? `https://phimapi.com/v1/api/danh-sach/phim-bo?country=${country}&limit=10` : null,
          year ? `https://phimapi.com/v1/api/danh-sach/phim-bo?year=${year}&limit=10` : null,
          `https://phimapi.com/v1/api/danh-sach/${type === 'series' ? 'phim-bo' : 'phim-le'}?limit=10`
        ].filter(Boolean);

        const results = await Promise.allSettled(urls.map(url => fetch(url!).then(r => r.json())));
        
        let allItems: any[] = [];
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            allItems = [...allItems, ...(result.value.data?.items || [])];
          }
        });

        const unique = Array.from(new Map(allItems.map(item => [item.slug, item])).values())
          .filter((m: any) => m.slug !== movie.slug)
          .sort(() => Math.random() - 0.5)
          .slice(0, 20);

        setRecommendations(unique);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      }
    };
    fetchRecommendations();
  }, [movie.slug, movie.category, movie.country, movie.year]);

  // Auto-load last played episode or first episode
  useEffect(() => {
    const savedEpisode = localStorage.getItem(`lastEpisode_${movie.slug}`);
    const savedIndex = localStorage.getItem(`lastEpisodeIndex_${movie.slug}`);
    if (savedEpisode && savedIndex) {
      setCurrentEpisodeUrl(savedEpisode);
      setCurrentEpisodeIndex(JSON.parse(savedIndex));
    } else if (serverData && serverData.length > 0) {
      let defaultServerIndex = 0;
      for (let i = 0; i < serverData.length; i++) {
        if (serverData[i].server_name.toLowerCase().includes("thuyết minh")) {
          defaultServerIndex = i;
          break;
        }
      }

      const defaultServer = serverData[defaultServerIndex];
      if (defaultServer?.server_data?.length > 0) {
        const firstEpisode = defaultServer.server_data[0];
        if (playerMode === 'm3u8' && firstEpisode?.link_m3u8) {
          setCurrentEpisodeUrl(firstEpisode.link_m3u8);
          setCurrentEpisodeIndex({ server: defaultServerIndex, episode: 0 });
        } else if (playerMode === 'embed' && firstEpisode?.link_embed) {
          setCurrentEpisodeUrl(firstEpisode.link_embed);
          setCurrentEpisodeIndex({ server: defaultServerIndex, episode: 0 });
        }
      }
    }
  }, [serverData, movie.slug]);

  // Save current episode to localStorage
  useEffect(() => {
    if (currentEpisodeUrl && currentEpisodeIndex) {
      localStorage.setItem(`lastEpisode_${movie.slug}`, currentEpisodeUrl);
      localStorage.setItem(
        `lastEpisodeIndex_${movie.slug}`,
        JSON.stringify(currentEpisodeIndex)
      );
    }
  }, [currentEpisodeUrl, currentEpisodeIndex, movie.slug]);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pt-4 pb-8 px-2 sm:px-4 lg:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area: Player and Movie Info (Left side on desktop) */}
        <div className="w-full lg:flex-1 min-w-0 space-y-4">
          {/* Player Container */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
            {playerMode === 'm3u8' ? (
              <VideoPlayer
                videoUrl={currentEpisodeUrl}
                autoplay={true}
                poster={movie.thumb_url || movie.poster_url}
                movieTitle={movie.name}
                movieSlug={slug}
                onEnded={() => {
                  if (!serverData || !currentEpisodeIndex) return;

                  const { server, episode } = currentEpisodeIndex;
                  const currentServer = serverData[server];
                  if (!currentServer) return;

                  let nextEpisodeIndex = episode + 1;
                  let nextServerIndex = server;

                  if (nextEpisodeIndex >= currentServer.server_data.length) {
                    nextServerIndex = server + 1;
                    nextEpisodeIndex = 0;
                    if (nextServerIndex >= serverData.length) return;
                  }

                  const nextServer = serverData[nextServerIndex];
                  if (!nextServer || nextEpisodeIndex >= nextServer.server_data.length) return;

                  const nextEpisode = nextServer.server_data[nextEpisodeIndex];
                  if (nextEpisode?.link_m3u8) {
                    setCurrentEpisodeUrl(nextEpisode.link_m3u8);
                    setCurrentEpisodeIndex({
                      server: nextServerIndex,
                      episode: nextEpisodeIndex,
                    });
                  }
                }}
              />
            ) : (
              <EmbedPlayer videoUrl={currentEpisodeUrl} />
            )}
          </div>

          {/* Title and Stats */}
          <div className="space-y-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {movie.name}
            </h1>
            
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 px-3 py-1 text-sm">
                  {movie.year}
                </Badge>
                <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 px-3 py-1 text-sm">
                  {movie.quality}
                </Badge>
                <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 px-3 py-1 text-sm">
                  {movie.lang}
                </Badge>
                <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />
                <span className="text-sm text-white/60 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {movie.time}
                </span>
                <span className="text-sm text-white/60 flex items-center gap-1.5 ml-2">
                  <Globe className="w-4 h-4" /> {movie.country?.map((c: any) => c.name).join(", ")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {movie.trailer_url && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-semibold transition-colors"
                  >
                    <Play className="w-4 h-4" /> Trailer
                  </button>
                )}
                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white/5 rounded-xl p-4 hover:bg-white/[0.08] transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4 text-sm font-semibold text-white">
                  <span>{movie.year}</span>
                  <div className="flex flex-wrap gap-2">
                    {movie.category?.slice(0, 3).map((cat: any) => (
                      <Link
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        #{cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className={cn(
                "text-sm text-white/90 leading-relaxed overflow-hidden transition-all duration-300",
                showDetails ? "max-h-[2000px]" : "max-h-20"
              )}>
                <p className="whitespace-pre-line">{decodeHtmlEntities(movie.content)}</p>
                
                {showDetails && (
                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {movie.director?.length > 0 && (
                      <div>
                        <span className="text-white/50 block text-xs uppercase mb-1">Đạo diễn</span>
                        <span className="text-sm">{movie.director.join(", ")}</span>
                      </div>
                    )}
                    {movie.actor?.length > 0 && (
                      <div>
                        <span className="text-white/50 block text-xs uppercase mb-1">Diễn viên</span>
                        <span className="text-sm line-clamp-2">{movie.actor.join(", ")}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-2 text-sm font-bold text-white hover:underline"
              >
                {showDetails ? "Ẩn bớt" : "Hiện thêm"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Episodes and Recommendations (Right side on desktop) */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          {/* Episode List */}
          <div className="rounded-xl overflow-hidden bg-[#0f0f0f] border border-white/10">
            <Episode
              serverData={serverData}
              currentServerIndex={currentEpisodeIndex?.server || 0}
              currentEpisodeIndex={currentEpisodeIndex?.episode || 0}
              onSelectEpisode={handleSelectEpisode}
              onServerChange={handleServerChange}
              thumb_url={movie.thumb_url}
              playerMode={playerMode}
              onPlayerModeChange={(mode) => {
                setPlayerMode(mode);
                if (currentEpisodeIndex && serverData) {
                  const currentEpisode = serverData[currentEpisodeIndex.server]?.server_data[currentEpisodeIndex.episode];
                  if (currentEpisode) {
                    if (mode === 'm3u8' && currentEpisode.link_m3u8) {
                      setCurrentEpisodeUrl(currentEpisode.link_m3u8);
                    } else if (mode === 'embed' && currentEpisode.link_embed) {
                      setCurrentEpisodeUrl(currentEpisode.link_embed);
                    }
                  }
                }
              }}
              compact={true}
            />
          </div>

          {/* Recommendations Sidebar List */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 px-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Đề xuất cho bạn
            </h2>
            
            <div className="flex flex-col gap-3">
              {recommendations.map((rec: any) => (
                <Link
                  key={rec.slug}
                  href={`/watch?slug=${rec.slug}`}
                  className="flex gap-3 group"
                >
                  <div className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-white/5">
                    <img
                      src={rec.poster_url?.startsWith("http") ? rec.poster_url : `https://phimimg.com/${rec.poster_url}`}
                      alt={rec.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                    />
                    <div className="absolute bottom-1 right-1 px-1 bg-black/80 rounded text-[10px] font-bold text-white">
                      {rec.quality || "HD"}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors leading-tight">
                      {rec.name}
                    </h3>
                    <p className="text-xs text-white/50 mt-1 line-clamp-1">
                      {rec.year} • {rec.lang}
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5 line-clamp-1">
                      {rec.origin_name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
        <DialogContent className="sm:max-w-4xl bg-black/95 backdrop-blur-xl border-white/10 rounded-2xl">
          <DialogTitle className="text-white text-xl font-bold mb-4 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl shadow-lg shadow-rose-500/30">
              <Play className="w-5 h-5 text-white" />
            </div>
            Trailer phim
          </DialogTitle>
          <div className="aspect-video rounded-xl overflow-hidden ring-1 ring-white/10">
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailer_url?.split("v=")[1]}`}
              className="w-full h-full"
              allowFullScreen
              title="Movie Trailer"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
