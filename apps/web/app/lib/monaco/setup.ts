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
      "editor.background": "#0e1012",
      "editor.foreground": "#d4d8dc",
      "editor.lineHighlightBackground": "#14171a",
      "editor.selectionBackground": "#173823",
      "editor.inactiveSelectionBackground": "#132419",
      "editorLineNumber.foreground": "#505860",
      "editorLineNumber.activeForeground": "#d4d8dc",
      "editorCursor.foreground": "#2ea043",
      "editorWhitespace.foreground": "#22272b",
      "editorIndentGuide.background": "#181d22",
      "editorIndentGuide.activeBackground": "#2a343d",
      "editor.findMatchBackground": "#2ea04355",
      "editor.findMatchHighlightBackground": "#2ea04333",
      "editorBracketMatch.background": "#2ea04322",
      "editorBracketMatch.border": "#2ea04388",
      "scrollbarSlider.background": "#22272b88",
      "scrollbarSlider.hoverBackground": "#333a40cc",
      "scrollbarSlider.activeBackground": "#444d56ee",
    },
  });

  monaco.editor.defineTheme("stackpilot-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "008000", fontStyle: "italic" },
      { token: "keyword", foreground: "7C3AED" },
      { token: "string", foreground: "059669" },
      { token: "number", foreground: "D97706" },
      { token: "type", foreground: "0D9488" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#1e293b",
      "editor.lineHighlightBackground": "#f8fafc",
      "editor.selectionBackground": "#bfdbfe",
      "editor.inactiveSelectionBackground": "#e2e8f0",
      "editorLineNumber.foreground": "#94a3b8",
      "editorLineNumber.activeForeground": "#334155",
      "editorCursor.foreground": "#0f172a",
      "editorWhitespace.foreground": "#cbd5e1",
      "editorIndentGuide.background": "#e2e8f0",
      "editorIndentGuide.activeBackground": "#cbd5e1",
      "editor.findMatchBackground": "#fef08a",
      "editor.findMatchHighlightBackground": "#fef9c3",
      "editorBracketMatch.background": "#e0e7ff",
      "editorBracketMatch.border": "#818cf8",
      "scrollbarSlider.background": "#cbd5e166",
      "scrollbarSlider.hoverBackground": "#94a3b8aa",
      "scrollbarSlider.activeBackground": "#64748b",
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
