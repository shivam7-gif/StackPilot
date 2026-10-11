"use client";

import React, { useEffect, useState } from "react";
import LoadingTextAnimation from "./LoadingTextAnimation";
import LoadingBar from "./LoadingBar";

export interface AuthToDashboardLoaderProps {
  /** Optional custom title or status text */
  text?: string;
  /** Duration in ms for the loading bar to complete. Default: 1800 */
  duration?: number;
  /** Triggered when the loading bar reaches 100% and router push should start */
  onExitStart?: () => void;
  /** Triggered after exit fade animation completes */
  onComplete?: () => void;
}

export default function AuthToDashboardLoader({
  text = "StackPilot",
  duration = 1800,
  onExitStart,
  onComplete,
}: AuthToDashboardLoaderProps) {
  const [isExiting, setIsExiting] = useState(false);

  // Lock body scroll while loader is visible
  useEffect(() => {
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevOverflow;
    };
  }, []);

  const handleBarComplete = () => {
    onExitStart?.();
    setIsExiting(true);

    // Allow 300ms for exit fade-out transition before unmounting
    setTimeout(() => {
      onComplete?.();
    }, 350);
  };

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white text-neutral-900 transition-all duration-300 ${
        isExiting ? "opacity-0 pointer-events-none scale-[1.02]" : "opacity-100 scale-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label="Navigating to Dashboard"
    >
      {/* Subtle modern background gradient & micro-dots */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-neutral-100 via-neutral-50 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 max-w-xl w-full">
        {/* Brand Pill */}
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 backdrop-blur-sm px-3.5 py-1 text-xs font-medium text-neutral-700 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
          <span>{text}</span>
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-500 font-mono text-[11px]">v0.1</span>
        </div>

        {/* Lottie "LOADING" Text Animation */}
        <div className="w-full flex items-center justify-center -my-1">
          <LoadingTextAnimation width={420} height={220} speed={1.9} />
        </div>

        {/* Bigger, Wider Interactive Progress Loading Bar (No numbers/subtext below) */}
        <div className="w-full mt-1">
          <LoadingBar
            duration={duration}
            onComplete={handleBarComplete}
            showPercentage={false}
            showStatus={false}
          />
        </div>
      </div>
    </div>
  );
}
