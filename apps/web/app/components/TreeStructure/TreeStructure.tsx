"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useTreeStructureStore } from "../../store/TreeStructureStore";
import { Tree } from "../Tree/tree";

export const TreeStructure = () => {
  const { treeStructure, setTreeStructure, isLoading, error } =
    useTreeStructureStore();

  const params = useParams();
  const projectId = params.id as string;

  useEffect(() => {
    if (!projectId) return;
    setTreeStructure(projectId);
  }, [projectId, setTreeStructure]);

  if (isLoading) {
    return (
      <div className="px-3 py-4 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[22px] rounded bg-[#252525] animate-pulse"
            style={{ width: `${60 + i * 8}%`, marginLeft: `${(i % 2) * 12}px` }}
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

  if (!treeStructure) {
    return (
      <div className="px-3 py-3 text-[11px] text-[#666]">
        No files in this project yet.
      </div>
    );
  }

  return (
    <div className="py-1">
      <Tree fileFolderData={treeStructure} depth={0} />
    </div>
  );
};
