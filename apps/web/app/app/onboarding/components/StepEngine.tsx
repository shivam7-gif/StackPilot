"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import type { OnboardingFormData } from "../types";
import { OptionRow } from "./OptionRow";
import { SpecPanel } from "./SpecPanel";

interface StepEngineProps {
  form: UseFormReturn<OnboardingFormData, any, any>;
}

const ENGINES = [
  { id: "auto", name: "Auto Router", desc: "Intelligent free router across highest-available models" },
  { id: "claude", name: "Claude 3.7", desc: "Anthropic Claude 3.7 Sonnet for deep architecture" },
  { id: "gpt", name: "GPT-4.5", desc: "OpenAI high-speed synthesis and refactoring" },
  { id: "gemini", name: "Gemini 2.5", desc: "Google high-throughput multimodal engine" },
  { id: "deepseek", name: "DeepSeek R1", desc: "Deep reasoning & algorithmic code validation" },
  { id: "llama", name: "Llama 3.3", desc: "Meta open weights running with privacy" },
];

const EFFORTS: Array<{ id: "low" | "medium" | "high"; label: string; desc: string }> = [
  { id: "low", label: "Low", desc: "Fast single-turn edits" },
  { id: "medium", label: "Medium", desc: "Balanced reasoning" },
  { id: "high", label: "High", desc: "Multi-agent deep thinking" },
];

export const StepEngine: React.FC<StepEngineProps> = ({ form }) => {
  const { watch, setValue } = form;
  const currentEngine = watch("engine");
  const currentEffort = watch("effort");
  const formData = watch();

  const effortIndex = EFFORTS.findIndex((e) => e.id === currentEffort);

  return (
    <div className="flex flex-col gap-12">
      {/* 01: Engine Selector */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#5227FF]">
          AI ENGINE INFERENCE
        </span>
        <div
          role="radiogroup"
          aria-label="AI Engine"
          className="border-t border-black/10 flex flex-col"
        >
          {ENGINES.map((eng, idx) => (
            <OptionRow
              key={eng.id}
              id={`eng-${eng.id}`}
              name={eng.name}
              description={eng.desc}
              index={idx + 1}
              selected={currentEngine === eng.id}
              onSelect={() => setValue("engine", eng.id, { shouldValidate: true })}
            />
          ))}
        </div>
      </div>

      {/* 02: Reasoning Effort Segmented Slider */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#5227FF]">
            REASONING EFFORT
          </span>
          <span className="text-xs font-mono text-neutral-400">
            {EFFORTS[effortIndex]?.desc}
          </span>
        </div>

        <div className="relative flex items-center bg-black/[0.04] p-1 border border-black/10 rounded-full max-w-sm h-11 select-none">
          {/* Sliding indicator */}
          <div
            className="absolute top-1 bottom-1 rounded-full bg-white border border-black/10 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: `calc((100% - 8px) / 3)`,
              left: `calc(4px + ${effortIndex} * ((100% - 8px) / 3))`,
            }}
          />

          {EFFORTS.map((effort) => (
            <button
              key={effort.id}
              type="button"
              onClick={() => setValue("effort", effort.id, { shouldValidate: true })}
              className={`relative z-10 flex-1 h-full text-xs font-semibold uppercase tracking-wider transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#5227FF] rounded-full ${
                currentEffort === effort.id
                  ? "text-[#0A0A0A]"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              {effort.label}
            </button>
          ))}
        </div>
      </div>

      {/* 03: Live Specification Review Panel */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#5227FF]">
          WORKSPACE MANIFEST PREVIEW
        </span>
        <SpecPanel data={formData} />
      </div>
    </div>
  );
};
