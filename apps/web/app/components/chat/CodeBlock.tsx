"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = "text", value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const displayLang = language.replace(/^language-/, "").toLowerCase() || "code";

  return (
    <div className="my-3.5 rounded-lg border border-neutral-200 bg-neutral-900 overflow-hidden text-neutral-100 shadow-2xs">
      {/* Header Strip */}
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-neutral-800 bg-neutral-950/80 select-none">
        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-medium">
          {displayLang}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-white transition-colors py-0.5 px-1.5 rounded cursor-pointer font-mono"
          aria-label="Copy code block"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-3.5 overflow-x-auto text-[13px] font-mono leading-relaxed whitespace-pre text-neutral-200">
        <code>{value}</code>
      </pre>
    </div>
  );
};
