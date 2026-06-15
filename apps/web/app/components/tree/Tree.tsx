"use client";

import { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { icons } from "./treeIcons";

interface TreeNode {
  name: string;
  children?: TreeNode[];
  type?: string;
}

interface TreeProps {
  fileFolderData: TreeNode;
}

export const Tree = ({ fileFolderData }: TreeProps) => {
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);

  if (!fileFolderData) return null;

  const hasChildren =
    fileFolderData.children && fileFolderData.children.length > 0;
  const extension = fileFolderData.name.split(".").pop()?.toLowerCase();
  const isReactFile = extension === "tsx" || extension === "jsx";
  const isFile = !hasChildren;
  const iconSrc = hasChildren
    ? icons.folder
    : isReactFile
      ? icons.reactFile
      : icons.file;

  const itemIcon = (
    <img
      src={iconSrc}
      alt={
        hasChildren
          ? "folder icon"
          : isReactFile
            ? "react file icon"
            : "file icon"
      }
      style={{ width: 18, height: 18 }}
    />
  );

  return (
    <div style={{ color: "white" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "4px 0",
          background: hovered ? "rgba(255, 255, 255, 0.08)" : "transparent",
          borderRadius: "4px",
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              height: "24px",
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              outline: "none",
              padding: 0,
            }}
          >
            <IoIosArrowForward
              style={{
                transition: "transform 0.2s",
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              }}
            />
          </button>
        ) : (
          <span style={{ display: "inline-block", width: "24px" }} />
        )}

        <span
          style={{ display: "flex", alignItems: "center", marginLeft: "8px" }}
        >
          {itemIcon}
          <span
            style={{
              marginLeft: "8px",
              cursor: isFile ? "default" : "pointer",
              fontSize: "15px",
              color: isReactFile ? "#61dafb" : "white",
            }}
            onClick={() => hasChildren && setExpanded((prev) => !prev)}
          >
            {fileFolderData.name}
          </span>
        </span>
      </div>

      {hasChildren && expanded && (
        <div style={{ paddingLeft: "18px" }}>
          {fileFolderData.children.map((child) => (
            <Tree
              key={`${child.name}-${child.type ?? "node"}`}
              fileFolderData={child}
            />
          ))}
        </div>
      )}
    </div>
  );
};
