"use client";

import { useState } from "react";
import { useThemeStore } from "../../store/useThemeStore";
import { ActivePreviewStore } from "../../store/activePreviewStore";

interface PromptEditorPanelProps {
  width: number;
}

const MODELS = [
  "gpt-4.1",
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-3.5-turbo",
  "claude-3-5-sonnet",
  "gemini-2.0-flash",
];

type Variable = { name: string };
type Tool = { name: string };

const DEFAULT_SYSTEM_MESSAGE = `You are StackPilot AI, an expert full-stack software engineer and architect. Your primary task is to help developers build, refactor, debug, and deploy production-grade applications.

For each request, follow this process:
- **Begin with Understanding**: Analyze the codebase context, technology stack, and specific requirements. Identify potential issues and edge cases step by step.
- **Provide Actionable Code**: For each task, write complete, production-ready code with proper error handling, TypeScript types, and best practices.
- **Explain Your Reasoning**: Briefly justify architectural decisions, trade-offs, and any assumptions made.
- **Conclude with Next Steps**: Summarize what was done and suggest logical follow-up improvements.

**Output Format:**
Respond with well-structured markdown containing:
- *"Analysis"*: Brief review of the problem and approach.
- *"Implementation"*: Complete, runnable code with comments.
- *"Summary"*: Concise recap and recommended next actions.`;

