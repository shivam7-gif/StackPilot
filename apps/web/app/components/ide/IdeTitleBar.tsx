"use client";

import { useState } from "react";

interface IdeTitleBarProps {
  projectName?: string;
}

const MENU_ITEMS = ["File", "Edit", "View", "Terminal", "Help"];

export default function IdeTitleBar({ projectName }: IdeTitleBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <header
      className="h-[38px] w-full flex items-center shrink-0 select-none"
      style={{
        background: "#181818",
        borderBottom: "1px solid #2b2b2b",
      }}
    >
      {/* macOS traffic light dots */}
      <div className="flex gap-[6px] pl-3 pr-2 shrink-0">
        <div className="w-[11px] h-[11px] rounded-full bg-[#ff5f57] hover:brightness-90 transition-all cursor-pointer" title="Close" />
        <div className="w-[11px] h-[11px] rounded-full bg-[#febc2e] hover:brightness-90 transition-all cursor-pointer" title="Minimize" />
        <div className="w-[11px] h-[11px] rounded-full bg-[#28c840] hover:brightness-90 transition-all cursor-pointer" title="Maximize" />
      </div>

      {/* Menu bar */}
      <nav className="flex items-center h-full shrink-0">
        {MENU_ITEMS.map((item) => (
          <button
            key={item}
            onMouseEnter={() => activeMenu && setActiveMenu(item)}
            onClick={() => setActiveMenu(activeMenu === item ? null : item)}
            onBlur={() => setActiveMenu(null)}
            className={`px-2 h-full text-[12px] transition-colors ${
              activeMenu === item
                ? "bg-[#2a2d2e] text-[#e0e0e0]"
                : "text-[#cccccc] hover:bg-[#2a2d2e]"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Center — project breadcrumb */}
      <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0 px-4">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#dcb67a" className="shrink-0 opacity-80">
          <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" />
        </svg>
        <span className="text-[12px] font-medium text-[#cccccc] truncate max-w-[300px]">
          {projectName || "StackPilot"}
        </span>
        {projectName && (
          <>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="#555" className="shrink-0">
              <path d="M6 4l4 4-4 4V4z" />
            </svg>
            <span className="text-[12px] text-[#858585]">IDE</span>
          </>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 pr-3 shrink-0">
        {/* Git branch indicator */}
        <div className="flex items-center gap-1 px-2 h-[22px] rounded text-[11px] text-[#858585] hover:text-[#ccc] hover:bg-[#2a2d2e] transition-colors cursor-pointer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="6" cy="6" r="2" />
            <circle cx="6" cy="18" r="2" />
            <circle cx="18" cy="12" r="2" />
            <path d="M6 8v8M8 6h5a3 3 0 013 3v3" />
          </svg>
          <span>main</span>
        </div>

        {/* Separator */}
        <div className="w-px h-4 bg-[#333]" />

        {/* Notifications */}
        <button className="w-7 h-7 flex items-center justify-center rounded text-[#858585] hover:text-[#ccc] hover:bg-[#2a2d2e] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>

        {/* Settings */}
        <button className="w-7 h-7 flex items-center justify-center rounded text-[#858585] hover:text-[#ccc] hover:bg-[#2a2d2e] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>

        {/* Separator */}
        <div className="w-px h-4 bg-[#333]" />

        {/* Run button */}
        <button className="flex items-center gap-1.5 px-3 h-[26px] rounded text-[11px] font-medium text-white transition-all"
          style={{ background: "linear-gradient(135deg, #0e639c 0%, #1177bb 100%)" }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M2 1.5v7l6.5-3.5L2 1.5z" />
          </svg>
          Run Dev
        </button>
      </div>
    </header>
  );
}
