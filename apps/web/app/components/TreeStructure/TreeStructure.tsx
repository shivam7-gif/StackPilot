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
    if (!projectId) {
      console.log("No projectId available");
      return;
    }

    console.log("Fetching tree structure for projectId:", projectId);
    setTreeStructure(projectId);
  }, [projectId, setTreeStructure]);

  useEffect(() => {
    if (treeStructure) {
      console.log("Tree structure updated:", treeStructure);
    }
  }, [treeStructure]);

  return (
    <div>
      <h1>Tree Structure</h1>
      {isLoading && <div>Loading tree structure...</div>}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      {!isLoading && !error && treeStructure ? (
        <Tree fileFolderData={treeStructure} />
      ) : (
        !isLoading && !error && <div>No tree structure available</div>
      )}
    </div>
  );
};
