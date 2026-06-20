"use client";

import type { BeforeMount } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import { useEffect } from "react";

interface EditorPanelProps {
  value?: string;
  language?: string;
}

export default function EditorPanel({
  value,
  language = "typescript",
}: EditorPanelProps) {
  const getLanguage = (ext?: string) => {
    switch (ext) {
      case "html":
        return "html";
      case "css":
        return "css";
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "json":
        return "json";
      default:
        return "plaintext";
    }
  };

  const imageExtensions = ["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp"];

  const isImage = language && imageExtensions.includes(language.toLowerCase());

  const imageUrl = value;

  useEffect(() => {
    console.log("Monaco Language:", language);
    console.log("mapped :", getLanguage(language));
  }, [language]);

  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme("stackpilot-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "C792EA" },
        { token: "string", foreground: "C3E88D" },
        { token: "number", foreground: "F78C6C" },
        { token: "type", foreground: "80CBC4" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#D4D4D4",
        "editor.lineHighlightBackground": "#282828",
        "editor.selectionBackground": "#264f78",
        "editor.inactiveSelectionBackground": "#3a3d41",
        "editorLineNumber.foreground": "#636369",
        "editorLineNumber.activeForeground": "#C6C6C6",
        "editorCursor.foreground": "#AEAFAD",
        "editorWhitespace.foreground": "#3B3B3B",
        "editorIndentGuide.background": "#2A2A2A",
        "editorIndentGuide.activeBackground": "#3D3D3D",
        "editor.findMatchBackground": "#515C6A",
        "editor.findMatchHighlightBackground": "#EA5C0055",
        "editorBracketMatch.background": "#0064001a",
        "editorBracketMatch.border": "#888888",
        "scrollbarSlider.background": "#79797966",
        "scrollbarSlider.hoverBackground": "#646464B3",
        "scrollbarSlider.activeBackground": "#BEBEBECC",
      },
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: "React",
      allowJs: true,
      typeRoots: ["node_modules/@types"],
    });
  };

  return (
    <>
      {isImage ? (
        <div className="h-full w-full flex items-center justify-center bg-[#1e1e1e]">
          <img
            src={imageUrl}
            alt="preview"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ) : (
        <Editor
          value={value}
          language={getLanguage(language)}
          height="100%"
          defaultValue="// Select a file from the explorer or start coding here"
          theme="stackpilot-dark"
          beforeMount={handleBeforeMount}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            renderLineHighlight: "line",
            padding: { top: 8 },
            tabSize: 2,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            contextmenu: true,
            wordWrap: "off",
            bracketPairColorization: { enabled: true },
            guides: { indentation: true },
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            parameterHints: {
              enabled: true,
            },
          }}
        />
      )}
    </>
  );
}
