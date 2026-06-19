"use client";

import { useState } from "react";

type TerminalTab = "terminal" | "problems" | "output";

const TABS: { id: TerminalTab; label: string }[] = [
  { id: "terminal", label: "Terminal" },
  { id: "problems", label: "Problems" },
  { id: "output", label: "Output" },
];

export default function Terminal() {
  const [activeTab, setActiveTab] = useState<TerminalTab>("terminal");

  return (
    <div className="h-[200px] bg-[#1e1e1e] border-t border-[#2b2b2b] flex flex-col shrink-0">
      <div className="flex items-center justify-between border-b border-[#2b2b2b] h-[35px] px-2 shrink-0">
        <div className="flex items-center h-full">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-3 h-full text-[11px] border-b-2 transition-colors ${
                activeTab === id
                  ? "text-[#e0e0e0] border-[#e0e0e0]"
                  : "text-[#858585] border-transparent hover:text-[#bbb]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 pr-1">
          <button className="p-1 rounded text-[#858585] hover:text-[#ccc] hover:bg-[#333] transition-colors" title="New terminal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button className="p-1 rounded text-[#858585] hover:text-[#ccc] hover:bg-[#333] transition-colors" title="Maximize panel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 p-3 font-mono text-[12px] overflow-y-auto ide-scrollbar">
        {activeTab === "terminal" && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#858585]">
              <span className="text-[#4ec9b0]">stackpilot</span>
              <span className="text-[#666]">on</span>
              <span className="text-[#569cd6]">main</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#4ec9b0]">❯</span>
              <span className="w-[7px] h-[15px] bg-[#cccccc] animate-pulse inline-block" />
            </div>
          </div>
        )}
        {activeTab === "problems" && (
          <p className="text-[#858585] text-[11px]">No problems detected.</p>
        )}
        {activeTab === "output" && (
          <p className="text-[#858585] text-[11px]">No output yet.</p>
        )}
      </div>
    </div>
  );
}
