"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/config/socket";
import { useRouter } from "next/navigation";

type OverlayStep = "idle" | "creating" | "logs" | "done";

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function LogLine({ text, i }: { text: string; i: number }) {
  return (
    <div
      className="text-[12px] font-mono py-0.5"
      style={{
        color: text.startsWith("✓")
          ? "#16a34a"
          : text.startsWith("✗")
            ? "#dc2626"
            : "#525252",
        animationDelay: `${i * 30}ms`,
      }}
    >
      {text}
    </div>
  );
}

const NAV_ITEMS = [
  {
    label: "Chat",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    label: "Projects",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Settings",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const [frontendFramework, setFrontendFramework] = useState("");
  const [backendFramework, setBackendFramework] = useState("");
  const [projectName, setProjectName] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [overlayStep, setOverlayStep] = useState<OverlayStep>("idle");
  const router = useRouter();

  const [userName, setUserName] = useState<string>("Shiva");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [aiTyping, setAiTyping] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeNav, setActiveNav] = useState("Chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch session / username
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.name) {
          const first = data.user.name.trim().split(" ")[0];
          setUserName(first || data.user.name);
        } else if (data?.user?.email) {
          setUserName(data.user.email.split("@")[0]);
        }
      })
      .catch(() => {});

    try {
      const stored = localStorage.getItem("stackpilot_username");
      if (stored) setUserName(stored);
    } catch {}
  }, []);

  // Socket connection
  useEffect(() => {
    socket.connect();
    socket.on("connect", () => console.log("connected:", socket.id));
    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err);
      setLogs((p) => [...p, `[Connection issue] ${err.message}`]);
    });
    socket.on("project-log", (log) => setLogs((p) => [...p, String(log)]));
    socket.on("project-step", (step: string) => {
      if (step === "folders") setOverlayStep("creating");
      if (step === "scaffolding") setOverlayStep("logs");
      if (step === "done") setOverlayStep("done");
    });
    socket.on("project-done", ({ projectId }) => {
      setOverlayStep("done");
      setTimeout(() => router.push(`/project/${projectId}`), 1000);
    });
    socket.on("engine-output", (payload: unknown) => {
      const text = String(payload ?? "").replace(/\r/g, "");
      const lines = text.split(/\n/).filter(Boolean);
      if (lines.length === 0) return;
      setLogs((prev) => [...prev, ...lines]);
      setChatMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "ai") {
          return [
            ...prev.slice(0, -1),
            { ...last, text: `${last.text}\n${lines.join("\n")}` },
          ];
        }
        return [...prev, { role: "ai", text: lines.join("\n") }];
      });
    });
    socket.on("engine-status", (status: { status?: string }) => {
      if (status?.status === "complete" || status?.status === "error") {
        setAiTyping(false);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("project-log");
      socket.off("project-step");
      socket.off("project-done");
      socket.off("engine-output");
      socket.off("engine-status");
      socket.disconnect();
    };
  }, [router]);

  function handleCreateProject() {
    socket.emit("createProject", {
      frontend: frontendFramework,
      backend: backendFramework,
      projectName,
    });
    setOverlayStep("creating");
    setShowModal(false);
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, aiTyping]);

  const handleSend = () => {
    const t = chatInput.trim();
    if (!t) return;
    setChatMessages((p) => [...p, { role: "user", text: t }]);
    setChatInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setAiTyping(true);
    setChatMessages((p) => [
      ...p,
      { role: "ai", text: "Processing your request with StackPilot..." },
    ]);
    socket.emit("engine:run", { prompt: t });
  };

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-black font-sans antialiased">
      {/* ─── SIDEBAR ─── */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300 bg-white border-r border-black/10"
        style={{
          width: sidebarCollapsed ? 0 : 250,
          overflow: "hidden",
        }}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs tracking-wider">
              SP
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-black">
              StackPilot
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ label, icon }) => {
            const active = activeNav === label;
            return (
              <button
                key={label}
                onClick={() => setActiveNav(label)}
                className={`w-full flex items-center gap-3 px-3.5 h-10 rounded-xl text-[13px] font-medium transition-all text-left ${
                  active
                    ? "bg-black text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* User profile footer */}
        <div className="p-4 border-t border-black/10 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-50 border border-black/5">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[12px] font-bold shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-black truncate">
                {userName}
              </p>
              <p className="text-[11px] text-neutral-400 truncate">
                Workspace
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 h-14 shrink-0 border-b border-black/10 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed((p) => !p)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-black transition"
              title="Toggle sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>
            <span className="text-sm font-medium text-neutral-500">Dashboard</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-semibold bg-black text-white hover:bg-neutral-800 transition active:scale-[0.98]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Project
            </button>
          </div>
        </header>

        {/* Center Canvas */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
            {/* Minimalist Heading: "what's in your mind today, {username}" */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black">
                What&apos;s on your mind today,{" "}
                <span className="font-bold text-black">{userName}</span>?
              </h1>
            </div>

            {/* Chat Messages (if active) */}
            {chatMessages.length > 0 && (
              <div className="w-full mb-6 max-h-72 overflow-y-auto space-y-3 px-1">
                {chatMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "ai" && (
                      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">
                        SP
                      </div>
                    )}
                    <div
                      className={`text-[13px] px-4 py-2.5 max-w-[80%] leading-relaxed ${
                        m.role === "user"
                          ? "bg-black text-white rounded-2xl rounded-tr-sm"
                          : "bg-neutral-100 text-black border border-black/5 rounded-2xl rounded-tl-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {aiTyping && (
                  <div className="flex gap-2.5 items-center">
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      SP
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-neutral-100 text-neutral-500 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Clean Prompt Input Card */}
            <div className="w-full rounded-2xl border border-black/15 bg-white p-4 shadow-sm transition focus-within:border-black/50 focus-within:shadow-md">
              <textarea
                ref={textareaRef}
                value={chatInput}
                onChange={(e) => {
                  setChatInput(e.target.value);
                  autoResize();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask anything or describe what you want to build..."
                rows={1}
                className="w-full outline-none resize-none text-[15px] bg-transparent leading-relaxed text-black placeholder:text-neutral-400 min-h-[36px] max-h-[180px]"
              />

              <div className="flex items-center justify-between pt-3 mt-1 border-t border-black/5">
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <span>Press <kbd className="px-1.5 py-0.5 rounded border border-black/10 bg-neutral-50 text-[10px] font-mono text-neutral-600">Enter</kbd> to submit</span>
                </div>

                <button
                  onClick={handleSend}
                  disabled={!chatInput.trim()}
                  className="flex items-center justify-center px-4 h-8 rounded-full text-xs font-semibold bg-black text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <span>Send</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-1.5">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Build Log Card if building */}
            {overlayStep !== "idle" && (
              <div className="w-full mt-6 rounded-2xl p-4 bg-neutral-900 text-white border border-neutral-800 shadow-md">
                <div className="flex items-center gap-2 mb-2 text-xs font-medium">
                  {overlayStep !== "done" ? <Spinner /> : <span className="text-green-400">✓</span>}
                  <span>
                    {overlayStep === "creating" && "Creating project structure..."}
                    {overlayStep === "logs" && "Scaffolding dependencies..."}
                    {overlayStep === "done" && "Project ready! Redirecting..."}
                  </span>
                </div>
                <div className="space-y-0.5 max-h-36 overflow-y-auto text-xs font-mono">
                  {logs.map((log, i) => (
                    <LogLine key={i} text={log} i={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ─── CREATE PROJECT MODAL ─── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl p-7 bg-white text-black shadow-2xl border border-black/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-black">Create New Project</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  StackPilot will scaffold it for you
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: "Project Name",
                  placeholder: "my-awesome-app",
                  setter: setProjectName,
                },
                {
                  label: "Frontend Framework",
                  placeholder: "react / next / vue",
                  setter: setFrontendFramework,
                },
                {
                  label: "Backend Framework",
                  placeholder: "express / fastapi / django",
                  setter: setBackendFramework,
                },
              ].map(({ label, placeholder, setter }) => (
                <div key={label}>
                  <label className="block text-[11px] font-semibold mb-1 uppercase tracking-wider text-neutral-500">
                    {label}
                  </label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full px-4 h-10 rounded-xl text-sm outline-none bg-neutral-50 border border-black/10 focus:border-black text-black transition placeholder:text-neutral-400"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleCreateProject}
              className="w-full h-11 rounded-full text-sm font-semibold mt-6 bg-black text-white hover:bg-neutral-800 transition active:scale-[0.98]"
            >
              Create Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
