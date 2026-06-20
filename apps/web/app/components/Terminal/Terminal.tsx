"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TerminalTab = "terminal" | "problems" | "output" | "ports";

const TABS: { id: TerminalTab; label: string }[] = [
  { id: "terminal", label: "Terminal" },
  { id: "problems", label: "Problems" },
  { id: "output", label: "Output" },
  { id: "ports", label: "Ports" },
];

interface TerminalProps {
  height: number;
  onResizeStart: (e: React.MouseEvent) => void;
}

export default function Terminal({ height, onResizeStart }: TerminalProps) {
  const [activeTab, setActiveTab] = useState<TerminalTab>("terminal");
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLines]);

  const handleCommand = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const cmd = inputValue.trim();
        if (!cmd) return;
        setTerminalLines((prev) => [
          ...prev,
          `$ ${cmd}`,
          `bash: ${cmd}: command not found`,
        ]);
        setInputValue("");
      }
    },
    [inputValue]
  );

  if (collapsed) {
    return (
      <div
        className="flex items-center px-3 gap-2 shrink-0 cursor-pointer select-none"
        style={{
          height: 28,
          background: "#1e1e1e",
          borderTop: "1px solid #2b2b2b",
        }}
        onClick={() => setCollapsed(false)}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="#858585">
          <path d="M4 10l4-4 4 4H4z" />
        </svg>
        <span className="text-[11px] text-[#858585]">Terminal</span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col shrink-0"
      style={{
        height,
        background: "#1e1e1e",
        borderTop: "1px solid #2b2b2b",
      }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={onResizeStart}
        className="resize-handle-h w-full shrink-0"
        style={{ height: 4 }}
      />

      {/* Tab bar */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ height: 35, borderBottom: "1px solid #2b2b2b" }}
      >
        <div className="flex items-center h-full">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="px-3 h-full text-[11px] transition-colors relative"
              style={{
                color: activeTab === id ? "#e0e0e0" : "#858585",
                borderBottom:
                  activeTab === id ? "2px solid #e0e0e0" : "2px solid transparent",
              }}
            >
              {label}
              {id === "problems" && (
                <span
                  className="ml-1.5 px-1 rounded-full text-[9px]"
                  style={{ background: "#333", color: "#666" }}
                >
                  0
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-0.5 pr-2">
          <button
            title="New terminal"
            className="w-7 h-7 flex items-center justify-center rounded text-[#858585] hover:text-[#ccc] hover:bg-[#2a2d2e] transition-colors"
            onClick={() => setTerminalLines([])}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            title="Split terminal"
            className="w-7 h-7 flex items-center justify-center rounded text-[#858585] hover:text-[#ccc] hover:bg-[#2a2d2e] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="12" y1="3" x2="12" y2="21" />
            </svg>
          </button>
          <div className="w-px h-4 mx-1" style={{ background: "#333" }} />
          <button
            title="Minimize panel"
            className="w-7 h-7 flex items-center justify-center rounded text-[#858585] hover:text-[#ccc] hover:bg-[#2a2d2e] transition-colors"
            onClick={() => setCollapsed(true)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 15l-7 7-7-7" />
            </svg>
          </button>
          <button
            title="Maximize panel"
            className="w-7 h-7 flex items-center justify-center rounded text-[#858585] hover:text-[#ccc] hover:bg-[#2a2d2e] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 min-h-0 overflow-y-auto ide-scrollbar px-3 py-2 font-mono text-[12px]"
        onClick={() => inputRef.current?.focus()}
        style={{ cursor: "text" }}
      >
        {activeTab === "terminal" && (
          <div className="space-y-0.5">
            {/* Welcome line */}
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: "#4ec9b0" }}>stackpilot</span>
              <span style={{ color: "#666" }}>on</span>
              <span style={{ color: "#569cd6" }}>⎇ main</span>
              <span style={{ color: "#666" }}>›</span>
            </div>

            {/* Output lines */}
            {terminalLines.map((line, i) => (
              <div
                key={i}
                style={{
                  color: line.startsWith("$") ? "#cccccc" : "#f48771",
                }}
              >
                {line}
              </div>
            ))}

            {/* Input row */}
            <div className="flex items-center gap-2">
              <span style={{ color: "#4ec9b0" }}>❯</span>
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleCommand}
                className="flex-1 bg-transparent outline-none text-[12px] font-mono"
                style={{ color: "#cccccc", caretColor: "#cccccc" }}
                autoFocus
                spellCheck={false}
              />
            </div>
            <div ref={bottomRef} />
          </div>
        )}

        {activeTab === "problems" && (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-[11px] text-[#555]">No problems detected.</p>
          </div>
        )}

        {activeTab === "output" && (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <p className="text-[11px] text-[#555]">No output yet.</p>
          </div>
        )}

        {activeTab === "ports" && (
          <div className="py-2">
            <div
              className="flex items-center gap-4 px-2 py-1.5 rounded text-[11px]"
              style={{ background: "#252525" }}
            >
              <span style={{ color: "#858585" }}>Port</span>
              <span style={{ color: "#858585" }}>Address</span>
              <span style={{ color: "#858585" }}>Process</span>
              <span style={{ color: "#858585" }}>Origin</span>
            </div>
            {[
              { port: 3000, addr: "localhost:3000", proc: "next", label: "Web" },
              { port: 5000, addr: "localhost:5000", proc: "node", label: "API" },
            ].map((p) => (
              <div
                key={p.port}
                className="flex items-center gap-4 px-2 py-1.5 text-[11px] rounded hover:bg-[#252525] transition-colors"
              >
                <span style={{ color: "#cccccc" }}>{p.port}</span>
                <span style={{ color: "#4fc1ff" }}>{p.addr}</span>
                <span style={{ color: "#858585" }}>{p.proc}</span>
                <span
                  className="px-1.5 py-0.5 rounded text-[9px]"
                  style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
                >
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
