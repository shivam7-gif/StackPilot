'use client'

import React, { useState } from 'react'
import { FiArrowUpRight, FiPlay, FiTerminal, FiCpu, FiCheckCircle, FiShield, FiActivity } from 'react-icons/fi'

interface HeroSectionProps {
  onOpenWaitlist: () => void
}

export default function HeroSection({ onOpenWaitlist }: HeroSectionProps) {
  const [activeScenario, setActiveScenario] = useState<'saas' | 'stream' | 'devops'>('saas')

  const scenarios = {
    saas: {
      prompt: 'Build multi-tenant SaaS with auth, Stripe billing, and automated test suite',
      plan: '14 Modules · 38 Endpoints · Next.js 16 + FastAPI',
      h1: 'Generating database schema and Stripe webhook listeners',
      h2: 'Parallel generation: alternate auth flow with OAuth2 + session tokens',
      h3: 'Integrity verified: 0 type flaws, zero circular imports',
    },
    stream: {
      prompt: 'Generate real-time event pipeline with Kafka, Redis cache, and WebSockets',
      plan: '8 Services · 12 Topics · Kafka + Redis Streams',
      h1: 'Generating consumer worker groups & partition rebalancing logic',
      h2: 'Parallel generation: optimized batching strategy with sub-5ms latency',
      h3: 'Integrity verified: throughput benchmark > 150k events/sec validated',
    },
    devops: {
      prompt: 'Synthesize Kubernetes cluster manifests, Terraform IaC, and GitHub Actions CI/CD',
      plan: 'Multi-region AWS EKS · Zero-Downtime Rolling Deploys',
      h1: 'Generating Helm charts, HPA scaling policies, and ingress routing',
      h2: 'Parallel generation: Canary deployment controller with Prometheus hooks',
      h3: 'Integrity verified: Terraform plan executed with 0 drift issues',
    },
  }

  return (
    <section id="hero" className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
      {/* Background warm amber radial glow behind hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] pointer-events-none -z-10 sp-hero-glow opacity-80" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Top Eyebrow Tag */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-amber-400 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Autonomous Multi-Agent Engineering Platform</span>
          </div>
        </div>

        {/* DOMINANT KINETIC-TYPE OVERSIZED HEADLINE */}
        <div className="text-center select-none">
          <h1 className="text-[14vw] sm:text-[11vw] lg:text-[130px] font-black uppercase tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-neutral-500 drop-shadow-sm">
            StackPilot<span className="text-amber-500">.</span>AI
          </h1>
        </div>

        {/* Subheadline & Supporting Line */}
        <div className="mt-8 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
            AI that builds everything with you.
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-neutral-400 font-normal leading-relaxed max-w-2xl mx-auto">
            An autonomous multi-agent platform that turns ideas into working, production-ready applications with persistent memory and parallel validation.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onOpenWaitlist}
            className="group relative inline-flex items-center gap-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black px-7 py-3.5 text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Join the Waitlist</span>
            <FiArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          <a
            href="#workflow"
            className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 px-6 py-3.5 text-sm font-medium uppercase tracking-wider text-neutral-200 hover:text-white transition-all duration-200"
          >
            <FiPlay className="w-3.5 h-3.5 text-amber-400" />
            <span>See How It Works</span>
          </a>
        </div>

        {/* Live Multi-Agent Simulation Preview Card */}
        <div className="mt-16 sm:mt-20 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden shadow-2xl shadow-black/80">
            {/* Terminal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-white/10 bg-[#141414]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs font-mono text-neutral-400 ml-2">stackpilot-orchestrator :: autonomous-engine v2.4</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-green-400">Agents Synchronized</span>
              </div>
            </div>

            {/* Interactive Prompt Scenario Selector */}
            <div className="px-5 py-3 border-b border-white/5 bg-[#101010] flex items-center gap-2 overflow-x-auto text-xs font-mono">
              <span className="text-neutral-500 uppercase tracking-wider text-[11px] mr-1 hidden sm:inline">Scenario:</span>
              <button
                onClick={() => setActiveScenario('saas')}
                className={`rounded-lg px-3 py-1 transition-all ${
                  activeScenario === 'saas'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                01 Full-Stack SaaS
              </button>
              <button
                onClick={() => setActiveScenario('stream')}
                className={`rounded-lg px-3 py-1 transition-all ${
                  activeScenario === 'stream'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                02 Real-Time Event Pipeline
              </button>
              <button
                onClick={() => setActiveScenario('devops')}
                className={`rounded-lg px-3 py-1 transition-all ${
                  activeScenario === 'devops'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                03 Cloud Infrastructure
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-5 sm:p-6 font-mono text-xs sm:text-sm space-y-3.5">
              {/* Prompt line */}
              <div className="flex items-start gap-2.5 text-neutral-300">
                <span className="text-amber-500 font-bold select-none">&gt;</span>
                <span className="text-neutral-400 select-none">prompt:</span>
                <span className="text-white font-medium">&quot;{scenarios[activeScenario].prompt}&quot;</span>
              </div>

              {/* Step: Planner & Architect */}
              <div className="flex items-start gap-2.5 text-neutral-300 pl-4 border-l border-white/10">
                <span className="text-neutral-500 select-none">[01 PLANNER]</span>
                <span className="text-neutral-300">{scenarios[activeScenario].plan}</span>
              </div>

              {/* Parallel Code Agents Execution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 my-2">
                {/* H1 Agent */}
                <div className="rounded-xl border border-white/10 bg-[#121212] p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-amber-400 text-xs font-bold flex items-center gap-1.5">
                      <FiCpu className="w-3.5 h-3.5" />
                      Karma H1 (Primary Agent)
                    </span>
                    <span className="text-[10px] text-green-400 font-mono">ACTIVE</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {scenarios[activeScenario].h1}
                  </p>
                </div>

                {/* H2 Agent */}
                <div className="rounded-xl border border-white/10 bg-[#121212] p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-amber-400 text-xs font-bold flex items-center gap-1.5">
                      <FiActivity className="w-3.5 h-3.5" />
                      Karma H2 (Parallel Agent)
                    </span>
                    <span className="text-[10px] text-green-400 font-mono">SYNCHRONOUS</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {scenarios[activeScenario].h2}
                  </p>
                </div>
              </div>

              {/* H3 Integrity Verification */}
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FiShield className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-amber-300 font-semibold text-xs">
                    Karma H3 (Integrity & Flow Monitor):
                  </span>
                  <span className="text-neutral-300 text-xs hidden sm:inline">
                    {scenarios[activeScenario].h3}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-amber-400 text-xs font-mono">
                  <FiCheckCircle className="w-4 h-4" />
                  <span>Validated</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
