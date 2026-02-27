"use client";

import dynamic from "next/dynamic";

const SumteoCuteCanvas = dynamic(
  () => import("@/components/SumteoCuteCanvas").then((m) => m.SumteoCuteCanvas),
  { ssr: false }
);

export default function DemoV2Page() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a1628]">
      <div className="absolute inset-0 z-0 [&>div]:!z-auto">
        <SumteoCuteCanvas />
      </div>
      
      {/* Retained original elegant UI but softened slightly */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
        <h1 className="text-2xl font-bold text-white/95 tracking-wide drop-shadow-md">
          SUMTEO
        </h1>
        <p className="text-sm text-emerald-400 font-medium mt-1 drop-shadow-md">독서 공간</p>
      </div>
      
      {/* Reader count badge - Retained but with slightly softer borders */}
      <div className="absolute top-6 right-6 z-10 bg-[#122432]/80 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 flex items-center gap-3 shadow-lg">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-sm font-medium text-gray-200">
          함께 읽는 중 <strong className="text-emerald-400 font-bold ml-1">3명</strong>
        </span>
      </div>
    </main>
  );
}
