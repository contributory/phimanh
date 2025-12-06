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
      <div className="w-full p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mb-4">
          <List className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Không có tập phim nào</p>
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
      "flex flex-col bg-gradient-to-b from-slate-900/95 via-slate-900/98 to-slate-950/95",
      compact ? "h-full max-h-[500px] lg:max-h-[600px]" : "max-h-[500px]"
    )}>
      {/* Header with gradient */}
      <div className="flex-shrink-0 p-4 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border-b border-white/10">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span>Danh sách tập</span>
            <span className="ml-1 px-2.5 py-0.5 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-xs font-semibold">
              {totalEpisodes}
            </span>
          </h4>
        </div>

        {/* Search/Jump to Episode - only show when many episodes */}
        {totalEpisodes > 20 && (
          <div className="relative mb-4 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Tìm tập (vd: 1, 10, Full)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const num = parseInt(searchQuery);
                  if (!isNaN(num)) {
                    handleJumpToEpisode(num);
                  }
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:bg-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
        )}

        {/* Player Mode Switch */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-white/50 font-medium uppercase tracking-wider">Nguồn</span>
          <div className="flex gap-1.5 flex-1 p-1 bg-white/5 rounded-xl">
            <button
              onClick={() => onPlayerModeChange('m3u8')}
              className={cn(
                "flex-1 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300",
                playerMode === 'm3u8'
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              Mặc định
            </button>
            <button
              onClick={() => onPlayerModeChange('embed')}
              className={cn(
                "flex-1 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300",
                playerMode === 'embed'
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              Dự phòng
            </button>
          </div>
        </div>

        {/* Server Selector */}
        {serverData.length > 1 && (
          <Select value={currentServerIndex.toString()} onValueChange={(value) => handleServerChange(parseInt(value))}>
            <SelectTrigger className="w-full h-10 text-sm bg-white/5 backdrop-blur-sm border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors">
              <Server className="w-4 h-4 mr-2 text-indigo-400" />
              <SelectValue placeholder="Chọn server" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 rounded-xl">
              {serverData.map((server, index) => (
                <SelectItem
                  key={index}
                  value={index.toString()}
                  className="text-sm text-white/80 focus:bg-indigo-500/20 focus:text-white rounded-lg"
                >
                  {server.server_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Pagination - Page Range Selector - only show when many pages */}
        {pageRanges.length > 1 && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <Select value={currentPage.toString()} onValueChange={(value) => setCurrentPage(parseInt(value))}>
              <SelectTrigger className="flex-1 h-9 text-xs bg-white/5 border-white/10 text-white rounded-xl">
                <SelectValue>Tập {pageRanges[currentPage]?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 max-h-60 rounded-xl">
                {pageRanges.map((range) => (
                  <SelectItem
                    key={range.page}
                    value={range.page.toString()}
                    className="text-xs text-white/80 focus:bg-indigo-500/20 focus:text-white rounded-lg"
                  >
                    Tập {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Episode List - Scrollable */}
      <div
        ref={episodeListRef}
        className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20"
      >
        <div className="p-3 space-y-2">
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
                  "w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 text-left group",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-indigo-500/25 scale-[1.02]"
                    : "bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-transparent hover:border-white/10"
                )}
                aria-label={`Tập ${episode.name}`}
              >
                {/* Episode Number */}
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300 group-hover:from-indigo-500/30 group-hover:to-purple-500/30"
                )}>
                  {actualIndex + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "font-semibold truncate",
                    compact ? "text-sm" : "text-sm"
                  )}>
                    {episode.name}
                  </div>
                  {!compact && episode.filename && (
                    <div className={cn(
                      "text-xs truncate mt-0.5",
                      isActive ? "text-white/70" : "text-white/40"
                    )}>
                      {episode.filename}
                    </div>
                  )}
                </div>

                {isActive && (
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                    <PlayCircle className="w-6 h-6 relative" />
                  </div>
                )}
              </button>
            );
          }) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <Search className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/40 font-medium">Không tìm thấy tập phim</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
