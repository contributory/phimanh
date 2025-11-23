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
  onSelectEpisode: (
    link: string,
    serverIndex: number,
    episodeIndex: number
  ) => void;
  thumb_url: string;
}

export default function Episode({
  serverData,
  onSelectEpisode,
  thumb_url,
}: EpisodeProps) {
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [activeEpisodeLink, setActiveEpisodeLink] = useState<string>("");
  const lastServerDataRef = useRef<string>("");

  // Initialize with first available episode when serverData changes, prioritizing "Thuyết Minh" server
  useEffect(() => {
    if (
      serverData &&
      serverData.length > 0
    ) {
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
        if (firstEpisode?.link_m3u8) {
          // Create a stable reference to detect serverData changes
          const currentServerDataKey = `${serverData.length}-${firstEpisode.link_m3u8}`;

          // Only initialize once per unique serverData
          if (lastServerDataRef.current !== currentServerDataKey) {
            setActiveServerIndex(defaultServerIndex);
            setActiveEpisodeLink(firstEpisode.link_m3u8);
            onSelectEpisode(firstEpisode.link_m3u8, defaultServerIndex, 0);
            lastServerDataRef.current = currentServerDataKey;
          }
        }
      }
    }
  }, [serverData, onSelectEpisode]);

  const handleServerChange = (index: number) => {
    setActiveServerIndex(index);
    // Auto-select first episode of the new server
    const firstEpisode = serverData[index]?.server_data?.[0];
    if (firstEpisode?.link_m3u8) {
      setActiveEpisodeLink(firstEpisode.link_m3u8);
      onSelectEpisode(firstEpisode.link_m3u8, index, 0);
    }
  };

  const handleEpisodeChange = (
    link: string,
    serverIndex: number,
    episodeIndex: number
  ) => {
    setActiveEpisodeLink(link);
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

  const currentServer = serverData[activeServerIndex];

  return (
    <div>
      {/* Server Selector - Show only if multiple servers */}
      {serverData.length > 1 && (
        <div className="w-full mb-4">
          <h4 className="text-white text-sm font-medium mb-2 px-2">Server</h4>
          <Select value={activeServerIndex.toString()} onValueChange={(value) => handleServerChange(parseInt(value))}>
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
            const isActive = activeEpisodeLink === episode.link_m3u8;
            return (
              <div
                key={`${activeServerIndex}-${index}`}
                onClick={() => handleEpisodeChange(episode.link_m3u8, activeServerIndex, index)}
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
