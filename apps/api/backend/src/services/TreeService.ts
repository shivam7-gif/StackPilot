import directoryTree from "directory-tree";
import path from "path";
import { PROJECTS_DIR } from "./project.service.js";

export const getProjectTreeService =async(projectId : string)=>{
  const projectPath = path.join(PROJECTS_DIR,projectId);
  const tree = directoryTree(projectPath);
  return tree;
}