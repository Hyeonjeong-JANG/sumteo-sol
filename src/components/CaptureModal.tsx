"use client";

import { useRef, useState, useCallback } from "react";

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export function CaptureModal({ isOpen, onClose, onCapture }: CaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch {
      setError("Camera access denied. Please enable camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageData);
    stopCamera();
  }, [stopCamera]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirm = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
      onClose();
    }
  }, [capturedImage, onCapture, onClose]);

  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  }, [stopCamera, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-lg w-full overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Capture Your Page</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400 text-center">
              {error}
              <button
                onClick={startCamera}
                className="block mx-auto mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : capturedImage ? (
            <div className="space-y-4">
              <img
                src={capturedImage}
                alt="Captured page"
                className="w-full rounded-lg"
              />
              <div className="flex gap-3">
                <button
                  onClick={retake}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
                >
                  Retake
                </button>
                <button
                  onClick={confirm}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold"
                >
                  Confirm
                </button>
              </div>
            </div>
          ) : stream ? (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <button
                onClick={capture}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold"
              >
                Take Photo
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                Take a photo of your current page to verify progress
              </p>
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold"
              >
                Open Camera
              </button>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
