"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTreeStructureStore } from "../../store/TreeStructureStore";
import { Tree } from "../Tree/Tree";
import { useFileContextMenuStore } from "@/store/fileContextMenuStore";
import { FileContextMenu } from "../ContextMenu/FileContentMenu";
import { useEditorSocketStore } from "@/store/EditorSocketStores";
import { FileIcon } from "../FileIcon/FileIcon";

export const TreeStructure = () => {
  const {
    treeStructure,
    setTreeStructure,
    isLoading,
    error,
    newFileInput,
    setNewFileInput,
    setFolderExpanded,
  } = useTreeStructureStore();

  const { editorSocket } = useEditorSocketStore();
  const [newEntryName, setNewEntryName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const params = useParams();
  const projectId = params.id as string;
  const {
    file,
    isOpen: isFileContextOpen,
    x: fileContextX,
    y: fileContextY,
    isFolder,
    open: openContextMenu,
  } = useFileContextMenuStore();

  const handleCreateSubmit = () => {
    const trimmed = newEntryName.trim();
    if (!trimmed || !editorSocket) {
      setNewFileInput(null);
      setNewEntryName("");
      return;
    }

    const parent = newFileInput?.parentPath || treeStructure?.path || "";
    const targetPath = parent ? `${parent}/${trimmed}` : trimmed;

    if (newFileInput?.parentPath) {
      setFolderExpanded(newFileInput.parentPath, true);
    }

    if (newFileInput?.isFolder) {
      editorSocket.emit("createFolder", { pathToFileFolder: targetPath });
    } else {
      editorSocket.emit("createFile", { pathToFileFolder: targetPath });
    }

    setNewFileInput(null);
    setNewEntryName("");
  };

  const contextMenu =
    isFileContextOpen &&
    fileContextX != null &&
    fileContextY != null &&
    file ? (
      <FileContextMenu
        x={fileContextX}
        y={fileContextY}
        path={file}
        isFolder={isFolder}
      />
    ) : null;

  useEffect(() => {
    if (!projectId) return;
    const hasExisting =
      treeStructure !== null &&
      useTreeStructureStore.getState().projectId === projectId;
    void setTreeStructure(projectId, hasExisting);
  }, [projectId, setTreeStructure]);

  if (isLoading && !treeStructure) {
    return (
      <div className="px-3 py-4 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[22px] rounded animate-pulse"
            style={{
              width: `${60 + i * 8}%`,
              marginLeft: `${(i % 2) * 12}px`,
              background: "var(--ide-hover)",
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-3 text-[11px] text-[#f48771]">
        Failed to load files: {error}
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col select-none"
      style={{
        background: "var(--ide-sidebar-bg)",
        color: "var(--ide-tree-text, var(--ide-text))",
      }}
      onContextMenu={(e) => {
        if ((e.target as HTMLElement).closest(".group")) return;
        e.preventDefault();
        openContextMenu({
          path: treeStructure?.path ?? "",
          isFolder: true,
          x: e.clientX,
          y: e.clientY,
        });
      }}
    >
      {contextMenu}

      {newFileInput && (
        <div
          className="flex items-center h-[26px] px-2.5 gap-1.5 my-1 mx-1.5 rounded"
          style={{ background: "var(--ide-hover)" }}
        >
          <span className="w-4 h-4 flex items-center justify-center shrink-0">
            {newFileInput.isFolder ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#dcb67a">
                <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" />
              </svg>
            ) : (
              <FileIcon extension={newEntryName.split(".").pop() || "file"} />
            )}
          </span>
          <input
            ref={inputRef}
            autoFocus
            value={newEntryName}
            onChange={(e) => setNewEntryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateSubmit();
              if (e.key === "Escape") {
                setNewFileInput(null);
                setNewEntryName("");
              }
            }}
            onBlur={() => {
              if (newEntryName.trim()) handleCreateSubmit();
              else {
                setNewFileInput(null);
                setNewEntryName("");
              }
            }}
            placeholder={
              newFileInput.isFolder ? "folder name..." : "filename.tsx..."
            }
            className="flex-1 min-w-0 h-[20px] px-1 text-[12px] rounded outline-none border"
            style={{
              background: "var(--ide-input-bg)",
              borderColor: "var(--ide-accent)",
              color: "var(--ide-text)",
            }}
          />
        </div>
      )}

      {!treeStructure ? (
        <div
          className="px-3 py-3 text-[11px]"
          style={{ color: "var(--ide-text-dim)" }}
        >
          No files in this project yet.
        </div>
      ) : (
        <div className="py-1">
          <Tree fileFolderData={treeStructure} depth={0} />
        </div>
      )}
    </div>
  );
};

