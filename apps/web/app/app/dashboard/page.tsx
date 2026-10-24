"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Layers,
  ArrowRight,
  Plus,
  Edit2,
  Check,
  Terminal,
  ExternalLink,
  ChevronDown,
  FolderCode,
  Clock,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import StaggeredMenu from "./StaggeredMenu";
import Folder from "./Folder";
import GlideSelect from "./GlideSelect";
import catalog from "./openrouter-free-models.json";
import { checkHealth, AI_BACKEND_URL } from "@/config/aiApi";
import { API_BASE_URL } from "@/config/axiosConfig";
import { scaffoldAiProjectApi } from "@/apis/project";
import { MessageList } from "@/components/chat/MessageList";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { useDashboardChat } from "@/hooks/useDashboardChat";

export interface ModelOption {
  id: string;
  label: string;
  tag?: string;
  provider?: string;
  bestFor?: string;
}

export interface BackendProject {
  projectId: string;
  projectName: string;
  description?: string;
  status?: string;
  frontend?: string;
  backend?: string;
  createdAt: string;
  updatedAt?: string;
}

const DEFAULT_MODELS: ModelOption[] = [
  ...catalog.models.map((m) => ({
    id: m.id,
    label: m.label,
    tag: m.tag,
    provider: m.provider,
    bestFor: m.bestFor,
  })),
  {
    id: "anthropic/claude-3.7-sonnet",
    label: "Claude 3.7 Sonnet",
    tag: "Pro",
    provider: "Anthropic",
    bestFor: "Complex software architecture, full-stack generation, and debugging",
  },
  {
    id: "openai/gpt-4o",
    label: "GPT-4o",
    tag: "High Speed",
    provider: "OpenAI",
    bestFor: "Fast multi-turn logic and API design",
  },
  {
    id: "deepseek/deepseek-r1",
    label: "DeepSeek R1",
    tag: "Reasoning",
    provider: "DeepSeek",
    bestFor: "Deep reasoning, algorithms, and validation",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id || (session?.user?.email ? encodeURIComponent(session.user.email) : "default-user");

  const [userName, setUserName] = useState<string>("Developer");
  const [folderHovered, setFolderHovered] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [headingHovered, setHeadingHovered] = useState(false);
  const [activeNav, setActiveNav] = useState<"Workspace" | "Projects">("Workspace");
  const [workspaceProject, setWorkspaceProject] = useState<string>("stackpilot-project");
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [projectNameDraft, setProjectNameDraft] = useState("");
  const [composerDraft, setComposerDraft] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [frontendFramework, setFrontendFramework] = useState("react");
  const [backendFramework, setBackendFramework] = useState("express");
  const [newProjectName, setNewProjectName] = useState("");
  const [isScaffoldingModal, setIsScaffoldingModal] = useState(false);
  const [scaffoldModalError, setScaffoldModalError] = useState<string | null>(null);

  // Projects list for returning users
  const [projectsList, setProjectsList] = useState<BackendProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // OpenRouter BYOK status
  const [openRouterConnected, setOpenRouterConnected] = useState<boolean>(false);
  const [openRouterKeyMasked, setOpenRouterKeyMasked] = useState<string | null>(null);

  // Model Selection
  const [selectedModel, setSelectedModel] = useState<ModelOption>(DEFAULT_MODELS[0]);

  // AI Backend Health
  const [aiBackendOnline, setAiBackendOnline] = useState<boolean | null>(null);

  const lastPromptRef = useRef<string>("");

  // Fetch recent projects list from backend
  const fetchProjects = useCallback(async () => {
    try {
      setLoadingProjects(true);
      const res = await fetch(`${API_BASE_URL}/projects?ownerId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProjectsList(data.projects || []);
      }
    } catch (e) {
      console.warn("Could not fetch projects list:", e);
    } finally {
      setLoadingProjects(false);
    }
  }, [userId]);

  // Fetch OpenRouter connection status
  const fetchOpenRouterStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/integrations/openrouter/status?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOpenRouterConnected(Boolean(data.connected));
        setOpenRouterKeyMasked(data.keyMasked || null);
      }
    } catch { }
  }, [userId]);

  // Initial mount
  useEffect(() => {
    fetchProjects();
    fetchOpenRouterStatus();

    // Clean up legacy cached chat messages and drafts
    try {
      localStorage.removeItem("stackpilot_dashboard_messages");
      localStorage.removeItem("stackpilot_dashboard_title");
      localStorage.removeItem("stackpilot_dashboard_draft");
      localStorage.removeItem("stackpilot_workspace_messages");

      const pName = localStorage.getItem("stackpilot_project_name");
      if (pName) {
        setWorkspaceProject(pName);
        setProjectNameDraft(pName);
      }
    } catch { }
  }, [fetchProjects, fetchOpenRouterStatus]);

  // Track backend health
  useEffect(() => {
    checkHealth().then(setAiBackendOnline);
    const interval = setInterval(() => {
      checkHealth().then(setAiBackendOnline);
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const chat = useDashboardChat();

  // User name resolution from session or storage
  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name.trim());
    } else if (session?.user?.email) {
      if (session.user.email.includes("shivamsrawat7") || session.user.email.toLowerCase().includes("rawat")) {
        setUserName("Shivam Rawat");
      } else {
        const emailParts = session.user.email.split("@")[0].replace(/[0-9_.-]/g, " ").trim();
        const formatted = emailParts
          ? emailParts
            .split(" ")
            .filter(Boolean)
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
          : "Shivam Rawat";
        setUserName(formatted || "Shivam Rawat");
      }
    }

    try {
      const stored =
        localStorage.getItem("stackpilot_fullname") ||
        localStorage.getItem("stackpilot_username");
      if (stored && stored.trim()) setUserName(stored.trim());
    } catch { }
  }, [session]);

  const isHeadingPopped = folderHovered || headingHovered || folderOpen || chat.messages.length > 0;

  const authPhotos = [
    <img
      key="login"
      src="/auth/Login.png"
      alt="Login screen"
      className="w-full h-full object-cover rounded-md"
    />,
    <img
      key="signup"
      src="/auth/Signup.png"
      alt="Signup screen"
      className="w-full h-full object-cover rounded-md"
    />,
    <img
      key="roboto"
      src="/auth/Transhumans - Roboto.png"
      alt="Roboto character"
      className="w-full h-full object-cover rounded-md"
    />,
  ];

  // Launch Project directly from Prompt into IDE (skipping onboarding)
  const handleLaunchProjectFromPrompt = async (promptQuery: string) => {
    const query = promptQuery.trim();
    if (!query) return;

    // Derive a clean project name from the prompt
    const pLower = query.toLowerCase();
    let nameGuess = "my-app";
    if (pLower.includes("dashboard")) nameGuess = "analytics-dashboard";
    else if (pLower.includes("saas")) nameGuess = "saas-application";
    else if (pLower.includes("api")) nameGuess = "rest-api-service";
    else if (pLower.includes("whiteboard") || pLower.includes("canvas")) nameGuess = "collab-whiteboard";
    else if (pLower.includes("chat") || pLower.includes("ai")) nameGuess = "ai-chat-app";
    else {
      const words = query.split(/\s+/).slice(0, 3).join("-").replace(/[^a-z0-9-]/gi, "").toLowerCase();
      if (words) nameGuess = words;
    }

    try {
      // Direct scaffold into IDE
      const scaffoldRes = await fetch(`${API_BASE_URL}/projects/scaffold-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: nameGuess,
          prompt: query,
          description: query,
          frontend: "react",
          backend: "express",
          database: "sqlite",
          language: "typescript",
          styling: "tailwindcss",
          model: selectedModel.id,
          ownerId: userId,
          libraries: ["lucide-react", "tailwindcss", "axios"],
        }),
      });

      if (scaffoldRes.ok) {
        const data = await scaffoldRes.json();
        if (data?.projectId) {
          router.push(`/project/${data.projectId}/ide`);
          return;
        }
      }
    } catch (err: any) {
      console.warn("Direct scaffold fallback:", err);
    }

    // Fallback: send prompt to active chat
    chat.send(query, {
      model: selectedModel.id,
      effort: "high",
    });
  };

  const handleSaveProjectName = () => {
    const trimmed = projectNameDraft.trim();
    if (trimmed) {
      setWorkspaceProject(trimmed);
      try {
        localStorage.setItem("stackpilot_project_name", trimmed);
      } catch { }
    }
    setIsEditingProjectName(false);
  };

  const handleDeleteProject = async (e: React.MouseEvent, pId: string) => {
    e.stopPropagation();
    try {
      await fetch(`${API_BASE_URL}/projects/${pId}`, { method: "DELETE" });
      fetchProjects();
    } catch { }
  };

  const handleScaffoldProjectFromModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const pName = newProjectName.trim() || "my-app";
    const cleanName = pName.toLowerCase().replace(/[^a-z0-9-_]/g, "-");

    setIsScaffoldingModal(true);
    setScaffoldModalError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/projects/scaffold-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: cleanName,
          prompt: `Scaffold fullstack application named ${cleanName} with ${frontendFramework} frontend and ${backendFramework} backend`,
          description: `Full-stack ${frontendFramework} + ${backendFramework} application`,
          frontend: frontendFramework,
          backend: backendFramework,
          database: "sqlite",
          language: "typescript",
          styling: "tailwindcss",
          model: selectedModel.id,
          ownerId: userId,
          libraries: ["lucide-react", "tailwindcss", "axios"],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to scaffold project");
      }

      const data = await res.json();
      if (data?.projectId) {
        setShowModal(false);
        router.push(`/project/${data.projectId}/ide`);
        return;
      }
      throw new Error("No project ID returned by server");
    } catch (err: any) {
      console.error("Modal scaffold error:", err);
      setScaffoldModalError(err?.message || "Failed to scaffold project");
    } finally {
      setIsScaffoldingModal(false);
    }
  };

  const menuItems = [
    {
      label: "AI Workspace",
      ariaLabel: "Go to Workspace",
      onClick: () => setActiveNav("Workspace"),
    },
    {
      label: "Recent Projects",
      ariaLabel: "View Projects",
      onClick: () => {
        fetchProjects();
        setActiveNav("Projects");
      },
    },
    {
      label: "AI Provider (BYOK)",
      ariaLabel: "OpenRouter Setup",
      onClick: () => router.push("/setup/ai"),
    },
  ];

  const socialItems = [
    { label: "GitHub", link: "https://github.com/shivam7-gif/StackPilot" },
    { label: "Docs", link: "#" },
    { label: "Community", link: "#" },
  ];

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-white text-neutral-900 font-sans antialiased">
      {/* ─── SLIDING DRAWER MENU ─── */}
      <StaggeredMenu
        position="left"
        items={menuItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        menuButtonColor="#18181b"
        openMenuButtonColor="#18181b"
        changeMenuColorOnOpen={true}
        colors={["#18181b", "#ea580c"]}
        accentColor="#ea580c"
        userName={userName}
        projectName={workspaceProject}
        isFixed={true}
      />

      {/* ─── MAIN CHAT WORKSPACE ─── */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden">
        {/* Fixed Top Navigation Toolbar */}
        <header className="flex items-center justify-between px-4 sm:px-6 h-13 shrink-0 border-b border-neutral-200/90 bg-white z-20 select-none">
          {/* Left: Breadcrumbs & Navigation Tabs */}
          <div className="flex items-center gap-2.5 pl-24 sm:pl-28 md:pl-32 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
              {/* View Selector (Workspace vs Projects) */}
              <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setActiveNav("Workspace")}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer ${activeNav === "Workspace"
                    ? "bg-white text-neutral-900 shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-800"
                    }`}
                >
                  Workspace
                </button>
                <button
                  type="button"
                  onClick={() => {
                    fetchProjects();
                    setActiveNav("Projects");
                  }}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer ${activeNav === "Projects"
                    ? "bg-white text-neutral-900 shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-800"
                    }`}
                >
                  Projects ({projectsList.length})
                </button>
              </div>
            </div>
          </div>

          {/* Right: Actions & Integrations */}
          <div className="flex items-center gap-2">
            {/* Topbar AI Model Selector powered by GlideSelect */}
            <GlideSelect
              options={DEFAULT_MODELS.map((m) => ({
                value: m.id,
                label: m.label,
                tag: m.tag,
              }))}
              value={selectedModel.id}
              onChange={(mId) => {
                const found = DEFAULT_MODELS.find((m) => m.id === mId);
                if (found) setSelectedModel(found);
              }}
              ariaLabel="AI Model Selection"
              showTags
              placement="bottom"
              align="right"
              size="sm"
              radius={8}
              menuWidth={240}
              accentColor="#ea580c"
              surfaceColor="#ffffff"
              highlightColor="#f4f4f5"
              textColor="#18181b"
            />

            {/* New Project Button */}
            <button
              type="button"
              onClick={() => {
                setScaffoldModalError(null);
                setShowModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
              title="Create or scaffold a new project"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>
        </header>

        {/* ─── BODY CONTAINER ─── */}
        <div className="flex-1 overflow-hidden flex flex-col relative min-h-0 bg-white">
          {activeNav === "Projects" ? (
            /* RETURNING USERS: RECENT PROJECTS DIRECTORY */
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-200">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900">Your Projects</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Live workspaces and scaffolded applications associated with your account
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setScaffoldModalError(null);
                    setShowModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Project</span>
                </button>
              </div>

              {projectsList.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-neutral-200 rounded-2xl p-8">
                  <FolderCode className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-neutral-800">No projects yet</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Describe what you want to build in the Workspace to generate your first project.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveNav("Workspace")}
                    className="mt-4 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-black transition"
                  >
                    Go to Workspace
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {projectsList.map((p) => (
                    <div
                      key={p.projectId}
                      onClick={() => {
                        router.push(`/project/${p.projectId}/ide`);
                      }}
                      className="group flex items-center justify-between p-4 rounded-xl border border-neutral-200 hover:border-orange-500/50 hover:bg-orange-50/10 transition bg-white shadow-2xs cursor-pointer"
                    >
                      <div className="space-y-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-sm text-neutral-900 group-hover:text-orange-950 transition">
                            {p.projectName}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${p.status === "draft"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              }`}
                          >
                            {p.status || "ready"}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 line-clamp-1">{p.description || "No description"}</p>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400">
                          <span>Stack: {p.frontend || "React"} + {p.backend || "Express"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteProject(e, p.projectId)}
                          className="p-1.5 rounded text-neutral-300 hover:text-red-600 transition"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white group-hover:bg-orange-600 text-xs font-semibold transition flex items-center gap-1">
                          <span>Open IDE</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : chat.messages.length === 0 ? (
            /* STAGE D: NEW USER / EMPTY WORKSPACE: FOLDER + HEADING POP-UP */
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full select-none overflow-y-auto">
              {/* Heading Pop-up */}
              <div
                onMouseEnter={() => setHeadingHovered(true)}
                onMouseLeave={() => setHeadingHovered(false)}
                className="flex flex-col items-center justify-center mt-1 mb-14 sm:mb-18 cursor-default z-10"
              >
                <div
                  className={`flex flex-col items-center text-center transition-all duration-500 transform ${isHeadingPopped
                    ? "opacity-100 -translate-y-6 sm:-translate-y-8 scale-100 filter blur-0 pointer-events-auto"
                    : "opacity-0 translate-y-4 scale-90 filter blur-[6px] pointer-events-none"
                    }`}
                  style={{
                    transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900 drop-shadow-sm">
                    What are we building today,{" "}
                    <span className="text-[#5227FF]">
                      {userName}
                    </span>
                    ?
                  </h1>
                </div>
              </div>

              {/* Center Stage: Interactive 3D Folder with Auth Photos */}
              <div className="w-full flex items-center justify-center mt-4 mb-6 py-4">
                <Folder
                  color="#5227FF"
                  size={2}
                  items={authPhotos}
                  isOpen={folderOpen}
                  onOpenChange={setFolderOpen}
                  onHoverChange={setFolderHovered}
                />
              </div>
            </div>
          ) : (
            /* CONVERSATION STREAMING */
            <MessageList
              messages={chat.messages}
              isStreaming={chat.isStreaming}
              isThinking={chat.isThinking}
              onRegenerateLast={chat.regenerateLast}
              onRetryLast={chat.retryLast}
              onOpenIde={(pId) => router.push(`/project/${pId}/ide`)}
            />
          )}

          {activeNav === "Workspace" && (
            <ChatComposer
              value={composerDraft}
              onChange={setComposerDraft}
              onSend={() => {
                if (composerDraft.trim()) {
                  handleLaunchProjectFromPrompt(composerDraft);
                  setComposerDraft("");
                }
              }}
              onStop={chat.stop}
              isStreaming={chat.isStreaming}
              models={DEFAULT_MODELS}
              selectedModelId={selectedModel.id}
              onModelChange={(mId) => {
                const found = DEFAULT_MODELS.find((m) => m.id === mId);
                if (found) setSelectedModel(found);
              }}
              modelName={selectedModel.label}
            />
          )}
        </div>
      </main>

      {/* ─── SCAFFOLD NEW PROJECT MODAL ─── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => !isScaffoldingModal && setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 sm:p-7 bg-white text-neutral-900 shadow-2xl border border-neutral-200 select-none relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-neutral-100">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-neutral-900">
                  Scaffold New Project
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Configure your frameworks to initialize an IDE workspace
                </p>
              </div>
              <button
                type="button"
                disabled={isScaffoldingModal}
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleScaffoldProjectFromModal} className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  disabled={isScaffoldingModal}
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., ai-analytics-app"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-neutral-300 focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/15 outline-none transition placeholder:text-neutral-400 text-neutral-900"
                />
              </div>

              {/* Frontend Framework Selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Frontend Framework
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "react", label: "React (Vite)" },
                    { id: "nextjs", label: "Next.js" },
                    { id: "vue", label: "Vue.js" },
                    { id: "svelte", label: "Svelte" },
                  ].map((fw) => (
                    <button
                      key={fw.id}
                      type="button"
                      disabled={isScaffoldingModal}
                      onClick={() => setFrontendFramework(fw.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition cursor-pointer ${
                        frontendFramework === fw.id
                          ? "border-[#5227FF] bg-violet-50 text-[#5227FF] font-semibold"
                          : "border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {fw.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Backend Framework Selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Backend Framework
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "express", label: "Express.js" },
                    { id: "fastapi", label: "FastAPI" },
                    { id: "nestjs", label: "NestJS" },
                    { id: "django", label: "Django" },
                  ].map((bw) => (
                    <button
                      key={bw.id}
                      type="button"
                      disabled={isScaffoldingModal}
                      onClick={() => setBackendFramework(bw.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition cursor-pointer ${
                        backendFramework === bw.id
                          ? "border-[#5227FF] bg-violet-50 text-[#5227FF] font-semibold"
                          : "border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {bw.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Alert */}
              {scaffoldModalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                  {scaffoldModalError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  disabled={isScaffoldingModal}
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScaffoldingModal || !newProjectName.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScaffoldingModal ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Scaffolding Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Scaffold Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
