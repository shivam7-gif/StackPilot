"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThreadArt from "./ThreadArt";
import {
  FiArrowRight,
  FiPlay,
  FiTerminal,
  FiCheckCircle,
  FiLayers,
  FiCpu,
  FiCode,
  FiFolder,
  FiFileText,
  FiShield,
  FiZap,
} from "react-icons/fi";

const PROMPT_SUGGESTIONS = [
  "Full-stack SaaS with Stripe billing & Next.js 15",
  "Real-time collaborative whiteboard with WebSockets & Canvas",
  "AI knowledge base with RAG, vector embeddings & FastAPI",
  "High-frequency crypto portfolio tracker with live charts",
];

const AGENT_DEMOS = {
  architect: {
    agent: "Architect Agent",
    badge: "System Design & Schema",
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
    files: [
      { name: "schema.prisma", status: "Validated" },
      { name: "architecture.spec.json", status: "Generated" },
      { name: "docker-compose.yml", status: "Configured" },
    ],
    code: `// StackPilot Architect Engine - Topology Spec
export interface ArchitectureBlueprint {
  project: "saas-subscription-core";
  stack: {
    frontend: "Next.js 15 App Router + Tailwind v4",
    backend: "Node.js 22 + Fastify + tRPC",
    database: "PostgreSQL with pgvector",
    realtime: "Socket.io + Redis Pub/Sub"
  };
  isolation: "Docker Containerized Sandbox";
  security: "Row-Level Security + OAuth2 / JWT";
}`,
  },
  planner: {
    agent: "Planner Agent",
    badge: "DAG Execution Graph",
    color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400",
    files: [
      { name: "execution-plan.dag", status: "Active" },
      { name: "test-matrix.config", status: "Passed" },
      { name: "route-map.ts", status: "Optimized" },
    ],
    code: `// StackPilot Planner Engine - Parallel Execution DAG
const executionPipeline = [
  { step: 1, task: "Scaffold monorepo structure & tsconfig", parallel: true },
  { step: 2, task: "Generate Prisma schema & DB migrations", deps: [1] },
  { step: 3, task: "Synthesize auth endpoints & JWT middleware", deps: [2] },
  { step: 4, task: "Build reactive UI components & Zustand stores", deps: [3] },
  { step: 5, task: "Run automated linter & self-heal errors", deps: [4] }
];
// Status: Step 4/5 in progress... All 18 unit tests passing.`,
  },
  coder: {
    agent: "Coder Agent",
    badge: "Parallel Code Synthesis",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    files: [
      { name: "WorkspaceEditor.tsx", status: "Streaming" },
      { name: "useSocketSync.ts", status: "Compiled" },
      { name: "api/checkout.ts", status: "Hot-Reloaded" },
    ],
    code: `// StackPilot Coder Engine - Component Synthesis
export function RealtimeWorkspace({ projectId }: { projectId: string }) {
  const { session, user } = useAuth();
  const { socket, isConnected } = useSocketSync(projectId);
  const [editorState, setEditorState] = useZustandStore();

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white">
      <MonacoEditor theme="vs-dark" autoSave={true} />
      <TerminalSandbox socket={socket} port={3000} />
      <PreviewIframe liveReload={true} />
    </div>
  );
}`,
  },
};

