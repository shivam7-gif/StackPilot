"use client";

import React, { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";
import animationData from "./Loading text animation.json";

export interface LoadingTextAnimationProps {
  /** Optional width in px or CSS string. Defaults to 320 */
  width?: number | string;
  /** Optional height in px or CSS string. Defaults to 160 */
  height?: number | string;
  /** Whether the animation should loop continuously. Default: true */
  loop?: boolean;
  /** Optional playback speed. Default: 1 */
  speed?: number;
  /** Additional custom class names for the container */
  className?: string;
}

export default function LoadingTextAnimation({
  width = 320,
  height = 160,
  loop = true,
  speed = 1,
  className = "",
}: LoadingTextAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Dynamically import lottie-web on client side to avoid any SSR issues
    import("lottie-web").then((lottieModule) => {
      if (!isMounted || !containerRef.current) return;
      const lottie =
        (lottieModule as any).default?.default ||
        (lottieModule as any).default ||
        (typeof window !== "undefined" && (window as any).lottie) ||
        lottieModule;

      if (!lottie || typeof lottie.loadAnimation !== "function") {
        console.warn("Lottie library not ready");
        return;
      }

      // Clean up any existing instance first
      if (animRef.current) {
        animRef.current.destroy();
      }

      try {
        const data = (animationData as any).default || animationData;
        const anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop,
          autoplay: true,
          animationData: data,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            progressiveLoad: true,
            hideOnTransparent: true,
          },
        });

        anim.setSpeed(speed);
        animRef.current = anim;
        setIsLoaded(true);
      } catch (err) {
        console.error("Failed to load Lottie text animation:", err);
      }
    });

    return () => {
      isMounted = false;
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [loop, speed]);

  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <div
      className={`relative flex items-center justify-center transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"
        } ${className}`}
      style={style}
      aria-label="Loading animation"
      role="img"
    >
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center [&_svg]:overflow-visible"
      />
    </div>
  );
}
