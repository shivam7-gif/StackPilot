"use client";
import Link from "next/link";
import Spline from '@splinetool/react-spline';
import Navbar from '@/components/navbar/Navbar';
import { useRouter } from "next/navigation";
export default function Home() {

  const router = useRouter();
  function signup() {
    router.push("/auth/signup");
  }
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* 3D Interactive Spline Canvas */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <Spline scene="https://prod.spline.design/sud5WLpv4tSe8n43/scene.splinecode" />
      </div>

      {/* Top Navbar */}
      <Navbar />

      {/* Action Buttons placed at the bottom */}
      <div className="pointer-events-none fixed bottom-12 left-0 right-0 z-20 flex items-center justify-center gap-4 px-6">
        <button onClick={signup} className="pointer-events-auto rounded-full bg-mist px-7 py-3 text-sm font-medium text-ink shadow-lg shadow-black/30 transition hover:bg-white active:scale-95 cursor-pointer">
          Sign up
        </button>
        <button className="pointer-events-auto rounded-full border border-mist/40 bg-black/30 px-7 py-3 text-sm font-medium text-mist backdrop-blur-md shadow-lg shadow-black/30 transition hover:bg-mist hover:text-ink active:scale-95">
          Documentation
        </button>
      </div>
    </main>
  );
}