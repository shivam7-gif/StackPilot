"use client";

import { useState } from "react";
import { useThemeStore } from "../../store/useThemeStore";
import { ActivePreviewStore } from "../../store/activePreviewStore";
import { useTreeStructureStore } from "../../store/TreeStructureStore";
import { useActiveFileTabStore } from "@/store/activeFileTabStore";
import { useEditorSocketStore } from "@/store/EditorSocketStores";
import { useEditorStatusStore } from "@/store/useEditorStatusStore";
import { useCommandPaletteStore } from "@/store/useCommandPaletteStore";
import { API_BASE_URL } from "@/config/socket";

interface IdeTitleBarProps {
  projectName?: string;
}

const MENU_ITEMS = ["File", "Edit", "View", "Terminal", "Help"];

export default function IdeTitleBar({ projectName }: IdeTitleBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { theme, toggleTheme } = useThemeStore();
  const { activeView, previewUrl, openPreview, openEditor } = ActivePreviewStore();
  const { projectId } = useTreeStructureStore();

  return (
    <header
      className="h-[40px] w-full flex items-center shrink-0 select-none"
      style={{
        background: "var(--ide-titlebar-bg)",
        borderBottom: "1px solid var(--ide-border)",
      }}
    >
      {/* macOS traffic light dots */}
      <div className="flex gap-[6px] pl-4 pr-3 shrink-0">
        {[
          { color: "#ff5f57", title: "Close" },
          { color: "#febc2e", title: "Minimize" },
          { color: "#28c840", title: "Maximize" },
        ].map((dot) => (
          <div
            key={dot.title}
            className="w-[11px] h-[11px] rounded-full hover:brightness-90 transition-all cursor-pointer"
            style={{ background: dot.color, boxShadow: `0 0 0 0.5px rgba(0,0,0,0.2)` }}
            title={dot.title}
          />
        ))}
      </div>

      {/* Menu bar */}
      <nav className="flex items-center h-full shrink-0 relative">
        {MENU_ITEMS.map((item) => (
          <div key={item} className="relative h-full flex items-center">
            <button
              onMouseEnter={() => activeMenu && setActiveMenu(item)}
              onClick={() => setActiveMenu(activeMenu === item ? null : item)}
              className="px-2.5 h-full text-[12px] font-medium transition-colors cursor-pointer"
              style={{
                background:
                  activeMenu === item ? "var(--ide-hover-strong)" : "transparent",
                color:
                  activeMenu === item
                    ? "var(--ide-text-bright)"
                    : "var(--ide-text-muted)",
              }}
            >
              {item}
            </button>

            {activeMenu === item && (
              <div
                className="absolute left-0 top-[38px] py-1 min-w-[210px] rounded-md shadow-2xl z-[99999] border text-[12px]"
                style={{
                  background: "var(--ide-titlebar-bg)",
                  borderColor: "var(--ide-border)",
                  color: "var(--ide-text)",
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {item === "File" && (
                  <>
                    <button
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[var(--ide-hover)]"
                      onClick={() => {
                        useTreeStructureStore.getState().setNewFileInput({
                          parentPath: "",
                          isFolder: false,
                        });
                        setActiveMenu(null);
                      }}
                    >
                      <span>New File</span>
                    </button>
                    <button
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[var(--ide-hover)]"
                      onClick={() => {
                        useTreeStructureStore.getState().setNewFileInput({
                          parentPath: "",
                          isFolder: true,
                        });
                        setActiveMenu(null);
                      }}
                    >
                      <span>New Folder</span>
                    </button>
                    <div className="h-px my-1" style={{ background: "var(--ide-border)" }} />
                    <button
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[var(--ide-hover)]"
                      onClick={() => {
                        const active = useActiveFileTabStore.getState().activeFileTab;
                        const socket = useEditorSocketStore.getState().editorSocket;
                        if (active && socket) {
                          socket.emit("writeFile", {
                            data: active.value,
                            pathToFileFolder: active.path,
                          });
                          useActiveFileTabStore.getState().markDirty(active.path, false);
                        }
                        setActiveMenu(null);
                      }}
                    >
                      <span>Save File</span>
                      <kbd className="text-[10px] opacity-60">Ctrl+S</kbd>
                    </button>
                    <button
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[var(--ide-hover)]"
                      onClick={() => {
                        useEditorStatusStore.getState().toggleAutoSave();
                        setActiveMenu(null);
                      }}
                    >
                      <span>Toggle Auto-Save</span>
                      <span className="text-[10px] text-[var(--ide-accent)]">
                        {useEditorStatusStore.getState().autoSave ? "ON" : "OFF"}
                      </span>
                    </button>
                    <div className="h-px my-1" style={{ background: "var(--ide-border)" }} />
                    <button
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[var(--ide-hover)]"
                      onClick={() => {
                        useCommandPaletteStore.getState().open("file");
                        setActiveMenu(null);
                      }}
                    >
                      <span>Quick Open...</span>
                      <kbd className="text-[10px] opacity-60">Ctrl+P</kbd>
                    </button>
                  </>
                )}

                {item === "Edit" && (
                  <>
                    <button
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[var(--ide-hover)]"
                      onClick={() => {
                        useCommandPaletteStore.getState().open("command");
                        setActiveMenu(null);
                      }}
                    >
                      <span>Command Palette...</span>
                      <kbd className="text-[10px] opacity-60">Ctrl+Shift+P</kbd>
                    </button>
                    <button
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[var(--ide-hover)]"
                      onClick={() => {
                        useCommandPaletteStore.getState().open("goto-line");
                        setActiveMenu(null);
                      }}
                    >
                      <span>Go to Line/Column...</span>
                      <kbd className="text-[10px] opacity-60">Ctrl+G</kbd>
                    </button>
                  </>
                )}

                {item === "View" && (
                  <>
                    <button
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[var(--ide-hover)]"
                      onClick={() => {
                        useCommandPaletteStore.getState().open("command");
                        setActiveMenu(null);
                      }}
                    >
                      <span>Command Palette...</span>
                      <kbd className="text-[10px] opacity-60">Ctrl+Shift+P</kbd>
                    </button>
                    <button
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[var(--ide-hover)]"
                      onClick={() => {
                        toggleTheme();
                        setActiveMenu(null);
                      }}
                    >
                      <span>Switch Theme</span>
                      <span className="text-[10px] opacity-60 capitalize">
                        {theme === "dark" ? "Light" : "Dark"}
                      </span>
                    </button>
                  </>
                )}

                {item === "Terminal" && (
                  <>
                    <button
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[var(--ide-hover)]"
                      onClick={() => {
                        useCommandPaletteStore.getState().open("command");
                        setActiveMenu(null);
                      }}
                    >
                      <span>Terminal Commands</span>
                    </button>
                  </>
                )}

                {item === "Help" && (
                  <>
                    <button
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[var(--ide-hover)]"
                      onClick={() => {
                        useCommandPaletteStore.getState().open("command");
                        setActiveMenu(null);
                      }}
                    >
                      <span>Show All Commands</span>
                      <kbd className="text-[10px] opacity-60">Ctrl+Shift+P</kbd>
                    </button>
                    <button
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[var(--ide-hover)]"
                      onClick={() => {
                        useCommandPaletteStore.getState().open("file");
                        setActiveMenu(null);
                      }}
                    >
                      <span>Quick Open Files</span>
                      <kbd className="text-[10px] opacity-60">Ctrl+P</kbd>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Center — project breadcrumb */}
      <div className="flex-1 flex items-center justify-center gap-2 min-w-0 px-4">
        {projectName && (
          <>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="var(--ide-text-dim)">
              <path d="M6 4l4 4-4 4V4z" />
            </svg>
            <span
              className="text-[12px] font-medium truncate max-w-[200px]"
              style={{ color: "var(--ide-text-bright)" }}
            >
              {projectName}
            </span>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="var(--ide-text-dim)">
              <path d="M6 4l4 4-4 4V4z" />
            </svg>
            <span className="text-[11px]" style={{ color: "var(--ide-text-muted)" }}>
              IDE
            </span>
          </>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 pr-3 shrink-0">
        {/* Git branch */}
        <div
          className="flex items-center gap-1.5 px-2.5 h-[26px] rounded-lg text-[11px] font-medium transition-all cursor-pointer"
          style={{
            color: "var(--ide-text-muted)",
            border: "1px solid var(--ide-border)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--ide-hover)";
            e.currentTarget.style.color = "var(--ide-text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--ide-text-muted)";
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="6" cy="6" r="2" />
            <circle cx="6" cy="18" r="2" />
            <circle cx="18" cy="12" r="2" />
            <path d="M6 8v8M8 6h5a3 3 0 013 3v3" />
          </svg>
          <span>main</span>
        </div>

        {/* Separator */}
        <div className="w-px h-4 mx-1" style={{ background: "var(--ide-border)" }} />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-[28px] h-[28px] flex items-center justify-center rounded-lg transition-all cursor-pointer"
          style={{ color: "var(--ide-text-muted)" }}
          title={theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--ide-hover)";
            e.currentTarget.style.color = "var(--ide-text-bright)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--ide-text-muted)";
          }}
        >
          {theme === "dark" ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <button
          className="w-[28px] h-[28px] flex items-center justify-center rounded-lg transition-all cursor-pointer"
          style={{ color: "var(--ide-text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--ide-hover)";
            e.currentTarget.style.color = "var(--ide-text-bright)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--ide-text-muted)";
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>

        {/* Separator */}
        <div className="w-px h-4 mx-1" style={{ background: "var(--ide-border)" }} />

        {/* Run Dev */}
        <button
          className="flex items-center gap-1.5 px-3 h-[28px] rounded-lg text-[11px] font-semibold text-white transition-all run-btn-glow cursor-pointer"
          style={{ background: "var(--ide-accent)" }}
          onClick={() => {
            if (activeView === "preview") {
              openEditor();
            } else {
              const url =
                previewUrl ||
                (projectId
                  ? `${API_BASE_URL}/api/preview/${projectId}/`
                  : `${API_BASE_URL}/api/preview/default/`);
              openPreview(url);
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--ide-accent-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--ide-accent)";
          }}
        >
          <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor">
            <path d="M2 1.5v7l6.5-3.5L2 1.5z" />
          </svg>
          Run Dev
        </button>
      </div>
    </header>
  );
}