export default function PromptEditorPanel({ width }: PromptEditorPanelProps) {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  const bg = isLight ? "#ffffff" : "#111111";
  const border = isLight ? "#e5e7eb" : "#1f1f1f";
  const textPrimary = isLight ? "#111827" : "#f9fafb";
  const textMuted = isLight ? "#6b7280" : "#6b7280";
  const textSecondary = isLight ? "#374151" : "#d1d5db";
  const sectionBg = isLight ? "#f9fafb" : "#161616";
  const inputBg = isLight ? "#ffffff" : "#0f0f0f";
  const chipBg = isLight ? "#f3f4f6" : "#1f2937";
  const chipBorder = isLight ? "#e5e7eb" : "#374151";
  const chipText = isLight ? "#374151" : "#d1d5db";
  const btnBorder = isLight ? "#e5e7eb" : "#2d2d2d";
  const addBtnColor = isLight ? "#6b7280" : "#6b7280";
  const scrollbarColor = isLight ? "#d1d5db" : "#2a2a2a";

  const [selectedModel, setSelectedModel] = useState("gpt-4.1");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [variables, setVariables] = useState<Variable[]>([
    { name: "project_context" },
    { name: "language" },
    { name: "framework" },
  ]);
  const [tools, setTools] = useState<Tool[]>([{ name: "Code Search" }]);
  const [systemMessage, setSystemMessage] = useState(DEFAULT_SYSTEM_MESSAGE);

  const removeVariable = (name: string) => {
    setVariables((v) => v.filter((x) => x.name !== name));
  };

  const addVariable = () => {
    const name = prompt("Variable name:");
    if (name?.trim()) setVariables((v) => [...v, { name: name.trim() }]);
  };

  const removeTool = (name: string) => {
    setTools((t) => t.filter((x) => x.name !== name));
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden shrink-0"
      style={{ width, minWidth: width, background: bg, borderRight: `1px solid ${border}` }}
    >
      {/* ── Model Row ── */}
      <div
        className="flex items-start gap-4 px-5 py-4 shrink-0"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <span
          className="text-[12px] font-medium w-20 shrink-0 mt-1"
          style={{ color: textMuted }}
        >
          Model
        </span>
        <div className="flex-1 min-w-0">
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown((p) => !p)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
              style={{
                background: chipBg,
                border: `1px solid ${chipBorder}`,
                color: textPrimary,
              }}
            >
              {selectedModel}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {showModelDropdown && (
              <div
                className="absolute top-full left-0 mt-1 rounded-lg overflow-hidden z-50"
                style={{
                  background: inputBg,
                  border: `1px solid ${border}`,
                  boxShadow: isLight
                    ? "0 4px 20px rgba(0,0,0,0.08)"
                    : "0 4px 20px rgba(0,0,0,0.5)",
                  minWidth: 180,
                }}
              >
                {MODELS.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedModel(m);
                      setShowModelDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] transition-colors"
                    style={{
                      color: m === selectedModel ? textPrimary : textMuted,
                      background: m === selectedModel ? chipBg : "transparent",
                      fontWeight: m === selectedModel ? 600 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (m !== selectedModel)
                        e.currentTarget.style.background = chipBg;
                    }}
                    onMouseLeave={(e) => {
                      if (m !== selectedModel)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Config hints */}
          <div className="flex flex-wrap gap-x-3 mt-2">
            {[
              { k: "text_format", v: "text" },
              { k: "tool_choice", v: "auto" },
              { k: "temp", v: "1.00" },
              { k: "tokens", v: "2048" },
              { k: "top_p", v: "1.00" },
              { k: "store", v: "true" },
            ].map(({ k, v }) => (
              <span key={k} className="text-[10px]" style={{ color: textMuted }}>
                <span style={{ color: isLight ? "#9ca3af" : "#4b5563" }}>{k}:</span>{" "}
                <span style={{ color: textSecondary }}>{v}</span>
              </span>
            ))}
          </div>
        </div>
        {/* Refresh */}
        <button
          className="mt-1 w-6 h-6 flex items-center justify-center rounded transition-colors shrink-0"
          style={{ color: textMuted }}
          onMouseEnter={(e) => { e.currentTarget.style.color = textPrimary; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = textMuted; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
          </svg>
        </button>
      </div>

      {/* ── Variables Row ── */}
      <div
        className="flex items-start gap-4 px-5 py-3 shrink-0"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <span
          className="text-[12px] font-medium w-20 shrink-0 mt-1"
          style={{ color: textMuted }}
        >
          Variables
        </span>
        <div className="flex flex-wrap gap-2 flex-1">
          {variables.map((v) => (
            <span
              key={v.name}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium"
              style={{
                background: chipBg,
                border: `1px solid ${chipBorder}`,
                color: chipText,
              }}
            >
              {v.name}
              <button
                onClick={() => removeVariable(v.name)}
                className="flex items-center justify-center w-3.5 h-3.5 rounded-full transition-colors"
                style={{ color: textMuted }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = textMuted; }}
              >
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 2l6 6M8 2l-6 6" />
                </svg>
              </button>
            </span>
          ))}
          <button
            onClick={addVariable}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] transition-colors"
            style={{ color: addBtnColor, border: `1.5px dashed ${btnBorder}` }}
            onMouseEnter={(e) => { e.currentTarget.style.color = textPrimary; e.currentTarget.style.borderColor = textMuted; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = addBtnColor; e.currentTarget.style.borderColor = btnBorder; }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add
          </button>
        </div>
      </div>

      {/* ── Tools Row ── */}
      <div
        className="flex items-start gap-4 px-5 py-3 shrink-0"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <span
          className="text-[12px] font-medium w-20 shrink-0 mt-1"
          style={{ color: textMuted }}
        >
          Tools
        </span>
        <div className="flex flex-wrap gap-2 flex-1">
          {tools.map((t) => (
            <span
              key={t.name}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium"
              style={{
                background: isLight ? "#eff6ff" : "#1e3a5f",
                border: `1px solid ${isLight ? "#bfdbfe" : "#1e40af"}`,
                color: isLight ? "#1d4ed8" : "#93c5fd",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              {t.name}
              <button
                onClick={() => removeTool(t.name)}
                className="flex items-center justify-center"
                style={{ color: isLight ? "#60a5fa" : "#93c5fd" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = isLight ? "#60a5fa" : "#93c5fd"; }}
              >
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 2l6 6M8 2l-6 6" />
                </svg>
              </button>
            </span>
          ))}
          <button
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] transition-colors"
            style={{ color: addBtnColor, border: `1.5px dashed ${btnBorder}` }}
            onMouseEnter={(e) => { e.currentTarget.style.color = textPrimary; e.currentTarget.style.borderColor = textMuted; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = addBtnColor; e.currentTarget.style.borderColor = btnBorder; }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add
          </button>
        </div>
      </div>

      {/* ── System Message ── */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-2.5 shrink-0"
          style={{ borderBottom: `1px solid ${border}` }}
        >
          <span className="text-[12px] font-semibold" style={{ color: textSecondary }}>
            System message
          </span>
          <button
            className="flex items-center justify-center w-6 h-6 rounded transition-colors"
            style={{ color: textMuted }}
            title="Expand"
            onMouseEnter={(e) => { e.currentTarget.style.color = textPrimary; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = textMuted; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        </div>

        {/* Textarea */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <textarea
            value={systemMessage}
            onChange={(e) => setSystemMessage(e.target.value)}
            className="w-full h-full px-5 py-4 text-[12.5px] leading-relaxed resize-none outline-none"
            style={{
              background: inputBg,
              color: textSecondary,
              fontFamily: "'Inter', sans-serif",
              scrollbarWidth: "thin",
              scrollbarColor: `${scrollbarColor} transparent`,
            }}
            placeholder="Enter system instructions..."
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
