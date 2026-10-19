import fs from "fs/promises";
import path from "path";
import { PROJECTS_DIR, type Framework } from "./project.service.js";

export interface ProjectRecord {
  projectId: string;
  projectName: string;
  baseName: string;
  folderName: string;
  description?: string | undefined;
  category?: string | undefined;
  ownerId?: string | undefined;
  status?: ("draft" | "onboarding" | "scaffolding" | "ready" | "failed") | undefined;
  frontend?: Framework | string | undefined;
  backend?: Framework | string | undefined;
  database?: string | undefined;
  language?: string | undefined;
  styling?: string | undefined;
  libraries?: string[] | undefined;
  model?: string | undefined;
  prompt?: string | undefined;
  createdAt: string;
  updatedAt?: string | undefined;
}

const PROJECT_RECORDS_PATH = path.join(PROJECTS_DIR, "project-records.json");

const ensureProjectStoreExists = async (): Promise<void> => {
  try {
    await fs.access(PROJECT_RECORDS_PATH);
  } catch {
    await fs.mkdir(PROJECTS_DIR, { recursive: true });
    await fs.writeFile(PROJECT_RECORDS_PATH, "[]", "utf8");
  }
};

const readProjectRecords = async (): Promise<ProjectRecord[]> => {
  await ensureProjectStoreExists();
  const raw = await fs.readFile(PROJECT_RECORDS_PATH, "utf8");
  if (!raw.trim()) return [];
  try {
    return JSON.parse(raw) as ProjectRecord[];
  } catch (err) {
    console.warn(
      "[projectStore] Warning: Failed to parse project-records.json directly. Attempting extraction repair...",
      err
    );
    const startIdx = raw.indexOf("[");
    const lastIdx = raw.lastIndexOf("]");
    if (startIdx >= 0 && lastIdx > startIdx) {
      try {
        const slice = raw.substring(startIdx, lastIdx + 1);
        const parsed = JSON.parse(slice) as ProjectRecord[];
        await fs.writeFile(PROJECT_RECORDS_PATH, JSON.stringify(parsed, null, 2), "utf8");
        return parsed;
      } catch {}
    }
    return [];
  }
};

const writeProjectRecords = async (records: ProjectRecord[]): Promise<void> => {
  await ensureProjectStoreExists();
  const tmpPath = `${PROJECT_RECORDS_PATH}.tmp.${Date.now()}`;
  await fs.writeFile(tmpPath, JSON.stringify(records, null, 2), "utf8");
  await fs.rename(tmpPath, PROJECT_RECORDS_PATH);
};

export const saveProjectRecord = async (record: ProjectRecord): Promise<void> => {
  const records = await readProjectRecords();
  const existingIndex = records.findIndex((item) => item.projectId === record.projectId);

  const now = new Date().toISOString();
  const toSave: ProjectRecord = {
    ...record,
    updatedAt: now,
    createdAt: record.createdAt || now,
  };

  if (existingIndex >= 0) {
    records[existingIndex] = toSave;
  } else {
    records.push(toSave);
  }

  await writeProjectRecords(records);
};

export const updateProjectRecord = async (
  projectId: string,
  updates: Partial<ProjectRecord>
): Promise<ProjectRecord | null> => {
  const records = await readProjectRecords();
  const idx = records.findIndex((item) => item.projectId === projectId);
  if (idx < 0) return null;

  const current = records[idx];
  const updated: ProjectRecord = Object.assign({}, current, updates, {
    updatedAt: new Date().toISOString(),
  });
  records[idx] = updated;

  await writeProjectRecords(records);
  return updated;
};

export const getProjectRecord = async (
  projectId: string
): Promise<ProjectRecord | undefined> => {
  const records = await readProjectRecords();
  return records.find((record) => record.projectId === projectId);
};

export const getAllProjects = async (ownerId?: string): Promise<ProjectRecord[]> => {
  const records = await readProjectRecords();
  if (!ownerId) return records;
  return records.filter((r) => !r.ownerId || r.ownerId === ownerId);
};

export const deleteProjectRecord = async (projectId: string): Promise<boolean> => {
  const records = await readProjectRecords();
  const initialLen = records.length;
  const filtered = records.filter((r) => r.projectId !== projectId);
  if (filtered.length !== initialLen) {
    await writeProjectRecords(filtered);
    try {
      const folderPath = path.join(PROJECTS_DIR, projectId);
      await fs.rm(folderPath, { recursive: true, force: true });
    } catch {}
    return true;
  }
  return false;
};
