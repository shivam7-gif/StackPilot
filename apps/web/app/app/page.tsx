import Navbar from "@/components/LandingPage/Navbar";
import Hero from "@/components/LandingPage/Hero";
import Features from "@/components/LandingPage/Features";
import AgentShowcase from "@/components/LandingPage/AgentShowcase";
import HowItWorks from "@/components/LandingPage/HowItWorks";
import Architecture from "@/components/LandingPage/Architecture";
import CTASection from "@/components/LandingPage/CTASection";
import Footer from "@/components/LandingPage/Footer";

export default function StackPilotLandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-amber-500/30 selection:text-white flex flex-col">
      {/* Sticky Glass Navbar */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero />
        <Features />
        <AgentShowcase />
        <HowItWorks />
        <Architecture />
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}