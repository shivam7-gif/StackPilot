"use client";

import React from "react";

interface StepHeaderProps {
  step: number;
  totalSteps: number;
  headline: string;
  helperText: string;
}

export const StepHeader: React.FC<StepHeaderProps> = ({
  step,
  totalSteps,
  headline,
  helperText,
}) => {
  const words = headline.split(" ");
  const currentFormatted = String(step).padStart(2, "0");
  const totalFormatted = String(totalSteps).padStart(2, "0");
  const progressPercent = ((step) / totalSteps) * 100;

  return (
    <div className="flex flex-col gap-6 lg:sticky lg:top-12">
      {/* Progress line and counter */}
      <div className="flex flex-col gap-2 max-w-[220px]">
        <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-neutral-400">
          <span className="text-[#5227FF] font-semibold">{currentFormatted}</span>
          <span>/</span>
          <span>{totalFormatted}</span>
        </div>
        <div className="h-[2px] w-full bg-neutral-200 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-[#5227FF] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Editorial Headline */}
      <div className="flex flex-wrap items-baseline gap-y-2">
        {words.map((word, idx) => (
          <span
            key={`${word}-${idx}`}
            className="relative inline-block pr-6 mr-2 font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl lg:text-6xl tracking-[-0.03em] leading-[0.95] uppercase select-none"
          >
            {word}
            <span className="absolute top-0 right-1 text-xs font-mono font-bold text-[#5227FF] tracking-normal select-none">
              {String(idx + 1).padStart(2, "0")}
            </span>
          </span>
        ))}
      </div>

      {/* Helper text */}
      <p className="text-neutral-500 text-sm font-normal max-w-sm leading-relaxed">
        {helperText}
      </p>
    </div>
  );
};
