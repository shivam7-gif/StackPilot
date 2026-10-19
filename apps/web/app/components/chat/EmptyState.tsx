"use client";

import React from "react";
import { Sparkles, Terminal, Code2, Cpu, Database, LayoutDashboard } from "lucide-react";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const PROMPT_SUGGESTIONS = [
  {
    icon: <LayoutDashboard className="w-4 h-4 text-orange-600" />,
    title: "Build a modern dashboard",
    prompt: "Build a developer analytics dashboard with Next.js, Tailwind CSS, and chart components",
    category: "Full-Stack UI",
  },
  {
    icon: <Database className="w-4 h-4 text-blue-600" />,
    title: "Create a RESTful API",
    prompt: "Create a RESTful task management API with Express, TypeScript, and PostgreSQL integration",
    category: "Backend API",
  },
  {
    icon: <Terminal className="w-4 h-4 text-emerald-600" />,
    title: "Real-time collaborative app",
    prompt: "Build a real-time collaborative whiteboard with WebSockets, Canvas, and state synchronization",
    category: "Real-time",
  },
  {
    icon: <Cpu className="w-4 h-4 text-neutral-700" />,
    title: "Refactor & add test suites",
    prompt: "Inspect the project structure, refactor domain models, and add comprehensive unit tests",
    category: "Refactoring",
  },
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-[800px] mx-auto w-full text-center select-none animate-[fadeIn_150ms_ease_both]">
      {/* Brand Icon */}
      <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 flex items-center justify-center mb-4">
        <Terminal className="w-5 h-5 stroke-[2.2]" />
      </div>

      {/* Main Heading */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-2">
        What are we building?
      </h1>

      {/* Clean Single-line Explanation */}
      <p className="text-sm text-neutral-500 max-w-lg mb-8 leading-relaxed font-sans">
        StackPilot synthesizes full-stack architectures, generates production code, and configures live workspaces for your team.
      </p>

      {/* 2x2 Grid of developer suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {PROMPT_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            className="group flex flex-col justify-between p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-orange-500/40 hover:bg-orange-50/[0.15] transition-all duration-150 cursor-pointer shadow-2xs text-left"
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-xs font-semibold text-neutral-900 group-hover:text-orange-950 transition">
                  {item.title}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 group-hover:text-orange-600 transition">
                {item.category}
              </span>
            </div>
            <p className="text-[12px] text-neutral-500 group-hover:text-neutral-700 line-clamp-2 leading-relaxed">
              {item.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
