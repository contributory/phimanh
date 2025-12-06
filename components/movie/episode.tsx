"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PlayCircle, Server, List } from "lucide-react";

interface EpisodeData {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

interface ServerData {
  server_name: string;
  server_data: EpisodeData[];
}

interface EpisodeProps {
  serverData: ServerData[];
  currentServerIndex: number;
  currentEpisodeIndex: number;
  onSelectEpisode: (
    link: string,
    serverIndex: number,
    episodeIndex: number
  ) => void;
  onServerChange: (serverIndex: number) => void;
  thumb_url: string;
  playerMode: 'm3u8' | 'embed';
  onPlayerModeChange: (mode: 'm3u8' | 'embed') => void;
  compact?: boolean;
}

export default function Episode({
  serverData,
  currentServerIndex,
  currentEpisodeIndex,
  onSelectEpisode,
  onServerChange,
  thumb_url,
  playerMode,
  onPlayerModeChange,
  compact = false,
}: EpisodeProps) {
  const handleServerChange = (index: number) => {
    const firstEpisode = serverData[index]?.server_data?.[0];
    if (firstEpisode) {
      if (playerMode === 'm3u8' && firstEpisode.link_m3u8) {
        onSelectEpisode(firstEpisode.link_m3u8, index, 0);
      } else if (playerMode === 'embed' && firstEpisode.link_embed) {
        onSelectEpisode(firstEpisode.link_embed, index, 0);
      }
    }
    onServerChange(index);
  };

  const handleEpisodeChange = (
    link: string,
    serverIndex: number,
    episodeIndex: number
  ) => {
    onSelectEpisode(link, serverIndex, episodeIndex);
  };

  // Handle edge case: no server data
  if (!serverData || serverData.length === 0) {
    return (
      <div className="w-full p-4 text-center text-gray-500 dark:text-gray-400">
        Không có tập phim nào
      </div>
    );
  }

  const currentServer = serverData[currentServerIndex];

  return (
    <div className={cn("flex flex-col", compact ? "h-full" : "")}>
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <List className="w-4 h-4 text-blue-500" />
            Danh sách tập ({currentServer?.server_data?.length || 0})
          </h4>
        </div>

        {/* Player Mode Switch */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-600 dark:text-gray-400">Phát:</span>
          <div className="flex gap-1 flex-1">
            <Button
              variant={playerMode === 'm3u8' ? "default" : "outline"}
              size="sm"
              onClick={() => onPlayerModeChange('m3u8')}
              className={cn(
                "text-xs flex-1 h-7",
                playerMode === 'm3u8'
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              Mặc định
            </Button>
            <Button
              variant={playerMode === 'embed' ? "default" : "outline"}
              size="sm"
              onClick={() => onPlayerModeChange('embed')}
              className={cn(
                "text-xs flex-1 h-7",
                playerMode === 'embed'
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              Dự phòng
            </Button>
          </div>
        </div>

        {/* Server Selector */}
        {serverData.length > 1 && (
          <Select value={currentServerIndex.toString()} onValueChange={(value) => handleServerChange(parseInt(value))}>
            <SelectTrigger className="w-full h-8 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
              <Server className="w-3 h-3 mr-1 text-gray-500" />
              <SelectValue placeholder="Chọn server" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
              {serverData.map((server, index) => (
                <SelectItem key={index} value={index.toString()} className="text-xs">
                  {server.server_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Episode List */}
      <div className={cn(
        "flex-1 overflow-y-auto",
        compact ? "max-h-[calc(100vh-400px)] lg:max-h-none" : "max-h-[300px]"
      )}>
        <div className="p-2 space-y-1">
          {currentServer?.server_data?.length > 0 ? currentServer.server_data.map((episode, index) => {
            const isActive = index === currentEpisodeIndex;
            return (
              <button
                key={`${currentServerIndex}-${index}`}
                onClick={() => handleEpisodeChange(
                  playerMode === 'm3u8' ? episode.link_m3u8 : episode.link_embed,
                  currentServerIndex,
                  index
                )}
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-left",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                aria-label={`Tập ${episode.name}`}
              >
                {!compact && (
                  <img
                    src={thumb_url}
                    alt={episode.name}
                    loading="lazy"
                    className="w-10 h-10 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "font-semibold truncate",
                    compact ? "text-xs" : "text-sm"
                  )}>
                    {episode.name}
                  </div>
                  {!compact && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {episode.filename}
                    </div>
                  )}
                </div>
                {isActive && (
                  <PlayCircle className={cn(
                    "flex-shrink-0",
                    compact ? "w-4 h-4" : "w-5 h-5"
                  )} />
                )}
              </button>
            );
          }) : (
            <div className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
              Không có tập phim nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

