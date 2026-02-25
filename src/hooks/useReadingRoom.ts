"use client";

import { useState, useEffect, useCallback } from "react";

export interface Reader {
  id: string;
  name: string;
  book: string;
  minutesRead: number;
  joinedAgo: number; // minutes ago
}

const MOCK_READERS: Reader[] = [
  { id: "1", name: "Miso", book: "Atomic Habits", minutesRead: 23, joinedAgo: 12 },
  { id: "2", name: "Haru", book: "Deep Work", minutesRead: 45, joinedAgo: 30 },
  { id: "3", name: "Yuna", book: "The Alchemist", minutesRead: 8, joinedAgo: 3 },
];

const JOIN_MESSAGES = [
  "joined the reading room",
  "started reading",
  "sat down to read",
];

export interface ActivityEvent {
  id: string;
  name: string;
  message: string;
  timestamp: number;
}

export function useReadingRoom() {
  const [readers, setReaders] = useState<Reader[]>(MOCK_READERS.slice(0, 2));
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  const addActivity = useCallback((name: string, message: string) => {
    setActivities((prev) => [
      { id: `${Date.now()}`, name, message, timestamp: Date.now() },
      ...prev.slice(0, 4),
    ]);
  }, []);

  // Simulate readers joining over time
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setReaders((prev) => {
        if (prev.length < 3) {
          const newReader = MOCK_READERS[prev.length];
          addActivity(
            newReader.name,
            JOIN_MESSAGES[Math.floor(Math.random() * JOIN_MESSAGES.length)]
          );
          return [...prev, newReader];
        }
        return prev;
      });
    }, 8000);

    const timer2 = setTimeout(() => {
      addActivity("Miso", "finished a chapter!");
    }, 15000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [addActivity]);

  // Update minutes read periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setReaders((prev) =>
        prev.map((r) => ({ ...r, minutesRead: r.minutesRead + 1 }))
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    readers,
    readerCount: readers.length,
    activities,
  };
}
