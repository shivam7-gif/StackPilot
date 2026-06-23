import fs from "fs/promises";
import path from "path";
import { getProjectRecord } from "../src/services/projectStore.js";
import { PROJECTS_DIR } from "../src/services/project.service.js";

export async function resolveProjectHostPath(projectId: string): Promise<string> {
  const record = await getProjectRecord(projectId);
  const candidates = record
    ? [path.join(PROJECTS_DIR, record.folderName)]
    : [];

  candidates.push(path.join(PROJECTS_DIR, projectId));

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return path.resolve(candidate);
    } catch {
      // try next candidate
    }
  }

  const fallback = path.join(PROJECTS_DIR, projectId);
  await fs.mkdir(fallback, { recursive: true });
  return path.resolve(fallback);
}
