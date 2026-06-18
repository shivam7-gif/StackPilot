"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTreeStructureStore } from "../../store/TreeStructureStore";
import { Tree } from "../Tree/tree";
import axios from "axios";

export const TreeStructure = () => {
  const { treeStructure, setTreeStructure, isLoading, error } =
    useTreeStructureStore();

  const params = useParams();
  const projectId = params.id as string;

  const [projectName, setProjectName] = useState("");
  const [projectBaseName, setProjectBaseName] = useState("");
  const [projectFolderName, setProjectFolderName] = useState("");

  useEffect(() => {
    async function fetchMeta() {
      if (!projectId) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/projects/${projectId}/meta`
        );
        setProjectName(res.data.projectName);
        setProjectBaseName(res.data.baseName);
        setProjectFolderName(res.data.folderName);
      } catch (err) {
        console.error(err);
      }
    }
    fetchMeta();
  }, [projectId]);

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
      {projectName && (
        <div className="px-3 py-2 text-xs font-semibold text-gray-300 border-b border-[#242424] bg-[#1a1a1a]/40 flex items-center gap-1.5 select-none">
          <span className="truncate">{projectName} Folder</span>
        </div>
      )}
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
