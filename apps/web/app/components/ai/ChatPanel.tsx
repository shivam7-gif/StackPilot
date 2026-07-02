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
  { id: "karma", label: "AI Chat" },
  { id: "linecoder", label: "Line Coder" },
];

const SUGGESTIONS = [
  "Explain this code",
  "Fix the bug",
  "Add error handling",
  "Write unit tests",
  "Refactor this",
];

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="chat-code-block relative group/code">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--ide-text-dim)" }}>
          {lang || "code"}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-[10px] font-medium transition-colors"
          style={{ color: "var(--ide-text-dim)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ide-text-muted)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ide-text-dim)"; }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto text-[11.5px] leading-relaxed whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2.5 animate-fade-in-up ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
        style={{
          background: isUser ? "var(--ide-hover-strong)" : "var(--ide-accent)",
          color: isUser ? "var(--ide-text-muted)" : "#fff",
        }}
      >
        {isUser ? "U" : "AI"}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1.5 max-w-[86%] ${isUser ? "items-end" : "items-start"}`}>
        {msg.text && (
          <div
            className="text-[12px] leading-relaxed px-3 py-2"
            style={{
              background: isUser ? "var(--ide-chat-user-bg)" : "var(--ide-chat-ai-bg)",
              color: isUser ? "var(--ide-chat-user-text)" : "var(--ide-chat-ai-text)",
              border: isUser ? "none" : "1px solid var(--ide-border)",
              borderRadius: isUser ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
            }}
          >
            {msg.text}
          </div>
        )}
        {msg.codeBlocks?.map((cb, i) => (
          <CodeBlock key={i} lang={cb.lang} code={cb.code} />
        ))}
        <span className="text-[10px] px-0.5" style={{ color: "var(--ide-text-dim)" }}>
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
        style={{ background: "var(--ide-accent)" }}
      >
        <span className="text-[10px] font-bold text-white">AI</span>
      </div>
      <div
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
        style={{ background: "var(--ide-chat-ai-bg)", border: "1px solid var(--ide-border)" }}
      >
        <span className="typing-dot" style={{ color: "var(--ide-text-muted)" }} />
        <span className="typing-dot" style={{ color: "var(--ide-text-muted)" }} />
        <span className="typing-dot" style={{ color: "var(--ide-text-muted)" }} />
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

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm your AI coding assistant. I'll help you build, refactor, and debug your code with precision.",
        role: "ai",
        timestamp: new Date(),
        codeBlocks:
          trimmed.toLowerCase().includes("code") || trimmed.toLowerCase().includes("example")
            ? [
              {
                lang: "typescript",
                code: `// Example generated by AI\nconst greet = (name: string) => {\n  return \`Hello, \${name}!\`;\n};\n\nconsole.log(greet("World"));`,
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
        background: "var(--ide-sidebar-bg)",
        borderLeft: "1px solid var(--ide-border)",
      }}
    >
      {/* ── Tab bar ── */}
      <div
        className="flex items-center shrink-0 px-1"
        style={{ height: 36, borderBottom: "1px solid var(--ide-border)" }}
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="px-3 h-full text-[11.5px] font-medium transition-all relative"
            style={{
              color: activeTab === id ? "var(--ide-text-bright)" : "var(--ide-text-muted)",
            }}
          >
            {label}
            {/* Active indicator */}
            {activeTab === id && (
              <span
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-sm"
                style={{ background: "var(--ide-accent)" }}
              />
            )}
          </button>
        ))}

        <div className="flex-1" />

        {/* New chat */}
        <button
          title="New conversation"
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
          style={{ color: "var(--ide-text-dim)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--ide-hover)";
            e.currentTarget.style.color = "var(--ide-text-muted)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--ide-text-dim)";
          }}
          onClick={() => setMessages([])}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* ── Header ── */}
      <div
        className="px-3 py-2.5 shrink-0"
        style={{ borderBottom: "1px solid var(--ide-border)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">

            <div>
              <span className="text-[13px] font-semibold block" style={{ color: "var(--ide-text-bright)" }}>
                Karma Assistant
              </span>
              <span className="text-[10px]" style={{ color: "var(--ide-text-dim)" }}>
                AI Coding Agent
              </span>
            </div>
          </div>

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
              className="text-[11px] transition-colors"
              style={{ color: "var(--ide-text-dim)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ide-text-dim)"; }}
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
            <div className="text-center">
              <p className="text-[12.5px] font-semibold" style={{ color: "var(--ide-text-muted)" }}>
                Ask AI anything
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--ide-text-dim)" }}>
                Build, refactor, or explain code
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-col gap-1.5 w-full px-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-left px-3 py-2 rounded-lg text-[11.5px] transition-all w-full"
                  style={{
                    background: "var(--ide-suggestion-bg)",
                    border: "1px solid var(--ide-suggestion-border)",
                    color: "var(--ide-text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--ide-suggestion-hover)";
                    e.currentTarget.style.borderColor = "var(--ide-accent)";
                    e.currentTarget.style.color = "var(--ide-text)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--ide-suggestion-bg)";
                    e.currentTarget.style.borderColor = "var(--ide-suggestion-border)";
                    e.currentTarget.style.color = "var(--ide-text-muted)";
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
        style={{ borderTop: "1px solid var(--ide-border)" }}
      >
        <div
          className="rounded-xl overflow-hidden transition-all"
          style={{
            background: "var(--ide-input-bg)",
            border: "1px solid var(--ide-input-border)",
          }}
          onFocusCapture={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--ide-accent)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px var(--ide-accent-dim)";
          }}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--ide-input-border)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask AI… (Enter to send)"
            rows={1}
            className="w-full px-3 pt-2.5 pb-1 text-[12px] outline-none resize-none"
            style={{ background: "transparent", color: "var(--ide-text)" }}
          />

          {/* Toolbar */}
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-1">
              {/* @ context */}
              <button
                title="Add context file"
                onClick={() => setContextFile("currentFile")}
                className="flex items-center gap-1 px-2 h-[22px] rounded-md text-[11px] transition-all"
                style={{ color: "var(--ide-text-dim)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--ide-hover)";
                  e.currentTarget.style.color = "var(--ide-text-muted)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--ide-text-dim)";
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
                className="w-[22px] h-[22px] flex items-center justify-center rounded-md transition-all"
                style={{ color: "var(--ide-text-dim)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--ide-hover)";
                  e.currentTarget.style.color = "var(--ide-text-muted)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--ide-text-dim)";
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
              className="flex items-center gap-1.5 px-2.5 h-[26px] rounded-lg text-[11px] font-semibold text-white transition-all disabled:opacity-30"
              style={{
                background: input.trim() ? "var(--ide-accent)" : "var(--ide-hover-strong)",
                color: input.trim() ? "#fff" : "var(--ide-text-dim)",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
              Send
            </button>
          </div>
        </div>
        <p className="text-[9px] text-center mt-1.5" style={{ color: "var(--ide-text-dim)" }}>
          AI may make mistakes. Review important outputs.
        </p>
      </div>
    </div>
  );
}
