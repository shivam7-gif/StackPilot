"use client";

import { useState } from "react";

interface ChatPanelProps {
  width: number;
}

export default function ChatPanel({ width }: ChatPanelProps) {
  const [activeAiTab, setActiveAiTab] = useState<"karma" | "linecoder">("karma");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ text: string; role: "user" | "ai" }[]>([]);

  const handleSend = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { text: trimmed, role: "user" }]);
    setChatInput("");
  };

  return (
    <div
      className="h-full bg-[#181818] shrink-0 overflow-hidden flex flex-col border-l border-[#2b2b2b]"
      style={{ width }}
    >
      <div className="flex items-center border-b border-[#2b2b2b] h-[35px] shrink-0 px-1">
        {(
          [
            { id: "karma" as const, label: "Karma" },
            { id: "linecoder" as const, label: "Line Coder" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveAiTab(id)}
            className={`px-3 h-full text-[11px] border-b-2 transition-colors ${
              activeAiTab === id
                ? "text-[#e0e0e0] border-[#007fd4]"
                : "text-[#858585] border-transparent hover:text-[#bbb]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4 pb-3 border-b border-[#2b2b2b] shrink-0">
        <div className="flex items-center gap-2">
          
          <div>
            <h2 className="text-[13px] font-semibold text-[#e0e0e0]">Karma v0.1</h2>
            <p className="text-[10px] text-[#666]">Full-stack AI agent</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 ide-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
            <div className="w-10 h-10 rounded-xl bg-[#252525] border border-[#333] flex items-center justify-center text-[#666]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="text-[11px] text-[#666] text-center leading-relaxed">
              Ask Karma to build, refactor, or explain code in your project.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 ${msg.role === "user" ? "" : "flex-row-reverse"}`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  msg.role === "user"
                    ? "bg-[#333] text-[#aaa]"
                    : "bg-gradient-to-br from-[#007fd4] to-[#6366f1] text-white"
                }`}
              >
                {msg.role === "user" ? "U" : "K"}
              </div>
              <p className="text-[12px] text-[#ccc] leading-relaxed bg-[#252525] rounded-lg px-3 py-2 max-w-[85%]">
                {msg.text}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-[#2b2b2b] shrink-0">
        <div className="flex items-end gap-2 bg-[#252525] border border-[#333] rounded-lg p-2 focus-within:border-[#007fd4]/50 transition-colors">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Karma…"
            rows={1}
            className="flex-1 bg-transparent text-[12px] text-[#ccc] placeholder-[#555] outline-none resize-none min-h-[24px] max-h-[120px]"
          />
          <button
            onClick={handleSend}
            disabled={!chatInput.trim()}
            className="p-1.5 rounded-md bg-[#007fd4] hover:bg-[#1177bb] disabled:opacity-30 disabled:hover:bg-[#007fd4] text-white transition-colors shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
