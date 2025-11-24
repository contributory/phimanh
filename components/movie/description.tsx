"use client";

import { useState, useEffect } from "react";
import Episode from "./episode";
import VideoPlayer from "../player/video-player";
import EmbedPlayer from "../player/embed-player";
import BackButton from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function Description({ movie, serverData }: any) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [currentEpisodeUrl, setCurrentEpisodeUrl] = useState("");
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<{
    server: number;
    episode: number;
  } | null>(null);
  const [playerMode, setPlayerMode] = useState<'m3u8' | 'embed'>('m3u8');

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
    // Remove if already exists
    const filtered = recentlyWatched.filter((m: any) => m.slug !== movie.slug);
    filtered.unshift(movieEntry); // Add to front
    // Keep only last 10
    const updated = filtered.slice(0, 10);
    Cookies.set('recentlyWatched', JSON.stringify(updated), { expires: 30 }); // Expires in 30 days
  }, [movie.slug]);

  // Auto-load last played episode or first episode on component mount, prioritizing "Thuyết Minh" server
  useEffect(() => {
    const savedEpisode = localStorage.getItem(`lastEpisode_${movie.slug}`);
    const savedIndex = localStorage.getItem(`lastEpisodeIndex_${movie.slug}`);
    if (savedEpisode && savedIndex) {
      setCurrentEpisodeUrl(savedEpisode);
      setCurrentEpisodeIndex(JSON.parse(savedIndex));
    } else if (serverData && serverData.length > 0) {
      // Find server with "Thuyết Minh" in name
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

  // Save current episode to localStorage when it changes
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
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Video Player Section */}
      <div className="w-full">
        <div className="relative">
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

                // If next episode doesn't exist in current server, go to next server
                if (nextEpisodeIndex >= currentServer.server_data.length) {
                  nextServerIndex = server + 1;
                  nextEpisodeIndex = 0;
                  if (nextServerIndex >= serverData.length) return; // No more episodes
                }

                const nextServer = serverData[nextServerIndex];
                if (
                  !nextServer ||
                  nextEpisodeIndex >= nextServer.server_data.length
                )
                  return;

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
            <EmbedPlayer
              videoUrl={currentEpisodeUrl}
            />
          )}
        </div>
      </div>

      {/* Movie Information Section */}
      <Card className="shadow-2xl rounded-3xl bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50">
        <div className="p-6 items-center">
          <details className="cursor-pointer">
            <summary className="list-none">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline">
                {movie.name}{" "}
                <Badge
                  variant="default"
                  className="bg-blue-600 text-white shadow text-xs"
                >
                  {movie.quality}
                </Badge>
              </h1>
            </summary>
            <div className="mt-4 space-y-4">
              <h2 className="text-lg md:text-xl font-bold text-blue-700 dark:text-blue-400">
                {movie.origin_name}
              </h2>
              <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                <Badge
                  variant="default"
                  className="bg-green-600 text-white shadow"
                >
                  {movie.lang}
                </Badge>
                <Badge
                  variant="default"
                  className="bg-purple-600 text-white shadow"
                >
                  {movie.time}
                </Badge>
                <Badge
                  variant="default"
                  className="bg-yellow-500 text-white shadow"
                >
                  {movie.year}
                </Badge>
              </div>

              {/* Movie Details Dropdown */}
              <details className="mt-4 cursor-pointer">
                <summary className="font-semibold text-gray-900 dark:text-white text-base mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Chi tiết phim
                </summary>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Đạo diễn:
                      </p>
                      <p className="mt-1">{movie.director.join(", ")}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Diễn viên:
                      </p>
                      <p className="mt-1">{movie.actor.join(", ")}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Thể loại:
                      </p>
                      <p className="mt-1">
                        {movie.category
                          .map((cat: { name: string }) => cat.name)
                          .join(", ")}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Quốc gia:
                      </p>
                      <p className="mt-1">
                        {movie.country
                          .map((c: { name: string }) => c.name)
                          .join(", ")}
                      </p>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5 shadow-lg">
                    <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
                      Nội dung phim
                    </h3>
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {movie.content}
                    </p>
                  </div>
                </div>
              </details>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 py-2 justify-center md:justify-start">
                {movie.trailer_url && (
                  <Button
                    size="lg"
                    variant="secondary"
                    className="font-bold px-8 py-2 text-lg rounded-xl shadow-lg transition-all hover:bg-gray-700"
                    onClick={() => setShowTrailer(true)}
                  >
                    Xem Trailer
                  </Button>
                )}
              </div>
            </div>
          </details>
        </div>

        {/* Episode Selector Section - Always Visible */}
        <div className="p-6 lg:w-1/2 lg:mx-auto">
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
              // Update current url based on new mode
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
          />
        </div>
      </Card>

      {/* Trailer Modal */}
      <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
        <DialogContent className="sm:max-w-4xl bg-black/90 border-gray-800">
          <DialogTitle className="text-white text-xl font-bold mb-2">
            Trailer phim
          </DialogTitle>
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailer_url.split("v=")[1]
                }`}
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
