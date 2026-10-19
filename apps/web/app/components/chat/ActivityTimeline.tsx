"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  CircleDot,
  Loader2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Terminal,
} from "lucide-react";
import type { ActivityStep, StageStatus } from "./types";

interface ActivityTimelineProps {
  stages?: ActivityStep[];
  rawSteps?: string[];
  isStreaming?: boolean;
  status?: "queued" | "running" | "completed" | "failed" | "cancelled";
  error?: boolean;
  onRetry?: () => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  stages = [],
  rawSteps = [],
  isStreaming = false,
  status = "running",
  error = false,
  onRetry,
}) => {
  const [expanded, setExpanded] = useState<boolean>(isStreaming);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  // If there are no stages and no raw steps, don't show an empty container unless streaming
  if (!stages.length && !rawSteps.length && !isStreaming) {
    return null;
  }

  // Find current running stage or last completed stage
  const activeStage = stages.find((s) => s.status === "running") || stages[stages.length - 1];
  const completedCount = stages.filter((s) => s.status === "completed").length;
  const isFailed = error || status === "failed";
  const isAllComplete = !isStreaming && !isFailed && stages.length > 0 && completedCount === stages.length;

  return (
    <div className="my-3 rounded-lg border border-neutral-200/90 bg-neutral-50/70 p-3 select-none text-xs transition-all">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-2 font-medium text-neutral-800 hover:text-neutral-950 transition cursor-pointer text-left"
          aria-expanded={expanded}
        >
          {isStreaming ? (
            <Loader2 className="w-3.5 h-3.5 text-orange-600 animate-spin shrink-0" />
          ) : isFailed ? (
            <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          )}

          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">
              {isStreaming
                ? activeStage?.label || "Executing workflow..."
                : isFailed
                  ? "Execution stopped"
                  : "Workflow execution completed"}
            </span>
            <span className="text-[11px] font-mono text-neutral-500">
              ({completedCount}/{stages.length || rawSteps.length} stages)
            </span>
          </div>

          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-1" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 ml-1" />
          )}
        </button>

        {rawSteps.length > 0 && (
          <button
            type="button"
            onClick={() => setShowLogs((prev) => !prev)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition cursor-pointer border ${
              showLogs
                ? "bg-neutral-200/80 text-neutral-800 border-neutral-300"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100"
            }`}
          >
            <Terminal className="w-3 h-3 text-neutral-500" />
            <span>Logs ({rawSteps.length})</span>
          </button>
        )}
      </div>

      {/* Expanded Stages Breakdown */}
      {expanded && stages.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-neutral-200/70 space-y-2">
          {stages.map((stage, idx) => {
            const isStageRunning = stage.status === "running";
            const isStageCompleted = stage.status === "completed";
            const isStageFailed = stage.status === "failed";

            return (
              <div key={stage.id || idx} className="flex items-start gap-2.5">
                {/* Status Dot / Icon */}
                <div className="mt-0.5 shrink-0">
                  {isStageRunning ? (
                    <Loader2 className="w-3.5 h-3.5 text-orange-600 animate-spin" />
                  ) : isStageCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isStageFailed ? (
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                  ) : (
                    <CircleDot className="w-3.5 h-3.5 text-neutral-300" />
                  )}
                </div>

                {/* Stage Text & Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs ${
                        isStageRunning
                          ? "font-semibold text-neutral-900"
                          : isStageCompleted
                            ? "text-neutral-700"
                            : "text-neutral-400"
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">
                      {stage.status}
                    </span>
                  </div>

                  {/* Optional stage details */}
                  {stage.details && stage.details.length > 0 && (
                    <div className="mt-1 pl-2 border-l border-neutral-200 space-y-0.5">
                      {stage.details.map((detail, dIdx) => (
                        <p key={dIdx} className="font-mono text-[11px] text-neutral-500 truncate">
                          {detail}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Raw Event Logs Drawer */}
      {showLogs && rawSteps.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-neutral-200/70">
          <div className="bg-neutral-900 text-neutral-200 rounded p-2.5 font-mono text-[11px] max-h-48 overflow-y-auto space-y-1">
            {rawSteps.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-neutral-500 select-none">{String(idx + 1).padStart(2, "0")}</span>
                <span className="text-neutral-300 break-all">{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failed Retry Option */}
      {isFailed && onRetry && (
        <div className="mt-2.5 pt-2 border-t border-red-200/70 flex items-center justify-between">
          <span className="text-xs text-red-600 font-medium">Stage failed during execution.</span>
          <button
            type="button"
            onClick={onRetry}
            className="px-2.5 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition cursor-pointer"
          >
            Retry Stage
          </button>
        </div>
      )}
    </div>
  );
};
