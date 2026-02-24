"use client";

import { useTimer } from "@/hooks/useTimer";
import { useState } from "react";

interface TimerProps {
  onComplete?: () => void;
}

export function Timer({ onComplete }: TimerProps) {
  const [targetMinutes] = useState(30);
  const timer = useTimer({
    targetMinutes,
    onComplete,
    onPause: () => {
      // Could show notification here
    },
  });

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Circular Progress */}
      <div className="relative w-64 h-64">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#1f2937"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${timer.progress * 2.827} 282.7`}
            className="transition-all duration-1000"
          />
        </svg>
        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-bold">{timer.display}</span>
          <span className="text-gray-400 text-sm mt-2">
            {timer.isComplete ? "Complete!" : timer.isPaused ? "Paused" : timer.isRunning ? "Focus..." : "Ready"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {!timer.isRunning && !timer.isComplete && (
          <button
            onClick={timer.start}
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-full font-semibold transition-colors"
          >
            Start Focus
          </button>
        )}
        {timer.isRunning && !timer.isPaused && (
          <button
            onClick={timer.pause}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-600 rounded-full font-semibold transition-colors"
          >
            Pause
          </button>
        )}
        {timer.isPaused && (
          <button
            onClick={timer.resume}
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-full font-semibold transition-colors"
          >
            Resume
          </button>
        )}
        {(timer.isRunning || timer.isComplete) && (
          <button
            onClick={timer.reset}
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-full font-semibold transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Paused warning */}
      {timer.isPaused && (
        <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg px-4 py-2 text-amber-400 text-sm">
          Timer paused - you left the app!
        </div>
      )}
    </div>
  );
}
