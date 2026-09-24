"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiLayers,
  FiCpu,
  FiCode,
  FiCheck,
  FiArrowRight,
  FiTerminal,
  FiGitCommit,
  FiServer,
} from "react-icons/fi";

const AGENTS = [
  {
    id: "architect",
    name: "Architect Agent",
    role: "System Design & Monorepo Topology",
    description:
      "Analyzes your prompt, evaluates performance tradeoffs, provisions database schemas (Prisma/PostgreSQL), and structures clean modular monorepos with Docker configurations.",
    icon: <FiLayers className="w-5 h-5 text-amber-400" />,
    color: "amber",
    responsibilities: [
      "Generates database schemas & migrations",
      "Defines REST, tRPC, and GraphQL contracts",
      "Configures container networking & environment specs",
      "Eliminates circular dependency anti-patterns",
    ],
    sampleLog: `[ARCHITECT] Analyzing requirement: "Multi-tenant B2B Analytics"
[ARCHITECT] Topology selected: Next.js 15 + Prisma + PostgreSQL + Redis
[ARCHITECT] Generated folder topology with 14 modular packages
[ARCHITECT] Security validation passed: RBAC and JWT policies established`,
  },
  {
    id: "planner",
    name: "Planner Agent",
    role: "Task Decomposition & DAG Execution",
    description:
      "Breaks the architectural blueprint into a Directed Acyclic Graph (DAG) of parallel execution steps, managing dependency order and allocating sub-tasks to code synthesis engines.",
    icon: <FiCpu className="w-5 h-5 text-purple-400" />,
    color: "purple",
    responsibilities: [
      "Constructs parallel execution DAGs",
      "Monitors step milestones & dependency blockers",
      "Validates state consistency between frontend & backend",
      "Schedules hot-reload & unit test pipelines",
    ],
    sampleLog: `[PLANNER] Building DAG execution graph for 24 sub-tasks
[PLANNER] Parallel batch #1 scheduled: Auth middleware & DB models
[PLANNER] Parallel batch #2 scheduled: UI layout, sidebar, canvas engine
[PLANNER] 100% DAG dependencies satisfied. Dispatched to Coder agent`,
  },
  {
    id: "coder",
    name: "Coder Agent",
    role: "Type-Safe Parallel Code Synthesis",
    description:
      "Writes high-performance, strictly typed code conforming to modern standards. Automatically runs tests, intercepts compile errors, and triggers self-healing iterations.",
    icon: <FiCode className="w-5 h-5 text-emerald-400" />,
    color: "emerald",
    responsibilities: [
      "Writes clean TypeScript with zero 'any' compromises",
      "Integrates modern UI with Tailwind CSS and Framer Motion",
      "Injects Socket.io, TanStack Query, and Zustand stores",
      "Executes test suites and self-corrects runtime bugs",
    ],
    sampleLog: `[CODER] Synthesizing components/Dashboard/MetricsCard.tsx...
[CODER] Synthesizing hooks/queries/useRealtimeAnalytics.ts...
[CODER] Running typecheck: 0 errors detected.
[CODER] Hot reload signal emitted to live sandbox iframe`,
  },
];

export default function AgentShowcase() {
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);

  return (
    <section id="agents" className="py-24 relative bg-[#0d0d13] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <FiServer className="w-3.5 h-3.5 text-purple-400" />
            Specialized Roles
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Meet the Multi-Agent Brain
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Unlike generic AI chat interfaces, StackPilot deploys a coordinated swarm of specialized agents, each trained for a distinct software engineering role.
          </p>
        </div>

        {/* Agent Selector Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl">
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgent(agent)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  selectedAgent.id === agent.id
                    ? "bg-white/[0.12] text-white shadow-lg border border-white/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {agent.icon}
                <span>{agent.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Agent Display Card */}
        <div className="rounded-3xl bg-[#111118]/90 border border-white/10 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Details */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.05] border border-white/10 text-xs font-mono text-amber-300">
                {selectedAgent.role}
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {selectedAgent.name}
              </h3>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                {selectedAgent.description}
              </p>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Key Responsibilities
                </div>
                {selectedAgent.responsibilities.map((resp, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-zinc-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <FiCheck className="w-3.5 h-3.5" />
                    </div>
                    <span>{resp}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300"
                >
                  <span>Experience {selectedAgent.name} in action</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Simulated Live Console */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#09090d] border border-white/10 p-5 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08] text-zinc-500 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-zinc-300 font-semibold">{selectedAgent.id}.agent.log</span>
                  </div>
                  <span>LangGraph Engine // Active</span>
                </div>

                <pre className="text-zinc-300 leading-loose whitespace-pre-wrap">
                  {selectedAgent.sampleLog}
                </pre>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Latency: ~180ms</span>
                  <span className="text-emerald-400 font-semibold">State: Synchronized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
