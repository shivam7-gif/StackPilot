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
  let architecture: any = null;

  const finalResultLine = resultLine as string | null;
  if (finalResultLine) {
    try {
      let clean = finalResultLine.trim();
      const firstBrace = clean.indexOf("{");
      const lastBrace = clean.lastIndexOf("}");
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        clean = clean.substring(firstBrace, lastBrace + 1);
      }
      const parsed = JSON.parse(clean);
      generatedFiles = parsed.files ?? [];
      projectName = parsed.projectName ?? projectName;
      architecture = parsed.architecture ?? null;
    } catch (e: any) {
      socket.emit(
        "engine-output",
        `\n[stackpilot-ai] Could not parse engine result JSON: ${e.message}\n`
      );
    }
  }

  // Create project folder and write files
  const projectId = crypto.randomUUID();
  const baseName =
    projectName.replace(/[^a-z0-9-]/gi, "-").toLowerCase() ||
    "stackpilot-project";
  const projectDir = path.join(PROJECTS_DIR, projectId);
  await fs.mkdir(projectDir, { recursive: true });

  const architectDir = path.join(projectDir, `${baseName}-architect`);
  const aiEngineDir = path.join(projectDir, `${baseName}-ai-engine`);
  await Promise.all([
    fs.mkdir(architectDir, { recursive: true }),
    fs.mkdir(aiEngineDir, { recursive: true }),
  ]);

  const architectMd = `# System Architecture Blueprint\n\nProject: **${projectName}**\n\n## Blueprint\n\`\`\`json\n${JSON.stringify(architecture || {}, null, 2)}\n\`\`\`\n`;
  const aiEngineMd = `# StackPilot AI Pipeline Blueprint\n\nSession completed: ${new Date().toISOString()}\n\nGenerated files: ${generatedFiles.length}\n`;

  await Promise.all([
    fs.writeFile(path.join(architectDir, "ARCHITECTURE.md"), architectMd, "utf8"),
    fs.writeFile(path.join(architectDir, "architecture.json"), JSON.stringify(architecture || {}, null, 2), "utf8"),
    fs.writeFile(path.join(aiEngineDir, "PIPELINE.md"), aiEngineMd, "utf8"),
  ]);

  socket.emit(
    "engine-output",
    `\n[stackpilot-ai] Writing ${generatedFiles.length} files...\n`
  );

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

  // Normalize and scaffold frameworks if detected
  const fwClean = (fw: string | undefined): Framework | undefined => {
    if (!fw || typeof fw !== "string") return undefined;
    const clean = fw.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (clean.includes("react")) return "react";
    if (clean.includes("next")) return "nextjs";
    if (clean.includes("vue")) return "vue";
    if (clean.includes("nuxt")) return "nuxt";
    if (clean.includes("angular")) return "angular";
    if (clean.includes("svelte")) return "svelte";
    if (clean.includes("astro")) return "astro";
    if (clean.includes("spring")) return "springboot";
    if (clean.includes("express")) return "express";
    if (clean.includes("nest")) return "nestjs";
    if (clean.includes("django")) return "django";
    if (clean.includes("laravel")) return "laravel";
    return undefined;
  };

  const resolvedFrontend = fwClean(architecture?.frontend?.framework);
  const resolvedBackend = fwClean(architecture?.backend?.framework);

  if (resolvedFrontend) {
    socket.emit("engine-output", `\n[stackpilot-ai] Scaffolding frontend: ${resolvedFrontend}...\n`);
    try {
      const { command } = getScaffoldCommand(resolvedFrontend, `${baseName}-frontend`);
      await runSpawn(command, projectDir, socket, "Frontend");
    } catch (e: any) {
      socket.emit("engine-output", `⚠️ Frontend scaffold: ${e.message}\n`);
    }
  }

  if (resolvedBackend) {
    socket.emit("engine-output", `\n[stackpilot-ai] Scaffolding backend: ${resolvedBackend}...\n`);
    try {
      const { command } = getScaffoldCommand(resolvedBackend, `${baseName}-backend`);
      await runSpawn(command, projectDir, socket, "Backend");
    } catch (e: any) {
      socket.emit("engine-output", `⚠️ Backend scaffold: ${e.message}\n`);
    }
  }

  // Save project record so the IDE can find it
  await saveProjectRecord({
    projectId,
    projectName,
    baseName,
    folderName: projectId,
    frontend: resolvedFrontend,
    backend: resolvedBackend,
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
  socket.on(
    "engine:run",
    async (
      { prompt }: { prompt?: string },
      acknowledge?: (response: { accepted: boolean; error?: string }) => void
    ) => {
      if (!prompt?.trim()) {
        acknowledge?.({ accepted: false, error: "No prompt provided" });
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

      acknowledge?.({ accepted: true });

      try {
        socket.emit("engine-output", `\n[stackpilot-ai] Prompt: ${prompt}\n`);
        const { projectId, projectName } = await runEngineWithSocket(
          prompt,
          socket
        );

        // Redirect the dashboard to the IDE for the newly created project
        socket.emit("project-done", { projectId, projectName });
      } catch (error: any) {
        socket.emit("engine-output", `\n[stackpilot-ai] ${error.message}\n`);
        socket.emit("engine-status", { status: "error", error: error.message });
      }
    }
  );

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
