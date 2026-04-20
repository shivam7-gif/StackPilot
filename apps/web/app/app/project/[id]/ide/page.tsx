"use client"
import { useRef, useState, useCallback, useEffect } from "react";
import Editro, { Editor } from "@monaco-editor/react"
import dynamic from "next/dynamic";
import {BeforeMount , OnMount} from "@monaco-editor/react"
const MIN_WIDTH = 180;
const MAX_WIDTH = 600;
import { useParams } from "next/navigation";
import Editor from "../../../../components/ide/EditorPanel"

export default function Ide() {
  const {id} = useParams();
  const [fileWidth, setFileWidth] = useState(220);
  const [aiWidth, setAiWidth] = useState(420);
  const [activeAiTab, setActiveAiTab] = useState<"karma" | "linecoder">("karma");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ text: string }[]>([]);

  const draggingFile = useRef(false);
  const draggingAi = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

//   const Editor = dynamic(()=> import ("@monaco-editor/react"),{ssr : false});
//   const handleBeforeMount: BeforeMount = (monaco) => {
//   // Enable full TS/JS language features
//   monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
//     target: monaco.languages.typescript.ScriptTarget.ESNext,
//     allowNonTsExtensions: true,
//     moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
//     module: monaco.languages.typescript.ModuleKind.CommonJS,
//     noEmit: true,
//     esModuleInterop: true,
//     jsx: monaco.languages.typescript.JsxEmit.React,
//     reactNamespace: "React",
//     allowJs: true,
//     typeRoots: ["node_modules/@types"],
//   });
//   const handleMount : OnMount = (editor , monaco)=>{

//     editor.onDidChangeModelContent((event)=>{
//       const model = editor.getModel();
//       if(!model) return ;

//       for(const change of event.changes){
//         if(change.text === ">"){
//           const position = editor.getPosition();
//           if(!position) continue;

//           const lineContent = model.getLineContent(position.lineNumber);
//           const textBeforeCursor = lineContent.substring(0,position.column - 1);

//           const openTagMatch = textBeforeCursor.match(/<([a-zA-Z][a-zA-Z0-9.-]*)(\s[^>]*)?\s*$/);

//           if(openTagMatch){
//             const tagName = openTagMatch[1];
//             const selfClosing = new Set([
//               "area","base","br","col","embed","hr","img","input",
//             "link","meta","param","source","track","wbr"
//             ]);

//             if(!selfClosing.has(tagName.toLowerCase())){
//               const closingTag = `</${tagName}>`;

//               editor.executeEdits("auto-close-tag",[
//                 {
//                   range:new monaco.Range(
//                     position.lineNumber,position.column,
//                     position.lineNumber,position.column
//                   ),
//                   text: closingTag,
//                 },
//               ])
//             }
//           }
//         }
//       }
//     })
//     monaco.languages.registerColorProvider("typescript",{
//       provideDocumentColors(model){
//         const matches : monaco.languages.IColorInformation[]=[];
//         const text = model.getValue();
//         const lines = text.split("\n");

//         const hexRegex = /#([0-9a-fA-F]{3,8})\b/g;

//         lines.forEach((line,lineIndex)=>{
//           let match;
//           while((match = hexRegex.exec(line))!== null){
//             const hex = match[1];
//             const r = parseInt(hex.slice(0,2),16)/255;
//             const g = parseInt(hex.slice(2,4),16)/255;
//             const b = parseInt(hex.slice(4,6),16)/255;
//             const a = hex.length ===8 ? parseInt(hex.slice(6,8),16)/255 : 1;

//             matches.push({
//               color :{red : r, green : g , blue : b , alpha : a},
//               range : {
//                 startLineNumber : lineIndex + 1,
//                 startColumn : match.index + 1,
//                 endLineNumber : lineIndex + 1,
//                 endColumn : match.index + 1 + match[0].length+1,
//               }
//             })
//           }
//         })
//       }
//     })
//   }

