"use client";

import { useState } from "react";
import { FileIcon } from "../FileIcon/FileIcon";
import { useActiveFileTabStore } from "../../store/activeFileTabStore";

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
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`text-[#858585] shrink-0 transition-transform duration-150 ${
        expanded ? "rotate-90" : ""
      }`}
    >
      <path d="M6 4l4 4-4 4V4z" />
    </svg>
  );
}

function FolderIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#dcb67a" className="shrink-0">
      <path d="M20 6h-8l-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2z" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#dcb67a" className="shrink-0">
      <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" />
    </svg>
  );
}

export const Tree = ({ fileFolderData, depth = 0 }: TreeProps) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const activeFileTab = useActiveFileTabStore((s) => s.activeFileTab);
  const setActiveFileTab = useActiveFileTabStore((s) => s.setActiveFileTab);

  if (!fileFolderData) return null;

  const hasChildren =
    fileFolderData.children && fileFolderData.children.length > 0;
  const extension = fileFolderData.name.split(".").pop()?.toLowerCase() ?? "file";
  const isFolder = hasChildren || fileFolderData.type === "directory";
  const nodePath = fileFolderData.path ?? fileFolderData.name;
  const isSelected = !isFolder && activeFileTab?.path === nodePath;
  const isReactFile = extension === "tsx" || extension === "jsx";

  const handleClick = () => {
    if (isFolder) {
      setExpanded((prev) => !prev);
    } else {
      setActiveFileTab(nodePath, "", extension);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={`w-full flex items-center h-[22px] pr-2 text-left group transition-colors ${
          isSelected
            ? "bg-[#04395e] text-[#ffffff]"
            : "text-[#cccccc] hover:bg-[#2a2d2e]"
        }`}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        <span className="w-4 h-4 flex items-center justify-center shrink-0">
          {isFolder ? (
            <Chevron expanded={expanded} />
          ) : (
            <span className="w-4" />
          )}
        </span>

        <span className="w-4 h-4 flex items-center justify-center shrink-0 mr-1.5">
          {isFolder ? (
            <FolderIcon open={expanded} />
          ) : (
            <FileIcon extension={extension} />
          )}
        </span>

        <span
          className={`text-[13px] truncate ${
            isReactFile && !isSelected ? "text-[#4fc1ff]" : ""
          }`}
        >
          {fileFolderData.name}
        </span>
      </button>

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
