import directoryTree from "directory-tree";
import path from "path";
import { PROJECTS_DIR } from "./project.service.js";
import { getProjectRecord } from "./projectStore.js";

export const getProjectTreeService = async (projectId: string) => {
  const projectRecord = await getProjectRecord(projectId);
  if (!projectRecord) {
    throw new Error(`Project record not found for id ${projectId}`);
  }

  const projectPath = path.join(PROJECTS_DIR, projectRecord.folderName);
  const tree = directoryTree(projectPath);
  
  if (!tree) {
    throw new Error(`Project folder missing at ${projectPath}`);
  }

  return tree;
};
