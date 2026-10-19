"use client";

import React, { useState } from "react";
import {
  FileCode2,
  FilePlus,
  FileEdit,
  FileMinus,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Layers,
  ArrowRight,
  Eye,
} from "lucide-react";
import type { EngineeringResult, ProjectFileChange } from "./types";
import { CodeBlock } from "./CodeBlock";

interface EngineeringResultViewProps {
  result: EngineeringResult;
  onOpenIde?: (projectId?: string) => void;
  onOpenPreview?: () => void;
}

export const EngineeringResultView: React.FC<EngineeringResultViewProps> = ({
  result,
  onOpenIde,
  onOpenPreview,
}) => {
  const [activeFile, setActiveFile] = useState<ProjectFileChange | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedFilePath, setCopiedFilePath] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const files = result.files || [];
  const arch = result.architecture;

  const createdCount = files.filter((f) => !f.action || f.action === "create").length;
  const modifiedCount = files.filter((f) => f.action === "modify").length;

  const handleCopyAll = async () => {
    try {
      const combined = files
        .map((f) => `// ========================\n// File: ${f.path}\n// ========================\n${f.code || ""}\n`)
        .join("\n");
      await navigator.clipboard.writeText(combined);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {}
  };

  const handleCopyFile = async (e: React.MouseEvent, file: ProjectFileChange) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(file.code || "");
      setCopiedFilePath(file.path);
      setTimeout(() => setCopiedFilePath(null), 2000);
    } catch {}
  };

  return (
    <div className="my-4 rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
      {/* Header Strip */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-50/80 border-b border-neutral-200">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-xs border border-orange-500/20">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-neutral-900 tracking-tight">
              {result.projectName || "Synthesized Workspace Plan"}
            </h4>
            <p className="text-[11px] text-neutral-500">
              {files.length} planned files • {createdCount} new, {modifiedCount} modified
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenIde && (
            <button
              type="button"
              onClick={() => onOpenIde(result.projectId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition active:scale-95 shadow-xs cursor-pointer"
            >
              <span>Open in IDE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition cursor-pointer"
            aria-label={isExpanded ? "Collapse section" : "Expand section"}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 text-xs">
          {/* Architecture Badges */}
          {arch && (
            <div className="flex flex-wrap gap-2 pt-1 pb-2 border-b border-neutral-100">
              {arch.frontend?.framework && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 font-mono text-[11px] border border-neutral-200">
                  <span className="text-neutral-400 font-sans">Frontend:</span> {arch.frontend.framework}
                </span>
              )}
              {arch.backend?.framework && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 font-mono text-[11px] border border-neutral-200">
                  <span className="text-neutral-400 font-sans">Backend:</span> {arch.backend.framework}
                </span>
              )}
              {arch.backend?.database && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 font-mono text-[11px] border border-neutral-200">
                  <span className="text-neutral-400 font-sans">Database:</span> {arch.backend.database}
                </span>
              )}
              {arch.frontend?.styling && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 font-mono text-[11px] border border-neutral-200">
                  <span className="text-neutral-400 font-sans">Styling:</span> {arch.frontend.styling}
                </span>
              )}
            </div>
          )}

          {/* Files List */}
          {files.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 font-mono">
                  Changed Files
                </span>
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 transition font-mono cursor-pointer"
                >
                  {copiedAll ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAll ? "Copied All" : "Copy All Files"}</span>
                </button>
              </div>

              <div className="border border-neutral-200 rounded-lg overflow-hidden divide-y divide-neutral-100 bg-neutral-50/50">
                {files.map((file, idx) => {
                  const isCreated = !file.action || file.action === "create";
                  const isModified = file.action === "modify";
                  const isDeleted = file.action === "delete";
                  const isSelected = activeFile?.path === file.path;

                  return (
                    <div
                      key={file.path || idx}
                      onClick={() => setActiveFile(isSelected ? null : file)}
                      className={`flex items-center justify-between px-3 py-2 text-xs transition cursor-pointer ${
                        isSelected
                          ? "bg-orange-50/80 text-orange-950 font-medium"
                          : "hover:bg-neutral-100/80 text-neutral-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isCreated && <FilePlus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        {isModified && <FileEdit className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        {isDeleted && <FileMinus className="w-3.5 h-3.5 text-red-600 shrink-0" />}

                        <span className="font-mono text-[12px] truncate">{file.path}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase ${
                            isCreated
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isModified
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {file.action || "create"}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleCopyFile(e, file)}
                          className="p-1 text-neutral-400 hover:text-neutral-700 transition"
                          title="Copy file code"
                        >
                          {copiedFilePath === file.path ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active File Code Preview */}
          {activeFile && (
            <div className="mt-3 border border-neutral-200 rounded-lg overflow-hidden animate-[fadeIn_150ms_ease_both]">
              <div className="flex items-center justify-between px-3 py-2 bg-neutral-100 border-b border-neutral-200">
                <span className="font-mono text-[12px] font-medium text-neutral-800">
                  {activeFile.path}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveFile(null)}
                  className="text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  Close preview
                </button>
              </div>
              <pre className="p-3 bg-neutral-900 text-neutral-100 font-mono text-[12px] leading-relaxed overflow-x-auto max-h-80">
                <code>{activeFile.code || "// No file content provided"}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
