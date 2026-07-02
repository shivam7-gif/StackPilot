"use client";

import { useState } from "react";
import { useThemeStore } from "../../store/useThemeStore";

interface IdeTopBarProps {
  projectName?: string;
  onSidebarToggle: () => void;
  sidebarCollapsed: boolean;
}

export default function IdeTopBar({
  projectName,
  onSidebarToggle,
  sidebarCollapsed,
}: IdeTopBarProps) {
  const { theme, setTheme } = useThemeStore();
  const isLight = theme === "light";

  const bg = isLight ? "#ffffff" : "#0f0f0f";
  const border = isLight ? "#e5e5e5" : "#1e1e1e";
  const textMuted = isLight ? "#6b7280" : "#6b7280";
  const textPrimary = isLight ? "#111827" : "#f9fafb";
  const textSecondary = isLight ? "#374151" : "#d1d5db";
  const btnBorder = isLight ? "#e5e7eb" : "#2d2d2d";
  const btnHoverBg = isLight ? "#f3f4f6" : "#1f2937";
  const draftBg = isLight ? "#fef3c7" : "#292500";
  const draftText = isLight ? "#92400e" : "#fbbf24";

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <header
      className="flex items-center px-4 shrink-0 gap-3"
      style={{
        height: 52,
        background: bg,
        borderBottom: `1px solid ${border}`,
      }}
    >
      {/* Left: back + title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Back arrow */}
        <button
          className="flex items-center justify-center w-7 h-7 rounded-md transition-colors shrink-0"
          style={{ color: textMuted }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = btnHoverBg;
            e.currentTarget.style.color = textPrimary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = textMuted;
          }}
          title="Back"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Title row */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[14px] font-semibold truncate"
            style={{ color: textPrimary }}
          >
            {projectName || "New project"}
          </span>

          {/* Chevron */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>

          {/* Edit icon */}
          <button
            className="flex items-center justify-center w-5 h-5 rounded transition-colors"
            style={{ color: textMuted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = textMuted;
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* Draft badge */}
          <span
            className="px-2 py-0.5 text-[11px] font-medium rounded-md"
            style={{ background: draftBg, color: draftText }}
          >
            Draft
          </span>

          <span className="text-[11px]" style={{ color: textMuted }}>
            Unsaved changes
          </span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* More options */}
        <button
          className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
          style={{ color: textMuted, border: `1px solid ${btnBorder}` }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = btnHoverBg;
            e.currentTarget.style.color = textPrimary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = textMuted;
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>

        <div className="w-px h-4 mx-0.5" style={{ background: btnBorder }} />

        {/* Compare */}
        <TopBarBtn label="Compare" icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
          </svg>
        } textMuted={textMuted} textPrimary={textPrimary} btnBorder={btnBorder} btnHoverBg={btnHoverBg} />

        {/* Optimize */}
        <TopBarBtn label="Optimize" icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        } textMuted={textMuted} textPrimary={textPrimary} btnBorder={btnBorder} btnHoverBg={btnHoverBg} />

        {/* Evaluate */}
        <TopBarBtn label="Evaluate" icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        } textMuted={textMuted} textPrimary={textPrimary} btnBorder={btnBorder} btnHoverBg={btnHoverBg} />

        <div className="w-px h-4 mx-0.5" style={{ background: btnBorder }} />

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isLight ? "dark" : "light")}
          className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
          style={{ color: textMuted, border: `1px solid ${btnBorder}` }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = btnHoverBg;
            e.currentTarget.style.color = textPrimary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = textMuted;
          }}
          title={isLight ? "Switch to Dark" : "Switch to Light"}
        >
          {isLight ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          )}
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 h-[30px] rounded-md text-[12px] font-semibold text-white transition-all"
          style={{
            background: saved ? "#22c55e" : "#111827",
          }}
        >
          {saved ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Saved
            </>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </header>
  );
}

function TopBarBtn({
  label,
  icon,
  textMuted,
  textPrimary,
  btnBorder,
  btnHoverBg,
}: {
  label: string;
  icon: React.ReactNode;
  textMuted: string;
  textPrimary: string;
  btnBorder: string;
  btnHoverBg: string;
}) {
  return (
    <button
      className="flex items-center gap-1.5 px-2.5 h-[28px] rounded-md text-[12px] font-medium transition-colors"
      style={{
        color: textMuted,
        border: `1px solid ${btnBorder}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = btnHoverBg;
        e.currentTarget.style.color = textPrimary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = textMuted;
      }}
    >
      {icon}
      {label}
    </button>
  );
}
