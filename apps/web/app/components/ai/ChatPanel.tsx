"use client";

import { useRef, useState, useEffect } from "react";

interface ChatPanelProps {
  width: number;
}

type Message = {
  id: string;
  text: string;
  role: "user" | "ai";
  timestamp: Date;
  codeBlocks?: { lang: string; code: string }[];
};

type AiTab = "karma" | "linecoder";

const TABS: { id: AiTab; label: string }[] = [
  { id: "karma", label: "Karma" },
  { id: "linecoder", label: "Line Coder" },
];

const SUGGESTIONS = [
  "Explain this code",
  "Fix the bug",
  "Add error handling",
  "Write unit tests",
  "Refactor to be cleaner",
];

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="chat-code-block relative group/code">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-[#666] uppercase tracking-wider">{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="text-[10px] text-[#666] hover:text-[#ccc] transition-colors opacity-0 group-hover/code:opacity-100"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto text-[11px] leading-relaxed whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex gap-2.5 animate-fade-in-up ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
        style={{
          background: isUser
            ? "#2d2d2d"
            : "linear-gradient(135deg, #007fd4 0%, #6366f1 100%)",
          color: isUser ? "#888" : "white",
          border: isUser ? "1px solid #3c3c3c" : "none",
        }}
      >
        {isUser ? "U" : "K"}
      </div>

      {/* Content */}
      <div
        className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}
      >
        {msg.text && (
          <div
            className="text-[12px] leading-relaxed rounded-xl px-3 py-2"
            style={{
              background: isUser ? "#0e639c" : "#252525",
              color: isUser ? "#e0e0e0" : "#cccccc",
              borderRadius: isUser ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
            }}
          >
            {msg.text}
          </div>
        )}
        {msg.codeBlocks?.map((cb, i) => (
          <CodeBlock key={i} lang={cb.lang} code={cb.code} />
        ))}
        <span className="text-[9px] text-[#444]">
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 animate-fade-in">
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: "linear-gradient(135deg, #007fd4 0%, #6366f1 100%)",
        }}
      >
        <span className="text-[10px] font-bold text-white">K</span>
      </div>
      <div
        className="flex items-center gap-1 px-3 py-2 rounded-xl"
        style={{ background: "#252525" }}
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

export default function ChatPanel({ width }: ChatPanelProps) {
  const [activeTab, setActiveTab] = useState<AiTab>("karma");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [contextFile, setContextFile] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: trimmed,
      role: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Simulate AI typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm Karma, your AI coding assistant. I'll help you build, refactor, and debug your code.",
        role: "ai",
        timestamp: new Date(),
        codeBlocks:
          trimmed.toLowerCase().includes("code") ||
            trimmed.toLowerCase().includes("example")
            ? [
              {
                lang: "typescript",
                code: `// Example code\nconst greet = (name: string) => {\n  return \`Hello, \${name}!\`;\n};\n\nconsole.log(greet("World"));`,
              },
            ]
            : undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1200 + Math.random() * 600);
  };

  return (
    <div
      className="h-full shrink-0 overflow-hidden flex flex-col"
      style={{
        width,
        background: "#181818",
        borderLeft: "1px solid #2b2b2b",
      }}
    >
      {/* ── Tab bar ── */}
      <div
        className="flex items-center shrink-0 px-1"
        style={{ height: 35, borderBottom: "1px solid #2b2b2b" }}
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="px-3 h-full text-[11px] transition-colors relative"
            style={{
              color: activeTab === id ? "#e0e0e0" : "#858585",
              borderBottom: activeTab === id ? "2px solid #007fd4" : "2px solid transparent",
            }}
          >
            {label}
          </button>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* New chat */}
        <button
          title="New conversation"
          className="w-7 h-7 flex items-center justify-center rounded text-[#858585] hover:text-[#ccc] hover:bg-[#252525] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        {/* History */}
        <button
          title="Conversation history"
          className="w-7 h-7 flex items-center justify-center rounded text-[#858585] hover:text-[#ccc] hover:bg-[#252525] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8v4l3 3" strokeLinecap="round" />
            <path d="M3.05 11a9 9 0 1 0 .5-4.5" strokeLinecap="round" />
            <polyline points="3 3 3 7 7 7" />
          </svg>
        </button>
      </div>

      {/* ── Header ── */}
      <div
        className="px-3 py-2.5 shrink-0"
        style={{ borderBottom: "1px solid #2b2b2b" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-[#e0e0e0]">Karma</span>
                {/* <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: "rgba(99, 102, 241, 0.2)", color: "#818cf8" }}
                >
                  v0.1
                </span> */}
                <p className="text-[10px] text-[#555]">Full-stack AI agent</p>
              </div>
            </div>
          </div>
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e66" }}
            title="Connected"
          />
        </div>

        {/* Context file chip */}
        {contextFile && (
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <span className="context-chip">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              @{contextFile}
            </span>
            <button
              onClick={() => setContextFile(null)}
              className="text-[10px] text-[#555] hover:text-[#888]"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 ide-scrollbar">
        {messages.length === 0 && !isTyping ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-4">
            {/* <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(0,127,212,0.15) 0%, rgba(99,102,241,0.15) 100%)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >

            </div> */}
            <div className="text-center">
              <p className="text-[12px] text-[#888] font-medium">Ask Karma anything</p>
              <p className="text-[11px] text-[#555] mt-0.5">
                Build, refactor, or explain code
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-col gap-1.5 w-full px-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-left px-3 py-2 rounded-lg text-[11px] transition-colors w-full"
                  style={{
                    background: "#252525",
                    border: "1px solid #333",
                    color: "#888",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#2d2d2d";
                    (e.currentTarget as HTMLButtonElement).style.color = "#aaa";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#252525";
                    (e.currentTarget as HTMLButtonElement).style.color = "#888";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ── Input ── */}
      <div
        className="p-2.5 shrink-0"
        style={{ borderTop: "1px solid #2b2b2b" }}
      >
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "#252525",
            border: "1px solid #333",
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,127,212,0.5)";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#333";
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Karma… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="w-full px-3 pt-2.5 pb-1 text-[12px] outline-none resize-none"
            style={{
              background: "transparent",
              color: "#ccc",
            }}
          />

          {/* Toolbar */}
          <div
            className="flex items-center justify-between px-2 pb-2"
          >
            <div className="flex items-center gap-1">
              {/* @ context */}
              <button
                title="Add context file"
                onClick={() => setContextFile("currentFile")}
                className="flex items-center gap-1 px-2 h-[22px] rounded text-[11px] transition-colors"
                style={{ color: "#666", background: "transparent" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#333";
                  (e.currentTarget as HTMLButtonElement).style.color = "#aaa";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "#666";
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94" />
                </svg>
                <span>@</span>
              </button>

              {/* Attach */}
              <button
                title="Attach file"
                className="w-[22px] h-[22px] flex items-center justify-center rounded transition-colors"
                style={{ color: "#666" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#333";
                  (e.currentTarget as HTMLButtonElement).style.color = "#aaa";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "#666";
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex items-center gap-1.5 px-2.5 h-[24px] rounded-lg text-[11px] font-medium text-white transition-all disabled:opacity-30"
              style={{
                background: input.trim()
                  ? "linear-gradient(135deg, #007fd4 0%, #6366f1 100%)"
                  : "#333",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
              Send
            </button>
          </div>
        </div>
        <p className="text-[9px] text-[#3a3a3a] text-center mt-1.5">
          Karma may make mistakes. Review important outputs.
        </p>
      </div>
    </div>
  );
}
