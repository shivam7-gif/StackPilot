"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useActiveFileTabStore } from "@/store/activeFileTabStore";
import { useEditorStatusStore } from "@/store/useEditorStatusStore";
import { useCommandPaletteStore } from "@/store/useCommandPaletteStore";
import { FileIcon } from "../FileIcon/FileIcon";

const Editor = dynamic(() => import("./EditorPanel"), {
  ssr: false,
  loading: () => (
    <div
      className="flex-1 flex items-center justify-center text-sm font-mono animate-pulse"
      style={{ color: "var(--ide-text-dim)", background: "var(--ide-bg)" }}
    >
      Loading editor…
    </div>
  ),
});

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
  sql: "SQL",
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
  md: "#0891b2",
};

function TabIcon({ extension }: { extension: string }) {
  const ext = extension.toLowerCase();
  if (ext === "ts" || ext === "tsx") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#3178c6">
        <rect width="24" height="24" rx="3" fill="#3178c6" />
        <text
          x="4.5"
          y="17.5"
          fill="white"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
        >
          TS
        </text>
      </svg>
    );
  }
  if (ext === "js" || ext === "jsx") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24">
        <rect width="24" height="24" rx="3" fill="#f7df1e" />
        <text
          x="4.5"
          y="17.5"
          fill="#333"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
        >
          JS
        </text>
      </svg>
    );
  }
  return <FileIcon extension={ext} />;
}

function buildBreadcrumb(path: string): string[] {
  return path
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean);
}

