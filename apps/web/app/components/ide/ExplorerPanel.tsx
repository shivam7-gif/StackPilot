"use client";

import { useState } from "react";
import { TreeStructure } from "../TreeStructure/TreeStructure";

interface ExplorerPanelProps {
  width: number;
}

type SidebarView = "files" | "search" | "git" | "extensions";

const ACTIVITY_ICONS: {
  id: SidebarView;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "files",
    label: "Explorer",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    id: "search",
    label: "Search",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3-3" />
      </svg>
    ),
  },
  {
    id: "git",
    label: "Source Control",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <circle cx="18" cy="12" r="2.5" />
        <path d="M6 8.5v7M8.5 6h4.5a3 3 0 013 3v3" />
      </svg>
    ),
  },
  {
    id: "extensions",
    label: "Extensions",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z" />
        <line x1="16" y1="8" x2="2" y2="22" />
        <line x1="17.5" y1="15" x2="9" y2="15" />
      </svg>
    ),
  },
];

export default function ExplorerPanel({ width }: ExplorerPanelProps) {
  const [activeView, setActiveView] = useState<SidebarView>("files");
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);
  const [hovering, setHovering] = useState(false);

  return (
    <div
      className="h-full shrink-0 flex"
      style={{
        width,
        background: "var(--ide-sidebar-bg)",
        borderRight: "1px solid var(--ide-border)",
      }}
    >
      {/* ── Activity Bar ── */}
      <aside
        className="w-[44px] shrink-0 flex flex-col items-center py-2 gap-0.5"
        style={{
          borderRight: "1px solid var(--ide-border)",
          background: "var(--ide-activity-bg)",
        }}
      >
        {/* Top: nav icons */}
        <div className="flex flex-col items-center gap-0.5 flex-1">
          {ACTIVITY_ICONS.map(({ id, label, icon }) => {
            const isActive = activeView === id;
            return (
              <button
                key={id}
                title={label}
                onClick={() => setActiveView(id)}
                className="activity-item relative w-[40px] h-[40px] flex items-center justify-center rounded-lg transition-all"
                style={{
                  color: isActive ? "var(--ide-text-bright)" : "var(--ide-text-dim)",
                  background: isActive ? "var(--ide-hover)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--ide-text-muted)";
                    e.currentTarget.style.background = "var(--ide-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--ide-text-dim)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {/* Active left border */}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 2,
                      height: 18,
                      background: "var(--ide-accent)",
                      borderRadius: "0 2px 2px 0",
                    }}
                  />
                )}
                {icon}
              </button>
            );
          })}
        </div>

        {/* Bottom: account + settings */}
        <div className="flex flex-col items-center gap-0.5 pb-1">
          <button
            title="Account"
            className="w-[34px] h-[34px] flex items-center justify-center rounded-lg transition-all"
            style={{ color: "var(--ide-text-dim)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--ide-text-muted)";
              e.currentTarget.style.background = "var(--ide-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--ide-text-dim)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </button>
          <button
            title="Settings"
            className="w-[34px] h-[34px] flex items-center justify-center rounded-lg transition-all"
            style={{ color: "var(--ide-text-dim)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--ide-text-muted)";
              e.currentTarget.style.background = "var(--ide-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--ide-text-dim)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Sidebar Panel ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {activeView === "files" && (
          <>
            {/* Panel title bar */}
            <div
              className="h-[35px] flex items-center justify-between px-3 shrink-0"
              style={{ borderBottom: "1px solid var(--ide-border)" }}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              <span className="panel-header">Explorer</span>
              <div
                className="flex items-center gap-0.5 transition-opacity"
                style={{ opacity: hovering ? 1 : 0 }}
              >
                {[
                  {
                    title: "New File",
                    icon: (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                    ),
                  },
                  {
                    title: "New Folder",
                    icon: (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                        <line x1="12" y1="11" x2="12" y2="17" />
                        <line x1="9" y1="14" x2="15" y2="14" />
                      </svg>
                    ),
                    onClick: () => {},
                  },
                  {
                    title: "Collapse All",
                    icon: (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 3 9 3 9 9 3 9" />
                        <polyline points="21 9 21 3 15 3" />
                        <polyline points="3 15 9 15 9 21" />
                        <polyline points="15 21 21 21 21 15" />
                      </svg>
                    ),
                    onClick: () => setExplorerCollapsed((p) => !p),
                  },
                ].map(({ title, icon, onClick }) => (
                  <button
                    key={title}
                    title={title}
                    onClick={onClick}
                    className="w-[22px] h-[22px] flex items-center justify-center rounded-md transition-all"
                    style={{ color: "var(--ide-text-muted)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--ide-hover-strong)";
                      e.currentTarget.style.color = "var(--ide-text-bright)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--ide-text-muted)";
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* File tree */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden ide-scrollbar">
              <TreeStructure />
            </div>
          </>
        )}

        {activeView === "search" && (
          <div className="flex flex-col h-full">
            <div
              className="h-[35px] flex items-center px-3 shrink-0"
              style={{ borderBottom: "1px solid var(--ide-border)" }}
            >
              <span className="panel-header">Search</span>
            </div>
            <div className="p-3">
              <input
                type="text"
                placeholder="Search files..."
                className="w-full px-3 py-1.5 text-[12px] rounded-lg outline-none transition-all"
                style={{
                  background: "var(--ide-input-bg)",
                  border: "1px solid var(--ide-input-border)",
                  color: "var(--ide-text)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--ide-accent)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px var(--ide-accent-dim)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--ide-input-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
            <p className="px-4 text-[11px]" style={{ color: "var(--ide-text-dim)" }}>
              Type to search across files.
            </p>
          </div>
        )}

        {activeView === "git" && (
          <div className="flex flex-col h-full">
            <div
              className="h-[35px] flex items-center px-3 shrink-0"
              style={{ borderBottom: "1px solid var(--ide-border)" }}
            >
              <span className="panel-header">Source Control</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-3 px-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ide-text-dim)" strokeWidth="1">
                <circle cx="6" cy="6" r="2" />
                <circle cx="6" cy="18" r="2" />
                <circle cx="18" cy="12" r="2" />
                <path d="M6 8v8M8 6h5a3 3 0 013 3v3" />
              </svg>
              <p className="text-[11px] text-center" style={{ color: "var(--ide-text-dim)" }}>
                No changes in working tree.
              </p>
            </div>
          </div>
        )}

        {activeView === "extensions" && (
          <div className="flex flex-col h-full">
            <div
              className="h-[35px] flex items-center px-3 shrink-0"
              style={{ borderBottom: "1px solid var(--ide-border)" }}
            >
              <span className="panel-header">Extensions</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-3 px-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ide-text-dim)" strokeWidth="1">
                <path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z" />
                <line x1="16" y1="8" x2="2" y2="22" />
              </svg>
              <p className="text-[11px] text-center" style={{ color: "var(--ide-text-dim)" }}>
                Extensions coming soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
