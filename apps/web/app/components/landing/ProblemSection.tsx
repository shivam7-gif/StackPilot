'use client'

import React from 'react'

export default function ProblemSection() {
  const problems = [
    {
      num: '01',
      title: 'Context Amnesia',
      desc: 'Models forget architecture, dependencies, and structure as projects grow beyond small toy files.',
      tag: 'Memory Decay',
    },
    {
      num: '02',
      title: 'Fragmented Workflow',
      desc: 'Developers juggle separate tools for planning, coding, testing, and deploying without unified synchronization.',
      tag: 'Tool Fatigue',
    },
    {
      num: '03',
      title: 'No Repository-Level Understanding',
      desc: "AI can't continuously retrieve relevant files, docs, or architectural decisions across large interconnected codebases.",
      tag: 'Shallow Indexing',
    },
    {
      num: '04',
      title: 'Not Fully Autonomous',
      desc: 'Current tools generate snippets and autocomplete single lines, failing to execute entire systems end-to-end.',
      tag: 'Snippet Trapped',
    },
  ]

  return (
    <section id="problem" className="py-24 sm:py-32 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="mb-14 sm:mb-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-500 font-mono text-sm sm:text-base font-semibold">(01)</span>
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">The Problem.</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl">
            AI coding assistants are hitting a wall.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 max-w-2xl">
            Autocomplete and copilot widgets solve syntax, but they crumble when building real-world, multi-module production software.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {problems.map((p) => (
            <div
              key={p.num}
              className="group relative rounded-2xl border border-white/10 bg-[#111111] p-8 hover:border-amber-500/40 hover:bg-[#141414] transition-all duration-300 shadow-lg shadow-black/40 hover:-translate-y-1"
            >
              {/* Card top row */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-amber-500/90 group-hover:text-amber-400 transition-colors">
                  {p.num}
                </span>
                <span className="sp-pill-tag text-neutral-400 group-hover:border-amber-500/40 group-hover:text-white">
                  {p.tag}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-amber-300 transition-colors">
                {p.title}
              </h3>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                {p.desc}
              </p>

              {/* Subtle accent hover indicator line */}
              <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-amber-500/0 to-transparent group-hover:via-amber-500/40 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
