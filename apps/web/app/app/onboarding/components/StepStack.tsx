"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import type { OnboardingFormData } from "../types";
import { OptionRow } from "./OptionRow";

interface StepStackProps {
  form: UseFormReturn<OnboardingFormData, any, any>;
}

const FRONTENDS = [
  { id: "nextjs", name: "Next.js", desc: "Full-stack React" },
  { id: "react", name: "React", desc: "Vite + SPA" },
  { id: "vue", name: "Vue.js", desc: "Vite + Vue 3" },
  { id: "nuxt", name: "Nuxt", desc: "SSR Vue" },
  { id: "svelte", name: "SvelteKit", desc: "Cybernetically enhanced" },
  { id: "angular", name: "Angular", desc: "Standalone components" },
  { id: "vanilla", name: "Vanilla HTML", desc: "Native Web APIs" },
];

const BACKENDS = [
  { id: "express", name: "Express", desc: "Node.js minimalist framework" },
  { id: "nestjs", name: "NestJS", desc: "TypeScript enterprise architecture" },
  { id: "fastapi", name: "FastAPI", desc: "High-performance Python 3.11" },
  { id: "django", name: "Django", desc: "Batteries-included Python" },
  { id: "flask", name: "Flask", desc: "Lightweight Python microservice" },
  { id: "hono", name: "Hono", desc: "Ultrafast edge runtime" },
  { id: "none", name: "No Backend", desc: "Frontend-only static / client" },
];

const DATABASES = [
  { id: "postgresql", name: "PostgreSQL", desc: "Robust relational SQL" },
  { id: "mongodb", name: "MongoDB", desc: "Flexible document store" },
  { id: "mysql", name: "MySQL", desc: "Standard relational engine" },
  { id: "sqlite", name: "SQLite", desc: "Zero-configuration file DB" },
  { id: "supabase", name: "Supabase", desc: "Managed Postgres with realtime" },
  { id: "firebase", name: "Firebase", desc: "Google cloud NoSQL" },
  { id: "none", name: "None", desc: "Stateless / in-memory only" },
];

const LANGUAGES = [
  { id: "typescript", name: "TypeScript", desc: "Strict type-safety by default" },
  { id: "javascript", name: "JavaScript", desc: "Modern ECMAScript" },
  { id: "python", name: "Python", desc: "Clean syntax for data and AI" },
];

const STYLINGS = [
  { id: "tailwind", name: "Tailwind CSS", desc: "Utility-first modern CSS" },
  { id: "css_modules", name: "CSS Modules", desc: "Scoped CSS component files" },
  { id: "styled_components", name: "Styled Components", desc: "CSS-in-JS components" },
  { id: "vanilla", name: "Vanilla CSS", desc: "Standard plain CSS3" },
];

export const StepStack: React.FC<StepStackProps> = ({ form }) => {
  const { watch, setValue } = form;

  const currentFrontend = watch("frontend");
  const currentBackend = watch("backend");
  const currentDatabase = watch("database");
  const currentLanguage = watch("language");
  const currentStyling = watch("styling");

  return (
    <div className="flex flex-col gap-12">
      {/* 01: Frontend Framework (Compact 2-column layout for 6+ items) */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#5227FF]">
          FRONTEND FRAMEWORK (6+ OPTIONS)
        </span>
        <div
          role="radiogroup"
          aria-label="Frontend Framework"
          className="grid grid-cols-1 md:grid-cols-2 border-t border-black/10"
        >
          {FRONTENDS.map((f, idx) => (
            <OptionRow
              key={f.id}
              id={`fe-${f.id}`}
              name={f.name}
              description={f.desc}
              index={idx + 1}
              selected={currentFrontend === f.id}
              onSelect={() => setValue("frontend", f.id, { shouldValidate: true })}
              compact={true}
            />
          ))}
        </div>
      </div>

      {/* 02: Backend Runtime */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#5227FF]">
          BACKEND RUNTIME
        </span>
        <div
          role="radiogroup"
          aria-label="Backend Runtime"
          className="grid grid-cols-1 md:grid-cols-2 border-t border-black/10"
        >
          {BACKENDS.map((b, idx) => (
            <OptionRow
              key={b.id}
              id={`be-${b.id}`}
              name={b.name}
              description={b.desc}
              index={idx + 1}
              selected={currentBackend === b.id}
              onSelect={() => setValue("backend", b.id, { shouldValidate: true })}
              compact={true}
            />
          ))}
        </div>
      </div>

      {/* 03: Database (Compact 2-column layout for 6+ items) */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#5227FF]">
          DATABASE STORAGE (6+ OPTIONS)
        </span>
        <div
          role="radiogroup"
          aria-label="Database Storage"
          className="grid grid-cols-1 md:grid-cols-2 border-t border-black/10"
        >
          {DATABASES.map((d, idx) => (
            <OptionRow
              key={d.id}
              id={`db-${d.id}`}
              name={d.name}
              description={d.desc}
              index={idx + 1}
              selected={currentDatabase === d.id}
              onSelect={() => setValue("database", d.id, { shouldValidate: true })}
              compact={true}
            />
          ))}
        </div>
      </div>

      {/* 04: Primary Language */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#5227FF]">
          PRIMARY LANGUAGE
        </span>
        <div
          role="radiogroup"
          aria-label="Primary Language"
          className="border-t border-black/10 flex flex-col"
        >
          {LANGUAGES.map((l, idx) => (
            <OptionRow
              key={l.id}
              id={`lang-${l.id}`}
              name={l.name}
              description={l.desc}
              index={idx + 1}
              selected={currentLanguage === l.id}
              onSelect={() => setValue("language", l.id, { shouldValidate: true })}
            />
          ))}
        </div>
      </div>

      {/* 05: Styling Solution */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#5227FF]">
          STYLING SYSTEM
        </span>
        <div
          role="radiogroup"
          aria-label="Styling System"
          className="border-t border-black/10 flex flex-col"
        >
          {STYLINGS.map((s, idx) => (
            <OptionRow
              key={s.id}
              id={`style-${s.id}`}
              name={s.name}
              description={s.desc}
              index={idx + 1}
              selected={currentStyling === s.id}
              onSelect={() => setValue("styling", s.id, { shouldValidate: true })}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
