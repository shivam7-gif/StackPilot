"use client";
import { useRef, useState, useCallback, useEffect } from "react";
// import Editro, { Editor } from "@monaco-editor/react"
import dynamic from "next/dynamic";
import { BeforeMount, OnMount } from "@monaco-editor/react";
const MIN_WIDTH = 180;
const MAX_WIDTH = 600;
import { useParams } from "next/navigation";
import Editor from "../../../../components/ide/EditorPanel";
import ChatPanel from "../../../../components/ai/ChatPanel";
import Terminal from "../../../../components/terminal/Terminal";
import { EditorButton } from "../../../../components/tree/EditorButton";

export default function Ide() {
  const { id } = useParams();
  const [fileWidth, setFileWidth] = useState(220);
  const [aiWidth, setAiWidth] = useState(420);

  const draggingFile = useRef(false);
  const draggingAi = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);


  const onMouseMoveFile = useCallback((e: MouseEvent) => {
    if (!draggingFile.current) return;
    const next = Math.min(
      MAX_WIDTH,
      Math.max(MIN_WIDTH, startWidth.current + (e.clientX - startX.current))
    );
    setFileWidth(next);
  }, []);

  const onMouseMoveAi = useCallback((e: MouseEvent) => {
    if (!draggingAi.current) return;
    const next = Math.min(
      MAX_WIDTH,
      Math.max(MIN_WIDTH, startWidth.current + (startX.current - e.clientX))
    );
    setAiWidth(next);
  }, []);

  const onMouseUp = useCallback(() => {
    draggingFile.current = false;
    draggingAi.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMoveFile);
    window.addEventListener("mousemove", onMouseMoveAi);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMoveFile);
      window.removeEventListener("mousemove", onMouseMoveAi);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMoveFile, onMouseMoveAi, onMouseUp]);

  const startDragFile = (e: React.MouseEvent) => {
    draggingFile.current = true;
    startX.current = e.clientX;
    startWidth.current = fileWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  };

  const startDragAi = (e: React.MouseEvent) => {
    draggingAi.current = true;
    startX.current = e.clientX;
    startWidth.current = aiWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  };

  console.log(id);

  return (
    <div className="h-screen w-screen bg-[#1a1a1a] text-white flex flex-col font-sans overflow-hidden">
      <h1>project Id : {id}</h1>
      {/* ── Title bar ── */}
      <div className="h-11 w-full flex items-center bg-[#1e1e1e] border-b border-[#2a2a2a] shrink-0 relative select-none px-3">
        {/* macOS dots */}
        <div className="flex gap-1.5 mr-3 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>

        {/* App name */}
        <span className="text-sm font-bold text-white mr-2 shrink-0">
          StackPilot
        </span>

        {/* Editor / Preview / Deploy tabs */}
        <div className="flex items-center gap-1 shrink-0">
          <button className="px-3 h-6 text-xs bg-[#3a3a4a] text-white rounded font-medium">
            Editor
          </button>
          <button className="px-3 h-6 text-xs text-gray-400 hover:text-gray-200 transition-colors">
            Preview
          </button>
          <button className="px-3 h-6 text-xs text-gray-400 hover:text-gray-200 transition-colors">
            Deploy
          </button>
        </div>

        <div className="flex-1" />

        {/* RIGHT: Karma Active + Run Dev */}
        <div className="flex items-center gap-2 shrink-0">
          {/* <div className="flex items-center gap-1.5 px-3 h-7 bg-[#1e2e1e] border border-green-700/50 rounded text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Karma Active
          </div> */}
          <button className="flex items-center gap-1.5 px-3 h-7 bg-[#2a2a2a] border border-[#3a3a3a] rounded text-xs text-gray-200 hover:bg-[#333] transition-colors">
            <span className="text-white">▶</span> Run Dev
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 min-h-0 w-full flex-col">
        {/* Top section */}
        <div className="flex flex-1 min-h-0 w-full">
        {/* ── File Explorer ── */}
        <div
          className="h-full bg-[#1e1e1e] shrink-0 overflow-y-auto flex flex-col border-r border-[#2a2a2a]"
          style={{ width: fileWidth }}
        >
          <div className="px-3 py-2 text-[10px] font-semibold tracking-[0.15em] text-gray-500 uppercase border-b border-[#2a2a2a]">
            Explorer
          </div>
          {/* Empty state */}
          <div className="flex-1 flex items-center justify-center">
            
          </div>
        </div>

        {/* Drag handle — explorer */}
        <div
          onMouseDown={startDragFile}
          className="w-1 h-full cursor-col-resize shrink-0 relative group"
        >
          <div className="absolute inset-0 bg-[#2a2a2a] group-hover:bg-blue-500 transition-colors duration-150" />
        </div>

        {/* ── Editor ── */}
        <div className="flex-1 h-full bg-[#1a1a2e] min-w-0 overflow-hidden flex flex-col">
          {/* File tabs — empty */}
          <div className="w-full flex items-center bg-[#1e1e2e] border-b border-[#2a2a3a] h-9 px-3 shrink-0">
            <EditorButton isActive={true} />
          </div>

          {/* Editor empty state */}
          <div className="flex-1 flex items-center justify-center">
            <Editor />
          </div>

          {/* Status bar */}
          <div className="h-6 bg-[#1e1e2e] border-t border-[#2a2a3a] flex items-center px-3 gap-4 text-[10px] text-gray-500 shrink-0">
            <span className="text-green-400 font-medium">✓ TypeScript</span>
            <span>Ln 1, Col 1</span>
            <span>UTF-8</span>
            <span>2 spaces</span>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-yellow-400">⚡ AI Line</span>
              <span>Prettier · ESLint</span>
            </div>
          </div>
        </div>

        {/* Drag handle — AI panel */}
        <ChatPanel aiWidth={aiWidth} onDragStart={startDragAi} />
        </div>

        {/* Terminal at bottom */}
        <Terminal />
      </div>
    </div>
  );
}
