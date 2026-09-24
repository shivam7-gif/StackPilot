"use client";

import {
  FiCpu,
  FiLayers,
  FiTerminal,
  FiShield,
  FiZap,
  FiGitBranch,
  FiRepeat,
  FiCode,
} from "react-icons/fi";

const FEATURES = [
  {
    icon: <FiLayers className="w-6 h-6 text-amber-400" />,
    tag: "LangGraph Architecture",
    title: "Tri-Agent Orchestration",
    desc: "Dedicated Architect, Planner, and Coder agents coordinate asynchronously through a LangGraph state machine, validating dependencies before a single line of code is written.",
    badge: "Multi-Agent Swarm",
    glow: "hover:border-amber-500/40 hover:shadow-amber-500/10",
  },
  {
    icon: <FiCpu className="w-6 h-6 text-orange-400" />,
    tag: "RAG & Vector Memory",
    title: "Persistent Context Graph",
    desc: "Never suffer from LLM amnesia. StackPilot indexes your repository, dependencies, schemas, and historical edits in a persistent vector and graph store.",
    badge: "Zero Amnesia",
    glow: "hover:border-orange-500/40 hover:shadow-orange-500/10",
  },
  {
    icon: <FiTerminal className="w-6 h-6 text-emerald-400" />,
    tag: "Real Execution",
    title: "In-Browser Terminal & Docker",
    desc: "Powered by xterm.js and WebSockets, StackPilot spins up real containerized environments to run npm scripts, install packages, and execute unit tests in real time.",
    badge: "Live Socket / xterm",
    glow: "hover:border-emerald-500/40 hover:shadow-emerald-500/10",
  },
  {
    icon: <FiShield className="w-6 h-6 text-purple-400" />,
    tag: "Self-Correction",
    title: "Automated Self-Healing Loop",
    desc: "When a build fails or tests error out, StackPilot intercepts stderr logs, traces the error back to the AST, and repairs the broken files recursively without human intervention.",
    badge: "Recursive Healing",
    glow: "hover:border-purple-500/40 hover:shadow-purple-500/10",
  },
  {
    icon: <FiCode className="w-6 h-6 text-cyan-400" />,
    tag: "Monaco Studio",
    title: "Dual Preview & In-Browser IDE",
    desc: "Inspect, edit, and modify generated code directly inside a Monaco-powered IDE, complete with multi-tab support, syntax highlighting, and instantaneous live iframe updates.",
    badge: "Instant Hot-Reload",
    glow: "hover:border-cyan-500/40 hover:shadow-cyan-500/10",
  },
  {
    icon: <FiGitBranch className="w-6 h-6 text-pink-400" />,
    tag: "Production Ready",
    title: "Git & Deployment Pipelines",
    desc: "Export clean Git commits, production Dockerfiles, and cloud deployment configs with zero lock-in. Your code is 100% standard TypeScript, React, and Node.js.",
    badge: "Zero Vendor Lock-in",
    glow: "hover:border-pink-500/40 hover:shadow-pink-500/10",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative bg-[#0a0a0a] border-t border-white/[0.06]">
      {/* Background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <FiZap className="w-3.5 h-3.5 text-amber-400" />
            Core Capabilities
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Engineered for Real-World, Production-Grade Software
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            StackPilot isn’t another conversational autocomplete. It is an autonomous software engineering platform capable of reasoning over complex architectures.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, index) => (
            <div
              key={index}
              className={`p-6 sm:p-7 rounded-2xl bg-[#0f0f15]/80 border border-white/[0.08] backdrop-blur-xl transition-all duration-300 shadow-xl ${feat.glow} flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] group-hover:scale-110 transition-transform duration-300">
                    {feat.icon}
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-white/[0.04] text-zinc-300 border border-white/[0.06]">
                    {feat.badge}
                  </span>
                </div>

                <div className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-1">
                  {feat.tag}
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-amber-200 transition-colors">
                  {feat.title}
                </h3>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center text-xs font-semibold text-zinc-400 group-hover:text-amber-300 transition-colors">
                <span>Explore technical spec</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
