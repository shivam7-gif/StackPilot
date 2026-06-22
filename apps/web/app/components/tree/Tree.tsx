"use client";

import { useRef, useState } from "react";
import { FileIcon } from "../FileIcon/FileIcon";
import { useActiveFileTabStore } from "../../store/activeFileTabStore";
import { useEditorSocketStore } from "@/store/EditorSocketStores";
import { useFileContextMenuStore } from "@/store/fileContextMenuStore";

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
  const [expanded, setExpanded] = useState(depth < 2);
  const [hovered, setHovered] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

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
    fileFolderData.children && fileFolderData.children.length > 0;
  const extension =
    fileFolderData.name.split(".").pop()?.toLowerCase() ?? "file";
  const isFolder = hasChildren || fileFolderData.type === "directory";
  const resolvedNodePath = fileFolderData.path ?? fileFolderData.name;
  const isSelected = !isFolder && activeTabPath === resolvedNodePath;
  const isReactFile = extension === "tsx" || extension === "jsx";
  const isRenamingNode = renamingPath === resolvedNodePath;

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
      setExpanded((prev) => !prev);
    } else {
      // Optimistically open tab; socket will fill in value
      openTab(resolvedNodePath, "", extension, "text");
      editorSocket?.emit("readFile", { pathToFileFolder: resolvedNodePath });
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
            background: "rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }}
        />
      )}

      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full flex items-center h-[22px] pr-1 text-left group relative"
        style={{
          paddingLeft,
          background: isSelected
            ? "#04395e"
            : hovered
              ? "#2a2d2e"
              : "transparent",
          color: isSelected ? "#ffffff" : "#cccccc",
          transition: "background 0.08s",
        }}
        onContextMenu={(e) => handleContextMenu(e, resolvedNodePath)}
      >
        {/* Chevron / spacer */}
        <span className="w-[14px] h-[14px] flex items-center justify-center shrink-0 mr-0.5">
          {isFolder ? (
            <Chevron expanded={expanded} />
          ) : (
            <span className="w-3" />
          )}
        </span>

        {/* Icon */}
        <span className="w-[16px] h-[16px] flex items-center justify-center shrink-0 mr-1.5">
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
              background: "#3c3c3c",
              border: "1px solid #007fd4",
              color: "#cccccc",
            }}
          />
        ) : (
          <span
            className="text-[13px] truncate flex-1"
            style={{
              color: isSelected ? "#fff" : isReactFile ? "#4fc1ff" : "#cccccc",
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
              className="w-[16px] h-[16px] flex items-center justify-center rounded text-[#858585] hover:text-[#ccc] hover:bg-[#3a3a3a]"
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
              className="w-[16px] h-[16px] flex items-center justify-center rounded text-[#858585] hover:text-[#f48771] hover:bg-[#3a3a3a]"
              onClick={(e) => e.stopPropagation()}
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
