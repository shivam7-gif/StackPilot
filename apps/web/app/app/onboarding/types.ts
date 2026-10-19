import { z } from "zod";

export const onboardingSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(3, "Name needs at least 3 characters.")
    .max(40, "Name must be 40 characters or fewer.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Use letters, numbers, hyphens, or underscores only."),
  description: z.string().max(280, "Description must be 280 characters or fewer."),
  projectType: z.string().min(1, "Pick a project type."),
  frontend: z.string().min(1, "Pick a frontend framework."),
  backend: z.string().min(1, "Pick a backend framework."),
  database: z.string().min(1, "Pick a database."),
  language: z.string().min(1, "Pick a primary language."),
  styling: z.string().min(1, "Pick a styling solution."),
  engine: z.string().min(1, "Pick an AI engine."),
  effort: z.enum(["low", "medium", "high"]),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const DEFAULT_ONBOARDING_VALUES: OnboardingFormData = {
  projectName: "invoice-tracker",
  description: "",
  projectType: "saas",
  frontend: "nextjs",
  backend: "express",
  database: "postgresql",
  language: "typescript",
  styling: "tailwind",
  engine: "auto",
  effort: "high",
};
