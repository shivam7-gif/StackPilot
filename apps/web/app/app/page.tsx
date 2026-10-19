"use client";

import Spline from "@splinetool/react-spline";
import Navbar from "@/components/navbar/Navbar";
import { usePageTransition } from "@/components/Loadingscreen/PageTransitionContext";
import { useSession } from "next-auth/react";
import { ArrowRight, Compass } from "lucide-react";

export default function Home() {
  const { transitionTo, isTransitioning } = usePageTransition();
  const { data: session, status } = useSession();

  function handleStartBuilding() {
    if (status === "authenticated") {
      transitionTo("/dashboard", "StackPilot");
    } else {
      transitionTo("/auth/login", "StackPilot");
    }
  }

  function handleExplore() {
    transitionTo("/dashboard", "StackPilot");
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black font-sans antialiased">
      {/* 3D Interactive Spline Canvas */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <Spline scene="https://prod.spline.design/sud5WLpv4tSe8n43/scene.splinecode" />
      </div>

      {/* Top Navbar */}
      <Navbar />

      {/* Action Buttons placed at bottom */}
      <div className="pointer-events-none fixed bottom-12 left-0 right-0 z-20 flex flex-col sm:flex-row items-center justify-center gap-3 px-6">
        <button
          onClick={handleStartBuilding}
          disabled={isTransitioning}
          className="pointer-events-auto flex items-center justify-center gap-2 rounded-full bg-orange-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-orange-950/30 transition hover:bg-orange-500 active:scale-95 cursor-pointer disabled:pointer-events-none"
        >
          <span>Start Building</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          onClick={handleExplore}
          disabled={isTransitioning}
          className="pointer-events-auto flex items-center justify-center gap-2 rounded-full border border-white/20 bg-black/40 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-md shadow-lg shadow-black/40 transition hover:bg-white/10 active:scale-95 cursor-pointer"
        >
          <Compass className="w-4 h-4 text-orange-400" />
          <span>Explore StackPilot</span>
        </button>
      </div>
    </main>
  );
}