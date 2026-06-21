import type { Monaco } from "@monaco-editor/react";
import { registerCompletionProviders } from "./completions";

let configured = false;

export function configureMonaco(monaco: Monaco) {
  if (configured) return;
  configured = true;

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

  const compilerOptions = {
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
  };

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
    compilerOptions
  );
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
    compilerOptions
  );

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  registerCompletionProviders(monaco);
}

export const editorOptions = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  fontLigatures: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  lineNumbers: "on" as const,
  renderLineHighlight: "line" as const,
  padding: { top: 8 },
  tabSize: 2,
  cursorBlinking: "smooth" as const,
  cursorSmoothCaretAnimation: "on" as const,
  smoothScrolling: true,
  contextmenu: true,
  wordWrap: "off" as const,
  bracketPairColorization: { enabled: true },
  guides: { indentation: true },
  scrollbar: {
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
  },
  quickSuggestions: {
    other: true,
    comments: false,
    strings: true,
  },
  suggestOnTriggerCharacters: true,
  tabCompletion: "on" as const,
  wordBasedSuggestions: "matchingDocuments" as const,
  acceptSuggestionOnCommitCharacter: true,
  acceptSuggestionOnEnter: "on" as const,
  autoClosingBrackets: "always" as const,
  autoClosingQuotes: "always" as const,
  autoClosingTags: "always" as const,
  autoClosingOvertype: "always" as const,
  autoIndent: "full" as const,
  formatOnType: true,
  parameterHints: {
    enabled: true,
  },
  suggest: {
    showKeywords: true,
    showSnippets: true,
    preview: true,
    insertMode: "insert" as const,
    localityBonus: true,
  },
};
