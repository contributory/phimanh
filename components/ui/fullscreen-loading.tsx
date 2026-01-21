"use client";

import React from "react";

interface FullscreenLoadingProps {
  transparent?: boolean;
}

export default function FullscreenLoading({ transparent = false }: FullscreenLoadingProps) {
  return (
    <main className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden ${transparent ? 'bg-black/40 backdrop-blur-sm' : 'bg-[#0a0a0a]'}`}>
      {/* Background Decorations - Only show if not transparent */}
      {!transparent && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px] animate-pulse"></div>
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-900/10 blur-[120px] animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-32 h-32 mb-12">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-[3px] border-red-900/20 rounded-full"></div>

          {/* Spinning Ring 1 */}
          <div className="absolute inset-0 border-[3px] border-red-600 border-t-transparent rounded-full animate-spin"></div>

          {/* Spinning Ring 2 */}
          <div
            className="absolute inset-4 border-[3px] border-white/40 border-b-transparent rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>

          {/* Center Logo/Icon placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-red-600 rounded-lg rotate-45 flex items-center justify-center animate-pulse">
              <div className="w-4 h-4 bg-white rounded-full -rotate-45"></div>
            </div>
          </div>
        </div>

        {/* Text Section */}
        <div className="text-center space-y-4 px-6">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">
            <span className="text-red-600">Phim</span>Anh
            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full ml-1 animate-bounce"></span>
          </h2>

          <div className="flex flex-col items-center gap-2">
            <div className="h-1 w-48 bg-gray-800 rounded-full overflow-hidden relative">
              <div className="absolute top-0 left-0 h-full bg-red-600 w-1/3 rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
            </div>
            <p className="text-gray-400 text-sm font-medium tracking-widest uppercase opacity-70">
              Đang chuẩn bị nội dung...
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Dots - Only show if not transparent */}
      {!transparent && (
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, #444 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      )}

      {/* Footer Disclaimer - Made more subtle */}
      <div className="fixed bottom-6 left-0 right-0 z-10 px-4 pointer-events-none">
        <p className="text-[10px] text-gray-600 text-center max-w-2xl mx-auto leading-relaxed uppercase tracking-tighter">
          Nội dung phục vụ mục đích học tập & trải nghiệm kỹ thuật
        </p>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </main>
  );
}
