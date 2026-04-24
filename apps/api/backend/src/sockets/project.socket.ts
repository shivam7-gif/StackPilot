import { spawn } from "child_process";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import {
  getScaffoldCommand,
  type Framework,
  PROJECTS_DIR,
} from "../services/project.service.js";

interface ProjectCreatePayload {
  frontend?: Framework;
  backend?: Framework;
  projectName?: string;
}

const runSpawn = (
  command: string,
  cwd: string,
  socket: any,
  label: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, {
      cwd,
      shell: true,
      env: { ...process.env, CI: "true" }, // ← fixes interactive prompts
    });

    proc.stdout.on("data", (data) =>
      socket.emit("project-log", data.toString())
    );
    proc.stderr.on("data", (data) =>
      socket.emit("project-log", data.toString())
    );

    proc.on("close", (code) => {
      socket.emit("project-log", `${label} process exited with code ${code}`);
      if (code === 0) resolve();
      else reject(new Error(`${label} failed with code ${code}`));
    });

    proc.on("error", (error) => reject(error));
  });
};

export const handleProjectSocket = (socket: any) => {
  socket.on(
    "createProject",
    async ({ frontend, backend, projectName }: ProjectCreatePayload) => {
      const baseName = projectName
        ? projectName.replace(/[^a-z0-9-]/gi, "-").toLowerCase()
        : crypto.randomUUID();

      const projectId = crypto.randomUUID();
      const mainFolder = path.join(PROJECTS_DIR, projectId); // ← unique container folder

      socket.emit("project-log", `Creating project ${baseName}...`);
      socket.emit("project-step", "folders");

      if (!frontend && !backend) {
        socket.emit(
          "project-log",
          "No frontend or backend framework selected."
        );
        return;
      }

      try {
        // 1. create main folder + architect + ai-engine
        await fs.mkdir(mainFolder, { recursive: true });
        await Promise.all([
          fs.mkdir(path.join(mainFolder, `${baseName}-architect`), {
            recursive: true,
          }),
          fs.mkdir(path.join(mainFolder, `${baseName}-ai-engine`), {
            recursive: true,
          }),
        ]);

        socket.emit("project-step", "scaffolding");

        // 2. frontend — sequential, not parallel
        if (frontend) {
          const { command } = getScaffoldCommand(
            frontend,
            `${baseName}-frontend`
          );
          socket.emit("project-log", `Scaffolding frontend: ${frontend}`);
          await runSpawn(command, mainFolder, socket, "Frontend"); // ← cwd is mainFolder
        }

        // 3. backend
        if (backend) {
          const { command } = getScaffoldCommand(
            backend,
            `${baseName}-backend`
          );
          socket.emit("project-log", `Scaffolding backend: ${backend}`);
          await runSpawn(command, mainFolder, socket, "Backend"); // ← cwd is mainFolder
        }

        socket.emit("project-step", "done");
        socket.emit("project-done", { projectId, projectName: baseName });
      } catch (error: any) {
        socket.emit("project-log", `Error: ${error.message}`);
        // cleanup on failure
        await fs
          .rm(mainFolder, { recursive: true, force: true })
          .catch(() => {});
      }
    }
  );
};
