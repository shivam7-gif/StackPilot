"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useCommandPaletteStore } from "@/store/useCommandPaletteStore";
import { useTreeStructureStore } from "@/store/TreeStructureStore";
import { useActiveFileTabStore } from "@/store/activeFileTabStore";
import { useEditorSocketStore } from "@/store/EditorSocketStores";
import { useThemeStore } from "@/store/useThemeStore";
import { useEditorStatusStore } from "@/store/useEditorStatusStore";
import { ActivePreviewStore } from "@/store/activePreviewStore";
import { FileIcon } from "../FileIcon/FileIcon";

interface FileItem {
  name: string;
  path: string;
  extension: string;
}

interface CommandItem {
  id: string;
  category: string;
  label: string;
  shortcut?: string;
  action: () => void;
}

function extractFilesFromTree(node: any, result: FileItem[] = []): FileItem[] {
  if (!node) return result;
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      extractFilesFromTree(child, result);
    }
  } else if (node.type === "file" || (node.name && !node.children)) {
    const ext = node.name.split(".").pop() || "";
    result.push({
      name: node.name,
      path: node.path || node.name,
      extension: ext,
    });
  }
  return result;
}

export default function CommandPalette() {
  const { isOpen, mode, initialQuery, close, setMode } =
    useCommandPaletteStore();
  const {
    treeStructure,
    projectId,
    setTreeStructure,
    triggerCollapseAll,
    setNewFileInput,
  } = useTreeStructureStore();
  const { tabs, activeTabPath, activeFileTab, closeTab, switchTab } =
    useActiveFileTabStore();
  const { editorSocket } = useEditorSocketStore();
  const { toggleTheme } = useThemeStore();
  const {
    autoSave,
    toggleAutoSave,
    setIndentSpaces,
    setEncoding,
    setEol,
    eol,
  } = useEditorStatusStore();
  const { activeView, previewUrl, openPreview, openEditor } =
    ActivePreviewStore();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Extract all files from project tree
  const allFiles = useMemo(() => {
    return extractFilesFromTree(treeStructure);
  }, [treeStructure]);

  // Global keyboard shortcuts (Ctrl+P, Ctrl+Shift+P, F1, Ctrl+G)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        useCommandPaletteStore.getState().open("command");
        return;
      }

      if (e.key === "F1") {
        e.preventDefault();
        useCommandPaletteStore.getState().open("command");
        return;
      }

      if (isCtrlOrCmd && !e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        useCommandPaletteStore.getState().open("file");
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === "g") {
        e.preventDefault();
        useCommandPaletteStore.getState().open("goto-line");
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Sync query when opening or initialQuery changes
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery || "");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 20);
    }
  }, [isOpen, initialQuery]);

  // Command palette registry
  const commands: CommandItem[] = useMemo(() => {
    return [
      {
        id: "file-new",
        category: "File",
        label: "New File",
        shortcut: "",
        action: () => {
          setNewFileInput({
            parentPath: treeStructure?.path ?? "",
            isFolder: false,
          });
        },
      },
      {
        id: "folder-new",
        category: "File",
        label: "New Folder",
        shortcut: "",
        action: () => {
          setNewFileInput({
            parentPath: treeStructure?.path ?? "",
            isFolder: true,
          });
        },
      },
      {
        id: "file-save",
        category: "File",
        label: "Save Active File",
        shortcut: "Ctrl+S",
        action: () => {
          if (activeFileTab && editorSocket) {
            editorSocket.emit("writeFile", {
              data: activeFileTab.value,
              pathToFileFolder: activeFileTab.path,
            });
            useActiveFileTabStore.getState().markDirty(activeFileTab.path, false);
          }
        },
      },
      {
        id: "file-toggle-autosave",
        category: "File",
        label: `Toggle Auto-save (${autoSave ? "Currently ON" : "Currently OFF"})`,
        shortcut: "",
        action: () => toggleAutoSave(),
      },
      {
        id: "tab-close-active",
        category: "View",
        label: "Close Active Editor Tab",
        shortcut: "Ctrl+W",
        action: () => {
          if (activeTabPath) closeTab(activeTabPath);
        },
      },
      {
        id: "tab-close-all",
        category: "View",
        label: "Close All Editor Tabs",
        action: () => {
          tabs.forEach((t) => closeTab(t.path));
        },
      },
      {
        id: "view-theme-toggle",
        category: "Preferences",
        label: "Toggle Theme (Light / Dark)",
        action: () => toggleTheme(),
      },
      {
        id: "explorer-refresh",
        category: "Explorer",
        label: "Refresh File Tree",
        action: () => {
          if (projectId) void setTreeStructure(projectId);
        },
      },
      {
        id: "explorer-collapse-all",
        category: "Explorer",
        label: "Collapse All Folders in Explorer",
        action: () => triggerCollapseAll(),
      },
      {
        id: "view-preview-toggle",
        category: "View",
        label: activeView === "preview" ? "Close Preview" : "Run Dev / Open Preview",
        action: () => {
          if (activeView === "preview") {
            openEditor();
          } else {
            openPreview(previewUrl || "");
          }
        },
      },
      {
        id: "indent-spaces-2",
        category: "Editor",
        label: "Change Indentation to 2 Spaces",
        action: () => setIndentSpaces(2),
      },
      {
        id: "indent-spaces-4",
        category: "Editor",
        label: "Change Indentation to 4 Spaces",
        action: () => setIndentSpaces(4),
      },
      {
        id: "encoding-utf8",
        category: "Editor",
        label: "Change Encoding to UTF-8",
        action: () => setEncoding("UTF-8"),
      },
      {
        id: "eol-toggle",
        category: "Editor",
        label: `Toggle Line Endings (Current: ${eol})`,
        action: () => setEol(eol === "LF" ? "CRLF" : "LF"),
      },
    ];
  }, [
    activeFileTab,
    activeTabPath,
    autoSave,
    editorSocket,
    eol,
    closeTab,
    openEditor,
    openPreview,
    previewUrl,
    activeView,
    projectId,
    setEncoding,
    setEol,
    setIndentSpaces,
    setNewFileInput,
    setTreeStructure,
    tabs,
    toggleAutoSave,
    toggleTheme,
    treeStructure?.path,
    triggerCollapseAll,
  ]);

  // Handle Query Changes and dynamic Mode switching
  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelectedIndex(0);

    // If starts with '>', switch to command mode
    if (val.startsWith(">") && mode !== "command") {
      setMode("command");
    } else if (!val.startsWith(">") && mode === "command" && initialQuery !== "command") {
      // If user clears '>', switch back to file mode
      setMode("file");
    }
  };

  // Filter items
  const filteredFiles = useMemo(() => {
    if (mode !== "file") return [];
    const cleanQ = query.trim().toLowerCase();
    if (!cleanQ) {
      // Show open tabs first or top files
      const tabPaths = new Set(tabs.map((t) => t.path));
      const openFileItems = allFiles.filter((f) => tabPaths.has(f.path));
      const remaining = allFiles.filter((f) => !tabPaths.has(f.path));
      return [...openFileItems, ...remaining].slice(0, 50);
    }
    return allFiles
      .filter(
        (f) =>
          f.name.toLowerCase().includes(cleanQ) ||
          f.path.toLowerCase().includes(cleanQ)
      )
      .slice(0, 50);
  }, [mode, query, allFiles, tabs]);

  const filteredCommands = useMemo(() => {
    if (mode !== "command") return [];
    const cleanQ = query.replace(/^>/, "").trim().toLowerCase();
    if (!cleanQ) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(cleanQ) ||
        c.category.toLowerCase().includes(cleanQ)
    );
  }, [mode, query, commands]);

  const activeItemsCount =
    mode === "file" ? filteredFiles.length : filteredCommands.length;

  const handleSelectFile = useCallback(
    (file: FileItem) => {
      // Check if already open
      const isAlreadyOpen = tabs.some((t) => t.path === file.path);
      if (isAlreadyOpen) {
        switchTab(file.path);
      } else if (editorSocket) {
        editorSocket.emit("readFile", { pathToFileFolder: file.path });
      }
      close();
    },
    [tabs, switchTab, editorSocket, close]
  );

  const handleSelectCommand = useCallback(
    (cmd: CommandItem) => {
      cmd.action();
      close();
    },
    [close]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < activeItemsCount - 1 ? prev + 1 : 0
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : Math.max(0, activeItemsCount - 1)
      );
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (mode === "file" && filteredFiles[selectedIndex]) {
        handleSelectFile(filteredFiles[selectedIndex]);
      } else if (mode === "command" && filteredCommands[selectedIndex]) {
        handleSelectCommand(filteredCommands[selectedIndex]);
      }
      return;
    }
  };

  // Keep selected item scrolled into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-start justify-center pt-[10vh] px-4 backdrop-blur-[2px] bg-black/40 animate-fade-in"
      onClick={close}
    >
      <div
        className="w-full max-w-[580px] rounded-xl shadow-2xl overflow-hidden border flex flex-col animate-scale-up"
        style={{
          background: "var(--ide-titlebar-bg)",
          borderColor: "var(--ide-border)",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div
          className="flex items-center px-3.5 h-[46px] gap-2.5 border-b"
          style={{ borderColor: "var(--ide-border)" }}
        >
          {mode === "command" ? (
            <span
              className="text-[13px] font-mono font-bold"
              style={{ color: "var(--ide-accent)" }}
            >
              &gt;
            </span>
          ) : (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--ide-text-dim)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === "command"
                ? "Type a command to run..."
                : "Search files by name (type > for commands)..."
            }
            className="flex-1 bg-transparent text-[13px] outline-none"
            style={{ color: "var(--ide-text-bright)" }}
          />

          <kbd
            className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
            style={{
              borderColor: "var(--ide-border)",
              color: "var(--ide-text-dim)",
              background: "var(--ide-hover)",
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[340px] overflow-y-auto ide-scrollbar py-1"
        >
          {mode === "file" && (
            <>
              {filteredFiles.length === 0 ? (
                <div
                  className="px-4 py-8 text-center text-[12px]"
                  style={{ color: "var(--ide-text-dim)" }}
                >
                  No matching files found
                </div>
              ) : (
                filteredFiles.map((file, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={file.path}
                      onClick={() => handleSelectFile(file)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className="flex items-center gap-2.5 px-3.5 py-2 cursor-pointer transition-colors"
                      style={{
                        background: isSelected
                          ? "var(--ide-hover)"
                          : "transparent",
                      }}
                    >
                      <span className="shrink-0 scale-90">
                        <FileIcon extension={file.extension} />
                      </span>
                      <span
                        className="text-[12.5px] font-medium truncate"
                        style={{
                          color: isSelected
                            ? "var(--ide-text-bright)"
                            : "var(--ide-text)",
                        }}
                      >
                        {file.name}
                      </span>
                      <span
                        className="text-[11px] truncate flex-1 text-right font-mono opacity-60"
                        style={{ color: "var(--ide-text-dim)" }}
                      >
                        {file.path}
                      </span>
                    </div>
                  );
                })
              )}
            </>
          )}

          {mode === "command" && (
            <>
              {filteredCommands.length === 0 ? (
                <div
                  className="px-4 py-8 text-center text-[12px]"
                  style={{ color: "var(--ide-text-dim)" }}
                >
                  No matching commands found
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={cmd.id}
                      onClick={() => handleSelectCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className="flex items-center justify-between px-3.5 py-2 cursor-pointer transition-colors"
                      style={{
                        background: isSelected
                          ? "var(--ide-hover)"
                          : "transparent",
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="text-[10px] uppercase font-semibold px-1 py-0.5 rounded"
                          style={{
                            background: "var(--ide-hover-strong)",
                            color: "var(--ide-accent)",
                          }}
                        >
                          {cmd.category}
                        </span>
                        <span
                          className="text-[12.5px] truncate"
                          style={{
                            color: isSelected
                              ? "var(--ide-text-bright)"
                              : "var(--ide-text)",
                          }}
                        >
                          {cmd.label}
                        </span>
                      </div>
                      {cmd.shortcut && (
                        <kbd
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ml-2"
                          style={{
                            borderColor: "var(--ide-border)",
                            color: "var(--ide-text-dim)",
                            background: "var(--ide-hover)",
                          }}
                        >
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Footer Hint */}
        <div
          className="flex items-center justify-between px-3.5 py-1.5 text-[10.5px] border-t"
          style={{
            borderColor: "var(--ide-border)",
            color: "var(--ide-text-dim)",
            background: "var(--ide-hover)",
          }}
        >
          <span>
            {mode === "file"
              ? "Tip: Type > to switch to Command Palette"
              : "Tip: Backspace > to switch to Quick Open"}
          </span>
          <div className="flex items-center gap-2">
            <span>Navigate: ↑↓</span>
            <span>Select: ↵</span>
          </div>
        </div>
      </div>
    </div>
  );
}
