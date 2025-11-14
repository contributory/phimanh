"use client";

import { useState } from "react";
import Episode from "./episode";
import HLSPlayer from "../hls-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function Description({ movie, serverData }: any) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [showMovie, setShowMovie] = useState(false);
  const [currentEpisodeUrl, setCurrentEpisodeUrl] = useState("");

  return (
    <Card className="p-0 shadow-2xl rounded-3xl bg-white dark:bg-gray-950 border-none">
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
              <Badge variant="default" className="bg-blue-600 text-white shadow">{movie.quality}</Badge>
              <Badge variant="default" className="bg-green-600 text-white shadow">{movie.lang}</Badge>
              <Badge variant="default" className="bg-purple-600 text-white shadow">{movie.time}</Badge>
              <Badge variant="default" className="bg-yellow-500 text-white shadow">{movie.year}</Badge>
            </div>
          </div>
        </div>

        {/* Info & Actions */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-wrap gap-4 py-2 justify-center md:justify-start">
            <Button
              size="lg"
              variant="default"
              className="font-bold px-8 py-2 text-lg rounded-xl shadow-lg transition-all hover:bg-blue-700"
              onClick={() => setShowMovie(!showMovie)}
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

          {/* Player & Episode */}
          {showMovie && currentEpisodeUrl && (
            <div className="w-full h-auto rounded-xl mt-4 shadow-xl border-2 border-blue-600 dark:border-blue-400">
              <HLSPlayer videoUrl={currentEpisodeUrl} />
            </div>
          )}
          {showMovie && (
            <Episode
              serverData={serverData}
              onSelectEpisode={(link: string) => setCurrentEpisodeUrl(link)}
            />
          )}

          {/* Movie Info */}
          <h2 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 mt-4">
            {movie.origin_name}
          </h2>
          <div className="grid grid-cols-2 gap-6 text-base text-gray-700 dark:text-gray-300 mt-4">
            <div>
              <p className="font-semibold">Đạo diễn:</p>
              <p>{movie.director.join(", ")}</p>
            </div>
            <div>
              <p className="font-semibold">Diễn viên:</p>
              <p>{movie.actor.join(", ")}</p>
            </div>
            <div>
              <p className="font-semibold">Thể loại:</p>
              <p>
                {movie.category
                  .map((cat: { name: string }) => cat.name)
                  .join(", ")}
              </p>
            </div>
            <div>
              <p className="font-semibold">Quốc gia:</p>
              <p>
                {movie.country
                  .map((c: { name: string }) => c.name)
                  .join(", ")}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
              Nội dung phim
            </h3>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
              {movie.content}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Trailer Modal */}
      <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
        <DialogContent className="sm:max-w-4xl bg-black/90">
          <DialogTitle className="text-white text-xl font-bold mb-2">Trailer phim</DialogTitle>
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailer_url.split("v=")[1]}`}
              className="w-full h-[400px] rounded-xl border-2 border-white"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
