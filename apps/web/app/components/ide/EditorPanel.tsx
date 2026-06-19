"use client";

import type { BeforeMount } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";

export default function EditorPanel() {
  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme("stackpilot-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.lineHighlightBackground": "#2a2d2e",
        "editorLineNumber.foreground": "#858585",
        "editorLineNumber.activeForeground": "#cccccc",
        "editor.selectionBackground": "#264f78",
        "editor.inactiveSelectionBackground": "#3a3d41",
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
    <Editor
      height="100%"
      defaultLanguage="typescript"
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
      }}
    />
  );
}
