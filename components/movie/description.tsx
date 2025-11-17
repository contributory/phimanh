"use client";

import { useState } from "react";
import Episode from "./episode";
import VideoPlayer from "../player/video-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function Description({ movie, serverData }: any) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [showMovie, setShowMovie] = useState(false);
  const [currentEpisodeUrl, setCurrentEpisodeUrl] = useState("");
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);

  // Trong components/movie/description.tsx
  const handleToggleMovie = () => {
    if (showMovie) {
      setTimeout(() => setShowMovie(false), 300);
    } else {
      setShowMovie(true);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Movie Information Card */}
      <Card
        className={`shadow-2xl rounded-3xl bg-white dark:bg-gray-950 border-none transition-all duration-500 ease-in-out ${
          showMovie ? "transform scale-75 -translate-y-12 opacity-60" : ""
        }`}
      >
        <CardContent className="flex flex-col md:flex-row gap-8 p-6">
          {/* Poster & Overlay */}
          <div className="relative flex-shrink-0 flex justify-center items-center w-full md:w-1/3">
            <img
              src={movie.poster_url}
              alt={movie.name}
              className="w-full max-w-xs h-[420px] object-cover rounded-2xl shadow-xl border-4 border-white dark:border-gray-900"
            />
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 to-transparent rounded-b-2xl">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-xl">
                {movie.name}
              </h1>
              <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                <Badge
                  variant="default"
                  className="bg-blue-600 text-white shadow"
                >
                  {movie.quality}
                </Badge>
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
            </div>
          </div>

          {/* Info & Actions */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Original Title */}
            <h2 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 mt-6">
              {movie.origin_name}
            </h2>

            {/* Movie Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base text-gray-700 dark:text-gray-300 mt-4">
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

            {/* Content Section - Hidden when video is open */}
            {!showMovie && (
              <div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
                  Nội dung phim
                </h3>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {movie.content}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 py-2 justify-center md:justify-start">
              <Button
                size="lg"
                variant="default"
                className="font-bold px-8 py-2 text-lg rounded-xl shadow-lg transition-all hover:bg-red-700 bg-yellow-600"
                onClick={() => handleToggleMovie()}
              >
                {showMovie ? "Đóng" : "Xem Phim"}
              </Button>
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
        </CardContent>
      </Card>
      {showMovie && !showEpisodeSelector && (
        <div className="right-0">
          <Button
            size="lg"
            variant="secondary"
            className="font-bold px-8 py-2 text-lg rounded-xl shadow-lg transition-all hover:bg-gray-700"
            onClick={() => setShowEpisodeSelector(!showEpisodeSelector)}
          >
            Mở Danh Sách Tập Phim
          </Button>
        </div>
      )}
      {/* Hero Video Section */}
      <div
        className={`w-full z-50 bg-gradient-to-b from-gray-900 to-gray-950 dark:from-black dark:to-gray-950 rounded-3xl shadow-2xl transition-all duration-500 ease-in-out ${
          showMovie
            ? "opacity-100 max-h-screen animate-in slide-in-from-bottom-4"
            : "opacity-0 max-h-0 overflow-hidden"
        }`}
      >
        {showMovie && (
          <div className="relative">
            <div className="relative w-80% h-80%">
              <VideoPlayer
                videoUrl={currentEpisodeUrl}
                autoplay={true}
                poster={movie.thumb_url || movie.poster_url}
              />
            </div>
            {/* Episode Selector Section */}
            {showEpisodeSelector && (
              <div className="fixed justify-center right-0 top-1/2 transform -translate-y-1/2 space-y-4 bg-gray-900/50 backdrop-blur-lg">
                {/* Episode Selector */}
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white text-lg font-semibold mb-3 px-2">
                      Chọn tập phim
                    </h3>
                    <button
                      className="text-white text-lg font-semibold mb-3 px-2 rounded-full border-2 border-white hover:bg-white hover:text-gray-900 transition-colors duration-300"
                      onClick={() => setShowEpisodeSelector(false)}
                    >
                      Đóng
                    </button>
                  </div>
                  <Episode
                    serverData={serverData}
                    onSelectEpisode={(link: string) =>
                      setCurrentEpisodeUrl(link)
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
        <DialogContent className="sm:max-w-4xl bg-black/90 border-gray-800">
          <DialogTitle className="text-white text-xl font-bold mb-2">
            Trailer phim
          </DialogTitle>
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${
                movie.trailer_url.split("v=")[1]
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
