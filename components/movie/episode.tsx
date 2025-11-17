"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
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
  onSelectEpisode: (link: string) => void;
}

export default function Episode({ serverData, onSelectEpisode }: EpisodeProps) {
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [activeEpisodeLink, setActiveEpisodeLink] = useState<string>("");
  const lastServerDataRef = useRef<string>("");

  // Initialize with first available episode when serverData changes
  useEffect(() => {
    if (
      serverData &&
      serverData.length > 0 &&
      serverData[0]?.server_data?.length > 0
    ) {
      const firstEpisode = serverData[0].server_data[0];
      if (firstEpisode?.link_m3u8) {
        // Create a stable reference to detect serverData changes
        const currentServerDataKey = `${serverData.length}-${firstEpisode.link_m3u8}`;

        // Only initialize once per unique serverData
        if (lastServerDataRef.current !== currentServerDataKey) {
          setActiveServerIndex(0);
          setActiveEpisodeLink(firstEpisode.link_m3u8);
          onSelectEpisode(firstEpisode.link_m3u8);
          lastServerDataRef.current = currentServerDataKey;
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
      onSelectEpisode(firstEpisode.link_m3u8);
    }
  };

  const handleEpisodeChange = (link: string) => {
    setActiveEpisodeLink(link);
    onSelectEpisode(link);
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
        <div className="w-full">
          <h4 className="text-white text-sm font-medium mb-2 px-2">Server</h4>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {serverData.map((server, index) => (
              <Button
                key={index}
                onClick={() => handleServerChange(index)}
                variant={activeServerIndex === index ? "default" : "outline"}
                className={cn(
                  "flex-shrink-0 min-w-[120px] transition-all",
                  activeServerIndex === index
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-600"
                )}
                aria-label={`Chọn server ${server.server_name}`}
                aria-pressed={activeServerIndex === index}
              >
                {server.server_name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Episode Grid */}
      <div className="w-full">
        <h4 className="text-white text-sm font-medium mb-2 px-2">
          Danh sách tập phim
        </h4>
        <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-scroll p-2 bg-gray-900/50 rounded-lg scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {currentServer?.server_data?.map((episode, index) => {
            const isActive = activeEpisodeLink === episode.link_m3u8;
            return (
              <Button
                key={index}
                onClick={() => handleEpisodeChange(episode.link_m3u8)}
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "h-auto py-3 px-4 flex flex-col items-start justify-center transition-all",
                  isActive
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-600 hover:border-blue-500"
                )}
                aria-label={`Tập ${episode.name}`}
                aria-pressed={isActive}
              >
                <span className="font-semibold text-sm">{episode.name}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
