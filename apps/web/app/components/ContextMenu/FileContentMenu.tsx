"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useFileContextMenuStore } from "@/store/fileContextMenuStore";
import { useEditorSocketStore } from "@/store/EditorSocketStores";
import { useActiveFileTabStore } from "@/store/activeFileTabStore";
import { useTreeStructureStore } from "@/store/TreeStructureStore";

interface FileContextMenuProps {
  x: number;
  y: number;
  path: string;
  isFolder: boolean;
}

type MenuItem =
  | { type: "action"; id: string; label: string; danger?: boolean; disabled?: boolean }
  | { type: "separator" };

function getRelativePath(fullPath: string, projectId: string): string {
  const normalized = fullPath.replace(/\\/g, "/");
  const marker = `/${projectId}/`;
  const idx = normalized.indexOf(marker);
  if (idx >= 0) {
    return normalized.slice(idx + marker.length);
  }
  const parts = normalized.split("/");
  return parts[parts.length - 1] ?? fullPath;
}

function clampMenuPosition(x: number, y: number, isFolder: boolean) {
  const padding = 8;
  const menuWidth = 180;
  const menuHeight = isFolder ? 200 : 130;

  if (typeof window === "undefined") {
    return { x, y };
  }

  return {
    x: Math.max(padding, Math.min(x, window.innerWidth - menuWidth - padding)),
    y: Math.max(padding, Math.min(y, window.innerHeight - menuHeight - padding)),
  };
}

function MenuSeparator() {
  return (
    <div
      className="my-1 mx-2"
      style={{ height: 1, background: "var(--ide-border)" }}
      role="separator"
    />
  );
}

function MenuButton({
  label,
  danger,
  disabled,
  onClick,
}: {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full flex items-center h-[24px] px-3 text-left text-[13px] transition-colors disabled:opacity-40 disabled:cursor-default rounded-sm"
      style={{ color: danger ? "#ef4444" : "var(--ide-text)" }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = "var(--ide-hover)";
        e.currentTarget.style.color = danger ? "#ef4444" : "var(--ide-text-bright)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = danger ? "#ef4444" : "var(--ide-text)";
      }}
    >
      {label}
    </button>
  );
}

export const FileContextMenu = ({
  x,
  y,
  path,
  isFolder,
}: FileContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const position = clampMenuPosition(x, y, isFolder);
  const params = useParams();
  const projectId = params.id as string;

  const close = useFileContextMenuStore((s) => s.close);
  const startRename = useFileContextMenuStore((s) => s.startRename);
  const { editorSocket } = useEditorSocketStore();
  const closeTab = useActiveFileTabStore((s) => s.closeTab);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close]);

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      console.error("Failed to copy to clipboard");
    }
    close();
  };

  const handleDelete = () => {
    if (!editorSocket) return;
    if (isFolder) {
      editorSocket.emit("deleteFolder", { pathToFileFolder: path });
    } else {
      editorSocket.emit("deleteFile", { pathToFileFolder: path });
      closeTab(path);
    }
    close();
  };

  const { setNewFileInput, setTreeStructure } = useTreeStructureStore();

  const handleNewFile = () => {
    setNewFileInput({ parentPath: path, isFolder: false });
    close();
  };

  const handleNewFolder = () => {
    setNewFileInput({ parentPath: path, isFolder: true });
    close();
  };

  const handleOpenFile = () => {
    if (!editorSocket) return;
    editorSocket.emit("readFile", { pathToFileFolder: path });
    close();
  };

  const handleRefresh = () => {
    if (projectId) {
      void setTreeStructure(projectId);
    }
    close();
  };

  const handleRename = () => {
    startRename(path);
  };

  const items: MenuItem[] = isFolder
    ? [
        { type: "action", id: "new-file", label: "New File" },
        { type: "action", id: "new-folder", label: "New Folder" },
        { type: "action", id: "refresh", label: "Refresh Folder" },
        { type: "separator" },
        { type: "action", id: "copy-path", label: "Copy Path" },
        { type: "action", id: "copy-relative-path", label: "Copy Relative Path" },
        { type: "separator" },
        { type: "action", id: "rename", label: "Rename" },
        { type: "action", id: "delete", label: "Delete", danger: true },
      ]
    : [
        { type: "action", id: "open-file", label: "Open File" },
        { type: "action", id: "close-tab", label: "Close Tab" },
        { type: "separator" },
        { type: "action", id: "copy-path", label: "Copy Path" },
        { type: "action", id: "copy-relative-path", label: "Copy Relative Path" },
        { type: "separator" },
        { type: "action", id: "rename", label: "Rename" },
        { type: "action", id: "delete", label: "Delete", danger: true },
      ];

  const runAction = (id: string) => {
    switch (id) {
      case "new-file":
        handleNewFile();
        break;
      case "new-folder":
        handleNewFolder();
        break;
      case "open-file":
        handleOpenFile();
        break;
      case "close-tab":
        closeTab(path);
        close();
        break;
      case "refresh":
        handleRefresh();
        break;
      case "copy-path":
        void copyToClipboard(path);
        break;
      case "copy-relative-path":
        void copyToClipboard(getRelativePath(path, projectId));
        break;
      case "rename":
        handleRename();
        break;
      case "delete":
        handleDelete();
        break;
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] py-1 min-w-[180px] select-none rounded-md"
      style={{
        left: position.x,
        top: position.y,
        background: "var(--ide-titlebar-bg)",
        border: "1px solid var(--ide-border)",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, index) =>
        item.type === "separator" ? (
          <MenuSeparator key={`sep-${index}`} />
        ) : (
          <MenuButton
            key={item.id}
            label={item.label}
            danger={item.danger}
            disabled={item.disabled}
            onClick={() => runAction(item.id)}
          />
        ),
      )}
    </div>
  );
};
