"use client";

import React, { useState } from "react";
import { Copy, Check, RotateCw, ThumbsUp, ThumbsDown, Terminal } from "lucide-react";
import { ActivityTimeline } from "./ActivityTimeline";
import { EngineeringResultView } from "./EngineeringResultView";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { ActivityStep, EngineeringResult } from "./types";

interface AssistantMessageProps {
  content: string;
  steps?: string[];
  activityStages?: ActivityStep[];
  engineeringResult?: EngineeringResult;
  model?: string;
  isStreaming?: boolean;
  isThinking?: boolean;
  isLatest?: boolean;
  error?: boolean;
  onRegenerate?: () => void;
  onRetry?: () => void;
  onOpenIde?: (projectId?: string) => void;
  onOpenPreview?: () => void;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  content,
  steps = [],
  activityStages = [],
  engineeringResult,
  model,
  isStreaming = false,
  isThinking = false,
  isLatest = false,
  error = false,
  onRegenerate,
  onRetry,
  onOpenIde,
  onOpenPreview,
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="group flex gap-3.5 w-full animate-[fadeIn_150ms_ease_both]">
      {/* Discreet 24px StackPilot orange avatar */}
      <div className="w-6 h-6 rounded-md bg-orange-500/10 text-orange-600 border border-orange-500/20 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 select-none font-mono">
        SP
      </div>

      {/* Message Container */}
      <div className="flex-1 min-w-0">
        {/* Assistant Header Info */}
        <div className="flex items-center gap-2 mb-1.5 select-none">
          <span className="text-xs font-semibold text-neutral-900">StackPilot</span>
          {model && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 text-neutral-600 border border-neutral-200">
              {model}
            </span>
          )}
        </div>

        {/* Inline Activity Lifecycle Timeline (Antigravity-inspired) */}
        {(activityStages.length > 0 || steps.length > 0 || (isStreaming && !content)) && (
          <ActivityTimeline
            stages={activityStages}
            rawSteps={steps}
            isStreaming={isStreaming && !content}
            status={error ? "failed" : isStreaming ? "running" : "completed"}
            error={error}
            onRetry={onRetry}
          />
        )}

        {/* Thinking indicator if waiting for initial stream */}
        {isThinking && !content && (
          <div className="flex items-center gap-2 text-neutral-400 text-xs py-1.5 font-mono select-none">
            <span>Analyzing prompt and context...</span>
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500/60 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500/60 animate-pulse [animation-delay:200ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500/60 animate-pulse [animation-delay:400ms]" />
            </span>
          </div>
        )}

        {/* Error State */}
        {error ? (
          <div className="p-3 rounded-lg border border-red-200 bg-red-50/70 text-xs text-red-900 flex items-center justify-between">
            <span>{content || "Unable to complete request. Please try again."}</span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="font-semibold text-red-700 underline underline-offset-2 hover:text-black cursor-pointer"
              >
                Retry Request
              </button>
            )}
          </div>
        ) : (
          /* Rendered Markdown Response */
          content && <MarkdownRenderer content={content} isStreaming={isStreaming} />
        )}

        {/* Implementation Review & File Changes (Antigravity / Replit inspired) */}
        {engineeringResult && (
          <EngineeringResultView
            result={engineeringResult}
            onOpenIde={onOpenIde}
            onOpenPreview={onOpenPreview}
          />
        )}

        {/* Action Row */}
        {!isStreaming && !isThinking && content && (
          <div
            className={`flex items-center gap-1 mt-2.5 transition-opacity duration-150 ${
              isLatest ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
              aria-label="Copy response"
              title="Copy markdown response"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Regenerate button */}
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="p-1 rounded text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
                aria-label="Regenerate response"
                title="Regenerate"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Thumbs up */}
            <button
              type="button"
              onClick={() => setFeedback(feedback === "up" ? null : "up")}
              className={`p-1 rounded transition cursor-pointer hover:bg-neutral-100 ${
                feedback === "up" ? "text-orange-600" : "text-neutral-400 hover:text-neutral-800"
              }`}
              aria-label="Helpful"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            {/* Thumbs down */}
            <button
              type="button"
              onClick={() => setFeedback(feedback === "down" ? null : "down")}
              className={`p-1 rounded transition cursor-pointer hover:bg-neutral-100 ${
                feedback === "down" ? "text-red-500" : "text-neutral-400 hover:text-neutral-800"
              }`}
              aria-label="Unhelpful"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
