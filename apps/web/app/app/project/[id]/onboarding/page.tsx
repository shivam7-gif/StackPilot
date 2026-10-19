"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Layers,
  CheckCircle2,
  Package,
  Cpu,
  ArrowRight,
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileCode2,
  Sparkles,
} from "lucide-react";
import { LIBRARY_CATALOG, type LibraryItem } from "./libraries";

interface ProjectOnboardingPageProps {
  params: Promise<{ id: string }>;
}

const STEPS = [
  { step: 1, title: "Review Project", desc: "Core metadata & prompt" },
  { step: 2, title: "Technology Stack", desc: "Frameworks & database" },
  { step: 3, title: "Libraries", desc: "Manual dependency selection" },
  { step: 4, title: "AI Model", desc: "Inference engine" },
  { step: 5, title: "Review & Create", desc: "Finalize & scaffold" },
];

const FRONTEND_OPTIONS = [
  { id: "react", name: "React (Vite)", desc: "High-performance SPA with fast HMR" },
  { id: "nextjs", name: "Next.js", desc: "Full-stack React with App Router & SSR" },
  { id: "vue", name: "Vue.js", desc: "Approachable, reactive component framework" },
  { id: "svelte", name: "Svelte", desc: "Cybernetically enhanced web apps" },
];

const BACKEND_OPTIONS = [
  { id: "express", name: "Express.js", desc: "Minimal, fast Node.js REST server" },
  { id: "nestjs", name: "NestJS", desc: "Enterprise TypeScript architecture with decorators" },
  { id: "fastapi", name: "FastAPI", desc: "Modern, high-performance Python ASGI API" },
  { id: "django", name: "Django", desc: "The web framework for perfectionists with deadlines" },
];

const DATABASE_OPTIONS = [
  { id: "postgresql", name: "PostgreSQL", desc: "Robust relational SQL database" },
  { id: "mongodb", name: "MongoDB", desc: "Flexible document-based NoSQL" },
  { id: "sqlite", name: "SQLite", desc: "Lightweight zero-config embedded database" },
];

const LANGUAGE_OPTIONS = [
  { id: "typescript", name: "TypeScript", desc: "Type-safe static analysis" },
  { id: "javascript", name: "JavaScript", desc: "Standard ECMAScript runtime" },
  { id: "python", name: "Python", desc: "Clean syntax for AI and backends" },
];

const STYLING_OPTIONS = [
  { id: "tailwind", name: "Tailwind CSS", desc: "Utility-first CSS framework" },
  { id: "css-modules", name: "CSS Modules", desc: "Scoped standard CSS" },
  { id: "plain-css", name: "Plain CSS", desc: "Standard vanilla styling" },
];

