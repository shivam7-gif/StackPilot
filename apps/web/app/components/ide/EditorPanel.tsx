"use client";

import type { BeforeMount } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import { configureMonaco, editorOptions } from "@/lib/monaco/setup";
import type { editor } from "monaco-editor";
import { useEditorSocketStore } from "@/store/EditorSocketStores";
import { useActiveFileTabStore } from "@/store/activeFileTabStore";
import { useMemo, useEffect } from "react";

interface EditorPanelProps {
  value?: string;
  language?: string;
}
import debounce from "lodash/debounce";
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
  const { activeFileTab } = useActiveFileTabStore();
  const { editorSocket } = useEditorSocketStore();
  const imageUrl = value;

  const handleBeforeMount: BeforeMount = (monaco) => {
    configureMonaco(monaco);
  };
  const debouncedSave = useMemo(
    () =>
      debounce((content: string, path: string) => {
        editorSocket?.emit("writeFile", {
          data: content,
          pathToFileFolder: path,
        });
      }, 1000),
    [editorSocket],
  );
  useEffect(() => {
    return () => {
      debouncedSave.flush();
      debouncedSave.cancel();
    };
  }, [debouncedSave]);
  const handleChange = (
    nextValue: string | undefined,
    e: editor.IModelContentChangedEvent,
  ) => {
    if (!editorSocket || !activeFileTab?.path) return;
    debouncedSave(nextValue ?? "", activeFileTab.path);
    console.log(nextValue, e);
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
          options={editorOptions}
          onChange={handleChange}
        />
      )}
    </>
  );
}
