"use client";

interface IdeTitleBarProps {
  projectName?: string;
}

export default function IdeTitleBar({ projectName }: IdeTitleBarProps) {
  return (
    <header className="h-[38px] w-full flex items-center bg-[#181818] border-b border-[#2b2b2b] shrink-0 select-none px-3 gap-3">
      <div className="flex gap-1.5 shrink-0">
        <div className="w-[11px] h-[11px] rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors" />
        <div className="w-[11px] h-[11px] rounded-full bg-[#febc2e] hover:bg-[#febc2e]/80 transition-colors" />
        <div className="w-[11px] h-[11px] rounded-full bg-[#28c840] hover:bg-[#28c840]/80 transition-colors" />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[13px] font-semibold text-[#cccccc] tracking-tight">
          StackPilot
        </span>
        {projectName && (
          <>
            <span className="text-[#555] text-xs">/</span>
            <span className="text-[12px] text-[#888] truncate max-w-[200px]">
              {projectName}
            </span>
          </>
        )}
      </div>

      <nav className="flex items-center gap-0.5 ml-2 shrink-0">
        {["Editor", "Preview", "Deploy"].map((tab, i) => (
          <button
            key={tab}
            className={`px-2.5 h-[26px] text-[11px] rounded-md transition-colors ${
              i === 0
                ? "bg-[#2a2a2a] text-[#e0e0e0] font-medium"
                : "text-[#888] hover:text-[#ccc] hover:bg-[#252525]"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      <button className="flex items-center gap-1.5 px-3 h-[26px] bg-[#0e639c] hover:bg-[#1177bb] rounded text-[11px] text-white font-medium transition-colors">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path d="M2 1.5v7l6.5-3.5L2 1.5z" />
        </svg>
        Run Dev
      </button>
    </header>
  );
}
