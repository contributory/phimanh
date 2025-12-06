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

  // Fetch related movies based on category
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (movie.category && movie.category[0]) {
        try {
          const res = await fetch(`https://phimapi.com/v1/api/the-loai/${movie.category[0].slug}?limit=12`);
          const data = await res.json();
          const filtered = (data.data?.items || [])
            .filter((m: any) => m.slug !== movie.slug)
            .slice(0, 12);
          setRecommendations(filtered);
        } catch (error) {
          console.error('Failed to fetch recommendations:', error);
        }
      }
    };
    fetchRecommendations();
  }, [movie.slug, movie.category]);

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
    <div className="w-full max-w-7xl mx-auto space-y-6 pt-4 pb-8">
      {/* Main Content: Player + Episode List */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Video Player - 2/3 width on desktop */}
        <div className="w-full lg:w-2/3">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 bg-gradient-to-b from-slate-900 to-black">
            {/* Decorative glow effects */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />

            {/* Player */}
            <div className="aspect-video relative">
              {playerMode === 'm3u8' ? (
                <VideoPlayer
                  videoUrl={currentEpisodeUrl}
                  autoplay={true}
                  poster={movie.thumb_url || movie.poster_url}
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

            {/* Movie Info Bar */}
            <div className="p-5 sm:p-6 bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl border-t border-white/5">
              {/* Title Section */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight tracking-tight">
                    {movie.name}
                  </h1>
                  {movie.origin_name && (
                    <p className="text-sm text-indigo-400 font-medium mt-1.5 italic">
                      {movie.origin_name}
                    </p>
                  )}

                  {/* Info Pills */}
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full text-sm text-white/80 border border-white/10">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      {movie.year}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full text-sm text-white/80 border border-white/10">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {movie.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full text-sm text-white/80 border border-white/10">
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                      {movie.country?.map((c: any) => c.name).join(", ")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-4 py-1.5 text-sm font-semibold shadow-lg shadow-indigo-500/30">
                    {movie.quality}
                  </Badge>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 px-4 py-1.5 text-sm font-semibold shadow-lg shadow-emerald-500/30">
                    {movie.lang}
                  </Badge>
                  {movie.trailer_url && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105"
                    >
                      <Play className="w-4 h-4" />
                      Trailer
                    </button>
                  )}
                </div>
              </div>

              {/* Details Toggle */}
              <div className="mt-6">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="inline-flex items-center gap-2.5 text-sm font-semibold text-white/70 hover:text-white transition-colors group"
                >
                  <div className={`p-2 rounded-xl transition-all duration-300 ${showDetails ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30' : 'bg-white/10 group-hover:bg-white/20'}`}>
                    <ChevronDown className={`w-4 h-4 transition-all duration-300 ${showDetails ? 'rotate-180 text-white' : 'text-white/70'}`} />
                  </div>
                  Chi tiết phim
                </button>

                <div className={`mt-5 space-y-5 overflow-hidden transition-all duration-500 ease-out ${showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  {/* Info Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {movie.director?.length > 0 && (
                      <div className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/20">
                          <Clapperboard className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">Đạo diễn</p>
                          <p className="mt-1 text-white/60 text-sm">{movie.director.join(", ")}</p>
                        </div>
                      </div>
                    )}
                    {movie.actor?.length > 0 && (
                      <div className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="p-2.5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl shadow-lg shadow-rose-500/20">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">Diễn viên</p>
                          <p className="mt-1 text-white/60 text-sm line-clamp-2">{movie.actor.join(", ")}</p>
                        </div>
                      </div>
                    )}
                    {movie.category?.length > 0 && (
                      <div className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
                          <Tag className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">Thể loại</p>
                          <p className="mt-1 text-white/60 text-sm">
                            {movie.category.map((cat: any) => cat.name).join(", ")}
                          </p>
                        </div>
                      </div>
                    )}
                    {movie.country?.length > 0 && (
                      <div className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20">
                          <Globe className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">Quốc gia</p>
                          <p className="mt-1 text-white/60 text-sm">
                            {movie.country.map((c: any) => c.name).join(", ")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Plot Summary */}
                  {movie.content && (
                    <div className="p-5 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/5">
                      <h3 className="text-sm font-bold mb-3 text-white flex items-center gap-2">
                        <Film className="w-4 h-4 text-indigo-400" />
                        Nội dung phim
                      </h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {movie.content}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Episode List - 1/3 width on desktop */}
        <div className="w-full lg:w-1/3">
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50 h-full">
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
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/30 bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl border border-white/5">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                Phim đề xuất
              </h2>
              {movie.category && movie.category[0] && (
                <Link
                  href={`/category/${movie.category[0].slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group"
                >
                  Xem thêm
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent -mx-5 px-5 sm:-mx-6 sm:px-6">
              {recommendations.map((rec: any) => (
                <Link
                  key={rec.slug}
                  href={`/watch?slug=${rec.slug}`}
                  className="group flex-shrink-0 w-36 sm:w-40"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 shadow-xl group-hover:shadow-2xl group-hover:shadow-indigo-500/20 transition-all duration-500 ring-1 ring-white/10 group-hover:ring-indigo-500/50">
                    <img
                      src={rec.poster_url?.startsWith("http") ? rec.poster_url : `https://phimimg.com/${rec.poster_url}`}
                      alt={rec.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                    {/* Title on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white text-sm font-semibold line-clamp-2 drop-shadow-lg">
                        {rec.name}
                      </p>
                    </div>

                    {/* Quality badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold border-0 shadow-lg px-2 py-0.5">
                        {rec.quality || "HD"}
                      </Badge>
                    </div>

                    {/* Play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-xl shadow-indigo-500/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium text-white/80 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                    {rec.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

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
