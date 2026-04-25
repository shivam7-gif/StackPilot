"use client";
import { useState } from "react";

interface ChatPanelProps {
  aiWidth: number;
  onDragStart: (e: React.MouseEvent) => void;
}

export default function ChatPanel({ aiWidth, onDragStart }: ChatPanelProps) {
  const [activeAiTab, setActiveAiTab] = useState<"karma" | "linecoder">(
    "karma"
  );
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ text: string }[]>([]);

  const handleSend = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { text: trimmed }]);
    setChatInput("");
  };

  return (
    <>
      {/* Drag handle — AI panel */}
      <div
        onMouseDown={onDragStart}
        className="w-1 h-full cursor-col-resize shrink-0 relative group"
      >
        <div className="absolute inset-0 bg-[#2a2a2a] group-hover:bg-blue-500 transition-colors duration-150" />
      </div>

      {/* ── AI Panel ── */}
      <div
        className="h-full bg-[#1a1a1a] shrink-0 overflow-hidden flex flex-col border-l border-[#2a2a2a]"
        style={{ width: aiWidth }}
      >
        {/* AI panel tabs */}
        <div className="flex items-center border-b border-[#2a2a2a] h-9 shrink-0">
          <button
            onClick={() => setActiveAiTab("karma")}
            className={`px-4 h-full text-xs border-b-2 transition-colors ${
              activeAiTab === "karma"
                ? "text-white border-white"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            Karma v0.1
          </button>
          <button
            onClick={() => setActiveAiTab("linecoder")}
            className={`px-4 h-full text-xs border-b-2 transition-colors ${
              activeAiTab === "linecoder"
                ? "text-white border-white"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            Line Coder
          </button>
        </div>

        {/* Karma header */}
        <div className="px-4 pt-4 pb-2 border-b border-[#2a2a2a] shrink-0">
          <h2 className="text-2xl font-bold text-gray-100 tracking-tight">
            karma 0.1
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            AI Full-Stack Agent · Code Generation Mode
          </p>
          <div className="mt-2 h-1 w-full bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: "0%" }}
            />
          </div>
        </div>

        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-gray-600 text-center">
                Ask Karma to build something
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded bg-[#2a2a4a] flex items-center justify-center text-[10px] font-bold text-blue-300 shrink-0">
                  U
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  {msg.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Chat input */}
        <div className="p-3 border-t border-[#2a2a2a] flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Karma to build something..."
            className="flex-1 bg-[#111118] border border-[#2a2a3a] rounded-lg px-3 h-9 text-xs text-gray-300 placeholder-gray-600 outline-none focus:border-blue-500/50 transition-colors"
          />
          <button
            onClick={handleSend}
            className="px-4 h-9 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium text-white transition-colors shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
