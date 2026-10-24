"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  onboardingSchema,
  OnboardingFormData,
  DEFAULT_ONBOARDING_VALUES,
} from "./types";
import { StepHeader } from "./components/StepHeader";
import { SpecPanel } from "./components/SpecPanel";
import { StepProject } from "./components/StepProject";
import { StepStack } from "./components/StepStack";
import { StepEngine } from "./components/StepEngine";

const DRAFT_STORAGE_KEY = "stackpilot_onboarding_draft";
const COMPLETED_STORAGE_KEY = "stackpilot_onboarding_completed";

const STEPS_CONFIG = [
  {
    step: 1,
    headline: "NAME IT.",
    helperText: "Every workspace starts with a name and architecture blueprint. Pick a default. You can change it later.",
  },
  {
    step: 2,
    headline: "PICK YOUR STACK.",
    helperText: "What are you building on? StackPilot configures framework CLIs, runtime dependencies, and database drivers.",
  },
  {
    step: 3,
    headline: "CHOOSE YOUR ENGINE.",
    helperText: "Select your primary AI model router and reasoning depth for autonomous code synthesis.",
  },
];

const FINISHING_LOGS = [
  "creating project manifest... done",
  "configuring runtime dependencies... done",
  "initializing workspace engine... done",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isFinishing, setIsFinishing] = useState(false);
  const [activeLogIndex, setActiveLogIndex] = useState(0);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: DEFAULT_ONBOARDING_VALUES,
    mode: "onChange",
  });

  const { watch, trigger, getValues, reset } = form;
  const formData = watch();

  // Onboarding page bypassed: always redirect directly to dashboard
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  // Persist draft on every change
  useEffect(() => {
    const subscription = watch((value) => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(value));
      } catch {}
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Complete onboarding sequence
  const finalizeOnboarding = useCallback(
    async (data: OnboardingFormData) => {
      setIsFinishing(true);

      try {
        // Save to localStorage for dashboard sidebar & chat context
        localStorage.setItem(COMPLETED_STORAGE_KEY, "true");
        localStorage.setItem("stackpilot_project_name", data.projectName);
        localStorage.setItem("stackpilot_onboarding_data", JSON.stringify(data));
        localStorage.removeItem(DRAFT_STORAGE_KEY);

        // Submit to API
        await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).catch(() => {});
      } catch {}

      // Reveal finishing logs step by step (~1.5s total)
      setTimeout(() => setActiveLogIndex(1), 500);
      setTimeout(() => setActiveLogIndex(2), 1000);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    },
    [router]
  );

  // Step transition handlers
  const handleNext = useCallback(async () => {
    if (currentStep === 1) {
      const valid = await trigger(["projectName", "description", "projectType"]);
      if (!valid) return;
      setDirection("next");
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 2) {
      const valid = await trigger(["frontend", "backend", "database", "language", "styling"]);
      if (!valid) return;
      setDirection("next");
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 3) {
      const valid = await trigger();
      if (!valid) return;
      finalizeOnboarding(getValues());
    }
  }, [currentStep, trigger, finalizeOnboarding, getValues]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setDirection("prev");
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  // Skip for now with default settings
  const handleSkip = useCallback(() => {
    finalizeOnboarding(DEFAULT_ONBOARDING_VALUES);
  }, [finalizeOnboarding]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinishing) return;

      // Don't intercept Enter inside textarea
      if (
        e.key === "Enter" &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLButtonElement)
      ) {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handleBack, isFinishing]);

  const currentConfig = STEPS_CONFIG[currentStep - 1];

  // Finishing screen: restrained monospace log sequence
  if (isFinishing) {
    return (
      <main className="min-h-screen w-full bg-white text-[#0A0A0A] flex flex-col justify-center items-center px-6 antialiased select-none">
        <div className="w-full max-w-md flex flex-col gap-6">
          <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#5227FF]">
            SETTING UP YOUR WORKSPACE
          </div>
          <div className="space-y-3 font-mono text-sm text-[#0A0A0A]">
            {FINISHING_LOGS.slice(0, activeLogIndex + 1).map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[#5227FF]">-&gt;</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-[#0A0A0A] font-sans antialiased flex flex-col selection:bg-[#5227FF] selection:text-white">
      {/* Top Bar */}
      <header className="h-16 border-b border-black/10 px-6 sm:px-10 flex items-center justify-between shrink-0 bg-white z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold uppercase tracking-tight text-[#0A0A0A]">
            StackPilot
          </span>
          <span className="text-neutral-300">/</span>
          <span className="text-xs font-mono font-medium text-neutral-400">
            ONBOARDING
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* AI Online Indicator (reused from dashboard) */}
          <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[10px] font-medium border border-green-200 text-green-700 bg-green-50 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            AI Online
          </span>

          {/* Skip for now text link */}
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-mono text-neutral-400 hover:text-[#0A0A0A] transition-colors cursor-pointer outline-none focus-visible:underline"
          >
            Skip for now
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-10 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Sticky Step Header & Progress */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <StepHeader
              step={currentConfig.step}
              totalSteps={STEPS_CONFIG.length}
              headline={currentConfig.headline}
              helperText={currentConfig.helperText}
            />
          </div>

          {/* Middle Column: Current Step Form */}
          <div className="lg:col-span-5 flex flex-col gap-12">
            <div
              key={currentStep}
              className={`transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                direction === "next"
                  ? "animate-[fadeInUp_300ms_cubic-bezier(0.22,1,0.36,1)_both]"
                  : "animate-[fadeInDown_300ms_cubic-bezier(0.22,1,0.36,1)_both]"
              }`}
            >
              {currentStep === 1 && <StepProject form={form} />}
              {currentStep === 2 && <StepStack form={form} />}
              {currentStep === 3 && <StepEngine form={form} />}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-black/10">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs font-mono text-neutral-500 hover:text-black transition-colors cursor-pointer outline-none focus-visible:underline"
                >
                  &larr; Back
                </button>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 h-10 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#0A0A0A] text-white hover:bg-[#5227FF] transition-all duration-200 active:scale-[0.98] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#5227FF] focus-visible:ring-offset-2"
              >
                <span>{currentStep === 3 ? "Launch workspace" : "Continue"}</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          {/* Right Column: Sticky Live Spec Panel (Desktop) */}
          <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-28">
            <SpecPanel data={formData} />
          </div>
        </div>
      </div>
    </div>
  );
}
