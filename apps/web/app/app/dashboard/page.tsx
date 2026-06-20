"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/config/socket";
import { useRouter } from "next/navigation";

type OverlayStep = "idle" | "creating" | "logs" | "done";
type Project = { id: string; name: string; frontend: string; backend: string; recent: string[] };

const SAVED_PROMPTS = [
  { bg: "#e8f5e9", iconBg: "#4caf50", title: "New Project", bold: "New", desc: "Scaffold a full-stack app with your chosen tech stack." },
  { bg: "#fff8e1", iconBg: "#e59400", title: "Creative Deploy", bold: "Creative", desc: "Ship your project and get a live preview instantly." },
  { bg: "#e3f2fd", iconBg: "#2196f3", title: "Debug Code", bold: "Debug", desc: "Ask Karma to find and fix bugs in your codebase." },
];

const NAV_ITEMS = [
  { label: "New Chat", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" /></svg> },
  { label: "Adaptive Chat", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg> },
  { label: "System Analysis", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" strokeLinecap="round" /></svg> },
  { label: "Data Flow", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
];

const MOCK_PROJECTS: Project[] = [
  { id: "p1", name: "Energy Optimization", frontend: "react", backend: "express", recent: ["From data usage to model..", "Signals filtered before fu..", "Every layer is designed to..", "Without increasing enviro.."] },
  { id: "p2", name: "Climate Model", frontend: "next", backend: "fastapi", recent: [] },
  { id: "p3", name: "Resource Mapping", frontend: "vue", backend: "django", recent: [] },
];

const PROJ_ICONS = [
  <svg key="p1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>,
  <svg key="p2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" /></svg>,
  <svg key="p3" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
];

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function LogLine({ text, i }: { text: string; i: number }) {
  return (
    <div className="text-[12px] font-mono py-0.5" style={{ color: text.startsWith("✓") ? "#4ade80" : text.startsWith("✗") ? "#f87171" : "#a3a3a3", animationDelay: `${i * 40}ms` }}>
      {text}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PROMPT CARD ICON SVGs
═══════════════════════════════════════════════════ */
const PROMPT_ICONS = [
  <svg key="1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>,
  <svg key="2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  <svg key="3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" strokeLinecap="round" /></svg>,
];

export default function DashboardPage() {
  /* ── original state (untouched) ── */
  const [frontendFramework, setFrontendFramework] = useState("");
  const [backendFramework, setBackendFramework] = useState("");
  const [projectName, setProjectName] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [overlayStep, setoverlayStep] = useState<OverlayStep>("idle");
  const router = useRouter();

  /* ── UI state ── */
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [aiTyping, setAiTyping] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeNav, setActiveNav] = useState("Adaptive Chat");
  const [expandedProj, setExpandedProj] = useState<string | null>("p1");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── socket (original, untouched) ── */
  useEffect(() => {
    socket.connect();
    socket.on("connect", () => console.log("connected:", socket.id));
    socket.on("project-log", (log) => setLogs(p => [...p, String(log)]));
    socket.on("project-step", (step: string) => {
      if (step === "folders") setoverlayStep("creating");
      if (step === "scaffolding") setoverlayStep("logs");
      if (step === "done") setoverlayStep("done");
    });
    socket.on("project-done", ({ projectId }) => {
      setoverlayStep("done");
      setTimeout(() => router.push(`/project/${projectId}`));
    });
    return () => { socket.off("connect"); socket.off("project-log"); socket.off("project-step"); socket.off("project-done"); socket.disconnect(); };
  }, []);

  function handleCreateProject() {
    socket.emit("createProject", { frontend: frontendFramework, backend: backendFramework, projectName });
    setoverlayStep("creating");
    setShowModal(false);
  }

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, aiTyping]);

  const handleSend = () => {
    const t = chatInput.trim(); if (!t) return;
    setChatMessages(p => [...p, { role: "user", text: t }]);
    setChatInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setAiTyping(true);
    setTimeout(() => {
      setAiTyping(false);
      setChatMessages(p => [...p, { role: "ai", text: `I can help you with "${t}". Let's build something amazing together with StackPilot!` }]);
    }, 900 + Math.random() * 700);
  };

  const autoResize = () => {
    const el = textareaRef.current; if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 130) + "px";
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans" style={{ background: "#f4f4ef", color: "#1a1a1a" }}>

      {/* ════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════ */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300"
        style={{ width: sidebarCollapsed ? 0 : 240, overflow: "hidden", background: "#f9f9f6", borderRight: "1px solid #e6e6e0" }}
      >
        {/* Logo row */}
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-3 shrink-0">

          <span className="font-semibold text-[15px] tracking-tight" style={{ color: "#1a1a1a" }}>StackPilot</span>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 shrink-0">
          <div className="flex items-center gap-2 px-3 h-9 rounded-2xl text-[13px]" style={{ background: "#eeeeea", border: "1px solid #e0e0da" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" strokeLinecap="round" /></svg>
            <span style={{ color: "#bbb" }}>Search here...</span>
          </div>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-3" style={{ scrollbarWidth: "none" }}>

          {/* Navigation */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-2 px-1" style={{ color: "#bbb" }}>Navigation</p>
            <div className="space-y-0.5">
              {NAV_ITEMS.map(({ label, icon }) => {
                const active = activeNav === label;
                return (
                  <button key={label} onClick={() => setActiveNav(label)}
                    className="w-full flex items-center gap-2.5 px-3 h-9 rounded-2xl text-[13px] transition-all text-left"
                    style={{ background: active ? "#cff589" : "transparent", color: active ? "#1a3a00" : "#555", fontWeight: active ? 600 : 400 }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#eeeeea"; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ color: active ? "#1a3a00" : "#999" }}>{icon}</span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Projects */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-2 px-1" style={{ color: "#bbb" }}>Projects</p>
            <div className="space-y-0.5">
              <button onClick={() => setShowModal(true)}
                className="w-full flex items-center gap-2.5 px-3 h-9 rounded-2xl text-[13px] transition-all text-left"
                style={{ color: "#555" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#eeeeea")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                New Project
              </button>

              {MOCK_PROJECTS.map((proj, pi) => {
                const exp = expandedProj === proj.id;
                return (
                  <div key={proj.id}>
                    <button
                      onClick={() => setExpandedProj(exp ? null : proj.id)}
                      className="w-full flex items-center justify-between px-3 h-9 rounded-2xl text-[13px] font-medium transition-all text-left"
                      style={{ color: "#333" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#eeeeea")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div className="flex items-center gap-2.5">
                        <span style={{ color: "#888" }}>{PROJ_ICONS[pi]}</span>
                        <span className="truncate max-w-[120px]">{proj.name}</span>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#bbb" strokeWidth="1.5"
                        style={{ transform: exp ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.18s" }}>
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                    </button>

                    {exp && proj.recent.length > 0 && (
                      <div className="pl-9 pt-0.5 pb-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "#ccc" }}>Recent</p>
                        {proj.recent.map((r, i) => (
                          <button key={i} className="w-full text-left text-[12px] py-0.5 truncate transition-colors"
                            style={{ color: "#999" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "#1a1a1a")}
                            onMouseLeave={e => (e.currentTarget.style.color = "#999")}
                          >{r}</button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Your chat */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-2 px-1" style={{ color: "#bbb" }}>Your chat</p>
            {["From data usage to model..", "Signals filtered before fu.."].map((item, i) => (
              <button key={i} className="w-full text-left text-[12px] px-3 py-1 rounded-xl truncate transition-colors"
                style={{ color: "#999" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#1a1a1a")}
                onMouseLeave={e => (e.currentTarget.style.color = "#999")}
              >{item}</button>
            ))}
          </div>
        </div>

        {/* User footer */}
        <div className="shrink-0 px-4 pb-4 pt-2" style={{ borderTop: "1px solid #e6e6e0" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl" style={{ background: "#1a1a1a" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
              style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)" }}>U</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">You</p>
              <p className="text-[11px]" style={{ color: "#666" }}>Free plan</p>
            </div>
            <button className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg"
              style={{ background: "#a3e635", color: "#1a1a1a" }}>Upgrade</button>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════
          MAIN
      ════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between px-6 h-12 shrink-0"
          style={{ borderBottom: "1px solid #e6e6e0", background: "#f9f9f6" }}>
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarCollapsed(p => !p)}
              className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
              style={{ color: "#888" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#eeeeea")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" />
              </svg>
            </button>
            <span className="text-[14px] font-semibold" style={{ color: "#1a1a1a" }}>StackPilot</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#eeeeea", color: "#888" }}>v1.0</span>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#ccc" strokeWidth="1.5"><path d="M4 6l4 4 4-4" /></svg>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 h-8 rounded-2xl text-[13px] font-semibold transition-colors"
              style={{ background: "#1a1a1a", color: "#fff" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#333")}
              onMouseLeave={e => (e.currentTarget.style.background = "#1a1a1a")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
              New Project
            </button>
            <button className="flex items-center gap-1.5 px-4 h-8 rounded-2xl text-[13px] font-medium border transition-colors"
              style={{ borderColor: "#e0e0da", color: "#555", background: "transparent" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
              Export
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="max-w-2xl mx-auto px-6 py-8">

            {/* Hero */}
            <div className="text-center mb-7">
              <h1 className="text-[38px] font-bold leading-[1.15] tracking-tight mb-2" style={{ color: "#1a1a1a" }}>
                Build Smarter Apps
                <br />
                <span style={{ color: "#aaa", fontStyle: "italic", fontWeight: 400 }}>with Adaptive Intelligence</span>
              </h1>
              <p className="text-[14px]" style={{ color: "#bbb" }}>StackPilot scaffolds, edits, and deploys your full-stack projects.</p>
            </div>

            {/* Chat box */}
            <div className="rounded-3xl overflow-hidden mb-3"
              style={{ background: "#fff", border: "1px solid #e6e6e0", boxShadow: "0 4px 28px rgba(0,0,0,0.06)" }}>

              {/* Messages */}
              {chatMessages.length > 0 && (
                <div className="max-h-56 overflow-y-auto px-5 pt-4 space-y-3" style={{ scrollbarWidth: "none" }}>
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      {m.role === "ai" && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
                          style={{ background: "#cff589", color: "#1a3a00" }}>K</div>
                      )}
                      <div className="text-[13px] px-4 py-2.5 max-w-[78%] leading-relaxed" style={{
                        background: m.role === "user" ? "#1a1a1a" : "#f4f4ef",
                        color: m.role === "user" ? "#fff" : "#333",
                        borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      }}>{m.text}</div>
                    </div>
                  ))}
                  {aiTyping && (
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{ background: "#cff589", color: "#1a3a00" }}>K</div>
                      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl" style={{ background: "#f4f4ef" }}>
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}

              {/* Textarea */}
              <div className="px-5 pt-4 pb-2">
                <textarea ref={textareaRef} value={chatInput}
                  onChange={e => { setChatInput(e.target.value); autoResize(); }}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Ask anything you want..."
                  rows={1}
                  className="w-full outline-none resize-none text-[14px] bg-transparent leading-relaxed placeholder:text-[#ccc]"
                  style={{ color: "#1a1a1a", caretColor: "#1a1a1a", minHeight: 28, maxHeight: 130 }}
                />
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 pb-3">
                <div className="flex items-center gap-0.5">
                  {/* Attach */}
                  <button className="flex items-center justify-center w-9 h-9 rounded-2xl transition-colors" style={{ color: "#bbb" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f4f4ef")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")} title="Attach">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                  {/* Create image */}
                  <button className="flex items-center gap-1.5 px-3 h-9 rounded-2xl text-[12px] transition-colors" style={{ color: "#888" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f4f4ef")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                    Create an image
                  </button>
                  {/* Search web */}
                  <button className="flex items-center gap-1.5 px-3 h-9 rounded-2xl text-[12px] transition-colors" style={{ color: "#888" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f4f4ef")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
                    Search the web
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mic */}
                  <button className="w-9 h-9 flex items-center justify-center rounded-2xl transition-colors" style={{ color: "#bbb" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f4f4ef")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" /></svg>
                  </button>
                  {/* Send */}
                  <button onClick={handleSend} disabled={!chatInput.trim()}
                    className="w-9 h-9 flex items-center justify-center rounded-2xl transition-all"
                    style={{ background: chatInput.trim() ? "#a3e635" : "#eeeeea", color: chatInput.trim() ? "#1a1a1a" : "#ccc" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Saved prompts label */}
            <div className="flex items-center gap-1.5 mb-3 px-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <span className="text-[12px]" style={{ color: "#bbb" }}>Saved prompts</span>
            </div>

            {/* Prompt cards */}
            <div className="grid grid-cols-3 gap-3">
              {SAVED_PROMPTS.map(({ bg, iconBg, title, bold, desc }, i) => (
                <button key={title} onClick={() => setChatInput(title)}
                  className="text-left p-4 rounded-2xl transition-all"
                  style={{ background: bg, transition: "all 0.18s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: iconBg }}>
                    {PROMPT_ICONS[i]}
                  </div>
                  <p className="text-[13px] font-semibold mb-1" style={{ color: "#1a1a1a" }}>
                    <strong>{bold}</strong>{" "}{title.replace(bold, "").trim()}
                  </p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#777" }}>{desc}</p>
                </button>
              ))}
            </div>

            {/* Build log */}
            {overlayStep !== "idle" && (
              <div className="mt-5 rounded-2xl p-4" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                <div className="flex items-center gap-2 mb-2">
                  {overlayStep !== "done" && <span className="text-[#a3e635]"><Spinner /></span>}
                  {overlayStep === "done" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a3e635" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>}
                  <span className="text-[13px] font-medium text-white">
                    {overlayStep === "creating" && "Creating project structure..."}
                    {overlayStep === "logs" && "Scaffolding dependencies..."}
                    {overlayStep === "done" && "Project ready! Redirecting..."}
                  </span>
                </div>
                <div className="space-y-0.5 max-h-36 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                  {logs.map((log, i) => <LogLine key={i} text={log} i={i} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ════════════════════════════════════════
          CREATE PROJECT MODAL
      ════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-3xl p-7"
            style={{ background: "#fff", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[18px] font-bold" style={{ color: "#1a1a1a" }}>Create New Project</h2>
                <p className="text-[12px] mt-0.5" style={{ color: "#aaa" }}>StackPilot will scaffold it for you</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors text-[#888]"
                onMouseEnter={e => (e.currentTarget.style.background = "#f4f4ef")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-3">
              {[
                { label: "Project Name", placeholder: "my-awesome-app", setter: setProjectName },
                { label: "Frontend Framework", placeholder: "react / next / vue", setter: setFrontendFramework },
                { label: "Backend Framework", placeholder: "express / fastapi / django", setter: setBackendFramework },
              ].map(({ label, placeholder, setter }) => (
                <div key={label}>
                  <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider" style={{ color: "#aaa" }}>{label}</label>
                  <input type="text" placeholder={placeholder} onChange={e => setter(e.target.value)}
                    className="w-full px-4 h-11 rounded-2xl text-[13px] outline-none transition-all"
                    style={{ background: "#f4f4ef", border: "1.5px solid #e6e6e0", color: "#1a1a1a" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#a3e635")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#e6e6e0")}
                  />
                </div>
              ))}
            </div>

            <button onClick={handleCreateProject}
              className="w-full h-12 rounded-2xl text-[14px] font-bold mt-5 transition-all"
              style={{ background: "#1a1a1a", color: "#fff" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#a3e635"; e.currentTarget.style.color = "#1a1a1a"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#fff"; }}
            >
              Create Project
            </button>
            <p className="text-center text-[11px] mt-3" style={{ color: "#ccc" }}>
              This will scaffold your project using the StackPilot backend
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
