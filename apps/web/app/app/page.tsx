'use client'

import React, { useState } from 'react'
import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import ProblemSection from '@/components/landing/ProblemSection'
import SolutionSection from '@/components/landing/SolutionSection'
import HSeriesSection from '@/components/landing/HSeriesSection'
import WorkflowSection from '@/components/landing/WorkflowSection'
import TechStackSection from '@/components/landing/TechStackSection'
import MidPageStatement from '@/components/landing/MidPageStatement'
import FutureImpactSection from '@/components/landing/FutureImpactSection'
import Footer from '@/components/landing/Footer'
import WaitlistModal from '@/components/landing/WaitlistModal'
import AmberCursor from '@/components/landing/AmberCursor'

export default function StackPilotLandingPage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false)

  const handleOpenWaitlist = () => setWaitlistOpen(true)
  const handleCloseWaitlist = () => setWaitlistOpen(false)

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-amber-500/30 selection:text-white relative overflow-x-hidden">
      {/* Subtle Agency Amber Cursor Accent */}
      <AmberCursor />

      {/* Fixed Navigation Bar */}
      <Navbar onOpenWaitlist={handleOpenWaitlist} />

      {/* 1. Hero Section with Oversized Kinetic Type */}
      <HeroSection onOpenWaitlist={handleOpenWaitlist} />

      {/* 2. Section 01: The Problem */}
      <ProblemSection />

      {/* 3. Section 02: Our Solution */}
      <SolutionSection />

      {/* 4. Section 03: Karma H-Series Parallel Code Generation */}
      <HSeriesSection />

      {/* 5. Section 04: Workflow (From prompt to production) */}
      <WorkflowSection />

      {/* 6. Section 05: Tech Stack (Under the Hood) */}
      <TechStackSection />

      {/* 7. Big Statement / Mid-Page CTA */}
      <MidPageStatement onOpenWaitlist={handleOpenWaitlist} />

      {/* 8. Horizon & Ecosystem Impact */}
      <FutureImpactSection />

      {/* 9. Minimal Footer */}
      <Footer />

      {/* Interactive Waitlist Modal */}
      <WaitlistModal isOpen={waitlistOpen} onClose={handleCloseWaitlist} />
    </main>
  )
}