"use client";

import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useActiveFileTabStore } from "@/store/activeFileTabStore";
import { FileIcon } from "../FileIcon/FileIcon";

const Editor = dynamic(() => import("./EditorPanel"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-sm font-mono animate-pulse" style={{ color: "var(--ide-text-dim)", background: "var(--ide-bg)" }}>
      Loading editor…
    </div>
  ),
});

const LANG_DISPLAY: Record<string, string> = {
  ts: "TypeScript", tsx: "TypeScript JSX", js: "JavaScript", jsx: "JavaScript JSX",
  json: "JSON", css: "CSS", html: "HTML", md: "Markdown", py: "Python",
  go: "Go", rs: "Rust", sh: "Shell", yaml: "YAML", yml: "YAML", toml: "TOML", env: "Dotenv",
};

const LANG_COLOR: Record<string, string> = {
  ts: "#3178c6", tsx: "#3178c6", js: "#f7df1e", jsx: "#f7df1e", json: "#cbcb41",
  css: "#563d7c", html: "#e34c26", py: "#3572A5", go: "#00ADD8", rs: "#dea584",
};

function TabIcon({ extension }: { extension: string }) {
  const ext = extension.toLowerCase();
  if (ext === "ts" || ext === "tsx") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#3178c6">
        <rect width="24" height="24" rx="3" fill="#3178c6" />
        <text x="4.5" y="17.5" fill="white" fontSize="11" fontWeight="bold" fontFamily="monospace">TS</text>
      </svg>
    );
  }
  if (ext === "js" || ext === "jsx") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24">
        <rect width="24" height="24" rx="3" fill="#f7df1e" />
        <text x="4.5" y="17.5" fill="#333" fontSize="11" fontWeight="bold" fontFamily="monospace">JS</text>
      </svg>
    );
  }
  return <FileIcon extension={ext} />;
}

function buildBreadcrumb(path: string): string[] {
  return path.replace(/\\/g, "/").split("/").slice(-3);
}

export default function EditorArea() {
  const { tabs, activeTabPath, activeFileTab, closeTab, switchTab } = useActiveFileTabStore();
  const tabBarRef = useRef<HTMLDivElement>(null);
  const breadcrumb = activeFileTab ? buildBreadcrumb(activeFileTab.path) : [];
  const ext = activeFileTab?.extension ?? "";
  const langDisplay = (LANG_DISPLAY[ext] ?? ext.toUpperCase()) || "Plain Text";
  const langColor = LANG_COLOR[ext] ?? "var(--ide-text-muted)";

  const handleCloseTab = useCallback(
    (e: React.MouseEvent, path: string) => { e.stopPropagation(); closeTab(path); },
    [closeTab]
  );

  return (
    <div className="flex-1 h-full min-w-0 flex flex-col" style={{ background: "var(--ide-bg)" }}>
      {/* ── Tab Bar ── */}
      <div
        ref={tabBarRef}
        className="flex items-end shrink-0 overflow-x-auto thin-scrollbar"
        style={{ background: "var(--ide-sidebar-bg)", borderBottom: "1px solid var(--ide-border)", height: 36, minHeight: 36 }}
      >
        {tabs.length === 0 ? (
          <div className="flex items-center h-full px-4 text-[12px] select-none" style={{ color: "var(--ide-text-dim)" }}>
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
                className="tab-item flex items-center gap-1.5 px-3 h-full cursor-pointer select-none shrink-0 group relative transition-all"
                style={{
                  background: isActive ? "var(--ide-bg)" : "transparent",
                  color: isActive ? "var(--ide-text-bright)" : "var(--ide-text-muted)",
                  borderRight: "1px solid var(--ide-border)",
                  borderBottom: isActive ? "2px solid var(--ide-accent)" : "2px solid transparent",
                  maxWidth: 180, minWidth: 80,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "var(--ide-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <span className="shrink-0"><TabIcon extension={tab.extension} /></span>
                <span className="text-[12px] truncate flex-1">{fileName}</span>
                {tab.isDirty && (
                  <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: "var(--ide-accent)" }} />
                )}
                <button
                  onClick={(e) => handleCloseTab(e, tab.path)}
                  className="tab-close-btn w-[15px] h-[15px] flex items-center justify-center rounded transition-all shrink-0"
                  style={{ color: "var(--ide-text-dim)" }}
                  title="Close"
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ide-hover-strong)"; e.currentTarget.style.color = "var(--ide-text)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ide-text-dim)"; }}
                >
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
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
          style={{ height: 24, borderBottom: "1px solid var(--ide-border)", background: "var(--ide-bg)" }}
        >
          {breadcrumb.map((segment, i) => {
            const isLast = i === breadcrumb.length - 1;
            return (
              <span key={i} className="flex items-center gap-1">
                <span
                  className="text-[11px] truncate max-w-[120px]"
                  style={{ color: isLast ? "var(--ide-text)" : "var(--ide-text-muted)", cursor: isLast ? "default" : "pointer" }}
                >
                  {segment}
                </span>
                {!isLast && (
                  <svg width="8" height="8" viewBox="0 0 16 16" fill="var(--ide-text-dim)">
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
          <Editor value={activeFileTab.value} language={activeFileTab.extension} />
        ) : (
          <WelcomeScreen />
        )}
      </div>

      {/* ── Status Bar ── */}
      <footer
        className="flex items-center px-3 gap-3 shrink-0 text-[11px] select-none"
        style={{
          height: 22,
          background: "var(--ide-statusbar-bg)",
          borderTop: "1px solid var(--ide-border)",
          color: "var(--ide-statusbar-text)",
        }}
      >
        <span className="flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="12" r="2" />
            <path d="M6 8v8M8 6h5a3 3 0 013 3v3" />
          </svg>
          main
        </span>
        <span className="flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          0 errors
        </span>
        <div className="flex-1" />
        {activeFileTab && (
          <>
            <span>Ln 1, Col 1</span>
            <span>Spaces: 2</span>
            <span>UTF-8</span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ background: "var(--ide-hover-strong)", color: langColor }}
            >
              {langDisplay}
            </span>
          </>
        )}
        <span>Prettier</span>
        <span>ESLint</span>
      </footer>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center gap-8 select-none"
      style={{ background: "var(--ide-bg)" }}
    >
      <div className="text-center">
        <h2 className="text-[18px] font-semibold mb-1.5" style={{ color: "var(--ide-text-bright)" }}>
          Code Editor
        </h2>
        <p className="text-[13px]" style={{ color: "var(--ide-text-dim)" }}>
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
              className="px-2 py-0.5 rounded-md text-[11px] font-mono"
              style={{
                background: "var(--ide-hover-strong)",
                border: "1px solid var(--ide-border)",
                color: "var(--ide-text-muted)",
              }}
            >
              {key}
            </kbd>
            <span className="text-[12px]" style={{ color: "var(--ide-text-dim)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
