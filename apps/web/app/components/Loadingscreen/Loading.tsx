"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./LoadingScreen.module.css";

export type LoadingScreenProps = {
  /** Bold word shown in the center. Default: "StackPilot" */
  text?: string;
  /** Minimum time (ms) the loader takes to reach 100%. */
  duration?: number;
  /** Called once the exit animation has finished and unmounted. */
  onComplete?: () => void;
  /** Called when 100% progress is reached and exit fade begins. */
  onExitStart?: () => void;
};

// Gentle quadratic ease-in-out for a silky-smooth, fluid progression without abrupt jumps
const smoothEase = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export default function LoadingScreen({
  text = "StackPilot",
  duration = 1500,
  onComplete,
  onExitStart,
}: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const lastPercentRef = useRef<number>(-1);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduceMotion ? 400 : duration;

    // Lock scroll while the loader is up
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    let pageReady = document.readyState === "complete";
    const onLoad = () => (pageReady = true);
    window.addEventListener("load", onLoad);

    let raf = 0;
    let exitTimer: ReturnType<typeof setTimeout>;
    const start = performance.now();

    const paint = (value: number) => {
      // Subpixel float interpolation for smooth GPU rendering
      rootRef.current?.style.setProperty("--p", value.toFixed(2));

      // Batch DOM mutations for counter text
      const rounded = Math.round(value);
      if (rounded !== lastPercentRef.current) {
        lastPercentRef.current = rounded;
        if (labelRef.current) {
          labelRef.current.textContent = `${rounded}%`;
        }
      }
    };

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / total);
      let value = smoothEase(t) * 100;

      // Hold at 99% until page is ready if assets are still actively streaming
      if (!pageReady) value = Math.min(value, 99);

      paint(value);

      if (t < 1 || !pageReady) {
        raf = requestAnimationFrame(tick);
      } else {
        paint(100);
        exitTimer = setTimeout(() => {
          setExiting(true);
          onExitStart?.();
        }, 150);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      window.removeEventListener("load", onLoad);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [duration, onExitStart]);

  // Handle final exit fade-out and unmount
  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(() => {
      setVisible(false);
      document.documentElement.style.overflow = "";
      onComplete?.();
    }, 500);
    return () => clearTimeout(t);
  }, [exiting, onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${exiting ? styles.exit : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      {/* Light layer with the centered text, revealed as the black curtain recedes */}
      <div className={styles.stage}>
        <p className={styles.title}>
          <strong>{text}</strong>
          <span> :</span>
        </p>
      </div>

      {/* Black curtain that wipes away to the right */}
      <div className={styles.curtain}>
        <div className={styles.counter}>
          <span ref={labelRef} className={styles.label}>
            0%
          </span>
          <span className={styles.line} />
        </div>
      </div>
    </div>
  );
}