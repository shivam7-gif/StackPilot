"use client";

import { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import { FileIcon } from "../FileIcon/FileIcon";
import styles from "./Tree.module.css";

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

  return (
    <div className={styles.treeContainer}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={styles.treeItem}
        style={{
          background: hovered ? "rgba(255, 255, 255, 0.04)" : "transparent",
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

        <span className={styles.iconWrap}>
          {hasChildren ? (
            expanded ? (
              <FaFolderOpen className={styles.folderIcon} />
            ) : (
              <FaFolder className={styles.folderIcon} />
            )
          ) : (
            <FileIcon extension={extension || "file"} />
          )}
          <span
            className={styles.name}
            onClick={() => hasChildren && setExpanded((prev) => !prev)}
            style={{ color: isReactFile ? "#61dafb" : undefined }}
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
