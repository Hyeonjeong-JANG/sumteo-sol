"use client";

import dynamic from "next/dynamic";

const CuteGameCanvas = dynamic(
  () => import("@/components/CuteGameCanvas").then((m) => m.CuteGameCanvas),
  { ssr: false }
);

export default function CuteDemoPage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#ffb2c1]">
      <div className="absolute inset-0 z-0 [&>div]:!z-auto">
        <CuteGameCanvas />
      </div>
      
      {/* Cute UI Overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
        <div className="bg-white/50 backdrop-blur-md px-10 py-4 rounded-3xl shadow-sm border border-white/60">
          <h1 className="text-3xl font-black text-pink-500 tracking-widest drop-shadow-sm flex items-center gap-2 justify-center">
            <span>SUMTEO</span>
          </h1>
          <p className="text-sm text-pink-600 font-bold mt-1 tracking-wide">✨ 뽀짝 독서 공간 ✨</p>
        </div>
      </div>
      
      {/* Cute Reader Badge */}
      <div className="absolute top-8 right-8 z-10 bg-white/70 backdrop-blur-md rounded-full px-5 py-3 flex items-center gap-3 shadow-md border border-pink-200">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
        </span>
        <span className="text-sm font-bold text-pink-700">
          함께 읽는 중 <strong className="text-pink-600 text-lg ml-1">3</strong>명
        </span>
      </div>
      
      {/* Emotes / Buttons */}
      <div className="absolute bottom-8 left-8 z-10 flex gap-4">
        <button className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-2 border-pink-200 hover:scale-110 hover:-translate-y-2 transition-all duration-300">
          <span className="text-3xl">🧸</span>
        </button>
        <button className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-2 border-pink-200 hover:scale-110 hover:-translate-y-2 transition-all duration-300">
          <span className="text-3xl">☕</span>
        </button>
      </div>
      
      <div className="absolute bottom-8 right-8 z-10">
         <button className="px-8 py-4 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full font-bold text-lg shadow-xl shadow-pink-300/50 hover:scale-105 hover:-translate-y-2 transition-all duration-300 border-2 border-white/50 flex items-center gap-2">
          <span>모래시계 뒤집기</span>
          <span className="text-xl">⏳</span>
         </button>
      </div>
    </main>
  );
}