//   monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
//     noSemanticValidation: false,
//     noSyntaxValidation: false,
//   });
// };

  const onMouseMoveFile = useCallback((e: MouseEvent) => {
    if (!draggingFile.current) return;
    const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + (e.clientX - startX.current)));
    setFileWidth(next);
  }, []);

  const onMouseMoveAi = useCallback((e: MouseEvent) => {
    if (!draggingAi.current) return;
    const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + (startX.current - e.clientX)));
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

  const handleSend = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { text: trimmed }]);
    setChatInput("");
    
  };
  console.log(id)

  return (
    <div className="h-screen w-screen bg-[#1a1a1a] text-white flex flex-col font-sans overflow-hidden">
      <h1>
          project Id : {id}
        </h1>
      {/* ── Title bar ── */}
      <div className="h-11 w-full flex items-center bg-[#1e1e1e] border-b border-[#2a2a2a] shrink-0 relative select-none px-3">
        {/* macOS dots */}
        <div className="flex gap-1.5 mr-3 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>

        {/* App name */}
        <span className="text-sm font-bold text-white mr-2 shrink-0">StackPilot</span>

        {/* Editor / Preview / Deploy tabs */}
        <div className="flex items-center gap-1 shrink-0">
          <button className="px-3 h-6 text-xs bg-[#3a3a4a] text-white rounded font-medium">Editor</button>
          <button className="px-3 h-6 text-xs text-gray-400 hover:text-gray-200 transition-colors">Preview</button>
          <button className="px-3 h-6 text-xs text-gray-400 hover:text-gray-200 transition-colors">Deploy</button>
        </div>

        <div className="flex-1" />

        {/* RIGHT: Karma Active + Run Dev */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 h-7 bg-[#1e2e1e] border border-green-700/50 rounded text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Karma Active
          </div>
          <button className="flex items-center gap-1.5 px-3 h-7 bg-[#2a2a2a] border border-[#3a3a3a] rounded text-xs text-gray-200 hover:bg-[#333] transition-colors">
            <span className="text-white">▶</span> Run Dev
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 min-h-0 w-full">
        
        {/* ── File Explorer ── */}
        <div className="h-full bg-[#1e1e1e] shrink-0 overflow-y-auto flex flex-col border-r border-[#2a2a2a]" style={{ width: fileWidth }}>
          <div className="px-3 py-2 text-[10px] font-semibold tracking-[0.15em] text-gray-500 uppercase border-b border-[#2a2a2a]">
            Explorer
          </div>
          {/* Empty state */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] text-gray-600 text-center px-4">No folder open</p>
          </div>
        </div>

        {/* Drag handle — explorer */}
        <div onMouseDown={startDragFile} className="w-1 h-full cursor-col-resize shrink-0 relative group">
          <div className="absolute inset-0 bg-[#2a2a2a] group-hover:bg-blue-500 transition-colors duration-150" />
        </div>

        {/* ── Editor ── */}
        <div className="flex-1 h-full bg-[#1a1a2e] min-w-0 overflow-hidden flex flex-col">

          {/* File tabs — empty */}
          <div className="w-full flex items-center bg-[#1e1e2e] border-b border-[#2a2a3a] h-9 px-3 shrink-0">
          </div>

          {/* Editor empty state */}
          <div className="flex-1 flex items-center justify-center">
            <Editor/>
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

          {/* Terminal panel */}
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
        </div>

        {/* Drag handle — AI panel */}
        <div onMouseDown={startDragAi} className="w-1 h-full cursor-col-resize shrink-0 relative group">
          <div className="absolute inset-0 bg-[#2a2a2a] group-hover:bg-blue-500 transition-colors duration-150" />
        </div>

        {/* ── AI Panel ── */}
        <div className="h-full bg-[#1a1a1a] shrink-0 overflow-hidden flex flex-col border-l border-[#2a2a2a]" style={{ width: aiWidth }}>

          {/* AI panel tabs */}
          <div className="flex items-center border-b border-[#2a2a2a] h-9 shrink-0">
            <button
              onClick={() => setActiveAiTab("karma")}
              className={`px-4 h-full text-xs border-b-2 transition-colors ${activeAiTab === "karma" ? "text-white border-white" : "text-gray-500 border-transparent hover:text-gray-300"}`}
            >
              Karma v0.1
            </button>
            <button
              onClick={() => setActiveAiTab("linecoder")}
              className={`px-4 h-full text-xs border-b-2 transition-colors ${activeAiTab === "linecoder" ? "text-white border-white" : "text-gray-500 border-transparent hover:text-gray-300"}`}
            >
              Line Coder
            </button>
          </div>

          {/* Karma header */}
          <div className="px-4 pt-4 pb-2 border-b border-[#2a2a2a] shrink-0">
            <h2 className="text-2xl font-bold text-gray-100 tracking-tight">karma 0.1</h2>
            <p className="text-xs text-gray-500 mt-0.5">AI Full-Stack Agent · Code Generation Mode</p>
            <div className="mt-2 h-1 w-full bg-[#2a2a2a] rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: "0%" }} />
            </div>
          </div>

          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-gray-600 text-center">Ask Karma to build something</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded bg-[#2a2a4a] flex items-center justify-center text-[10px] font-bold text-blue-300 shrink-0">U</div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Chat input */}
          <div className="p-3 border-t border-[#2a2a2a] flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Karma to build something..."
              className="flex-1 bg-[#111118] border border-[#2a2a3a] rounded-lg px-3 h-9 text-xs text-gray-300 placeholder-gray-600 outline-none focus:border-blue-500/50 transition-colors"
            />
            <button
              onClick={handleSend}
              className="px-4 h-9 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium text-white transition-colors shrink-0"
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
