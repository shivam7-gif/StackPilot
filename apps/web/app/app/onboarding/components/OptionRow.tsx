"use client";

import React from "react";

export interface OptionRowProps {
  id: string;
  name: string;
  description?: string;
  index: number;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}

export const OptionRow: React.FC<OptionRowProps> = ({
  id,
  name,
  description,
  index,
  selected,
  onSelect,
  compact = false,
}) => {
  const indexFormatted = String(index).padStart(2, "0");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="radio"
      id={id}
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={`group relative flex items-baseline justify-between w-full cursor-pointer border-b border-black/10 py-4 px-3 outline-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-black/[0.02] hover:translate-x-[6px] focus-visible:ring-2 focus-visible:ring-[#5227FF] focus-visible:ring-offset-1 select-none ${
        selected ? "bg-[#5227FF]/[0.03]" : ""
      }`}
    >
      {/* Left side: indicator/index + title */}
      <div className="flex items-baseline gap-3 min-w-0 pr-4">
        {selected ? (
          <span className="flex items-center gap-1.5 shrink-0 text-[#5227FF] font-mono text-xs font-bold w-7">
            <span className="w-1.5 h-1.5 bg-[#5227FF] shrink-0" />
            <span>-&gt;</span>
          </span>
        ) : (
          <span className="font-mono text-xs text-neutral-400 shrink-0 w-7 group-hover:text-neutral-600 transition-colors">
            {indexFormatted}
          </span>
        )}

        <span
          className={`font-bold tracking-tight uppercase transition-colors duration-200 truncate ${
            selected ? "text-[#5227FF]" : "text-[#0A0A0A] group-hover:text-black"
          } ${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"}`}
        >
          {name}
        </span>
      </div>

      {/* Right side: descriptor */}
      {description && (
        <span className="text-xs font-mono text-neutral-400 shrink-0 hidden sm:inline-block ml-auto group-hover:text-neutral-600 transition-colors">
          {description}
        </span>
      )}
    </div>
  );
};
