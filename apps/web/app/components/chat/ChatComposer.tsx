"use client";

import React, { useRef, useEffect } from "react";
import { ArrowUp, Square, Sparkles, ChevronDown } from "lucide-react";
import GlideSelect from "@/app/dashboard/GlideSelect";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  modelName?: string;
  models?: { id: string; label: string; tag?: string }[];
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
  projectName?: string;
  onOpenModelSelect?: () => void;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
  placeholder = "Describe what you want to build or change...",
  modelName = "Auto (Free Router)",
  models,
  selectedModelId,
  onModelChange,
  projectName,
  onOpenModelSelect,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea smoothly up to ~180px
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.max(44, Math.min(el.scrollHeight, 180));
    el.style.height = `${nextHeight}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && value.trim() && !disabled) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full bg-white border-t border-neutral-200/80 px-4 sm:px-6 py-3 select-none">
      <div className="max-w-[840px] mx-auto w-full">
        {/* IDE-Grade Composer Box */}
        <div className="rounded-xl border border-neutral-300 bg-white hover:border-[#5227FF] focus-within:border-[#5227FF] focus-within:ring-2 focus-within:ring-[#5227FF]/15 transition-all shadow-2xs">
          {/* Multi-line Text Input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent text-[14px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 px-3.5 pt-3 pb-1.5 outline-none resize-none font-sans overflow-y-auto"
          />

          {/* Secondary Controls Toolbar */}
          <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-neutral-100 relative">
            {/* Left: Model & Workspace Context Pills */}
            <div className="flex items-center gap-2 text-xs relative flex-wrap sm:flex-nowrap">
              {models && models.length > 0 && onModelChange ? (
                <GlideSelect
                  options={models.map((m) => ({
                    value: m.id,
                    label: m.label,
                    tag: m.tag,
                  }))}
                  value={selectedModelId}
                  onChange={(val) => onModelChange(val)}
                  ariaLabel="AI Model Selection"
                  showTags
                  placement="top"
                  align="left"
                  size="sm"
                  radius={8}
                  menuWidth={240}
                  accentColor="#5227FF"
                  surfaceColor="#ffffff"
                  highlightColor="#f4f4f5"
                  textColor="#18181b"
                />
              ) : onOpenModelSelect ? (
                <button
                  type="button"
                  onClick={onOpenModelSelect}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200 transition cursor-pointer"
                  title="Switch AI model"
                >
                  <Sparkles className="w-3 h-3 text-[#5227FF]" />
                  <span className="truncate max-w-[150px]">{modelName}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono text-neutral-600 bg-neutral-100 border border-neutral-200">
                  <Sparkles className="w-3 h-3 text-[#5227FF]" />
                  <span className="truncate max-w-[150px]">{modelName}</span>
                </span>
              )}

              {projectName && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono text-neutral-500 bg-neutral-50 border border-neutral-200">
                  <span>📁</span>
                  <span className="truncate max-w-[130px]">{projectName}</span>
                </span>
              )}
            </div>

            {/* Right: Shortcut Hint & Action Button */}
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-[11px] font-mono text-neutral-400">
                ↵ to send • shift+↵ newline
              </span>

              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-900 text-white hover:bg-black transition cursor-pointer shadow-xs"
                  aria-label="Stop generation"
                  title="Stop generation"
                >
                  <Square className="w-3 h-3 fill-white" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!value.trim() || disabled}
                  onClick={onSend}
                  className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all cursor-pointer shadow-xs ${value.trim() && !disabled
                      ? "bg-[#5227FF] text-white hover:bg-[#431ce6] active:scale-95 shadow-sm shadow-[#5227FF]/25"
                      : "bg-neutral-100 text-neutral-300 cursor-not-allowed border border-neutral-200"
                    }`}
                  aria-label="Send message"
                  title="Send message"
                >
                  <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Minimal Developer Disclaimer */}
        <p className="text-[11px] text-neutral-400 text-center mt-1.5 select-none font-mono">
          StackPilot AI Workspace • verify generated code before deploying to production
        </p>
      </div>
    </div>
  );
};
