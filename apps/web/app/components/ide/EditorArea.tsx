"use client";

import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useActiveFileTabStore } from "@/store/activeFileTabStore";
import { FileIcon } from "../FileIcon/FileIcon";

const Editor = dynamic(() => import("./EditorPanel"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-[#666] text-sm font-mono">
      <span className="animate-pulse">Loading editor…</span>
    </div>
  ),
});

// Map extension to language display name
const LANG_DISPLAY: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TypeScript JSX",
  js: "JavaScript",
  jsx: "JavaScript JSX",
  json: "JSON",
  css: "CSS",
  html: "HTML",
  md: "Markdown",
  py: "Python",
  go: "Go",
  rs: "Rust",
  sh: "Shell",
  yaml: "YAML",
  yml: "YAML",
  toml: "TOML",
  env: "Dotenv",
};

const LANG_COLOR: Record<string, string> = {
  ts: "#3178c6",
  tsx: "#3178c6",
  js: "#f7df1e",
  jsx: "#f7df1e",
  json: "#cbcb41",
  css: "#563d7c",
  html: "#e34c26",
  py: "#3572A5",
  go: "#00ADD8",
  rs: "#dea584",
};

function TabIcon({ extension }: { extension: string }) {
  const ext = extension.toLowerCase();
  if (ext === "ts" || ext === "tsx") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#3178c6">
        <rect width="24" height="24" rx="3" fill="#3178c6" />
        <text x="4.5" y="17.5" fill="white" fontSize="11" fontWeight="bold" fontFamily="monospace">TS</text>
      </svg>
    );
  }
  if (ext === "js" || ext === "jsx") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24">
        <rect width="24" height="24" rx="3" fill="#f7df1e" />
        <text x="4.5" y="17.5" fill="#333" fontSize="11" fontWeight="bold" fontFamily="monospace">JS</text>
      </svg>
    );
  }
  return <FileIcon extension={ext} />;
}

// Build breadcrumb from path
function buildBreadcrumb(path: string): string[] {
  const parts = path.replace(/\\/g, "/").split("/");
  // Show last 3 segments max
  return parts.slice(-3);
}

