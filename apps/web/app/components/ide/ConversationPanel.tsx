"use client";

import { useRef, useState, useEffect } from "react";
import { useThemeStore } from "../../store/useThemeStore";

interface ConversationPanelProps {
  width: number;
}

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  codeBlocks?: { lang: string; code: string }[];
};

type VariableInput = {
  name: string;
  value: string;
  placeholder: string;
};

const DEFAULT_VARIABLES: VariableInput[] = [
  { name: "project_context", value: "", placeholder: "Next.js full-stack app with TypeScript" },
  { name: "language", value: "", placeholder: "TypeScript" },
  { name: "framework", value: "", placeholder: "Next.js 15 with App Router" },
];

const AI_RESPONSES = [
  "I'll analyze your request and provide a complete implementation with best practices.",
  "Here's a production-ready solution for your StackPilot project. I've included error handling and TypeScript types.",
  "Great question! Let me break this down step by step with a clean implementation.",
  "I've reviewed the context and here's my recommended approach with full code.",
];

function CodeBlock({ lang, code, isLight }: { lang: string; code: string; isLight: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden my-2"
      style={{
        background: isLight ? "#f8fafc" : "#0d1117",
        border: `1px solid ${isLight ? "#e2e8f0" : "#30363d"}`,
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: `1px solid ${isLight ? "#e2e8f0" : "#21262d"}` }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: isLight ? "#94a3b8" : "#484f58" }}
        >
          {lang}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-[10px] font-medium transition-colors"
          style={{ color: isLight ? "#64748b" : "#8b949e" }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="px-4 py-3 text-[11.5px] leading-relaxed overflow-x-auto"
        style={{
          color: isLight ? "#1e293b" : "#e6edf3",
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MessageBubble({ msg, isLight }: { msg: Message; isLight: boolean }) {
  const isUser = msg.role === "user";
  const userBubbleBg = isLight ? "#111827" : "#1f2937";
  const aiBubbleBg = isLight ? "#f3f4f6" : "#161616";
  const aiBubbleBorder = isLight ? "#e5e7eb" : "#1f1f1f";
  const aiText = isLight ? "#374151" : "#d1d5db";

  return (
    <div className={`flex gap-3 animate-fade-in-up ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
        style={{
          background: isUser
            ? (isLight ? "#111827" : "#1f2937")
            : (isLight ? "#f0fdf4" : "#052e16"),
          color: isUser
            ? "#ffffff"
            : (isLight ? "#16a34a" : "#4ade80"),
          border: isUser ? "none" : `1px solid ${isLight ? "#bbf7d0" : "#166534"}`,
        }}
      >
        {isUser ? "U" : "AI"}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1 max-w-[82%] ${isUser ? "items-end" : "items-start"}`}>
        {msg.content && (
          <div
            className="px-3.5 py-2.5 text-[12.5px] leading-relaxed"
            style={{
              background: isUser ? userBubbleBg : aiBubbleBg,
              color: isUser ? "#f9fafb" : aiText,
              border: isUser ? "none" : `1px solid ${aiBubbleBorder}`,
              borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            }}
          >
            {msg.content}
          </div>
        )}
        {msg.codeBlocks?.map((cb, i) => (
          <CodeBlock key={i} lang={cb.lang} code={cb.code} isLight={isLight} />
        ))}
        <span
          className="text-[10px] px-1"
          style={{ color: isLight ? "#9ca3af" : "#4b5563" }}
        >
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator({ isLight }: { isLight: boolean }) {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
        style={{
          background: isLight ? "#f0fdf4" : "#052e16",
          color: isLight ? "#16a34a" : "#4ade80",
          border: `1px solid ${isLight ? "#bbf7d0" : "#166534"}`,
        }}
      >
        AI
      </div>
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
        style={{
          background: isLight ? "#f3f4f6" : "#161616",
          border: `1px solid ${isLight ? "#e5e7eb" : "#1f1f1f"}`,
        }}
      >
        <span className="typing-dot" style={{ color: isLight ? "#6b7280" : "#4b5563" }} />
        <span className="typing-dot" style={{ color: isLight ? "#6b7280" : "#4b5563" }} />
        <span className="typing-dot" style={{ color: isLight ? "#6b7280" : "#4b5563" }} />
      </div>
    </div>
  );
}

export default function ConversationPanel({ width }: ConversationPanelProps) {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const [variables, setVariables] = useState<VariableInput[]>(DEFAULT_VARIABLES);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const bg = isLight ? "#fafafa" : "#0a0a0a";
  const border = isLight ? "#e5e7eb" : "#1a1a1a";
  const textMuted = isLight ? "#6b7280" : "#6b7280";
  const textPrimary = isLight ? "#111827" : "#f9fafb";
  const textSecondary = isLight ? "#374151" : "#d1d5db";
  const inputBg = isLight ? "#ffffff" : "#111111";
  const inputBorder = isLight ? "#e5e7eb" : "#262626";
  const varLabelColor = isLight ? "#374151" : "#9ca3af";
  const varInputBg = isLight ? "#ffffff" : "#0f0f0f";
  const varInputBorder = isLight ? "#e5e7eb" : "#1f1f1f";
  const sendBg = isLight ? "#111827" : "#f9fafb";
  const sendColor = isLight ? "#ffffff" : "#111827";

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
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
        timestamp: new Date(),
        codeBlocks:
          trimmed.toLowerCase().includes("code") ||
          trimmed.toLowerCase().includes("example") ||
          trimmed.toLowerCase().includes("function")
            ? [
                {
                  lang: "typescript",
                  code: `// StackPilot AI generated code\nexport async function handler(req: Request) {\n  try {\n    const data = await req.json();\n    return Response.json({ success: true, data });\n  } catch (error) {\n    return Response.json({ error: "Internal error" }, { status: 500 });\n  }\n}`,
                },
              ]
            : undefined,
      };
      setMessages((p) => [...p, aiMsg]);
    }, 1000 + Math.random() * 800);
  };

  return (
    <div
      className="h-full flex flex-col flex-1 min-w-0 overflow-hidden"
      style={{ background: bg, width }}
    >
      {/* ── Empty state / Messages ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-5"
        style={{ scrollbarWidth: "thin", scrollbarColor: `${isLight ? "#d1d5db" : "#2a2a2a"} transparent` }}
      >
        {messages.length === 0 && !isTyping ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: isLight ? "#f3f4f6" : "#161616",
                border: `1px solid ${isLight ? "#e5e7eb" : "#1f1f1f"}`,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={textMuted}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <p
              className="text-[13px] font-medium text-center"
              style={{ color: textMuted }}
            >
              Your conversation will appear here
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} isLight={isLight} />
            ))}
            {isTyping && <TypingIndicator isLight={isLight} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ── Variable Inputs ── */}
      <div
        className="px-4 pt-3 pb-2 shrink-0 space-y-2"
        style={{ borderTop: `1px solid ${border}` }}
      >
        {variables.map((v) => (
          <div key={v.name} className="flex items-center gap-3">
            <span
              className="text-[11px] font-mono font-medium w-32 shrink-0 text-right"
              style={{ color: varLabelColor }}
            >
              {v.name}
            </span>
            <span className="text-[11px]" style={{ color: isLight ? "#d1d5db" : "#374151" }}>
              :
            </span>
            <input
              type="text"
              value={v.value}
              placeholder={v.placeholder}
              onChange={(e) => {
                const val = e.target.value;
                setVariables((prev) =>
                  prev.map((x) => (x.name === v.name ? { ...x, value: val } : x))
                );
              }}
              className="flex-1 px-2.5 py-1.5 rounded-lg text-[12px] outline-none transition-colors"
              style={{
                background: varInputBg,
                border: `1px solid ${varInputBorder}`,
                color: textSecondary,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = isLight ? "#6b7280" : "#4b5563";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = varInputBorder;
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Chat Input ── */}
      <div className="px-4 pb-4 pt-2 shrink-0">
        <div
          className="rounded-xl overflow-hidden transition-all"
          style={{
            background: inputBg,
            border: `1px solid ${inputBorder}`,
          }}
          onFocusCapture={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = isLight ? "#6b7280" : "#4b5563";
            (e.currentTarget as HTMLDivElement).style.boxShadow = isLight
              ? "0 0 0 3px rgba(107,114,128,0.1)"
              : "0 0 0 3px rgba(75,85,99,0.2)";
          }}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              (e.currentTarget as HTMLDivElement).style.borderColor = inputBorder;
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }
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
            placeholder="Chat with your prompt…"
            rows={1}
            className="w-full px-4 pt-3 pb-2 text-[13px] outline-none resize-none"
            style={{
              background: "transparent",
              color: textSecondary,
              minHeight: 44,
            }}
          />

          {/* Input toolbar */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <div className="flex items-center gap-1.5">
              {/* Attach */}
              <button
                className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
                style={{ color: textMuted }}
                onMouseEnter={(e) => { e.currentTarget.style.background = isLight ? "#f3f4f6" : "#1f1f1f"; e.currentTarget.style.color = textPrimary; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = textMuted; }}
                title="Attach file"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
              </button>

              {/* Auto-clear */}
              <button
                onClick={() => setMessages([])}
                className="flex items-center gap-1.5 px-2.5 h-[26px] rounded-md text-[11px] font-medium transition-colors"
                style={{ color: textMuted }}
                onMouseEnter={(e) => { e.currentTarget.style.background = isLight ? "#f3f4f6" : "#1f1f1f"; e.currentTarget.style.color = textPrimary; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = textMuted; }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                </svg>
                Auto-clear
              </button>
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm transition-all disabled:opacity-30"
              style={{
                background: input.trim() ? sendBg : (isLight ? "#e5e7eb" : "#1f1f1f"),
                color: input.trim() ? sendColor : textMuted,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5V19M5 12l7-7 7 7" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
