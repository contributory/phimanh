"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
}

export default function Episode({
  serverData,
  currentServerIndex,
  currentEpisodeIndex,
  onSelectEpisode,
  onServerChange,
  thumb_url,
}: EpisodeProps) {
  const handleServerChange = (index: number) => {
    // Auto-select first episode of the new server
    const firstEpisode = serverData[index]?.server_data?.[0];
    if (firstEpisode?.link_m3u8) {
      onSelectEpisode(firstEpisode.link_m3u8, index, 0);
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
    <div>
      {/* Server Selector - Show only if multiple servers */}
      {serverData.length > 1 && (
        <div className="w-full mb-4">
          <h4 className="text-white text-sm font-medium mb-2 px-2">Server</h4>
          <Select value={currentServerIndex.toString()} onValueChange={(value) => handleServerChange(parseInt(value))}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Chọn server" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 text-white">
              {serverData.map((server, index) => (
                <SelectItem key={index} value={index.toString()} className="text-white">
                  {server.server_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Episode List - Horizontal layout with thumbnail on left */}
      <div className="w-full">
        <h4 className="text-white text-sm font-medium mb-2 px-2">
          Danh sách tập phim ({currentServer?.server_data?.length || 0} tập)
        </h4>
        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 bg-gray-900/50 rounded-lg p-2">
          {currentServer?.server_data?.length > 0 ? currentServer.server_data.map((episode, index) => {
            const isActive = index === currentEpisodeIndex;
            return (
              <div
                key={`${currentServerIndex}-${index}`}
                onClick={() => handleEpisodeChange(episode.link_m3u8, currentServerIndex, index)}
                className={cn(
                  "flex items-center p-2 rounded-lg cursor-pointer transition-all border mb-1",
                  isActive
                    ? "bg-green-700 text-white border-green-600 ring-1 ring-green-500"
                    : "bg-gray-800 text-gray-200 border-gray-600 hover:border-gray-500 hover:bg-gray-700"
                )}
                aria-label={`Tập ${episode.name}`}
              >
                <img
                  src={thumb_url}
                  alt={episode.name}
                  loading="lazy"
                  className="w-10 h-10 object-cover rounded mr-3 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{episode.name}</div>
                  <div className="text-xs text-gray-400 truncate">{episode.filename}</div>
                </div>
              </div>
            );
          }) : (
            <div className="text-white text-center py-4">Không có tập phim nào trong server này</div>
          )}
        </div>
      </div>
    </div>
  );
}
