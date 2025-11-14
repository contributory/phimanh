"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Episode({ serverData, onSelectEpisode }: any) {
  useEffect(() => {
    if (serverData?.[0]?.server_data?.[0]?.link_m3u8) {
      onSelectEpisode(serverData[0].server_data[0].link_m3u8);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <Select
        onValueChange={onSelectEpisode}
        defaultValue={serverData[0].server_data[0].link_m3u8}
      >
        <SelectTrigger className="w-full h-12 text-base bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <SelectValue placeholder="Chọn tập phim" />
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          {serverData.map((server: any, serverIndex: number) => (
            <SelectGroup key={serverIndex}>
              <SelectLabel className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {server.server_name}
              </SelectLabel>
              {server.server_data.map((episode: any, episodeIndex: number) => (
                <SelectItem
                  key={episodeIndex}
                  value={episode.link_m3u8}
                  className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <span className="font-medium">{episode.name}</span>
                  {episode.filename && (
                    <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">
                      - {episode.filename}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