const MODEL_OPTIONS = [
  { id: "openrouter/free", name: "Auto (Free Router)", badge: "Free", desc: "Automated free routing across highest-capacity models" },
  { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7 Sonnet", badge: "Pro", desc: "Anthropic premier model for deep software architecture" },
  { id: "openai/gpt-4o", name: "GPT-4o", badge: "Fast", desc: "OpenAI flagship high-speed reasoning and synthesis" },
  { id: "deepseek/deepseek-r1", name: "DeepSeek R1", badge: "Reasoning", desc: "Deep reasoning, math, and algorithmic validation" },
];

export default function ProjectOnboardingPage({ params }: ProjectOnboardingPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: session } = useSession();
  const userId =
    session?.user?.id ||
    (session?.user?.email ? encodeURIComponent(session.user.email) : "default-user");

  const [currentStep, setCurrentStep] = useState(1);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Project state
  const [projectName, setProjectName] = useState("my-app");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Full-Stack Web App");
  const [frontend, setFrontend] = useState("react");
  const [backend, setBackend] = useState("express");
  const [database, setDatabase] = useState("postgresql");
  const [language, setLanguage] = useState("typescript");
  const [styling, setStyling] = useState("tailwind");
  const [selectedLibraries, setSelectedLibraries] = useState<string[]>([
    "lucide-react",
    "tailwindcss",
    "axios",
    "zod",
  ]);
  const [selectedModel, setSelectedModel] = useState("openrouter/free");

  // Library catalog filters
  const [librarySearch, setLibrarySearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Scaffolding execution state
  const [isScaffolding, setIsScaffolding] = useState(false);
  const [scaffoldStages, setScaffoldStages] = useState<string[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [scaffoldError, setScaffoldError] = useState<string | null>(null);

  const [openRouterConnected, setOpenRouterConnected] = useState(false);
  const [modelsList, setModelsList] = useState(MODEL_OPTIONS);
  const [loadingModels, setLoadingModels] = useState(false);

  // Check OpenRouter connection status
  useEffect(() => {
    async function checkAiStatus() {
      try {
        const res = await fetch(`http://localhost:5000/api/integrations/openrouter/status?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setOpenRouterConnected(Boolean(data.connected));
        }
      } catch {}
    }
    checkAiStatus();
  }, [userId]);

  // Fetch dynamically available models when user reaches AI configuration step
  useEffect(() => {
    if (currentStep === 4) {
      async function fetchModels() {
        try {
          setLoadingModels(true);
          const res = await fetch(`http://localhost:5000/api/integrations/openrouter/models?userId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.models && data.models.length > 0) {
              setModelsList(
                data.models.map((m: any) => ({
                  id: m.id,
                  name: m.name || m.id,
                  badge: m.is_free ? "Free" : "BYOK",
                  desc: m.description || `Context length: ${m.context_length ? m.context_length.toLocaleString() : "128k"} tokens`,
                }))
              );
            }
          }
        } catch {} finally {
          setLoadingModels(false);
        }
      }
      fetchModels();
    }
  }, [currentStep, userId]);

  // Load draft project details on mount
  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`http://localhost:5000/projects/${id}`);
        if (res.ok) {
          const data = await res.json();
          const p = data.project;
          if (p) {
            if (p.projectName) setProjectName(p.projectName);
            if (p.description || p.prompt) setDescription(p.description || p.prompt);
            if (p.category) setCategory(p.category);
            if (p.frontend) setFrontend(p.frontend);
            if (p.backend) setBackend(p.backend);
            if (p.database) setDatabase(p.database);
            if (p.language) setLanguage(p.language);
            if (p.styling) setStyling(p.styling);
            if (p.libraries && p.libraries.length) setSelectedLibraries(p.libraries);
            if (p.model) setSelectedModel(p.model);
          }
        }
      } catch (err) {
        console.warn("Could not load backend draft project:", err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadProject();
  }, [id]);

  // Toggle library selection
  const handleToggleLibrary = (libId: string) => {
    setSelectedLibraries((prev) =>
      prev.includes(libId) ? prev.filter((i) => i !== libId) : [...prev, libId]
    );
  };

  // Filter libraries
  const filteredLibraries = LIBRARY_CATALOG.filter((lib) => {
    const matchesSearch =
      lib.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
      lib.pkg.toLowerCase().includes(librarySearch.toLowerCase()) ||
      lib.description.toLowerCase().includes(librarySearch.toLowerCase());
    const matchesCat = selectedCategory === "All" || lib.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = [
    "All",
    "UI Components",
    "Styling",
    "Routing",
    "State Management",
    "Forms & Validation",
    "Authentication",
    "Database & ORM",
    "AI & LLM",
    "API & Networking",
    "Testing",
    "Dev Tooling",
  ];

  // Save changes to backend draft
  const handleSaveDraft = async () => {
    try {
      await fetch(`http://localhost:5000/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          description,
          category,
          frontend,
          backend,
          database,
          language,
          styling,
          libraries: selectedLibraries,
          model: selectedModel,
        }),
      });
    } catch {}
  };

  // Stage F: Real project scaffolding execution
  const handleCreateAndScaffold = async () => {
    setIsScaffolding(true);
    setScaffoldError(null);

    const stages = [
      "Saving project manifest and architecture specification...",
      `Initializing ${frontend} frontend and ${backend} framework templates...`,
      "Synthesizing modular components and application routes...",
      `Configuring ${selectedLibraries.length} validated library dependencies...`,
      "Validating dependency manifests and build configuration...",
      "Preparing project workspace and runtime sandbox...",
      "Opening StackPilot IDE...",
    ];

    setScaffoldStages(stages);
    setCurrentStageIndex(0);

    try {
      // Step through progress stages
      const advanceInterval = setInterval(() => {
        setCurrentStageIndex((prev) => {
          if (prev < stages.length - 2) {
            return prev + 1;
          }
          return prev;
        });
      }, 700);

      const scaffoldRes = await fetch("http://localhost:5000/projects/scaffold-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          projectName,
          frontend,
          backend,
          database,
          language,
          styling,
          prompt: description,
          libraries: selectedLibraries,
          model: selectedModel,
        }),
      });

      clearInterval(advanceInterval);

      if (!scaffoldRes.ok) {
        const errData = await scaffoldRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to scaffold project workspace");
      }

      setCurrentStageIndex(stages.length - 1);
      setTimeout(() => {
        router.push(`/project/${id}/ide`);
      }, 900);
    } catch (err: any) {
      setScaffoldError(err.message || "Failed to scaffold workspace. Please retry.");
      setIsScaffolding(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased flex flex-col">
      {/* Top Header */}
      <header className="h-14 border-b border-neutral-200 px-6 flex items-center justify-between bg-white z-20">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-orange-600 text-white flex items-center justify-center font-bold text-xs font-mono shadow-2xs">
            SP
          </div>
          <span className="text-xs font-semibold text-neutral-900">StackPilot</span>
          <span className="text-neutral-300">/</span>
          <span className="text-xs font-mono text-neutral-600 truncate max-w-[180px]">{projectName}</span>
          <span className="text-neutral-300">/</span>
          <span className="text-xs text-neutral-500">Project Setup</span>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-xs text-neutral-500 hover:text-neutral-900 transition"
        >
          Exit to Dashboard
        </button>
      </header>

      {/* Stepper Progress Bar */}
      <div className="border-b border-neutral-200 bg-neutral-50/60 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {STEPS.map((s) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step < currentStep) setCurrentStep(s.step);
                }}
                className={`flex items-center gap-2 text-xs transition cursor-pointer ${
                  isActive
                    ? "font-semibold text-orange-600"
                    : isCompleted
                      ? "text-neutral-700"
                      : "text-neutral-400"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] ${
                    isActive
                      ? "bg-orange-600 text-white"
                      : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {isCompleted ? "✓" : s.step}
                </span>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-8 flex flex-col justify-between">
        {/* Scaffolding Progress Overlay */}
        {isScaffolding ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Scaffolding Workspace</h2>
            <p className="text-xs text-neutral-500 font-mono mb-6 max-w-md">
              {scaffoldStages[currentStageIndex]}
            </p>

            <div className="w-full max-w-md border border-neutral-200 rounded-xl bg-neutral-50 p-4 text-left font-mono text-xs space-y-2">
              {scaffoldStages.map((stg, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 ${
                    i < currentStageIndex
                      ? "text-emerald-600"
                      : i === currentStageIndex
                        ? "text-orange-600 font-semibold"
                        : "text-neutral-400"
                  }`}
                >
                  <span>{i < currentStageIndex ? "✓" : i === currentStageIndex ? "→" : "○"}</span>
                  <span className="truncate">{stg}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {scaffoldError && (
              <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{scaffoldError}</span>
              </div>
            )}

            {/* STEP 1: REVIEW PROJECT */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-[fadeIn_150ms_ease_both]">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900">Review Project</h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Verify or edit your project name, initial description, and application requirements.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider font-mono mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:border-orange-500 text-xs font-mono outline-none text-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider font-mono mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:border-orange-500 text-xs outline-none text-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider font-mono mb-1">
                      Project Prompt & Scope
                    </label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe requirements, architecture details, and data models..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:border-orange-500 text-xs leading-relaxed outline-none text-neutral-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: TECHNOLOGY STACK */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-[fadeIn_150ms_ease_both]">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900">Choose Technology Stack</h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Select supported frontend frameworks, backend runtimes, and databases.
                  </p>
                </div>

                {/* Frontend Framework */}
                <div>
                  <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-neutral-600 mb-2">
                    Frontend Framework
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FRONTEND_OPTIONS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFrontend(f.id)}
                        className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                          frontend === f.id
                            ? "border-orange-600 bg-orange-50/50 shadow-2xs"
                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-900">{f.name}</span>
                          {frontend === f.id && <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{f.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Backend Runtime */}
                <div>
                  <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-neutral-600 mb-2">
                    Backend Framework
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {BACKEND_OPTIONS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBackend(b.id)}
                        className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                          backend === b.id
                            ? "border-orange-600 bg-orange-50/50 shadow-2xs"
                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-900">{b.name}</span>
                          {backend === b.id && <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{b.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Database */}
                <div>
                  <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-neutral-600 mb-2">
                    Database
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {DATABASE_OPTIONS.map((db) => (
                      <button
                        key={db.id}
                        type="button"
                        onClick={() => setDatabase(db.id)}
                        className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                          database === db.id
                            ? "border-orange-600 bg-orange-50/50 shadow-2xs"
                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                        }`}
                      >
                        <span className="text-xs font-semibold text-neutral-900">{db.name}</span>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{db.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIGURE LIBRARIES */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-[fadeIn_150ms_ease_both]">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900">Configure Libraries & Dependencies</h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Select verified packages to install automatically during scaffolding.
                  </p>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search libraries (e.g. zustand, prisma, zod)..."
                      value={librarySearch}
                      onChange={(e) => setLibrarySearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-orange-500"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-none bg-white font-mono"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Selected Count */}
                <div className="text-xs text-neutral-500 flex items-center justify-between">
                  <span>{selectedLibraries.length} libraries selected</span>
                  <button
                    type="button"
                    onClick={() => setSelectedLibraries([])}
                    className="text-neutral-400 hover:text-red-600 transition"
                  >
                    Clear selections
                  </button>
                </div>

                {/* Libraries List */}
                <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 max-h-80 overflow-y-auto bg-neutral-50/50">
                  {filteredLibraries.map((lib) => {
                    const isSelected = selectedLibraries.includes(lib.id);
                    return (
                      <div
                        key={lib.id}
                        onClick={() => handleToggleLibrary(lib.id)}
                        className={`p-3 flex items-start justify-between gap-3 text-xs cursor-pointer transition ${
                          isSelected ? "bg-orange-50/60" : "hover:bg-white bg-transparent"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900">{lib.name}</span>
                            <span className="font-mono text-[10px] text-neutral-500">`{lib.pkg}`</span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                                lib.type === "prod"
                                  ? "bg-neutral-200 text-neutral-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {lib.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500">{lib.description}</p>
                        </div>

                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleLibrary(lib.id)}
                          className="mt-1 accent-orange-600 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: AI CONFIGURATION */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-[fadeIn_150ms_ease_both]">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900">AI Engine Configuration</h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Choose the primary model used for code synthesis and agent workflows.
                  </p>
                </div>

                {/* OpenRouter Connection Status Banner */}
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                    openRouterConnected
                      ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
                      : "border-amber-200 bg-amber-50/50 text-amber-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        openRouterConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                      }`}
                    />
                    <span className="font-semibold">
                      {openRouterConnected
                        ? "OpenRouter Connected (BYOK Key Active)"
                        : "OpenRouter Not Connected (Using Free Default Models)"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/setup/ai")}
                    className="font-semibold underline underline-offset-2 hover:opacity-80 transition cursor-pointer"
                  >
                    {openRouterConnected ? "Manage Keys →" : "Connect OpenRouter →"}
                  </button>
                </div>

                {loadingModels ? (
                  <div className="py-8 flex items-center justify-center gap-2 text-xs text-neutral-400 font-mono">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                    <span>Fetching available models from OpenRouter...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {modelsList.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedModel(m.id)}
                        className={`w-full p-4 rounded-xl border text-left transition cursor-pointer ${
                          selectedModel === m.id
                            ? "border-orange-600 bg-orange-50/50 shadow-2xs"
                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900">{m.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                              {m.badge}
                            </span>
                          </div>
                          {selectedModel === m.id && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: REVIEW & CREATE */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-[fadeIn_150ms_ease_both]">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900">Review & Scaffold</h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Verify project specifications before launching the real live IDE workspace.
                  </p>
                </div>

                <div className="border border-neutral-200 rounded-xl p-5 bg-neutral-50/50 space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-neutral-200">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase">Project Name</span>
                      <span className="font-semibold text-neutral-900">{projectName}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase">Category</span>
                      <span className="font-semibold text-neutral-900">{category}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-3 border-b border-neutral-200">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase">Frontend</span>
                      <span className="font-semibold text-neutral-900">{frontend}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase">Backend</span>
                      <span className="font-semibold text-neutral-900">{backend}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase">Database</span>
                      <span className="font-semibold text-neutral-900">{database}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase">Model</span>
                      <span className="font-semibold text-neutral-900 truncate block">{selectedModel}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase mb-1">
                      Installed Libraries ({selectedLibraries.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedLibraries.map((lib) => (
                        <span key={lib} className="px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-800 text-[11px]">
                          {lib}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stepper Navigation Actions */}
        {!isScaffolding && (
          <div className="pt-6 border-t border-neutral-200 flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((s) => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={async () => {
                  await handleSaveDraft();
                  setCurrentStep((s) => s + 1);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white hover:bg-black transition active:scale-95 shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateAndScaffold}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white transition active:scale-95 shadow-md shadow-orange-950/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Project & Open IDE</span>
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
