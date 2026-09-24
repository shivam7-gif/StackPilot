"use client";

import {
  FiSend,
  FiGitPullRequest,
  FiCode,
  FiGlobe,
  FiCheckCircle,
  FiTerminal,
} from "react-icons/fi";

const STEPS = [
  {
    step: "01",
    title: "Define Your Vision",
    subtitle: "Architectural Blueprint Formulation",
    desc: "Describe what you want to build in natural language. StackPilot's Architect analyzes technical tradeoffs, selects optimal libraries, and drafts database models.",
    details: ["Schema generation (Prisma/SQL)", "Package dependency graph", "Docker environment provisioning"],
    badge: "Input & Blueprint",
  },
  {
    step: "02",
    title: "LangGraph Orchestration",
    subtitle: "Parallel Task Decomposition",
    desc: "The Planner converts your project specification into a Directed Acyclic Graph (DAG) of parallel execution steps, scheduling frontend and backend milestones simultaneously.",
    details: ["Parallel task scheduling", "Monorepo topology validation", "Milestone tracking"],
    badge: "DAG Planning",
  },
  {
    step: "03",
    title: "Synthesis & Self-Healing",
    subtitle: "Automated Code Generation & Fixing",
    desc: "Specialized Coder agents synthesize production TypeScript code. If compile errors or lint failures occur, StackPilot intercepts and corrects them autonomously.",
    details: ["Type-safe TypeScript", "Real-time linter error tracing", "Autonomous self-heal loop"],
    badge: "Execution & QA",
  },
  {
    step: "04",
    title: "Live Preview & Git Export",
    subtitle: "Instant Hot-Reload & Deploy",
    desc: "Your application boots in an isolated container sandbox with an in-browser Monaco editor, live terminal output, and full Git repository export.",
    details: ["Instant iframe sandbox preview", "Interactive Monaco editor", "Production Docker & Git push"],
    badge: "Ship & Iterate",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative bg-[#0a0a0a] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Execution Pipeline
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            From Idea to Running Container in 4 Steps
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            How StackPilot’s multi-agent engine converts high-level prompts into deployable production code without hallucinations or shortcuts.
          </p>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className="relative p-6 rounded-2xl bg-[#0f0f16]/90 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between group hover:border-amber-500/40 transition-all duration-300 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-black font-mono text-zinc-700 group-hover:text-amber-400/80 transition-colors">
                    {step.step}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-amber-300 border border-white/[0.08]">
                    {step.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-amber-200 transition-colors">
                  {step.title}
                </h3>
                <div className="text-xs font-medium text-amber-400/90 mb-3 mt-1">
                  {step.subtitle}
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] space-y-2">
                {step.details.map((detail, di) => (
                  <div key={di} className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