export default function Hero() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"architect" | "planner" | "coder">("coder");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLaunch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    const targetPrompt = prompt.trim() || PROMPT_SUGGESTIONS[0];
    router.push(`/dashboard?prompt=${encodeURIComponent(targetPrompt)}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden min-h-[92vh] flex flex-col justify-center">
      {/* Background Interactive ThreadArt Canvas */}
      <ThreadArt />

      {/* Radial Glow Gradient Backdrop Mask */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(245,158,11,0.18),rgba(10,10,10,0.85)_75%)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs sm:text-sm font-medium mb-6 backdrop-blur-md shadow-lg shadow-amber-500/10 hover:border-amber-500/40 transition-all cursor-default">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-semibold text-amber-200">Introducing StackPilot Engine v2.0</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-300">Autonomous Multi-Agent Engineering</span>
        </div>

        {/* Hero Main Headline */}
        <h1 className="max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12]">
          The Autonomous Software Engineer That{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 underline decoration-amber-500/30 decoration-wavy underline-offset-8">
            Builds With You
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-base sm:text-lg lg:text-xl text-zinc-300/90 leading-relaxed font-normal">
          StackPilot coordinates specialized AI agents (Architect, Planner, and Coder) with persistent context memory and an in-browser sandbox to turn complex ideas into production-ready full-stack applications.
        </p>

        {/* Interactive Prompt Sandbox Box */}
        <div className="mt-9 w-full max-w-3xl">
          <form
            onSubmit={handleLaunch}
            className="relative flex flex-col sm:flex-row items-center p-2 rounded-2xl bg-[#121218]/90 border border-white/10 shadow-2xl shadow-black/80 backdrop-blur-2xl focus-within:border-amber-500/50 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all group"
          >
            <div className="flex items-center pl-3 pr-2 py-2 text-zinc-400 w-full sm:w-auto">
              <FiZap className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>

            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to build (e.g. AI-powered analytics dashboard with Supabase)..."
              className="w-full bg-transparent px-3 py-3 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
            >
              <span>{isSubmitting ? "Launching..." : "Build with StackPilot"}</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Prompt Suggestion Chips */}
          <div className="mt-3 flex items-center justify-center flex-wrap gap-2 text-xs">
            <span className="text-zinc-500 font-mono flex items-center gap-1">
              <FiZap className="w-3.5 h-3.5 text-amber-400" /> Try:
            </span>
            {PROMPT_SUGGESTIONS.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-amber-500/30 text-zinc-400 hover:text-zinc-200 transition-all text-[11px] sm:text-xs cursor-pointer truncate max-w-[280px] sm:max-w-none"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl w-full">
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
            <FiLayers className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-medium text-zinc-300">LangGraph Agent Swarm</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
            <FiCpu className="w-4 h-4 text-orange-400" />
            <span className="text-xs sm:text-sm font-medium text-zinc-300">Persistent Context Memory</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
            <FiTerminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs sm:text-sm font-medium text-zinc-300">Live Browser Terminal</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
            <FiShield className="w-4 h-4 text-purple-400" />
            <span className="text-xs sm:text-sm font-medium text-zinc-300">Self-Healing Debugger</span>
          </div>
        </div>

        {/* Interactive Multi-Agent IDE Showcase Window */}
        <div className="mt-16 w-full max-w-5xl rounded-2xl bg-[#0e0e14]/90 border border-white/10 shadow-2xl shadow-black/90 overflow-hidden backdrop-blur-xl text-left">
          {/* Top Window Bar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#13131c]/90 border-b border-white/[0.07] gap-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              </div>
              <span className="text-xs font-mono text-zinc-400 ml-2 hidden sm:inline">
                stackpilot-studio // agent-orchestrator.ts
              </span>
            </div>

            {/* Agent Select Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/40 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("architect")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === "architect"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FiLayers className="w-3.5 h-3.5" />
                <span>1. Architect</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("planner")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === "planner"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FiCpu className="w-3.5 h-3.5" />
                <span>2. Planner</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("coder")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === "coder"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FiCode className="w-3.5 h-3.5" />
                <span>3. Coder</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Engine Active
              </span>
            </div>
          </div>

          {/* IDE Body */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[340px]">
            {/* Left File Tree & Status */}
            <div className="md:col-span-4 p-4 border-b md:border-b-0 md:border-r border-white/[0.06] bg-[#0c0c12]/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Agent Blueprint
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-amber-300 font-mono">
                    {AGENT_DEMOS[activeTab].badge}
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {AGENT_DEMOS[activeTab].files.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.04]"
                    >
                      <div className="flex items-center gap-2 text-zinc-200">
                        <FiFileText className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <FiCheckCircle className="w-3 h-3" />
                        {file.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engine State Indicator */}
              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>LangGraph Phase:</span>
                  <span className="text-amber-400 font-semibold">{AGENT_DEMOS[activeTab].agent}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-1.5 rounded-full w-[85%] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Right Code Viewer */}
            <div className="md:col-span-8 p-4 font-mono text-xs overflow-x-auto bg-[#09090e]/90 flex flex-col justify-between">
              <pre className="text-zinc-300 leading-relaxed overflow-x-auto">
                <code>{AGENT_DEMOS[activeTab].code}</code>
              </pre>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-zinc-500 text-[11px]">
                <div className="flex items-center gap-2">
                  <FiTerminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>stdout: STACKPILOT_ENGINE_OK // 0 errors, 0 warnings</span>
                </div>
                <button
                  type="button"
                  onClick={handleLaunch}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  Open in Workspace <FiArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
