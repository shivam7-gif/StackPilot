"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/config/socket";
import { useRouter } from "next/navigation";
import { Attachment01Icon, Globe02Icon } from "@hugeicons/core-free-icons";
import PromptBar from "./PromptBar";
import StaggeredMenu from "./StaggeredMenu";
import Folder from "./Folder";
import catalog from "./openrouter-free-models.json";

const modelOptions = catalog.models.map((m) => ({
  value: m.id,
  label: m.label,
  badge: m.tag,
  description: m.bestFor,
}));

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

export default function DashboardPage() {
  const [frontendFramework, setFrontendFramework] = useState("");
  const [backendFramework, setBackendFramework] = useState("");
  const [projectName, setProjectName] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [overlayStep, setOverlayStep] = useState<OverlayStep>("idle");
  const router = useRouter();

  const [userName, setUserName] = useState<string>("Shivam Rawat");
  const [folderHovered, setFolderHovered] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [headingHovered, setHeadingHovered] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [aiTyping, setAiTyping] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeNav, setActiveNav] = useState("Chat");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isHeadingPopped = folderHovered || headingHovered || folderOpen || chatMessages.length > 0;

  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);

  const ask = async ({
    text,
    attachments,
    model,
    effort,
    signal,
  }: {
    text: string;
    attachments?: string[];
    model?: string;
    effort?: string;
    signal?: AbortSignal;
  }) => {
    setChatMessages((p) => [...p, { role: "user", text }]);
    setAiTyping(true);
    setChatMessages((p) => [
      ...p,
      {
        role: "ai",
        text: `Processing request with ${model || "Nova 3"} (${effort || "Medium"} effort)...`,
      },
    ]);

    socket.emit("engine:run", {
      prompt: text,
      model,
      effort,
      attachments,
    });

    if (signal) {
      signal.addEventListener("abort", () => {
        socket.emit("engine:stop");
        setAiTyping(false);
        setBusy(false);
      });
    }
  };

  const send = async (
    text: string,
    {
      attachments,
      model,
      effort,
    }: {
      attachments: string[];
      model: { key?: string; value?: string; name?: string; label?: string };
      effort: string;
    }
  ) => {
    setBusy(true);
    controller.current = new AbortController();
    const modelId = model.value || model.key || catalog.defaultModelId;
    await ask({
      text,
      attachments,
      model: modelId,
      effort,
      signal: controller.current.signal,
    }).catch(() => {});
    setBusy(false);
  };

  const pickFiles = (): Promise<string[]> => {
    return new Promise((resolve) => {
      if (typeof document === "undefined") return resolve([]);
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.onchange = () => {
        const files = Array.from(input.files || []).map((f) => f.name);
        resolve(files);
      };
      input.click();
    });
  };

  const transcribe = (): Promise<string> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve("");
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser.");
        resolve("");
        return;
      }
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event: any) => {
          const transcript = event.results[0]?.[0]?.transcript || "";
          resolve(transcript);
        };
        recognition.onerror = () => {
          resolve("");
        };
        recognition.start();
      } catch {
        resolve("");
      }
    });
  };

  // Fetch session / username
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.name) {
          // Display the user's full name without truncating
          setUserName(data.user.name.trim());
        } else if (data?.user?.email) {
          if (data.user.email.includes("shivamsrawat7") || data.user.email.toLowerCase().includes("rawat")) {
            setUserName("Shivam Rawat");
          } else {
            const emailParts = data.user.email.split("@")[0].replace(/[0-9_.-]/g, " ").trim();
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
      })
      .catch(() => {});

    try {
      const stored =
        localStorage.getItem("stackpilot_fullname") ||
        localStorage.getItem("stackpilot_username");
      if (stored && stored.trim()) setUserName(stored.trim());
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
        setBusy(false);
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
    if (chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, aiTyping]);

  const menuItems = [
    {
      label: "Chat",
      ariaLabel: "Go to Chat",
      onClick: () => setActiveNav("Chat"),
    },
    {
      label: "Projects",
      ariaLabel: "View Projects",
      onClick: () => setActiveNav("Projects"),
    },
    {
      label: "New Project",
      ariaLabel: "Create New Project",
      onClick: () => setShowModal(true),
    },
    {
      label: "Settings",
      ariaLabel: "Open Settings",
      onClick: () => setActiveNav("Settings"),
    },
  ];

  const socialItems = [
    { label: "GitHub", link: "https://github.com/shivam7-gif/StackPilot" },
    { label: "Docs", link: "#" },
    { label: "Community", link: "#" },
  ];

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
      alt="Auth illustration"
      className="w-full h-full object-cover rounded-md"
    />,
  ];

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-white text-black font-sans antialiased">
      {/* ─── SLIDING DASHBOARD MENU (React Bits StaggeredMenu) ─── */}
      <StaggeredMenu
        position="left"
        items={menuItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        menuButtonColor="#111"
        openMenuButtonColor="#111"
        changeMenuColorOnOpen={true}
        colors={["#18181b", "#5227FF"]}
        accentColor="#5227FF"
        userName={userName}
        isFixed={true}
      />

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 h-14 shrink-0 border-b border-black/10 bg-white z-20">
          <div className="flex items-center gap-3 pl-24 md:pl-28">
            <span className="text-sm font-semibold tracking-tight text-neutral-800">StackPilot</span>
            <span className="text-neutral-300">/</span>
            <span className="text-sm font-medium text-neutral-500">{activeNav}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-semibold bg-black text-white hover:bg-[#5227FF] transition active:scale-[0.98] shadow-sm"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Project
            </button>
          </div>
        </header>

        {/* Center Canvas */}
        <div className="flex-1 overflow-y-auto px-4 flex flex-col items-center justify-center relative pb-36 min-h-0">
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
            {/* Pop-out Heading: springs out when hovering on folder */}
            <div
              className="w-full min-h-[80px] flex flex-col items-center justify-center mb-24 select-none z-10"
              onMouseEnter={() => setHeadingHovered(true)}
              onMouseLeave={() => setHeadingHovered(false)}
            >
              <div
                className={`flex flex-col items-center text-center transition-all duration-500 transform ${
                  isHeadingPopped
                    ? "opacity-100 translate-y-0 scale-100 filter blur-0 pointer-events-auto"
                    : "opacity-0 translate-y-6 scale-90 filter blur-[6px] pointer-events-none"
                }`}
                style={{
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900 drop-shadow-sm">
                  What&apos;s on your mind today,{" "}
                  <span className="text-[#5227FF]">
                    {userName}
                  </span>
                  ?
                </h1>
              </div>
            </div>

            {/* Chat Messages (if active) */}
            {chatMessages.length > 0 && (
              <div className="w-full max-w-2xl mb-6 max-h-56 overflow-y-auto space-y-3 px-1">
                {chatMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "ai" && (
                      <div className="w-6 h-6 rounded-full bg-[#5227FF] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">
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
                    <div className="w-6 h-6 rounded-full bg-[#5227FF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      SP
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-neutral-100 text-neutral-500 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5227FF] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5227FF] animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5227FF] animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Center Stage: Happening Animated 3D Interactive Folder with Auth Photos */}
            <div className="w-full flex items-center justify-center my-6 py-4">
              <Folder
                color="#5227FF"
                size={2}
                items={authPhotos}
                isOpen={folderOpen}
                onOpenChange={setFolderOpen}
                onHoverChange={setFolderHovered}
              />
            </div>

            {/* Build Log Card if building */}
            {overlayStep !== "idle" && (
              <div className="w-full max-w-2xl mt-6 rounded-2xl p-4 bg-neutral-900 text-white border border-neutral-800 shadow-md">
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

        {/* Docked Prompt Bar with Margin from Bottom */}
        <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
          <div className="w-full max-w-4xl flex justify-center pointer-events-auto">
            <PromptBar
              placeholder="Ask anything or describe what to build..."
              sources={[
                { key: 'files', name: 'Photos & files', description: 'Upload from this device', icon: Attachment01Icon, attach: true },
                { key: 'web', name: 'Web search', description: 'Live results', icon: Globe02Icon }
              ]}
              commands={[{ key: 'summarize', name: '/summarize', description: 'Digest the thread so far' }]}
              models={modelOptions}
              defaultModel={catalog.defaultModelId}
              efforts={['Low', 'Medium', 'High', 'Extra', 'Max']}
              busy={busy}
              onSend={send}
              onStop={() => {
                controller.current?.abort();
                setBusy(false);
                setAiTyping(false);
              }}
              onAttach={() => pickFiles()}
              onDictate={() => transcribe()}
              background="#18181b"
              color="#f5f5f5"
              menuBackground="#27272a"
              sparkColor="#5227FF"
              sparkBoost={1.2}
              width={800}
              radius={18}
              maxRows={5}
              morphDuration={240}
              squash={0.12}
              tilt={8}
              pressScale={0.96}
            />
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
