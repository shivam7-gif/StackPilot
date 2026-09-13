'use client'

import React from 'react'
import { FiMonitor, FiCpu, FiDatabase, FiCloud } from 'react-icons/fi'

export default function TechStackSection() {
  const categories = [
    {
      name: 'Interface Layer',
      icon: FiMonitor,
      num: '01',
      description: 'Zero-latency browser IDE and cross-platform native terminal CLI tooling.',
      technologies: ['React', 'Next.js', 'Monaco Editor', 'Node.js / Go CLI', 'JWT / OAuth 2.0'],
    },
    {
      name: 'AI Orchestration',
      icon: FiCpu,
      num: '02',
      description: 'Distributed event-driven agent state machine with deterministic routing.',
      technologies: ['FastAPI', 'LangGraph', 'Celery / Temporal', 'Apache Kafka', 'Event Bus'],
    },
    {
      name: 'Memory & Context',
      icon: FiDatabase,
      num: '03',
      description: 'Hybrid multi-tier knowledge graph, vector similarity, and immutable audit chains.',
      technologies: ['Neo4j Graph', 'Pinecone / Qdrant', 'Weaviate', 'Redis Cache', 'KarmaChain Ledger'],
    },
    {
      name: 'DevOps & Cloud',
      icon: FiCloud,
      num: '04',
      description: 'Production container orchestration, infrastructure as code, and observability.',
      technologies: ['Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'AWS Multi-Region', 'Prometheus / Grafana'],
    },
  ]

  return (
    <section id="tech" className="py-24 sm:py-32 border-t border-white/5 relative bg-[#0d0d0d]/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="mb-14 sm:mb-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-500 font-mono text-sm sm:text-base font-semibold">(05)</span>
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">Under the Hood.</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl">
            Built on a modern, scalable stack.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 max-w-2xl">
            Enterprise-grade infrastructure designed for millisecond state propagation, fault-tolerant agent execution, and petabyte-scale codebases.
          </p>
        </div>

        {/* 4 Category Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <div
                key={cat.name}
                className="rounded-2xl border border-white/10 bg-[#111111] p-7 sm:p-8 hover:border-amber-500/40 hover:bg-[#141414] transition-all duration-300 shadow-xl shadow-black/40"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {cat.name}
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-amber-500 font-semibold uppercase">
                    LAYER {cat.num}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed">
                  {cat.description}
                </p>

                {/* Tech Chips */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                  {cat.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="sp-pill-tag py-1.5 px-3 text-xs text-neutral-300 hover:text-white hover:border-amber-500/40 hover:bg-amber-500/10 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
                      {tech}
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
