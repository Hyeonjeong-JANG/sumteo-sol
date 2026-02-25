"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Timer } from "@/components/Timer";
import { WalletButton } from "@/components/WalletButton";
import { CaptureModal } from "@/components/CaptureModal";
import { MintTreeButton } from "@/components/MintTreeButton";
import { useReadingRoom } from "@/hooks/useReadingRoom";

const GameCanvas = dynamic(
  () => import("@/components/GameCanvas").then((m) => m.GameCanvas),
  { ssr: false }
);

export default function Home() {
  const [showCapture, setShowCapture] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [inkEarned, setInkEarned] = useState(0);
  const [readingComplete, setReadingComplete] = useState(false);
  const [readingMinutes, setReadingMinutes] = useState(0);
  const [minted, setMinted] = useState(false);
  const { readers, readerCount, activities } = useReadingRoom();

  const handleTimerComplete = () => {
    const mins = Number(process.env.NEXT_PUBLIC_TIMER_MINUTES) || 30;
    setReadingMinutes(mins);
    setShowCapture(true);
  };

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setInkEarned((prev) => prev + 5);
    setReadingComplete(true);
  };

  const handleMinted = () => {
    setMinted(true);
    setInkEarned((prev) => prev + 20);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Phaser Game Background */}
      <GameCanvas />

      {/* UI Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold">
              S
            </div>
            <div>
              <h1 className="font-bold">SUMTEO</h1>
              <p className="text-xs text-gray-400">Onchain Reading Garden</p>
            </div>
          </div>
          <WalletButton />
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          {/* INK Balance + Social Badge */}
          <div className="flex items-center gap-3">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
              <p className="text-gray-400 text-sm">Your $INK Balance</p>
              <p className="text-3xl font-bold text-emerald-400">
                {inkEarned.toLocaleString()} INK
              </p>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-200 whitespace-nowrap">
                함께 읽는 중{" "}
                <strong className="text-emerald-400">{readerCount}명</strong>
              </span>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8">
            <Timer onComplete={handleTimerComplete} />
          </div>

          {/* Social Activity Feed */}
          {activities.length > 0 && (
            <div className="w-full max-w-sm space-y-1">
              {activities.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-900/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-gray-400 animate-fade-in"
                >
                  <strong className="text-emerald-400">{event.name}</strong>{" "}
                  {event.message}
                </div>
              ))}
            </div>
          )}

          {/* Readers in room */}
          <div className="flex gap-2 items-center">
            {readers.map((reader) => (
              <div
                key={reader.id}
                className="bg-gray-900/60 backdrop-blur-sm rounded-xl px-3 py-2 text-center"
                title={`Reading: ${reader.book}`}
              >
                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-xs font-bold text-emerald-400 mx-auto mb-1">
                  {reader.name[0]}
                </div>
                <p className="text-xs text-gray-300">{reader.name}</p>
                <p className="text-[10px] text-gray-500 truncate max-w-[80px]">
                  {reader.book}
                </p>
              </div>
            ))}
          </div>

          {/* Mint Tree Button - shows after reading verification */}
          {readingComplete && !minted && (
            <div className="w-full max-w-sm">
              <MintTreeButton
                bookTitle="My Current Book"
                readingMinutes={readingMinutes}
                onMinted={handleMinted}
              />
            </div>
          )}

          {/* Minted result stays visible */}
          {minted && (
            <div className="w-full max-w-sm">
              <MintTreeButton
                bookTitle="My Current Book"
                readingMinutes={readingMinutes}
              />
            </div>
          )}

          {/* Last Capture Preview */}
          {capturedImage && (
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 max-w-xs">
              <p className="text-gray-400 text-sm mb-2">Last Verification</p>
              <img
                src={capturedImage}
                alt="Last capture"
                className="w-full rounded-lg"
              />
              <p className="text-emerald-400 text-sm mt-2 text-center">
                +5 $INK earned!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="p-4 text-center text-gray-500 text-sm">
          <p>Built for Solana | cNFT Reading Trees on Devnet</p>
        </footer>
      </div>

      {/* Capture Modal */}
      <CaptureModal
        isOpen={showCapture}
        onClose={() => setShowCapture(false)}
        onCapture={handleCapture}
      />
    </main>
  );
}
