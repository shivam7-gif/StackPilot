import fs from "fs/promises";
import path from "path";
import { PROJECTS_DIR, type Framework } from "./project.service.js";

export interface ProjectRecord {
  projectId: string;
  projectName: string;
  baseName: string;
  folderName: string;
  frontend: Framework | undefined;
  backend: Framework | undefined;
  createdAt: string;
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
  return JSON.parse(raw) as ProjectRecord[];
};

const writeProjectRecords = async (records: ProjectRecord[]): Promise<void> => {
  await ensureProjectStoreExists();
  await fs.writeFile(
    PROJECT_RECORDS_PATH,
    JSON.stringify(records, null, 2),
    "utf8"
  );
};

export const saveProjectRecord = async (
  record: ProjectRecord
): Promise<void> => {
  const records = await readProjectRecords();

  const existingIndex = records.findIndex(
    (item) => item.projectId === record.projectId
  );

  console.log("Saving project:", record.projectId);

  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }

  await writeProjectRecords(records);
};

export const getProjectRecord = async (
  projectId: string
): Promise<ProjectRecord | undefined> => {
  const records = await readProjectRecords();

  console.log("Looking for project:", projectId);
  console.log("Available records:", records);

  return records.find((record) => record.projectId === projectId);
};
