"use client";

export default function Terminal() {
  return (
    <div className="h-44 bg-[#141420] border-t border-[#2a2a3a] flex flex-col shrink-0">
      {/* Terminal tabs */}
      <div className="flex items-center border-b border-[#2a2a3a] h-8 px-2 shrink-0">
        {["Terminal", "Problems", "Output"].map((t) => (
          <button
            key={t}
            className={`px-3 h-full text-xs border-b-2 transition-colors ${
              t === "Terminal"
                ? "text-white border-white"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {/* Terminal — empty with cursor */}
      <div className="flex-1 p-2 font-mono text-[11px]">
        <div className="flex items-center gap-1">
          <span className="text-green-400">$</span>
          <span className="w-2 h-3.5 bg-gray-400 animate-pulse inline-block" />
        </div>
      </div>
    </div>
  );
}
