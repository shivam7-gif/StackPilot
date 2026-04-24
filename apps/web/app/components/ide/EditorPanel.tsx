"use client";
import dynamic from "next/dynamic";
import type { BeforeMount } from "@monaco-editor/react";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function EditorPanel() {
  const handleBeforeMount: BeforeMount = (monaco) => {
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
      height="100vh"
      defaultLanguage="typescript"
      defaultValue="// start coding"
      theme="vs-dark"
      beforeMount={handleBeforeMount}
      options={{
        fontSize: 13,
        fontFamily: "JetBrains Mono, Fira Code, monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: "on",
        renderLineHighlight: "line",
        padding: { top: 12 },
        tabSize: 2,
        cursorBlinking: "smooth",
        smoothScrolling: true,
        contextmenu: true,
        wordWrap: "on",
      }}
    />
  );
}