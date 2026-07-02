import { spawn } from "child_process";
import crypto from "crypto";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { saveProjectRecord } from "../services/projectStore.js";
import {
  getScaffoldCommand,
  type Framework,
  PROJECTS_DIR,
} from "../services/project.service.js";

const runEngineWithSocket = async (
  prompt: string,
  socket: any
): Promise<{ projectId: string; projectName: string }> => {
  const workspaceRoot = path.resolve(process.cwd(), "../../..");
  const engineDir = path.join(workspaceRoot, "stackpilotAiEngine");
  const engineScript = path.join(engineDir, "index.ts");
  const localTsxCli = path.join(
    workspaceRoot,
    "apps",
    "api",
    "backend",
    "node_modules",
    "tsx",
    "dist",
    "cli.mjs"
  );

  socket.emit(
    "engine-output",
    "\n[stackpilot-ai] Starting engine session...\n"
  );

  const useLocalTsx = fsSync.existsSync(localTsxCli);
  const command = process.execPath;
  const args = useLocalTsx
    ? [localTsxCli, engineScript, prompt]
    : ["--import", "tsx", engineScript, prompt];

  const child = spawn(command, args, {
    cwd: engineDir,
    env: { ...process.env, STACKPILOT_PROMPT: prompt },
    shell: false,
    windowsHide: true,
  });

  let resultLine: string | null = null;

  const processLine = (line: string) => {
    if (line.startsWith("STACKPILOT_RESULT:")) {
      resultLine = line.slice("STACKPILOT_RESULT:".length).trim();
      // Don't stream the raw JSON to the client
      return;
    }
    socket.emit("engine-output", line + "\n");
  };

  // Buffer partial lines across chunks
  let lineBuffer = "";
  const handleChunk = (data: Buffer) => {
    lineBuffer += data.toString();
    const lines = lineBuffer.split("\n");
    lineBuffer = lines.pop() ?? "";
    lines.forEach(processLine);
  };

  child.stdout.on("data", handleChunk);
  child.stderr.on("data", (data: Buffer) => {
    socket.emit("engine-output", data.toString());
  });

  await new Promise<void>((resolve, reject) => {
    child.on("close", (code) => {
      // Flush any remaining buffer
      if (lineBuffer) processLine(lineBuffer);
      if (code === 0 || resultLine) {
        resolve();
      } else {
        reject(new Error(`Engine exited with code ${code}`));
      }
    });
    child.on("error", reject);
  });

  // ── Parse the STACKPILOT_RESULT and write files ──────────────────
  let generatedFiles: { path: string; code: string }[] = [];
  let projectName = "stackpilot-project";

  if (resultLine) {
    try {
      const parsed = JSON.parse(resultLine);
      generatedFiles = parsed.files ?? [];
      projectName = parsed.projectName ?? projectName;
    } catch {
      socket.emit("engine-output", "\n[stackpilot-ai] Could not parse engine result JSON.\n");
    }
  }

  // Create project folder and write files
  const projectId = crypto.randomUUID();
  const projectDir = path.join(PROJECTS_DIR, projectId);
  await fs.mkdir(projectDir, { recursive: true });

  socket.emit("engine-output", `\n[stackpilot-ai] Writing ${generatedFiles.length} files...\n`);

  await Promise.all(
    generatedFiles.map(async (file) => {
      // Sanitise path — prevent directory traversal
      const safePath = file.path.replace(/^\/+/, "").replace(/\.\.\//g, "");
      const fullPath = path.join(projectDir, safePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, file.code, "utf8");
      socket.emit("engine-output", `✓ ${safePath}\n`);
    })
  );

  // Save project record so the IDE can find it
  await saveProjectRecord({
    projectId,
    projectName,
    baseName: projectName,
    folderName: projectId,
    createdAt: new Date().toISOString(),
  });

  socket.emit("engine-output", "\n[stackpilot-ai] Engine session complete.\n");
  socket.emit("engine-status", { status: "complete" });

  return { projectId, projectName };
};


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
      env: { ...process.env, CI: "true" },
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
  socket.on("engine:run", async ({ prompt }: { prompt?: string }) => {
    if (!prompt?.trim()) {
      socket.emit(
        "engine-output",
        "\n[stackpilot-ai] Please provide a prompt.\n"
      );
      socket.emit("engine-status", {
        status: "error",
        error: "No prompt provided",
      });
      return;
    }

    try {
      socket.emit("engine-output", `\n[stackpilot-ai] Prompt: ${prompt}\n`);
      const { projectId, projectName } = await runEngineWithSocket(prompt, socket);

      // Redirect the dashboard to the IDE for the newly created project
      socket.emit("project-done", { projectId, projectName });
    } catch (error: any) {
      socket.emit("engine-output", `\n[stackpilot-ai] ${error.message}\n`);
      socket.emit("engine-status", { status: "error", error: error.message });
    }
  });

  socket.on(
    "createProject",
    async ({ frontend, backend, projectName }: ProjectCreatePayload) => {
      const baseName = projectName
        ? projectName.replace(/[^a-z0-9-]/gi, "-").toLowerCase()
        : crypto.randomUUID();

      const projectId = crypto.randomUUID();
      const mainFolder = path.join(PROJECTS_DIR, projectId);
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

        if (frontend) {
          const { command } = getScaffoldCommand(
            frontend,
            `${baseName}-frontend`
          );
          socket.emit("project-log", `Scaffolding frontend: ${frontend}`);
          await runSpawn(command, mainFolder, socket, "Frontend");
        }

        // 3. backend
        if (backend) {
          const { command } = getScaffoldCommand(
            backend,
            `${baseName}-backend`
          );
          socket.emit("project-log", `Scaffolding backend: ${backend}`);
          await runSpawn(command, mainFolder, socket, "Backend");
        }

        await saveProjectRecord({
          projectId,
          projectName: projectName ?? baseName,
          baseName,
          folderName: projectId,
          frontend,
          backend,
          createdAt: new Date().toISOString(),
        });

        socket.emit("project-step", "done");
        socket.emit("project-done", { projectId, projectName: baseName });
      } catch (error: any) {
        socket.emit("project-log", `Error: ${error.message}`);
        await fs
          .rm(mainFolder, { recursive: true, force: true })
          .catch(() => {});
      }
    }
  );
};
