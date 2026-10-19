"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface WorkingBlockProps {
  steps: string[];
  isStreaming?: boolean;
}

export const WorkingBlock: React.FC<WorkingBlockProps> = ({
  steps,
  isStreaming = false,
}) => {
  // Shows live (expanded) while model is working, collapses when answer starts
  const [expanded, setExpanded] = useState(isStreaming);

  useEffect(() => {
    if (!isStreaming) {
      setExpanded(false);
    }
  }, [isStreaming]);

  if (!steps || steps.length === 0) return null;

  const title = isStreaming
    ? `Working on ${steps.length} step${steps.length > 1 ? "s" : ""}...`
    : `Planned ${steps.length} step${steps.length > 1 ? "s" : ""}`;

  return (
    <div className="mb-4 select-none">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors py-1 cursor-pointer outline-none focus-visible:underline"
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        )}
        <span className="font-medium">{title}</span>
      </button>

      {expanded && (
        <div className="mt-2 ml-1 pl-3 border-l border-black/15 space-y-1.5 font-mono text-[13px] text-neutral-500">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="text-[#5227FF] text-xs font-bold shrink-0">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
