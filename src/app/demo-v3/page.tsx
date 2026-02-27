"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const PixelCafeCanvas = dynamic(
  () => import("@/components/PixelCafeCanvas").then((m) => m.PixelCafeCanvas),
  { ssr: false }
);

export default function DemoV3Page() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#e8eaf6]">
      <div className="absolute inset-0 z-0 [&>div]:!z-auto">
        <PixelCafeCanvas />
      </div>
      
      {/* Top Header - Zep Style (Clean white banner) */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur border-b border-gray-200 z-10 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black text-indigo-900 tracking-tight flex items-center gap-2">
            <span className="bg-indigo-600 text-white p-1 rounded-md text-sm leading-none">ST</span>
            SUMTEO <span className="text-indigo-400 font-medium">CAFE</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <span className="text-sm font-semibold text-indigo-900">
              접속자 <strong className="text-indigo-600">3명</strong>
            </span>
          </div>
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            ⚙️
          </button>
        </div>
      </div>
      
      {/* Mock Video Floating Elements (Left) */}
      {mounted && (
        <div className="absolute left-6 top-24 z-10 flex flex-col gap-4 pointer-events-none">
          <div className="w-36 h-28 bg-gray-900 rounded-lg shadow-lg border-2 border-green-500 relative overflow-hidden flex items-center justify-center">
            <span className="text-4xl filter grayscale opacity-50">👩‍💻</span>
            <div className="absolute bottom-1 right-2">
              <span className="bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">나(냥냥)</span>
            </div>
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          
          <div className="w-36 h-28 bg-gray-900 rounded-lg shadow-lg border border-gray-600 relative overflow-hidden flex items-center justify-center">
            <span className="text-4xl filter grayscale opacity-50">👨‍💻</span>
            <div className="absolute bottom-1 right-2">
              <span className="bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">친구1</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-2 flex items-center gap-2">
          <button className="w-12 h-12 bg-gray-100 rounded-xl hover:bg-gray-200 flex items-center justify-center text-xl transition-transform hover:scale-105">
            🎤
          </button>
          <button className="w-12 h-12 bg-gray-100 rounded-xl hover:bg-gray-200 flex items-center justify-center text-xl transition-transform hover:scale-105">
            📹
          </button>
          <div className="w-px h-8 bg-gray-300 mx-2"></div>
          <button className="w-12 h-12 bg-indigo-50 rounded-xl hover:bg-indigo-100 flex items-center justify-center text-xl transition-transform hover:scale-105 border border-indigo-100">
            ⏳
          </button>
          <button className="w-12 h-12 bg-indigo-50 rounded-xl hover:bg-indigo-100 flex items-center justify-center text-xl transition-transform hover:scale-105 border border-indigo-100">
            👏
          </button>
          <button className="w-12 h-12 bg-indigo-50 rounded-xl hover:bg-indigo-100 flex items-center justify-center text-xl transition-transform hover:scale-105 border border-indigo-100">
            ❤️
          </button>
        </div>
      </div>
    </main>
  );
}
