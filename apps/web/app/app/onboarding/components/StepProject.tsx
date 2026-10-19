"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import type { OnboardingFormData } from "../types";
import { OptionRow } from "./OptionRow";

interface StepProjectProps {
  form: UseFormReturn<OnboardingFormData, any, any>;
}

const PROJECT_TYPES = [
  { id: "saas", name: "SaaS", desc: "Software as a service with auth & billing" },
  { id: "api", name: "API Service", desc: "High-throughput endpoints and data pipelines" },
  { id: "internal", name: "Internal Tool", desc: "Dashboards, admin panels, and ops workflows" },
  { id: "ai_app", name: "AI Agent App", desc: "Autonomous multi-agent chains and LLM pipelines" },
];

export const StepProject: React.FC<StepProjectProps> = ({ form }) => {
  const { register, watch, setValue, formState: { errors } } = form;
  const description = watch("description") || "";
  const selectedType = watch("projectType");

  return (
    <div className="flex flex-col gap-10">
      {/* Project Name Field */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="projectName"
          className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#5227FF]"
        >
          PROJECT IDENTIFIER
        </label>
        <div className="relative">
          <input
            id="projectName"
            type="text"
            autoFocus
            {...register("projectName")}
            placeholder="invoice-tracker"
            className="w-full bg-transparent border-b-2 border-black/20 focus:border-[#5227FF] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0A0A0A] placeholder-neutral-300 py-2 outline-none transition-colors"
          />
        </div>
        {errors.projectName && (
          <p className="text-xs font-mono text-red-600 mt-1">
            {errors.projectName.message}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="description"
            className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#5227FF]"
          >
            DESCRIPTION (OPTIONAL)
          </label>
          <span className="text-xs font-mono text-neutral-400">
            {description.length} / 280
          </span>
        </div>
        <textarea
          id="description"
          rows={2}
          maxLength={280}
          {...register("description")}
          placeholder="A quick note on what this workspace solves..."
          className="w-full bg-transparent border-b border-black/10 focus:border-black/30 text-sm text-[#0A0A0A] placeholder-neutral-400 py-2 outline-none resize-none transition-colors"
        />
        {errors.description && (
          <p className="text-xs font-mono text-red-600 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Project Type as Rows */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#5227FF]">
          TYPE OF WORKSPACE
        </span>
        <div
          role="radiogroup"
          aria-label="Workspace Type"
          className="border-t border-black/10 flex flex-col"
        >
          {PROJECT_TYPES.map((t, idx) => (
            <OptionRow
              key={t.id}
              id={`type-${t.id}`}
              name={t.name}
              description={t.desc}
              index={idx + 1}
              selected={selectedType === t.id}
              onSelect={() => setValue("projectType", t.id, { shouldValidate: true })}
            />
          ))}
        </div>
        {errors.projectType && (
          <p className="text-xs font-mono text-red-600 mt-1">
            {errors.projectType.message}
          </p>
        )}
      </div>
    </div>
  );
};
