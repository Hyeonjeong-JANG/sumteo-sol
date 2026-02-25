"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Timer } from "@/components/Timer";
import { WalletButton } from "@/components/WalletButton";
import { CaptureModal } from "@/components/CaptureModal";

const GameCanvas = dynamic(
  () => import("@/components/GameCanvas").then((m) => m.GameCanvas),
  { ssr: false }
);

export default function Home() {
  const [showCapture, setShowCapture] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [inkEarned, setInkEarned] = useState(0);

  const handleTimerComplete = () => {
    setShowCapture(true);
  };

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    // Mock: Award $INK for completing session
    setInkEarned((prev) => prev + 5);
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
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-8">
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
                함께 읽는 중 <strong className="text-emerald-400">3명</strong>
              </span>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8">
            <Timer onComplete={handleTimerComplete} />
          </div>

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
          <p>Built for Solana | Reading Garden Prototype</p>
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
