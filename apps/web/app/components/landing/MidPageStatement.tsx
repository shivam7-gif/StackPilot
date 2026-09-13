'use client'

import React, { useState } from 'react'
import { FiArrowRight, FiCheck } from 'react-icons/fi'

interface MidPageStatementProps {
  onOpenWaitlist: () => void
}

export default function MidPageStatement({ onOpenWaitlist }: MidPageStatementProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setSubmitted(true)
  }

  return (
    <section className="relative py-28 sm:py-36 md:py-44 overflow-hidden border-t border-b border-white/5 bg-[#0a0a0a]">
      {/* Warm black-to-amber/orange radiant glow underneath */}
      <div className="absolute inset-0 pointer-events-none -z-10 sp-statement-glow opacity-90" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1100px] h-[350px] pointer-events-none -z-10 bg-gradient-to-t from-amber-600/20 via-amber-700/5 to-transparent blur-3xl" />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-amber-400 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>The Next Evolution in Software Engineering</span>
        </div>

        {/* Big Full-Width Statement */}
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white leading-[1.0] drop-shadow-md">
          Ideas become <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-600">
            autonomous software.
          </span>
        </h2>

        {/* Supporting Line */}
        <p className="mt-6 text-base sm:text-xl md:text-2xl text-neutral-300 font-light max-w-2xl mx-auto leading-relaxed">
          StackPilot AI handles the build — you focus on the idea.
        </p>

        {/* Interactive Quick Signup Form */}
        <div className="mt-12 max-w-md mx-auto">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                placeholder="Enter your work email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-5 py-3.5 text-sm text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-colors"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3.5 text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 shrink-0"
              >
                <span>Get Access</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-6 py-3 text-sm text-amber-300 font-medium">
              <FiCheck className="w-4 h-4 text-amber-400" />
              <span>Priority access requested for {email}</span>
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={onOpenWaitlist}
              className="text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-300 transition-colors font-mono"
            >
              Or configure team onboarding &rarr;
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
