"use client";

import { useEffect, useRef, useState } from "react";
import { FileIcon } from "../FileIcon/FileIcon";
import { useActiveFileTabStore } from "../../store/activeFileTabStore";
import { useEditorSocketStore } from "@/store/EditorSocketStores";
import { useFileContextMenuStore } from "@/store/fileContextMenuStore";
import { useTreeStructureStore } from "@/store/TreeStructureStore";

interface TreeNode {
  name: string;
  path?: string;
  children?: TreeNode[];
  type?: string;
}

interface TreeProps {
  fileFolderData: TreeNode;
  depth?: number;
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="text-[#858585] shrink-0"
      style={{
        transition: "transform 0.12s ease",
        transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
      }}
    >
      <path d="M6 4l4 4-4 4V4z" />
    </svg>
  );
}

function FolderIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="#dcb67a"
      className="shrink-0"
    >
      <path d="M20 6h-8l-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2z" />
    </svg>
  ) : (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="#dcb67a"
      className="shrink-0"
    >
      <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" />
    </svg>
  );
}

export const Tree = ({ fileFolderData, depth = 0 }: TreeProps) => {
  const [hovered, setHovered] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const collapseAllVersion = useTreeStructureStore((s) => s.collapseAllVersion);
  const expandedPaths = useTreeStructureStore((s) => s.expandedPaths);
  const toggleFolder = useTreeStructureStore((s) => s.toggleFolder);

  const activeTabPath = useActiveFileTabStore((s) => s.activeTabPath);
  const openTab = useActiveFileTabStore((s) => s.openTab);
  const closeTab = useActiveFileTabStore((s) => s.closeTab);
  const tabs = useActiveFileTabStore((s) => s.tabs);

  const { editorSocket } = useEditorSocketStore();
  const openContextMenu = useFileContextMenuStore((s) => s.open);
  const renamingPath = useFileContextMenuStore((s) => s.renamingPath);
  const clearRename = useFileContextMenuStore((s) => s.clearRename);
  const startRename = useFileContextMenuStore((s) => s.startRename);

  if (!fileFolderData) return null;

  const hasChildren =
    Array.isArray(fileFolderData.children) && fileFolderData.children.length > 0;
  const extension =
    fileFolderData.name.split(".").pop()?.toLowerCase() ?? "file";
  const isFolder =
    Array.isArray(fileFolderData.children) || fileFolderData.type === "directory";
  const resolvedNodePath = fileFolderData.path ?? fileFolderData.name;
  const isSelected = !isFolder && activeTabPath === resolvedNodePath;
  const isReactFile = extension === "tsx" || extension === "jsx";
  const isRenamingNode = renamingPath === resolvedNodePath;

  const defaultExpanded = depth < 2;
  const expanded =
    collapseAllVersion > 0
      ? (expandedPaths[resolvedNodePath] ?? false)
      : (expandedPaths[resolvedNodePath] ?? defaultExpanded);

  const submitRename = () => {
    const trimmed = renameInputRef.current?.value.trim() ?? "";
    clearRename();

    if (!trimmed || trimmed === fileFolderData.name || !editorSocket) return;

    const parentDir = resolvedNodePath.replace(/[/\\][^/\\]+$/, "");
    const separator = resolvedNodePath.includes("\\") ? "\\" : "/";
    const newPath = `${parentDir}${separator}${trimmed}`;

    editorSocket.emit("renamePath", {
      pathToFileFolder: resolvedNodePath,
      newPath,
    });

    const openTabMatch = tabs.find((tab) => tab.path === resolvedNodePath);
    if (openTabMatch) {
      closeTab(resolvedNodePath);
      openTab(newPath, openTabMatch.value, openTabMatch.extension, openTabMatch.fileType);
    }
  };

  const cancelRename = () => {
    clearRename();
  };

  const INDENT = 12;
  const paddingLeft = 8 + depth * INDENT;

  const handleClick = () => {
    if (isFolder) {
      toggleFolder(resolvedNodePath, expanded);
    } else {
      // Optimistically open tab; socket will fill in value
      openTab(resolvedNodePath, "", extension, "text");
      if (editorSocket) {
        console.log("[Editor] Requesting readFile:", resolvedNodePath);
        editorSocket.emit("readFile", { pathToFileFolder: resolvedNodePath });
      }
    }
  };
  function handleContextMenu(
    e: React.MouseEvent<HTMLButtonElement>,
    path: string,
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (!path) return;
    openContextMenu({
      x: e.clientX,
      y: e.clientY,
      path,
      isFolder,
    });
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Indentation guide line */}
      {depth > 0 && (
        <span
          style={{
            position: "absolute",
            left: 8 + (depth - 1) * INDENT + 6,
            top: 0,
            bottom: 0,
            width: 1,
            background: "var(--ide-border)",
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />
      )}

      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full flex items-center h-[22px] pr-1 text-left group relative cursor-pointer select-none"
        style={{
          paddingLeft,
          background: isSelected
            ? "var(--ide-selected)"
            : hovered
              ? "var(--ide-hover)"
              : "transparent",
          color: isSelected ? "var(--ide-selected-text)" : "var(--ide-text)",
          transition: "background 0.08s",
        }}
        onContextMenu={(e) => handleContextMenu(e, resolvedNodePath)}
      >
        {/* Chevron / spacer */}
        <span className="w-[14px] h-[14px] flex items-center justify-center shrink-0 mr-0.5 cursor-pointer">
          {isFolder ? (
            <Chevron expanded={expanded} />
          ) : (
            <span className="w-3" />
          )}
        </span>

        {/* Icon */}
        <span className="w-[16px] h-[16px] flex items-center justify-center shrink-0 mr-1.5 cursor-pointer">
          {isFolder ? (
            <FolderIcon open={expanded} />
          ) : (
            <FileIcon extension={extension} />
          )}
        </span>

        {/* Label */}
        {isRenamingNode ? (
          <input
            ref={renameInputRef}
            key={resolvedNodePath}
            defaultValue={fileFolderData.name}
            autoFocus
            onFocus={(e) => e.target.select()}
            onClick={(e) => e.stopPropagation()}
            onBlur={submitRename}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                e.preventDefault();
                submitRename();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                cancelRename();
              }
            }}
            className="flex-1 min-w-0 h-[18px] px-1 text-[13px] rounded outline-none"
            style={{
              background: "var(--ide-input-bg)",
              border: "1px solid var(--ide-accent)",
              color: "var(--ide-text)",
            }}
          />
        ) : (
          <span
            className="text-[13px] truncate flex-1 cursor-pointer"
            style={{
              color: isSelected ? "var(--ide-selected-text)" : isReactFile ? "var(--ide-react-color)" : "var(--ide-text)",
            }}
          >
            {fileFolderData.name}
          </span>
        )}

        {/* Hover actions */}
        {hovered && !isFolder && (
          <span className="flex items-center gap-0.5 pr-1 shrink-0 animate-fade-in">
            <span
              title="Rename"
              className="w-[16px] h-[16px] flex items-center justify-center rounded transition-colors cursor-pointer"
              style={{ color: "var(--ide-text-dim)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--ide-hover)";
                e.currentTarget.style.color = "var(--ide-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--ide-text-dim)";
              }}
              onClick={(e) => {
                e.stopPropagation();
                startRename(resolvedNodePath);
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </span>
            <span
              title="Delete"
              className="w-[16px] h-[16px] flex items-center justify-center rounded transition-colors cursor-pointer"
              style={{ color: "var(--ide-text-dim)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--ide-hover)";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--ide-text-dim)";
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (editorSocket) {
                  editorSocket.emit("deleteFile", { pathToFileFolder: resolvedNodePath });
                  closeTab(resolvedNodePath);
                }
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </span>
          </span>
        )}
      </button>

      {/* Children */}
      {isFolder && expanded && fileFolderData.children && (
        <div>
          {fileFolderData.children.map((child) => (
            <Tree
              key={`${child.path ?? child.name}-${child.type ?? "node"}`}
              fileFolderData={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
