"use client";

import type { BeforeMount, OnMount } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import { configureMonaco, editorOptions } from "@/lib/monaco/setup";
import type { editor } from "monaco-editor";
import { useEditorSocketStore } from "@/store/EditorSocketStores";
import { useActiveFileTabStore } from "@/store/activeFileTabStore";
import { useEditorStatusStore } from "@/store/useEditorStatusStore";
import { useCommandPaletteStore } from "@/store/useCommandPaletteStore";
import { useMemo, useEffect, useRef, useCallback } from "react";
import debounce from "lodash/debounce";
import { useThemeStore } from "@/store/useThemeStore";

interface EditorPanelProps {
  value?: string;
  language?: string;
}

export default function EditorPanel({
  value,
  language = "typescript",
}: EditorPanelProps) {
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const { setCursor, autoSave, indentSpaces } = useEditorStatusStore();
  const { markDirty, updateTabValue, activeFileTab } = useActiveFileTabStore();
  const { editorSocket } = useEditorSocketStore();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

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
      case "md":
        return "markdown";
      case "py":
        return "python";
      case "sql":
        return "sql";
      case "sh":
        return "shell";
      case "yaml":
      case "yml":
        return "yaml";
      default:
        return "plaintext";
    }
  };

  const imageExtensions = ["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp"];
  const isImage = language && imageExtensions.includes(language.toLowerCase());
  const imageUrl = value;

  const saveContent = useCallback(
    (content: string, path: string) => {
      if (!editorSocket || !path) return;
      editorSocket.emit("writeFile", {
        data: content,
        pathToFileFolder: path,
      });
      updateTabValue(path, content);
      markDirty(path, false);
    },
    [editorSocket, updateTabValue, markDirty]
  );

  const debouncedSave = useMemo(
    () =>
      debounce((content: string, path: string) => {
        if (autoSave) {
          saveContent(content, path);
        }
      }, 1000),
    [saveContent, autoSave]
  );

  useEffect(() => {
    return () => {
      debouncedSave.flush();
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const handleManualSave = useCallback(() => {
    if (!editorRef.current || !activeFileTab?.path) return;
    const currentVal = editorRef.current.getValue();
    debouncedSave.cancel();
    saveContent(currentVal, activeFileTab.path);
  }, [debouncedSave, saveContent, activeFileTab?.path]);

  // Global Ctrl+S shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleManualSave]);

  const handleBeforeMount: BeforeMount = (monaco) => {
    configureMonaco(monaco);
  };

  const handleOnMount: OnMount = (editorInstance, monacoInstance) => {
    editorRef.current = editorInstance;

    editorInstance.onDidChangeCursorPosition((e) => {
      const selection = editorInstance.getSelection();
      const model = editorInstance.getModel();
      let count = 0;
      if (model && selection && !selection.isEmpty()) {
        count = model.getValueInRange(selection).length;
      }
      setCursor(e.position.lineNumber, e.position.column, count);
    });

    editorInstance.onDidChangeCursorSelection((e) => {
      const model = editorInstance.getModel();
      let count = 0;
      if (model && !e.selection.isEmpty()) {
        count = model.getValueInRange(e.selection).length;
      }
      const pos = editorInstance.getPosition();
      if (pos) {
        setCursor(pos.lineNumber, pos.column, count);
      }
    });

    // Bind Ctrl+S
    editorInstance.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
      () => {
        handleManualSave();
      }
    );

    // Bind Ctrl+P (Quick Open)
    editorInstance.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyP,
      () => {
        useCommandPaletteStore.getState().open("file");
      }
    );

    // Bind Ctrl+Shift+P (Command Palette)
    editorInstance.addCommand(
      monacoInstance.KeyMod.CtrlCmd |
        monacoInstance.KeyMod.Shift |
        monacoInstance.KeyCode.KeyP,
      () => {
        useCommandPaletteStore.getState().open("command");
      }
    );

    // Bind Ctrl+G (Go to line)
    editorInstance.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyG,
      () => {
        useCommandPaletteStore.getState().open("goto-line");
      }
    );
  };

  const handleChange = (
    nextValue: string | undefined,
    _e: editor.IModelContentChangedEvent
  ) => {
    if (!activeFileTab?.path) return;
    markDirty(activeFileTab.path, true);
    if (autoSave) {
      debouncedSave(nextValue ?? "", activeFileTab.path);
    }
  };

  const mergedOptions = useMemo(
    () => ({
      ...editorOptions,
      tabSize: indentSpaces,
    }),
    [indentSpaces]
  );

  return (
    <>
      {isImage ? (
        <div
          className={`h-full w-full flex items-center justify-center ${isLight ? "bg-slate-100" : "bg-[#1e1e1e]"}`}
        >
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
          theme={isLight ? "stackpilot-light" : "stackpilot-dark"}
          beforeMount={handleBeforeMount}
          onMount={handleOnMount}
          options={mergedOptions}
          onChange={handleChange}
        />
      )}
    </>
  );
}
