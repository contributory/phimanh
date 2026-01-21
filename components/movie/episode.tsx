"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PlayCircle, Server, List, ChevronLeft, ChevronRight, Search, Sparkles } from "lucide-react";

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

const EPISODES_PER_PAGE = 50;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const episodeListRef = useRef<HTMLDivElement>(null);

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
    setCurrentPage(0);
    setSearchQuery("");
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
      <div className="w-full p-8 text-center bg-muted/30 rounded-xl border border-dashed border-border">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <List className="w-8 h-8 text-muted-foreground/60" />
        </div>
        <p className="text-muted-foreground font-medium">Không có tập phim nào</p>
      </div>
    );
  }

  const currentServer = serverData[currentServerIndex];
  const allEpisodes = currentServer?.server_data || [];
  const totalEpisodes = allEpisodes.length;

  // Filter episodes by search
  const filteredEpisodes = (() => {
    if (!searchQuery.trim()) return allEpisodes;
    const query = searchQuery.toLowerCase().trim();
    return allEpisodes.filter((ep, index) =>
      ep.name.toLowerCase().includes(query) ||
      (index + 1).toString() === query
    );
  })();

  // Pagination
  const totalPages = Math.ceil(filteredEpisodes.length / EPISODES_PER_PAGE);
  const paginatedEpisodes = filteredEpisodes.slice(
    currentPage * EPISODES_PER_PAGE,
    (currentPage + 1) * EPISODES_PER_PAGE
  );

  // Generate page ranges for quick navigation
  const pageRanges = (() => {
    if (totalPages <= 1) return [];
    return Array.from({ length: totalPages }, (_, i) => ({
      page: i,
      label: `${i * EPISODES_PER_PAGE + 1}-${Math.min((i + 1) * EPISODES_PER_PAGE, filteredEpisodes.length)}`,
    }));
  })();

  // Auto-switch to correct page when episode changes
  useEffect(() => {
    if (currentEpisodeIndex !== undefined && !searchQuery) {
      const targetPage = Math.floor(currentEpisodeIndex / EPISODES_PER_PAGE);
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage);
      }
    }
  }, [currentEpisodeIndex]);

  // Scroll to top of episode list when page changes
  useEffect(() => {
    if (episodeListRef.current) {
      episodeListRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  const handleJumpToEpisode = (episodeNumber: number) => {
    const targetIndex = episodeNumber - 1;
    if (targetIndex >= 0 && targetIndex < allEpisodes.length) {
      const episode = allEpisodes[targetIndex];
      handleEpisodeChange(
        playerMode === 'm3u8' ? episode.link_m3u8 : episode.link_embed,
        currentServerIndex,
        targetIndex
      );
      const targetPage = Math.floor(targetIndex / EPISODES_PER_PAGE);
      setCurrentPage(targetPage);
      setSearchQuery("");
    }
  };

  return (
    <div className={cn(
      "flex flex-col bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden",
      compact ? "h-[500px]" : "h-full"
    )}>
      {/* Header Area */}
      <div className="flex-shrink-0 p-4 bg-[#212121] border-b border-white/5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-white leading-tight">Danh sách tập</h4>
              <p className="text-xs text-white/50 mt-1">
                {currentServerIndex + 1}/{serverData.length} Server • {currentEpisodeIndex + 1}/{totalEpisodes} Tập
              </p>
            </div>
            
            {/* Server Selector Dropdown */}
            {serverData.length > 1 && (
              <Select value={currentServerIndex.toString()} onValueChange={(value) => handleServerChange(parseInt(value))}>
                <SelectTrigger className="w-[120px] h-8 text-[11px] bg-white/10 border-0 text-white rounded-md">
                  <SelectValue placeholder="Server" />
                </SelectTrigger>
                <SelectContent className="bg-[#212121] border-white/10">
                  {serverData.map((server, index) => (
                    <SelectItem key={index} value={index.toString()} className="text-xs text-white/80">
                      {server.server_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Quick Actions and Player Mode */}
          <div className="flex items-center gap-2">
            <div className="flex bg-white/5 p-0.5 rounded-lg flex-1">
              <button
                onClick={() => onPlayerModeChange('m3u8')}
                className={cn(
                  "flex-1 px-2 py-1.5 text-[10px] font-bold rounded-md transition-all",
                  playerMode === 'm3u8' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                )}
              >
                M3U8
              </button>
              <button
                onClick={() => onPlayerModeChange('embed')}
                className={cn(
                  "flex-1 px-2 py-1.5 text-[10px] font-bold rounded-md transition-all",
                  playerMode === 'embed' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                )}
              >
                EMBED
              </button>
            </div>
            
            {totalEpisodes > 20 && (
              <div className="relative flex-[1.5]">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
                <input
                  type="text"
                  placeholder="Tìm tập..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-white/5 border-0 rounded-lg text-white placeholder:text-white/20 outline-none focus:bg-white/10"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Episode List Container */}
      <div
        ref={episodeListRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        <div className="flex flex-col">
          {paginatedEpisodes.length > 0 ? paginatedEpisodes.map((episode, pageIndex) => {
            const actualIndex = searchQuery
              ? allEpisodes.findIndex(ep => ep.slug === episode.slug)
              : currentPage * EPISODES_PER_PAGE + pageIndex;
            const isActive = actualIndex === currentEpisodeIndex;
            
            return (
              <button
                key={`${currentServerIndex}-${actualIndex}`}
                onClick={() => handleEpisodeChange(
                  playerMode === 'm3u8' ? episode.link_m3u8 : episode.link_embed,
                  currentServerIndex,
                  actualIndex
                )}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 transition-colors group",
                  isActive ? "bg-white/10" : "hover:bg-white/5"
                )}
              >
                {/* Index / Playing Icon */}
                <div className="flex-shrink-0 w-4 flex justify-center">
                  {isActive ? (
                    <PlayCircle className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <span className="text-[11px] text-white/40 group-hover:hidden">{actualIndex + 1}</span>
                  )}
                  {!isActive && (
                    <PlayCircle className="w-3.5 h-3.5 text-white hidden group-hover:block" />
                  )}
                </div>

                {/* Thumbnail-like Box (Minimalist YT Style) */}
                <div className="flex-shrink-0 w-24 aspect-video rounded-md overflow-hidden bg-white/5 relative">
                  <img
                    src={thumb_url || "/og-image.svg"}
                    alt={episode.name}
                    className={cn(
                      "w-full h-full object-cover opacity-60",
                      isActive && "opacity-100"
                    )}
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="text-[10px] font-bold text-white uppercase tracking-tighter">Đang phát</div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-left">
                  <h5 className={cn(
                    "text-xs font-semibold truncate",
                    isActive ? "text-white" : "text-white/90"
                  )}>
                    Tập {episode.name}
                  </h5>
                  <p className="text-[10px] text-white/40 truncate mt-0.5">
                    {episode.filename || `Phần ${actualIndex + 1}`}
                  </p>
                </div>
              </button>
            );
          }) : (
            <div className="text-center py-10 opacity-30">
              <p className="text-xs">Không tìm thấy tập phim</p>
            </div>
          )}
          
          {/* Pagination for long lists */}
          {totalPages > 1 && !searchQuery && (
            <div className="p-4 flex items-center justify-center gap-4 border-t border-white/5">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-1 text-white/40 hover:text-white disabled:opacity-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-bold text-white/60">
                TRANG {currentPage + 1} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages - 1}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-1 text-white/40 hover:text-white disabled:opacity-10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
