import directoryTree from "directory-tree";
import path from "path";
import { PROJECTS_DIR } from "./project.service.js";
import { getProjectRecord } from "./projectStore.js";

export const getProjectTreeService = async (projectId: string) => {
  const projectRecord = await getProjectRecord(projectId);
  if (!projectRecord) {
    throw new Error(`Project record not found for id ${projectId}`);
  }

  const candidatePaths = [path.join(PROJECTS_DIR, projectRecord.folderName)];
  if (projectRecord.folderName !== projectId) {
    candidatePaths.push(path.join(PROJECTS_DIR, projectId));
  }

  let tree = null;
  let lastPath = candidatePaths[0];
  for (const candidatePath of candidatePaths) {
    lastPath = candidatePath;
    tree = directoryTree(candidatePath);
    if (tree) break;
  }

  if (!tree) {
    throw new Error(`Project folder missing at ${lastPath}`);
  }

  return tree;
};