export default function EditorArea() {
  const { tabs, activeTabPath, activeFileTab, closeTab, switchTab } =
    useActiveFileTabStore();

  const tabBarRef = useRef<HTMLDivElement>(null);

  const breadcrumb = activeFileTab ? buildBreadcrumb(activeFileTab.path) : [];
  const ext = activeFileTab?.extension ?? "";
  const langDisplay = (LANG_DISPLAY[ext] ?? ext.toUpperCase()) || "Plain Text";
  const langColor = LANG_COLOR[ext] ?? "#858585";

  const handleCloseTab = useCallback(
    (e: React.MouseEvent, path: string) => {
      e.stopPropagation();
      closeTab(path);
    },
    [closeTab]
  );

  return (
    <div
      className="flex-1 h-full min-w-0 flex flex-col"
      style={{ background: "#1e1e1e" }}
    >
      {/* ── Tab Bar ── */}
      <div
        ref={tabBarRef}
        className="flex items-end shrink-0 overflow-x-auto thin-scrollbar"
        style={{
          background: "#181818",
          borderBottom: "1px solid #2b2b2b",
          height: 35,
          minHeight: 35,
        }}
      >
        {tabs.length === 0 ? (
          <div className="flex items-center h-full px-4 text-[12px] text-[#555] select-none">
            No file open
          </div>
        ) : (
          tabs.map((tab) => {
            const isActive = tab.path === activeTabPath;
            const fileName = tab.path.split(/[\\/]/).pop() ?? tab.path;
            return (
              <div
                key={tab.path}
                onClick={() => switchTab(tab.path)}
                className="tab-item flex items-center gap-1.5 px-3 h-full cursor-pointer select-none shrink-0 group relative"
                style={{
                  background: isActive ? "#1e1e1e" : "#2d2d2d",
                  color: isActive ? "#e0e0e0" : "#8a8a8a",
                  borderRight: "1px solid #2b2b2b",
                  borderTop: isActive ? "1px solid #007fd4" : "1px solid transparent",
                  maxWidth: 180,
                  minWidth: 80,
                  transition: "background 0.1s, color 0.1s",
                }}
              >
                <span className="shrink-0">
                  <TabIcon extension={tab.extension} />
                </span>
                <span className="text-[12px] truncate flex-1">{fileName}</span>
                {/* Dirty indicator */}
                {tab.isDirty && (
                  <span className="w-[6px] h-[6px] rounded-full bg-[#e0e0e0] shrink-0" />
                )}
                {/* Close button */}
                <button
                  onClick={(e) => handleCloseTab(e, tab.path)}
                  className="tab-close-btn w-[16px] h-[16px] flex items-center justify-center rounded shrink-0 text-[#858585] hover:text-[#ccc] hover:bg-[#3a3a3a] transition-colors"
                  title="Close"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M2 2l6 6M8 2l-6 6" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* ── Breadcrumb ── */}
      {activeFileTab && (
        <div
          className="flex items-center px-3 gap-1 shrink-0"
          style={{
            height: 26,
            background: "#1e1e1e",
            borderBottom: "1px solid #2b2b2b",
          }}
        >
          {breadcrumb.map((segment, i) => {
            const isLast = i === breadcrumb.length - 1;
            return (
              <span key={i} className="flex items-center gap-1">
                <span
                  className="text-[11px] truncate max-w-[120px]"
                  style={{
                    color: isLast ? "#cccccc" : "#858585",
                    cursor: isLast ? "default" : "pointer",
                  }}
                >
                  {segment}
                </span>
                {!isLast && (
                  <svg width="8" height="8" viewBox="0 0 16 16" fill="#555">
                    <path d="M6 4l4 4-4 4V4z" />
                  </svg>
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* ── Editor ── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeFileTab ? (
          <Editor
            value={activeFileTab.value}
            language={activeFileTab.extension}
          />
        ) : (
          <WelcomeScreen />
        )}
      </div>

      {/* ── Status Bar ── */}
      <footer
        className="flex items-center px-3 gap-3 shrink-0 text-[11px] text-white/90 select-none"
        style={{ height: 22, background: "#007acc" }}
      >
        {/* Left */}
        <span className="flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="6" cy="6" r="2" />
            <circle cx="6" cy="18" r="2" />
            <circle cx="18" cy="12" r="2" />
            <path d="M6 8v8M8 6h5a3 3 0 013 3v3" />
          </svg>
          main
        </span>

        <span className="flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          0 errors
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right */}
        {activeFileTab && (
          <>
            <span>Ln 1, Col 1</span>
            <span>Spaces: 2</span>
            <span>UTF-8</span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                background: "rgba(255,255,255,0.1)",
              }}
            >
              {langDisplay}
            </span>
          </>
        )}
        <span className="opacity-80">Prettier</span>
        <span className="opacity-80">ESLint</span>
      </footer>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center gap-6 select-none"
      style={{ background: "#1e1e1e" }}
    >
      {/* Logo */}
      {/* <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #0e639c 0%, #6366f1 100%)",
          boxShadow: "0 8px 32px rgba(14, 99, 156, 0.3)",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div> */}

      <div className="text-center">
        <h2 className="text-[20px] font-semibold text-[#e0e0e0] mb-1">StackPilot IDE</h2>
        <p className="text-[13px] text-[#666]">
          Select a file from the explorer to start editing
        </p>
      </div>

      <div className="flex flex-col gap-2 items-start">
        {[
          { key: "Ctrl+P", label: "Quick Open File" },
          { key: "Ctrl+`", label: "Open Terminal" },
          { key: "Ctrl+B", label: "Toggle Sidebar" },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <kbd
              className="px-2 py-0.5 rounded text-[11px] font-mono"
              style={{
                background: "#2d2d2d",
                border: "1px solid #3c3c3c",
                color: "#858585",
              }}
            >
              {key}
            </kbd>
            <span className="text-[12px] text-[#555]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
