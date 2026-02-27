"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const SumteoZepCanvas = dynamic(
  () => import("@/components/SumteoZepCanvas").then((m) => m.SumteoZepCanvas),
  { ssr: false }
);

export default function DemoZepPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a1628]">
      <div className="absolute inset-0 z-0 [&>div]:!z-auto">
        <SumteoZepCanvas />
      </div>

      {/* Retained original UI Theme - Midnight solid elegant theme */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
        <h1 className="text-2xl font-bold text-white/90 tracking-wide">
          SUMTEO
        </h1>
        <p className="text-sm text-emerald-400/80 mt-1">평상 독서 공간</p>
      </div>

      <div className="absolute top-6 right-6 z-10 bg-gray-900/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border border-gray-700">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span className="text-sm text-gray-200">
          함께 읽는 중 <strong className="text-emerald-400">3명</strong>
        </span>
      </div>

      {/* Mock Video Floating Elements (Retained logic from v3 but styled like Forest Theme) */}
      {mounted && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-4 pointer-events-none">
          <div className="w-32 h-24 bg-gray-900/60 backdrop-blur-md rounded-lg shadow-xl shadow-black/50 border border-emerald-500 relative overflow-hidden flex items-center justify-center">
            <span className="text-3xl opacity-80 mix-blend-luminosity">👩🏻‍💻</span>
            <div className="absolute bottom-1 right-2">
              <span className="bg-black/80 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30">나</span>
            </div>
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          
          <div className="w-32 h-24 bg-gray-900/60 backdrop-blur-md rounded-lg shadow-xl shadow-black/50 border border-gray-700 relative overflow-hidden flex items-center justify-center">
            <span className="text-3xl opacity-30 mix-blend-luminosity">👨🏻‍💻</span>
            <div className="absolute bottom-1 right-2">
              <span className="bg-black/60 text-gray-400 text-[10px] px-1.5 py-0.5 rounded">친구1</span>
            </div>
          </div>
        </div>
      )}

      {/* Minimalistic Tool Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-full shadow-lg border border-gray-700/50 p-1.5 flex items-center gap-1">
          <button className="w-10 h-10 rounded-full hover:bg-gray-700/50 flex items-center justify-center text-lg transition-colors text-white/70">
            🎤
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-gray-700/50 flex items-center justify-center text-lg transition-colors text-white/70">
            📹
          </button>
          <div className="w-px h-6 bg-gray-600 mx-2"></div>
          <button className="w-10 h-10 rounded-full hover:bg-gray-700/50 flex items-center justify-center text-lg transition-colors text-emerald-400">
            ⏳
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-gray-700/50 flex items-center justify-center text-lg transition-colors text-yellow-400">
            🍉
          </button>
        </div>
      </div>
    </main>
  );
}
