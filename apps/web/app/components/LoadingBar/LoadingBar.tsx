"use client";

import React, { useEffect, useState, useRef } from "react";

export interface LoadingBarProps {
  /** Controlled progress (0-100). If undefined, automatically increments over `duration`. */
  progress?: number;
  /** Duration in milliseconds for auto-incrementing from 0 to 100. Default: 1800ms */
  duration?: number;
  /** Called when progress reaches 100% */
  onComplete?: () => void;
  /** Custom status message if showStatus is enabled. */
  statusText?: string;
  /** Whether to show percentage number. Default: false */
  showPercentage?: boolean;
  /** Whether to show status message. Default: false */
  showStatus?: boolean;
  /** Custom CSS class for the container */
  className?: string;
}

export default function LoadingBar({
  progress: controlledProgress,
  duration = 1800,
  onComplete,
  statusText,
  showPercentage = false,
  showStatus = false,
  className = "",
}: LoadingBarProps) {
  const [internalProgress, setInternalProgress] = useState(
    controlledProgress !== undefined ? controlledProgress : 0
  );
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const isControlled = controlledProgress !== undefined;
  const currentProgress = isControlled
    ? Math.min(100, Math.max(0, controlledProgress))
    : internalProgress;

  // Auto-progress animation if uncontrolled
  useEffect(() => {
    if (isControlled) return;

    let rafId: number;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);

      // Smooth ease-out cubic curve
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.min(100, Math.round(eased * 100));

      setInternalProgress(val);

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setInternalProgress(100);
        if (onCompleteRef.current) {
          // Micro delay to allow 100% to paint before invoking completion
          setTimeout(() => {
            onCompleteRef.current?.();
          }, 150);
        }
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isControlled, duration]);

  return (
    <div
      className={`w-full max-w-xl flex flex-col gap-2 ${className}`}
      role="progressbar"
      aria-valuenow={currentProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading progress"
    >
      {/* Optional Top row: only shown if explicitly requested */}
      {(showStatus || showPercentage) && (
        <div className="flex items-center justify-between text-xs px-1">
          {showStatus ? (
            <div className="flex items-center gap-2 text-neutral-600 font-medium tracking-tight">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>{statusText || "Loading..."}</span>
            </div>
          ) : (
            <span />
          )}

          {showPercentage && (
            <span className="font-mono font-semibold text-neutral-800 tabular-nums text-[11px] bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200/60">
              {currentProgress}%
            </span>
          )}
        </div>
      )}

      {/* Bigger, Wider, Thicker Progress Bar Track */}
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-neutral-100 p-1 border border-black/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
        {/* Fill Bar */}
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-neutral-950 via-neutral-900 to-black transition-all duration-150 ease-out shadow-[0_0_12px_rgba(0,0,0,0.3)]"
          style={{ width: `${currentProgress}%` }}
        >
          {/* Animated subtle shimmer highlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />

          {/* Glowing leading tip */}
          <div className="absolute right-0 top-0 bottom-0 w-3 rounded-full bg-white/50 blur-[1px]" />
        </div>
      </div>
    </div>
  );
}
