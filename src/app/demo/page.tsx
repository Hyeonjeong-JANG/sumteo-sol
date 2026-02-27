"use client";

import dynamic from "next/dynamic";

const GameCanvas = dynamic(
  () => import("@/components/GameCanvas").then((m) => m.GameCanvas),
  { ssr: false }
);

export default function DemoPage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a1628]">
      <div className="absolute inset-0 z-0 [&>div]:!z-auto">
        <GameCanvas />
      </div>
      {/* Minimal overlay — title only */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center">
        <h1 className="text-2xl font-bold text-white/90 tracking-wide">
          SUMTEO
        </h1>
        <p className="text-sm text-emerald-400/80 mt-1">독서 공간</p>
      </div>
      {/* Reader count badge */}
      <div className="absolute top-6 right-6 z-10 bg-gray-900/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span className="text-sm text-gray-200">
          함께 읽는 중 <strong className="text-emerald-400">3명</strong>
        </span>
      </div>
    </main>
  );
}
