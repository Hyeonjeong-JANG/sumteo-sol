"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseTimerOptions {
  targetMinutes: number;
  onComplete?: () => void;
  onPause?: () => void;
}

export function useTimer({ targetMinutes, onComplete, onPause }: UseTimerOptions) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetSeconds = targetMinutes * 60;

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
    onPause?.();
  }, [onPause]);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const reset = useCallback(() => {
    setSeconds(0);
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  // Timer tick
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= targetSeconds) {
            setIsRunning(false);
            onComplete?.();
            return targetSeconds;
          }
          return s + 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, targetSeconds, onComplete]);

  // Background detection (visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && !isPaused) {
        pause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, isPaused, pause]);

  const progress = (seconds / targetSeconds) * 100;
  const remaining = targetSeconds - seconds;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  const isComplete = seconds >= targetSeconds;

  return {
    seconds,
    isRunning,
    isPaused,
    isComplete,
    progress,
    display,
    start,
    pause,
    resume,
    reset,
  };
}
