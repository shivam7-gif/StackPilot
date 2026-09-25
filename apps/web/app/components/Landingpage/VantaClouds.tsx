"use client";

import React, { useEffect, useRef, useState } from "react";

interface VantaCloudsProps {
  children?: React.ReactNode;
  className?: string;
}

declare global {
  interface Window {
    VANTA?: any;
    THREE?: any;
  }
}

export default function VantaClouds({
  children,
  className = "",
}: VantaCloudsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    let effectInstance: any = null;
    let isCancelled = false;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    };

    const initVanta = async () => {
      try {
        // Load Three.js first if not already present
        if (!window.THREE) {
          await loadScript(
            "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
          );
        }

        // Load Vanta Clouds script
        if (!window.VANTA || !window.VANTA.CLOUDS) {
          await loadScript(
            "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.clouds.min.js"
          );
        }

        if (
          !isCancelled &&
          containerRef.current &&
          window.VANTA &&
          window.VANTA.CLOUDS
        ) {
          effectInstance = window.VANTA.CLOUDS({
            el: containerRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            backgroundColor: 0x090d16,
            skyColor: 0x162238,
            cloudColor: 0x485f80,
            cloudShadowColor: 0x0f172a,
            sunColor: 0xf59e0b,
            sunGlareColor: 0xd97706,
            sunlightColor: 0xfbbf24,
            speed: 1.0,
          });

          setVantaEffect(effectInstance);
        }
      } catch (err) {
        // If external CDN is blocked or fails, graceful fallback to ambient gradient
        console.warn("Vanta Clouds animation could not load; using ambient fallback.", err);
      }
    };

    initVanta();

    return () => {
      isCancelled = true;
      if (effectInstance && typeof effectInstance.destroy === "function") {
        effectInstance.destroy();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#090d16] ${className}`}
    >
      {/* Ambient atmospheric background fallback */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/40 via-[#090d16]/80 to-[#090d16]"
        aria-hidden="true"
      />
      {/* Content wrapper */}
      <div className="relative z-10 flex w-full flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
