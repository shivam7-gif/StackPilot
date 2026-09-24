"use client";

import {
  FiServer,
  FiTerminal,
  FiDatabase,
  FiCpu,
  FiLock,
  FiBox,
} from "react-icons/fi";

const ARCH_LAYERS = [
  {
    icon: <FiTerminal className="w-5 h-5 text-amber-400" />,
    name: "Client Presentation Layer",
    tech: "Next.js 15 • Monaco Editor • xterm.js",
    desc: "Interactive in-browser developer studio with multi-file Monaco tabs, real-time xterm WebSocket streaming, and instant responsive iframe live-reload.",
  },
  {
    icon: <FiCpu className="w-5 h-5 text-orange-400" />,
    name: "LangGraph Multi-Agent Engine",
    tech: "LangGraph • LangSmith Tracing • Multi-Agent State Machine",
    desc: "Autonomous supervisor routing requests across Architect, Planner, and Coder with cyclical self-healing edges and deterministic checkpoints.",
  },
  {
    icon: <FiDatabase className="w-5 h-5 text-purple-400" />,
    name: "Persistent Knowledge & Context Graph",
    tech: "Vector Embeddings • AST Graph • RAG Memory",
    desc: "Maintains real-time project AST, schema models, component dependencies, and developer preferences across the entire application lifecycle.",
  },
  {
    icon: <FiBox className="w-5 h-5 text-emerald-400" />,
    name: "Isolated Execution Sandbox",
    tech: "Docker Containers • Node.js / Python Runtime • Hot Dev Server",
    desc: "Ephemeral, secure runtime environment where npm dependencies are installed, dev servers are booted, and automated verification suites run.",
  },
];

export default function Architecture() {
  return (
    <section id="architecture" className="py-24 relative bg-[#0d0d12] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <FiServer className="w-3.5 h-3.5 text-cyan-400" />
            System Architecture
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Built from the Ground Up for Autonomous Execution
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            A resilient microservices-based architecture designed for high throughput, safe execution sandboxing, and real-time collaboration.
          </p>
        </div>

        {/* Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {ARCH_LAYERS.map((layer, index) => (
            <div
              key={index}
              className="p-7 rounded-2xl bg-[#111119]/80 border border-white/[0.08] backdrop-blur-xl hover:border-amber-500/30 transition-all duration-300 shadow-xl group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] group-hover:scale-105 transition-transform">
                  {layer.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-amber-200 transition-colors">
                    {layer.name}
                  </h3>
                  <span className="text-xs font-mono text-amber-400/90 font-medium">
                    {layer.tech}
                  </span>
                </div>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed">
                {layer.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
