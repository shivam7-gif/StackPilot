'use client'

import React from 'react'
import { FiCompass, FiTrendingUp, FiCheckCircle } from 'react-icons/fi'

export default function FutureImpactSection() {
  const futureScopeItems = [
    {
      title: 'Autonomous MCP Server',
      desc: 'Native Model Context Protocol servers enabling zero-human continuous deployment and self-updating microservices.',
    },
    {
      title: 'Swarm-Level Agent Collaboration',
      desc: 'Dynamic agent spawning that automatically provisions niche sub-agents for specialized cryptography, UI accessibility, or database indexing.',
    },
    {
      title: 'Self-Optimizing CI/CD Pipelines',
      desc: 'Telemetry feedback loops that automatically fine-tune Kubernetes resource allocations and auto-scale infrastructure based on live metrics.',
    },
    {
      title: 'Deep Multi-Cloud Native Integration',
      desc: 'Seamless zero-config deployment spanning AWS, GCP, Azure, and distributed edge networks with automated compliance audits.',
    },
  ]

  const impactItems = [
    {
      metric: '10x',
      title: 'Velocity Acceleration',
      desc: 'Shrink release cycles from quarters to hours by eliminating manual boilerplate writing and repetitive refactoring loops.',
    },
    {
      metric: 'Zero',
      title: 'Context Loss',
      desc: 'Persistent graph memory ensures agents retain architectural decisions across weeks of complex distributed codebase evolution.',
    },
    {
      metric: '100%',
      title: 'Automated Integrity Verification',
      desc: 'Karma H3 acts as a continuous quality gate, guaranteeing that generated code passes syntax, linting, and type verification before merge.',
    },
    {
      metric: 'End-to-End',
      title: 'True Autonomy',
      desc: 'From initial prompt to live production cloud URL, StackPilot coordinates every stage without fragile copy-pasting.',
    },
  ]

  return (
    <section id="future-impact" className="py-24 sm:py-32 border-t border-white/5 relative bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="mb-14 sm:mb-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-500 font-mono text-sm sm:text-base font-semibold">(06)</span>
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">Future & Impact.</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl">
            Pioneering the autonomous frontier.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 max-w-2xl">
            We are building toward a future where developers orchestrate systems at the architectural level while autonomous agents handle execution.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Column 1: Future Scope */}
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-8 sm:p-10 shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <FiCompass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Future Scope</h3>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">Roadmap & Capabilities</span>
              </div>
            </div>

            <div className="space-y-6">
              {futureScopeItems.map((item, idx) => (
                <div key={item.title} className="flex items-start gap-3.5">
                  <span className="font-mono text-xs text-amber-500 font-semibold mt-1">
                    0{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Impact */}
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-8 sm:p-10 shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <FiTrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Ecosystem Impact</h3>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">Measurable Outcomes</span>
              </div>
            </div>

            <div className="space-y-6">
              {impactItems.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="min-w-[64px] font-mono text-xl font-black text-amber-400">
                    {item.metric}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
