"use client";

import { useState } from "react";
import { useThemeStore } from "../../store/useThemeStore";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  section: "create" | "manage" | "optimize";
};

const NAV_ITEMS: NavItem[] = [
  // Create
  {
    id: "chat",
    label: "Chat",
    section: "create",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    id: "agent",
    label: "Agent Builder",
    section: "create",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93l-1.41 1.41M5.34 5.34L3.93 6.75M19.07 19.07l-1.41-1.41M5.34 18.66L3.93 17.25" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
      </svg>
    ),
  },
  {
    id: "audio",
    label: "Audio",
    section: "create",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0118 0v6" />
        <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
      </svg>
    ),
  },
  {
    id: "images",
    label: "Images",
    section: "create",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    id: "videos",
    label: "Videos",
    section: "create",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
  },
  {
    id: "assistants",
    label: "Assistants",
    section: "create",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  // Manage
  {
    id: "usage",
    label: "Usage",
    section: "manage",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: "api-keys",
    label: "API Keys",
    section: "manage",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    ),
  },
  {
    id: "logs",
    label: "Logs",
    section: "manage",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: "storage",
    label: "Storage",
    section: "manage",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    id: "batches",
    label: "Batches",
    section: "manage",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 3H8M12 3v4" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="16" x2="16" y2="16" />
      </svg>
    ),
  },
  // Optimize
  {
    id: "evaluation",
    label: "Evaluation",
    section: "optimize",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    id: "fine-tuning",
    label: "Fine-tuning",
    section: "optimize",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </svg>
    ),
  },
];

const SECTIONS = [
  { id: "create", label: "Create" },
  { id: "manage", label: "Manage" },
  { id: "optimize", label: "Optimize" },
] as const;

interface IdeNavSidebarProps {
  activeNavItem: string;
  onNavChange: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function IdeNavSidebar({
  activeNavItem,
  onNavChange,
  collapsed,
  onToggleCollapse,
}: IdeNavSidebarProps) {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  const bg = isLight ? "#ffffff" : "#0f0f0f";
  const border = isLight ? "#e5e5e5" : "#1e1e1e";
  const textMuted = isLight ? "#6b7280" : "#6b7280";
  const textLabel = isLight ? "#374151" : "#9ca3af";
  const sectionLabel = isLight ? "#9ca3af" : "#4b5563";
  const activeItemBg = isLight ? "#f3f4f6" : "#1f2937";
  const activeItemText = isLight ? "#111827" : "#f9fafb";
  const hoverBg = isLight ? "#f9fafb" : "#111827";
  const logoText = isLight ? "#111827" : "#f9fafb";
  const logoBadge = isLight ? "#111827" : "#f9fafb";
  const logoBadgeText = isLight ? "#ffffff" : "#000000";

  return (
    <aside
      className="h-full flex flex-col shrink-0 transition-all duration-200 overflow-hidden"
      style={{
        width: collapsed ? 0 : 220,
        background: bg,
        borderRight: `1px solid ${border}`,
        minWidth: collapsed ? 0 : 220,
      }}
    >
      {/* Logo / Brand */}
      <div
        className="flex items-center gap-2.5 px-4 shrink-0"
        style={{ height: 52, borderBottom: `1px solid ${border}` }}
      >
        {!collapsed && (
          <>
            <div className="flex flex-col min-w-0">
              <span
                className="text-[13px] font-semibold leading-tight truncate"
                style={{ color: logoText }}
              >
                Project Workspace
              </span>
              <span className="text-[10px]" style={{ color: textMuted }}>
                Default project
              </span>
            </div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke={textMuted}
              strokeWidth="2"
              className="ml-auto shrink-0"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "none" }}>
        {SECTIONS.map((section) => {
          const items = NAV_ITEMS.filter((i) => i.section === section.id);
          return (
            <div key={section.id} className="mb-1">
              {!collapsed && (
                <div
                  className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-widest uppercase"
                  style={{ color: sectionLabel }}
                >
                  {section.label}
                </div>
              )}
              {items.map((item) => {
                const isActive = activeNavItem === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavChange(item.id)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 transition-all duration-100 relative"
                    style={{
                      background: isActive ? activeItemBg : "transparent",
                      color: isActive ? activeItemText : textMuted,
                      borderRadius: 6,
                      margin: "1px 6px",
                      width: "calc(100% - 12px)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = hoverBg;
                        e.currentTarget.style.color = textLabel;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = textMuted;
                      }
                    }}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <span className="text-[13px] font-medium truncate">
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Collapse toggle */}
      <div
        className="shrink-0 flex items-center px-4 py-3"
        style={{ borderTop: `1px solid ${border}` }}
      >
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-2 transition-colors"
          style={{ color: textMuted }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = textLabel;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = textMuted;
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: collapsed ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