export default function EditorArea() {
  const { tabs, activeTabPath, activeFileTab, closeTab, switchTab } =
    useActiveFileTabStore();
  const {
    line,
    col,
    selectionCount,
    indentSpaces,
    encoding,
    eol,
    autoSave,
    setIndentSpaces,
    setEncoding,
    setEol,
    toggleAutoSave,
  } = useEditorStatusStore();
  const { open: openPalette } = useCommandPaletteStore();

  const tabBarRef = useRef<HTMLDivElement>(null);
  const [tabContextMenu, setTabContextMenu] = useState<{
    x: number;
    y: number;
    path: string;
  } | null>(null);

  const [indentPickerOpen, setIndentPickerOpen] = useState(false);
  const [encodingPickerOpen, setEncodingPickerOpen] = useState(false);

  const breadcrumb = activeFileTab ? buildBreadcrumb(activeFileTab.path) : [];
  const ext = activeFileTab?.extension ?? "";
  const langDisplay = (LANG_DISPLAY[ext] ?? ext.toUpperCase()) || "Plain Text";
  const langColor = LANG_COLOR[ext] ?? "var(--ide-text-muted)";

  const handleCloseTab = useCallback(
    (e: React.MouseEvent, path: string) => {
      e.stopPropagation();
      closeTab(path);
    },
    [closeTab]
  );

  const handleCloseOthers = useCallback(
    (targetPath: string) => {
      tabs.forEach((t) => {
        if (t.path !== targetPath) closeTab(t.path);
      });
      setTabContextMenu(null);
    },
    [tabs, closeTab]
  );

  const handleCloseAll = useCallback(() => {
    tabs.forEach((t) => closeTab(t.path));
    setTabContextMenu(null);
  }, [tabs, closeTab]);

  useEffect(() => {
    const handleOutsideClick = () => {
      setTabContextMenu(null);
      setIndentPickerOpen(false);
      setEncodingPickerOpen(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div
      className="flex-1 h-full min-w-0 flex flex-col relative select-none"
      style={{ background: "var(--ide-bg)" }}
    >
      {/* ── Tab Bar ── */}
      <div
        ref={tabBarRef}
        className="flex items-end shrink-0 overflow-x-auto thin-scrollbar relative"
        style={{
          background: "var(--ide-sidebar-bg)",
          borderBottom: "1px solid var(--ide-border)",
          height: 36,
          minHeight: 36,
        }}
      >
        {tabs.length === 0 ? (
          <div
            className="flex items-center h-full px-4 text-[12px]"
            style={{ color: "var(--ide-text-dim)" }}
          >
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
                onMouseDown={(e) => {
                  if (e.button === 1) {
                    e.preventDefault();
                    closeTab(tab.path);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setTabContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    path: tab.path,
                  });
                }}
                className="tab-item group flex items-center gap-1.5 px-3 h-full cursor-pointer shrink-0 relative transition-all"
                style={{
                  background: isActive ? "var(--ide-bg)" : "transparent",
                  color: isActive
                    ? "var(--ide-text-bright)"
                    : "var(--ide-text-muted)",
                  borderRight: "1px solid var(--ide-border)",
                  borderBottom: isActive
                    ? "2px solid var(--ide-accent)"
                    : "2px solid transparent",
                  maxWidth: 200,
                  minWidth: 90,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "var(--ide-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <span className="shrink-0">
                  <TabIcon extension={tab.extension} />
                </span>
                <span className="text-[12px] truncate flex-1 font-medium">
                  {fileName}
                </span>

                {/* Unsaved changes dot indicator */}
                {tab.isDirty && (
                  <span
                    title="Unsaved changes"
                    className="w-[7px] h-[7px] rounded-full shrink-0 group-hover:hidden transition-all"
                    style={{ background: "var(--ide-accent)" }}
                  />
                )}

                {/* Close Button: shows on hover, or replaces dot on hover */}
                <button
                  onClick={(e) => handleCloseTab(e, tab.path)}
                  className={`tab-close-btn w-[16px] h-[16px] flex items-center justify-center rounded transition-all shrink-0 ${
                    tab.isDirty ? "hidden group-hover:flex" : "opacity-0 group-hover:opacity-100"
                  }`}
                  style={{ color: "var(--ide-text-dim)" }}
                  title="Close tab"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--ide-hover-strong)";
                    e.currentTarget.style.color = "var(--ide-text)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--ide-text-dim)";
                  }}
                >
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  >
                    <path d="M2 2l6 6M8 2l-6 6" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Tab Context Menu */}
      {tabContextMenu && (
        <div
          className="fixed z-[9999] py-1 min-w-[160px] rounded-md shadow-xl text-[12px]"
          style={{
            left: tabContextMenu.x,
            top: tabContextMenu.y,
            background: "var(--ide-titlebar-bg)",
            border: "1px solid var(--ide-border)",
            color: "var(--ide-text)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-3 py-1.5 transition-colors hover:bg-[var(--ide-hover)]"
            onClick={() => {
              closeTab(tabContextMenu.path);
              setTabContextMenu(null);
            }}
          >
            Close
          </button>
          <button
            className="w-full text-left px-3 py-1.5 transition-colors hover:bg-[var(--ide-hover)]"
            onClick={() => handleCloseOthers(tabContextMenu.path)}
          >
            Close Others
          </button>
          <button
            className="w-full text-left px-3 py-1.5 transition-colors hover:bg-[var(--ide-hover)]"
            onClick={handleCloseAll}
          >
            Close All
          </button>
          <div className="h-px my-1" style={{ background: "var(--ide-border)" }} />
          <button
            className="w-full text-left px-3 py-1.5 transition-colors hover:bg-[var(--ide-hover)]"
            onClick={() => {
              navigator.clipboard.writeText(tabContextMenu.path);
              setTabContextMenu(null);
            }}
          >
            Copy Path
          </button>
        </div>
      )}

      {/* ── Breadcrumb Path ── */}
      {activeFileTab && (
        <div
          className="flex items-center px-3.5 gap-1.5 shrink-0 overflow-x-auto thin-scrollbar"
          style={{
            height: 24,
            borderBottom: "1px solid var(--ide-border)",
            background: "var(--ide-bg)",
          }}
        >
          {breadcrumb.map((segment, i) => {
            const isLast = i === breadcrumb.length - 1;
            return (
              <span key={i} className="flex items-center gap-1.5 shrink-0">
                {/* Segment icon */}
                {isLast ? (
                  <span className="shrink-0 scale-90">
                    <TabIcon extension={activeFileTab.extension} />
                  </span>
                ) : (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="#dcb67a"
                    className="shrink-0"
                  >
                    <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" />
                  </svg>
                )}

                <span
                  className="text-[11.5px] truncate max-w-[160px] cursor-pointer hover:text-[var(--ide-text-bright)] transition-colors"
                  style={{
                    color: isLast ? "var(--ide-text-bright)" : "var(--ide-text-muted)",
                    fontWeight: isLast ? 500 : 400,
                  }}
                >
                  {segment}
                </span>

                {isLast && activeFileTab.isDirty && (
                  <span
                    className="w-[6px] h-[6px] rounded-full shrink-0"
                    style={{ background: "var(--ide-accent)" }}
                    title="Unsaved changes"
                  />
                )}

                {!isLast && (
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 16 16"
                    fill="var(--ide-text-dim)"
                    className="shrink-0"
                  >
                    <path d="M6 4l4 4-4 4V4z" />
                  </svg>
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* ── Editor Canvas ── */}
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
        className="flex items-center px-3 gap-3.5 shrink-0 text-[11px] font-sans relative"
        style={{
          height: 22,
          background: "var(--ide-titlebar-bg)",
          borderTop: "1px solid var(--ide-border)",
          color: "var(--ide-text-muted)",
        }}
      >
        {/* Git Branch */}
        <span
          className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--ide-text-bright)] transition-colors"
          title="Git Branch: main"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="6" cy="6" r="2" />
            <circle cx="6" cy="18" r="2" />
            <circle cx="18" cy="12" r="2" />
            <path d="M6 8v8M8 6h5a3 3 0 013 3v3" />
          </svg>
          main
        </span>

        {/* Diagnostics */}
        <span
          className="flex items-center gap-1 cursor-pointer hover:text-[var(--ide-text-bright)] transition-colors"
          title="No problems detected"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          0 errors
        </span>

        {/* Auto-save toggle indicator (clean text, no dot, no background) */}
        <button
          onClick={toggleAutoSave}
          className="flex items-center px-1.5 py-0.5 rounded transition-colors cursor-pointer hover:text-[var(--ide-text-bright)]"
          style={{
            background: "transparent",
            color: autoSave ? "var(--ide-text)" : "var(--ide-text-dim)",
          }}
          title={
            autoSave
              ? "Auto-save is ON (saves automatically 1s after editing)"
              : "Auto-save is OFF (use Ctrl+S to save)"
          }
        >
          <span>{autoSave ? "Auto-Save: ON" : "Auto-Save: OFF"}</span>
        </button>

        <div className="flex-1" />

        {activeFileTab && (
          <>
            {/* Line and Column with Go to line action */}
            <span
              onClick={() => openPalette("goto-line")}
              className="cursor-pointer hover:text-[var(--ide-text-bright)] transition-colors px-1 py-0.5 rounded hover:bg-[var(--ide-hover)]"
              title="Click to Go to Line:Column (Ctrl+G)"
            >
              Ln {line}, Col {col}
              {selectionCount > 0 ? ` (${selectionCount} selected)` : ""}
            </span>

            {/* Indentation with picker */}
            <div className="relative">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setIndentPickerOpen((p) => !p);
                }}
                className="cursor-pointer hover:text-[var(--ide-text-bright)] transition-colors px-1 py-0.5 rounded hover:bg-[var(--ide-hover)]"
                title="Select Indentation"
              >
                Spaces: {indentSpaces}
              </span>
              {indentPickerOpen && (
                <div
                  className="absolute bottom-6 right-0 py-1 min-w-[120px] rounded-md shadow-xl text-[12px] z-50"
                  style={{
                    background: "var(--ide-titlebar-bg)",
                    border: "1px solid var(--ide-border)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className={`w-full text-left px-3 py-1 hover:bg-[var(--ide-hover)] ${
                      indentSpaces === 2 ? "font-bold text-[var(--ide-accent)]" : ""
                    }`}
                    onClick={() => {
                      setIndentSpaces(2);
                      setIndentPickerOpen(false);
                    }}
                  >
                    Spaces: 2 {indentSpaces === 2 ? "✓" : ""}
                  </button>
                  <button
                    className={`w-full text-left px-3 py-1 hover:bg-[var(--ide-hover)] ${
                      indentSpaces === 4 ? "font-bold text-[var(--ide-accent)]" : ""
                    }`}
                    onClick={() => {
                      setIndentSpaces(4);
                      setIndentPickerOpen(false);
                    }}
                  >
                    Spaces: 4 {indentSpaces === 4 ? "✓" : ""}
                  </button>
                </div>
              )}
            </div>

            {/* Encoding */}
            <div className="relative">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setEncodingPickerOpen((p) => !p);
                }}
                className="cursor-pointer hover:text-[var(--ide-text-bright)] transition-colors px-1 py-0.5 rounded hover:bg-[var(--ide-hover)]"
                title="Select Encoding"
              >
                {encoding}
              </span>
              {encodingPickerOpen && (
                <div
                  className="absolute bottom-6 right-0 py-1 min-w-[110px] rounded-md shadow-xl text-[12px] z-50"
                  style={{
                    background: "var(--ide-titlebar-bg)",
                    border: "1px solid var(--ide-border)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {["UTF-8", "UTF-16 LE", "ASCII"].map((enc) => (
                    <button
                      key={enc}
                      className={`w-full text-left px-3 py-1 hover:bg-[var(--ide-hover)] ${
                        encoding === enc ? "font-bold text-[var(--ide-accent)]" : ""
                      }`}
                      onClick={() => {
                        setEncoding(enc);
                        setEncodingPickerOpen(false);
                      }}
                    >
                      {enc} {encoding === enc ? "✓" : ""}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* EOL */}
            <span
              onClick={() => setEol(eol === "LF" ? "CRLF" : "LF")}
              className="cursor-pointer hover:text-[var(--ide-text-bright)] transition-colors px-1 py-0.5 rounded hover:bg-[var(--ide-hover)]"
              title="Click to toggle LF / CRLF"
            >
              {eol}
            </span>

            {/* Language badge */}
            <span
              onClick={() => openPalette("command", "Language: ")}
              className="px-2 py-0.5 rounded text-[10.5px] font-medium cursor-pointer transition-colors"
              style={{
                background: "var(--ide-hover-strong)",
                color: langColor,
              }}
              title="Change Language Mode"
            >
              {langDisplay}
            </span>
          </>
        )}

        <span
          className="cursor-pointer hover:text-[var(--ide-text-bright)] transition-colors"
          title="Format Document with Prettier"
        >
          Prettier
        </span>
      </footer>
    </div>
  );
}

function WelcomeScreen() {
  const { open: openPalette } = useCommandPaletteStore();

  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center gap-8 select-none"
      style={{ background: "var(--ide-bg)" }}
    >
      <div className="text-center">
        <h2
          className="text-[18px] font-semibold mb-1.5"
          style={{ color: "var(--ide-text-bright)" }}
        >
          Code Editor
        </h2>
        <p className="text-[13px]" style={{ color: "var(--ide-text-dim)" }}>
          Select a file from the explorer to start editing
        </p>
      </div>

      <div className="flex flex-col gap-2 items-start">
        {[
          {
            key: "Ctrl+P",
            label: "Quick Open File",
            action: () => openPalette("file"),
          },
          {
            key: "Ctrl+Shift+P",
            label: "Command Palette",
            action: () => openPalette("command"),
          },
          {
            key: "Ctrl+`",
            label: "Toggle Terminal",
          },
          {
            key: "Ctrl+B",
            label: "Toggle Sidebar",
          },
        ].map(({ key, label, action }) => (
          <div
            key={key}
            className="flex items-center gap-3 cursor-pointer py-1 px-2 rounded-lg hover:bg-[var(--ide-hover)] transition-colors"
            onClick={action}
          >
            <kbd
              className="px-2 py-0.5 rounded-md text-[11px] font-mono shadow-sm"
              style={{
                background: "var(--ide-hover-strong)",
                border: "1px solid var(--ide-border)",
                color: "var(--ide-text-muted)",
              }}
            >
              {key}
            </kbd>
            <span
              className="text-[12px]"
              style={{ color: "var(--ide-text-dim)" }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
