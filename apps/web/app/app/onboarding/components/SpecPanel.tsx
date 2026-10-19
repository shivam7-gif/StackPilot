"use client";

import React from "react";
import type { OnboardingFormData } from "../types";

interface SpecPanelProps {
  data: Partial<OnboardingFormData>;
  className?: string;
}

export const SpecPanel: React.FC<SpecPanelProps> = ({ data, className = "" }) => {
  const fields = [
    { key: "project", value: data.projectName },
    { key: "type", value: data.projectType },
    { key: "frontend", value: data.frontend },
    { key: "backend", value: data.backend },
    { key: "database", value: data.database },
    { key: "language", value: data.language },
    { key: "styling", value: data.styling },
    { key: "engine", value: data.engine === "auto" ? "auto (free router)" : data.engine },
    { key: "effort", value: data.effort },
  ];

  return (
    <div
      className={`border border-black/10 bg-white p-6 font-mono text-[13px] leading-relaxed select-text ${className}`}
    >
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/10 text-[10px] tracking-[0.2em] uppercase font-bold text-[#5227FF]">
        <span>SPECIFICATION</span>
        <span className="text-neutral-400 font-normal">YAML / CONFIG</span>
      </div>

      <div className="space-y-2 text-[#0A0A0A]">
        {fields.map(({ key, value }) => {
          const displayKey = key.padEnd(12, " ");
          const hasValue = Boolean(value && value.trim());

          return (
            <div key={key} className="flex items-baseline justify-between gap-4">
              <span className="text-neutral-400 shrink-0 whitespace-pre">{displayKey}</span>
              {hasValue ? (
                <span className="text-[#0A0A0A] font-medium text-right truncate">
                  {value}
                </span>
              ) : (
                <span className="text-[#5227FF] font-bold text-right inline-block animate-pulse">
                  --
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
