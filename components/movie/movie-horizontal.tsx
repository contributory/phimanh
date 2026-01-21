"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useLoading } from "@/components/ui/loading-context";
import { Calendar, Play, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface MovieHorizontalProps {
    movie: any;
}

export default function MovieHorizontalCard({ movie }: MovieHorizontalProps) {
    const router = useRouter();
    const { showLoading } = useLoading();

    const handleClick = () => {
        showLoading();
        router.push(`/watch?slug=${movie.slug}`);
    };

    const posterUrl = movie.poster_url?.startsWith("http")
        ? movie.poster_url
        : `https://phimimg.com/${movie.poster_url}`;

    return (
        <button onClick={handleClick} className="block w-full text-left">
            <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-500/50">
                <div className="flex flex-row h-28 sm:h-32 md:h-36">
                    {/* Poster */}
                    <div className="relative w-20 sm:w-24 md:w-28 flex-shrink-0 overflow-hidden">
                        <img
                            src={posterUrl}
                            alt={movie.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* HD Badge */}
                        <div className="absolute top-1 left-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold shadow-lg z-10">
                            {movie.quality || "HD"}
                        </div>
                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                                <Play className="w-5 h-5 text-blue-600 fill-current ml-0.5" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <CardContent className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
                        <div>
                            {/* Title */}
                            <h3 className="font-bold text-sm sm:text-base md:text-lg line-clamp-1 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                                {movie.name}
                            </h3>

                            {/* Original name */}
                            {movie.origin_name && (
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                                    {movie.origin_name}
                                </p>
                            )}
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            {/* Year */}
                            <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                {movie.year}
                            </span>

                            {/* Episode info */}
                            {movie.episode_current && (
                                <span className="text-xs sm:text-sm px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                                    {movie.episode_current}
                                </span>
                            )}

                            {/* Language */}
                            {movie.lang && (
                                <span className="text-xs sm:text-sm px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full font-medium">
                                    {movie.lang}
                                </span>
                            )}

                            {/* Category */}
                            {movie.category && movie.category[0] && (
                                <span className="hidden sm:inline text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                                    {movie.category[0].name}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </div>
            </Card>
        </button>
    );
}
