'use client'

import React, { useState } from 'react'
import { FiCpu, FiGitBranch, FiShield, FiCheck, FiRefreshCw, FiZap } from 'react-icons/fi'

export default function HSeriesSection() {
  const [activeTab, setActiveTab] = useState<'h1' | 'h2' | 'h3'>('h1')

  const agentDetails = {
    h1: {
      tag: 'Primary Synthesizer',
      code: `// Karma H1 :: Primary Execution Node
export async function handlePaymentWebhook(req: Request) {
  const payload = await req.json();
  const sig = req.headers.get("stripe-signature");
  
  // Verify signature & extract event
  const event = stripe.webhooks.constructEvent(payload, sig, SECRET);
  await db.transaction(async (tx) => {
    await tx.events.insert({ eventId: event.id, status: "PROCESSED" });
    await notifyTenantService(event.data.object.customer);
  });
  return new Response("OK", { status: 200 });
}`,
      metrics: { latency: '142ms', astValid: '100%', coverage: '98.4%' },
      status: 'Generating Primary Route Handlers',
    },
    h2: {
      tag: 'Parallel Fallback & Optimization',
      code: `// Karma H2 :: Parallel Resilient Node
export async function handlePaymentWebhook(req: Request) {
  const buffer = await req.arrayBuffer();
  // Parallel idempotent Redis queue fallback
  const jobId = await redisQueue.push("stripe_events", buffer, {
    retries: 5,
    backoff: "exponential"
  });
  
  // Immediate acknowledge prevents provider timeout
  return new Response(JSON.stringify({ queued: true, jobId }), {
    status: 202,
    headers: { "Content-Type": "application/json" }
  });
}`,
      metrics: { latency: '89ms', astValid: '100%', coverage: '99.1%' },
      status: 'Synthesizing Idempotent Alternative',
    },
    h3: {
      tag: 'Integrity & Flow Monitor',
      code: `// Karma H3 :: Consensus & Integrity Engine
{
  "consensus_result": "MERGED_OPTIMAL",
  "analysis": {
    "h1_primary": "Strict relational ACID transaction guarantees",
    "h2_parallel": "Superior queue resiliency under traffic spikes",
    "selected_path": "H1 primary with H2 fallback dead-letter queue",
    "syntax_check": "PASS (0 lint errors)",
    "circular_dep_check": "ZERO_CYCLES",
    "architectural_fit": "100% compliant with Schema v2.4"
  }
}`,
      metrics: { latency: '18ms', astValid: 'PASS', coverage: 'VERIFIED' },
      status: 'Consensus Merged · Ready for Deployment',
    },
  }

  const agents = [
    {
      id: 'h1' as const,
      name: 'Karma H1',
      role: 'Primary Code Generation Agent',
      desc: 'Builds core modules, APIs, database schemas, and business logic directly from the architecture plan.',
      icon: FiCpu,
      badge: 'Agent 01',
    },
    {
      id: 'h2' as const,
      name: 'Karma H2',
      role: 'Parallel Code Generation Agent',
      desc: "Independently generates alternative implementations in parallel, so one agent's failure or timeout never blocks progress.",
      icon: FiGitBranch,
      badge: 'Agent 02',
    },
    {
      id: 'h3' as const,
      name: 'Karma H3',
      role: 'Code Integrity & Flow Monitor',
      desc: 'Continuously checks syntax, dependency flow, type contracts, and architectural consistency across H1 and H2 outputs.',
      icon: FiShield,
      badge: 'Agent 03',
    },
  ]

  return (
    <section id="h-series" className="py-24 sm:py-32 border-t border-white/5 relative bg-[#0d0d0d]/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="mb-14 sm:mb-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-500 font-mono text-sm sm:text-base font-semibold">(03)</span>
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">Parallel Code Generation.</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl">
            Three agents. One reliable output.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 max-w-2xl">
            Single-agent systems hallucinate and stall. The Karma H-Series runs synchronized parallel generation with automated integrity consensus.
          </p>
        </div>

        {/* 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {agents.map((a) => {
            const Icon = a.icon
            const isSelected = activeTab === a.id
            return (
              <div
                key={a.id}
                onClick={() => setActiveTab(a.id)}
                className={`cursor-pointer rounded-2xl border p-7 transition-all duration-300 relative ${
                  isSelected
                    ? 'border-amber-500/60 bg-[#161616] shadow-xl shadow-amber-950/20'
                    : 'border-white/10 bg-[#111111] hover:border-white/20 hover:bg-[#141414]'
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-amber-500 text-black' : 'bg-white/5 text-amber-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs text-amber-500 font-semibold uppercase">
                    {a.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-1.5 tracking-tight">
                  {a.name}
                </h3>
                <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400/90 mb-3">
                  {a.role}
                </h4>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {a.desc}
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-mono text-neutral-400">
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400 animate-pulse' : 'bg-neutral-600'}`} />
                  <span>Click to inspect live telemetry</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Live Parallel Execution Visualizer */}
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-2xl">
          {/* Visualizer Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-[#121212]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                Karma H-Engine Consensus Inspector:
              </span>
              <span className="rounded-md bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-xs font-mono font-semibold text-amber-400">
                {activeTab.toUpperCase()} ACTIVE
              </span>
            </div>

            {/* Metrics Chips */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-neutral-300">
                <FiZap className="w-3.5 h-3.5 text-amber-400" />
                <span>Latency: {agentDetails[activeTab].metrics.latency}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-neutral-300">
                <FiCheck className="w-3.5 h-3.5 text-green-400" />
                <span>AST: {agentDetails[activeTab].metrics.astValid}</span>
              </div>
            </div>
          </div>

          {/* Code & Telemetry Pane */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span className="text-white font-medium">{agentDetails[activeTab].tag}</span>
                <span className="text-neutral-500">— {agentDetails[activeTab].status}</span>
              </span>
              <span className="text-[11px] text-neutral-500">Auto-Reconciling Stream</span>
            </div>

            <pre className="p-4 sm:p-5 rounded-xl bg-[#0e0e0e] border border-white/5 font-mono text-xs sm:text-sm text-neutral-200 overflow-x-auto leading-relaxed">
              <code>{agentDetails[activeTab].code}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}
