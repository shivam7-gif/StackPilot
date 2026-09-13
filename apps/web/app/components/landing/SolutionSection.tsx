'use client'

import React from 'react'
import { FiDatabase, FiTerminal, FiLayers, FiCpu } from 'react-icons/fi'

export default function SolutionSection() {
  const solutions = [
    {
      num: '01',
      title: 'Karma Memory Graph',
      desc: 'Persistent vector + graph memory that eliminates context loss across multi-day engineering workflows and complex architectures.',
      icon: FiDatabase,
      tags: ['Vector Memory', 'Redis Cache', 'KarmaChain'],
    },
    {
      num: '02',
      title: 'Agentic Dev Environment',
      desc: "One unified Monaco web editor + CLI where specialized agents handle everything from prompt intake to production cloud deployment.",
      icon: FiTerminal,
      tags: ['Web Editor', 'CLI', 'Event-Driven'],
    },
    {
      num: '03',
      title: 'KarmaRepo',
      desc: 'Real-time AST and semantic indexing of your entire codebase for precise reasoning over hundreds of thousands of lines of code.',
      icon: FiLayers,
      tags: ['Semantic Search', 'Kafka Sync', 'Vector DB'],
    },
    {
      num: '04',
      title: 'Karma Orchestrator',
      desc: 'The master coordination layer assigning and sequencing work across every specialized agent with continuous feedback loops.',
      icon: FiCpu,
      tags: ['Multi-Agent', 'Feedback Loops', 'Automation'],
    },
  ]

  return (
    <section id="solution" className="py-24 sm:py-32 border-t border-white/5 relative bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="mb-14 sm:mb-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-500 font-mono text-sm sm:text-base font-semibold">(02)</span>
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">Our Solution.</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl">
            Solutions built for scale.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 max-w-2xl">
            StackPilot replaces fragile single-shot generation with an interconnected multi-agent engine anchored by persistent graph memory.
          </p>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((s) => {
            const IconComponent = s.icon
            return (
              <div
                key={s.num}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#101010] p-7 hover:border-amber-500/40 hover:bg-[#141414] transition-all duration-300 shadow-xl shadow-black/40 hover:-translate-y-1"
              >
                <div>
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs text-amber-500 font-semibold uppercase tracking-wider">
                      ({s.num})
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-amber-300 transition-colors">
                    {s.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                {/* Pill Badges / Tags */}
                <div className="mt-8 pt-5 border-t border-white/5 flex flex-wrap gap-1.5">
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      className="sp-pill-tag text-[11px] py-1 px-2.5 group-hover:border-amber-500/30 group-hover:text-neutral-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
