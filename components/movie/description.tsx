"use client";

import { useState, useEffect } from "react";
import Episode from "./episode";
import VideoPlayer from "../player/video-player";
import EmbedPlayer from "../player/embed-player";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Play, Calendar, Clock, Globe, Film, ChevronRight, ChevronDown } from "lucide-react";
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
    <div className="w-full max-w-7xl mx-auto space-y-6 pt-4">
      {/* Main Content: Player + Episode List Side by Side */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Video Player - 2/3 width on desktop */}
        <div className="w-full lg:w-2/3">
          <Card className="shadow-2xl rounded-2xl overflow-hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50">
            <CardContent className="p-0">
              {/* Player */}
              <div className="aspect-video">
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
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                      {movie.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {movie.year}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {movie.time}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" />
                        {movie.country?.map((c: any) => c.name).join(", ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-blue-600 text-white">{movie.quality}</Badge>
                    <Badge className="bg-green-600 text-white">{movie.lang}</Badge>
                    {movie.trailer_url && (
                      <button
                        onClick={() => setShowTrailer(true)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Trailer
                      </button>
                    )}
                  </div>
                </div>

                {/* Movie Details - Single Level Dropdown */}
                <div className="mt-4">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                    Chi tiết phim
                  </button>
                  
                  {showDetails && (
                    <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      {/* Origin Name */}
                      {movie.origin_name && (
                        <p className="text-base font-medium text-blue-600 dark:text-blue-400">
                          {movie.origin_name}
                        </p>
                      )}

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {movie.director?.length > 0 && (
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Đạo diễn:</p>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">{movie.director.join(", ")}</p>
                          </div>
                        )}
                        {movie.actor?.length > 0 && (
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Diễn viên:</p>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">{movie.actor.join(", ")}</p>
                          </div>
                        )}
                        {movie.category?.length > 0 && (
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Thể loại:</p>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                              {movie.category.map((cat: any) => cat.name).join(", ")}
                            </p>
                          </div>
                        )}
                        {movie.country?.length > 0 && (
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Quốc gia:</p>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                              {movie.country.map((c: any) => c.name).join(", ")}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Plot Summary */}
                      {movie.content && (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                          <h3 className="text-sm font-bold mb-2 text-gray-900 dark:text-white">Nội dung phim</h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {movie.content}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Episode List - 1/3 width on desktop */}
        <div className="w-full lg:w-1/3">
          <Card className="shadow-2xl rounded-2xl overflow-hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 h-full">
            <CardContent className="p-0">
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommendations Section - Horizontal Scroll */}
      {recommendations.length > 0 && (
        <Card className="shadow-xl rounded-2xl overflow-hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-blue-500" />
                Phim đề xuất
              </h2>
              {movie.category && movie.category[0] && (
                <Link
                  href={`/category/${movie.category[0].slug}`}
                  className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Xem thêm
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent -mx-4 px-4 sm:-mx-6 sm:px-6">
              {recommendations.map((rec: any) => (
                <Link
                  key={rec.slug}
                  href={`/watch?slug=${rec.slug}`}
                  className="group flex-shrink-0 w-28 sm:w-32"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
                    <img
                      src={rec.poster_url?.startsWith("http") ? rec.poster_url : `https://phimimg.com/${rec.poster_url}`}
                      alt={rec.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium line-clamp-2">
                        {rec.name}
                      </p>
                    </div>
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">
                      {rec.quality || "HD"}
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {rec.name}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trailer Modal */}
      <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
        <DialogContent className="sm:max-w-4xl bg-black/90 border-gray-800">
          <DialogTitle className="text-white text-xl font-bold mb-2">
            Trailer phim
          </DialogTitle>
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailer_url?.split("v=")[1]}`}
              className="w-full h-full rounded-xl border-2 border-gray-700"
              allowFullScreen
              title="Movie Trailer"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
