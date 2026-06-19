"use client";

import { TreeStructure } from "../TreeStructure/TreeStructure";

interface ExplorerPanelProps {
  width: number;
}

const SIDEBAR_ICONS = [
  {
    id: "files",
    label: "Explorer",
    active: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    id: "search",
    label: "Search",
    active: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3-3" />
      </svg>
    ),
  },
  {
    id: "git",
    label: "Source Control",
    active: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="6" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="12" r="2" />
        <path d="M6 8v8M8 6h5a3 3 0 013 3v3" />
      </svg>
    ),
  },
];

export default function ExplorerPanel({ width }: ExplorerPanelProps) {
  return (
    <div
      className="h-full shrink-0 flex bg-[#181818] border-r border-[#2b2b2b]"
      style={{ width }}
    >
      <aside className="w-[48px] shrink-0 flex flex-col items-center py-2 gap-1 border-r border-[#2b2b2b] bg-[#181818]">
        {SIDEBAR_ICONS.map(({ id, label, active, icon }) => (
          <button
            key={id}
            title={label}
            className={`w-[38px] h-[38px] flex items-center justify-center rounded-md transition-colors ${
              active
                ? "text-[#e0e0e0] bg-[#252525]"
                : "text-[#858585] hover:text-[#ccc] hover:bg-[#252525]/60"
            }`}
          >
            {icon}
          </button>
        ))}
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="h-[35px] flex items-center px-4 text-[11px] font-semibold tracking-[0.08em] text-[#bbbbbb] uppercase border-b border-[#2b2b2b] shrink-0">
          Explorer
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden ide-scrollbar">
          <TreeStructure />
        </div>
      </div>
    </div>
  );
}
