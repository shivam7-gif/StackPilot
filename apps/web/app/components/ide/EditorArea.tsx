"use client";

import dynamic from "next/dynamic";
import { useActiveFileTabStore } from "@/store/activeFileTabStore";
const Editor = dynamic(() => import("./EditorPanel"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-[#666] text-sm">
      Loading editor…
    </div>
  ),
});

interface EditorAreaProps {
  activeFileName?: string;
  value?: string;
  language?: string;
}

export default function EditorArea({
  activeFileName,
  value,
  language,
}: EditorAreaProps) {
  const tabLabel = activeFileName ?? "untitled.ts";
  const { activeFileTab } = useActiveFileTabStore();
  return (
    <div className="flex-1 h-full min-w-0 flex flex-col bg-[#1e1e1e]">
      <div className="h-[35px] flex items-end bg-[#181818] border-b border-[#2b2b2b] shrink-0 overflow-x-auto">
        <div className="flex items-center h-full px-4 min-w-[120px] max-w-[200px] bg-[#1e1e1e] border-r border-[#2b2b2b] border-t-2 border-t-[#007fd4] text-[12px] text-[#e0e0e0] gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#3178c6">
            <rect width="24" height="24" rx="3" fill="#3178c6" />
            <text
              x="5"
              y="17"
              fill="white"
              fontSize="11"
              fontWeight="bold"
              fontFamily="monospace"
            >
              TS
            </text>
          </svg>
          <span className="truncate">{tabLabel}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <Editor
          value={activeFileTab?.value}
          language={activeFileTab?.extension}
        />
      </div>

      <footer className="h-[22px] bg-[#007acc] flex items-center px-3 gap-4 text-[11px] text-white/90 shrink-0">
        <span className="flex items-center gap-1">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="opacity-80"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          {activeFileTab?.extension}
        </span>
        <span>Ln 1, Col 1</span>
        <span>UTF-8</span>
        <span>Spaces: 2</span>
        <div className="ml-auto flex items-center gap-3 opacity-90">
          <span>Prettier</span>
          <span>ESLint</span>
        </div>
      </footer>
    </div>
  );
}
