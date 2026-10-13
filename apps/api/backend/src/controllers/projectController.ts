import util from "util";
import child_process from "child_process";
import fs from "fs/promises";
import crypto from "crypto";
import path from "path";
import type { Request, Response } from "express";
import { getProjectTreeService } from "../services/TreeService.js";
import {
  saveProjectRecord,
  getProjectRecord,
} from "../services/projectStore.js";
import {
  getScaffoldCommand,
  type Framework,
  PROJECTS_DIR,
} from "../services/project.service.js";
import {
  callAiEngine,
  callAiEngineStream,
  checkAiBackendHealth,
  type AiGenerateResult,
  type GeneratedFile,
} from "../services/aiEngineService.js";

const execPromisified = util.promisify(child_process.exec);

const NAMED_SCAFFOLD_FRAMEWORKS: Framework[] = [
  "react",
  "vue",
  "svelte",
  "nextjs",
  "angular",
  "nestjs",
  "nuxt",
  "laravel",
  "springboot",
];

const DOT_SCAFFOLD_FRAMEWORKS: Framework[] = ["astro", "express", "django"];

interface CreateProjectBody {
  projectName: string;
  frontend?: Framework;
  backend?: Framework;
}

const runScaffold = async (
  framework: Framework,
  dirName: string,
  mainFolder: string
) => {
  const isDotScaffold = DOT_SCAFFOLD_FRAMEWORKS.includes(framework);
  const targetFolder = path.join(mainFolder, dirName);
  let cwd: string;

  if (isDotScaffold) {
    await fs.mkdir(targetFolder, { recursive: true });
    cwd = targetFolder;
  } else {
    cwd = mainFolder;
  }

  const { command } = getScaffoldCommand(framework, dirName);

  console.log(` [${framework}] Running: ${command}`);
  console.log(` [${framework}] cwd: ${cwd}`);

  const { stdout, stderr } = await execPromisified(command, {
    cwd,
    timeout: 300_000,
    env: {
      ...process.env,
      CI: "true",
      npm_config_yes: "true",
    },
  });

  console.log(` [${framework}] stdout: ${stdout}`);
  if (stderr) console.warn(` [${framework}] stderr: ${stderr}`);

  try {
    await fs.access(targetFolder);
    console.log(` [${framework}] Folder verified: ${targetFolder}`);
  } catch {
    const contents = await fs.readdir(mainFolder);
    console.warn(
      ` [${framework}] Expected folder missing. mainFolder contains: [${contents.join(", ")}]`
    );
    throw new Error(
      `Scaffold failed: expected folder "${dirName}" was not created by ${framework} CLI`
    );
  }
};

export const CreateProjectController = async (req: Request, res: Response) => {
  try {
    const { projectName, frontend, backend } = req.body as CreateProjectBody;

    if (!projectName) {
      return res.status(400).json({ error: "Project name is required" });
    }

    if (!frontend && !backend) {
      return res
        .status(400)
        .json({ error: "Select at least one frontend or backend framework" });
    }

    const supportedFrameworks: Framework[] = [
      "react",
      "nextjs",
      "vue",
      "nuxt",
      "angular",
      "svelte",
      "astro",
      "springboot",
      "express",
      "nestjs",
      "django",
      "laravel",
    ];

    if (frontend && !supportedFrameworks.includes(frontend)) {
      return res.status(400).json({
        error: "Unsupported frontend framework",
        supported: supportedFrameworks,
      });
    }

    if (backend && !supportedFrameworks.includes(backend)) {
      return res.status(400).json({
        error: "Unsupported backend framework",
        supported: supportedFrameworks,
      });
    }

    const projectId = crypto.randomUUID();
    const baseName = projectName.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const mainFolder = path.join(PROJECTS_DIR, baseName);

    console.log("Controller version ");
    console.log("baseName : ", baseName);
    console.log("main Folder : ", mainFolder);
    console.log("frontend subfolder : ", `${baseName}-frontend`);
    console.log("backend subfolder : ", `${baseName}-backend`);
    await fs.mkdir(mainFolder, { recursive: true });
    console.log("Main folder created:", mainFolder);

    await Promise.all([
      fs.mkdir(path.join(mainFolder, `${baseName}-architect`), {
        recursive: true,
      }),
      fs.mkdir(path.join(mainFolder, `${baseName}-ai-engine`), {
        recursive: true,
      }),
    ]);
    console.log(" Architect + AI Engine folders created");

    await saveProjectRecord({
      projectId,
      projectName,
      baseName,
      folderName: baseName,
      frontend,
      backend,
      createdAt: new Date().toISOString(),
    });

    if (frontend) {
      await runScaffold(frontend, `${baseName}-frontend`, mainFolder);
    }

    if (backend) {
      await runScaffold(backend, `${baseName}-backend`, mainFolder);
    }

    return res.status(201).json({
      frontend: frontend
        ? `${frontend} project created successfully`
        : "No frontend selected",
      backend: backend
        ? `${backend} project created successfully`
        : "No backend selected",
      projectId,
      projectName,
      baseName,
      structure: {
        mainFolder: baseName,
        frontend: frontend ? `${baseName}-frontend` : null,
        backend: backend ? `${baseName}-backend` : null,
        architect: `${baseName}-architect`,
        aiEngine: `${baseName}-ai-engine`,
      },
      date: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(" Error creating project:", error);
    return res.status(500).json({
      error: "Failed to create project",
      detail: error?.message,
      stdout: error?.stdout,
      stderr: error?.stderr,
    });
  }
};

export const getProjectTree = async (req: Request, res: Response) => {
  const projectId = Array.isArray(req.params.projectId)
    ? req.params.projectId[0]
    : req.params.projectId;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "Project id is required",
    });
  }

  try {
    const tree = await getProjectTreeService(projectId);
    return res.status(200).json({
      data: tree,
      success: true,
      message: "Successfully fetched the tree",
    });
  } catch (error: any) {
    console.error("Error fetching project tree:", error);

    if (error.message?.includes("Project record not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch project tree",
      detail: error.message,
    });
  }
};

export const getProjectMeta = async (req: Request, res: Response) => {
  const projectId = Array.isArray(req.params.projectId)
    ? req.params.projectId[0]
    : req.params.projectId;

  if (!projectId)
    return res.status(400).json({ error: "Project Id is required" });

  try {
    const rec = await getProjectRecord(projectId);
    if (!rec) return res.status(404).json({ error: "Project not found" });
    return res.status(200).json({
      projectId: rec.projectId,
      projectName: rec.projectName,
      baseName: rec.baseName,
      folderName: rec.folderName,
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err) });
  }
};

/**
 * Safely writes generated files into a target project directory.
 * Prevents directory traversal attacks and creates parent directories automatically.
 */
export const writeGeneratedFiles = async (
  projectDir: string,
  files: GeneratedFile[]
): Promise<{ written: string[]; skipped: string[] }> => {
  const written: string[] = [];
  const skipped: string[] = [];
  const resolvedTarget = path.resolve(projectDir);

  for (const file of files) {
    if (!file?.path || typeof file?.code !== "string") {
      skipped.push(file?.path || "unknown");
      continue;
    }

    // Normalize path and strip directory traversal sequences
    const safeRel = path
      .normalize(file.path)
      .replace(/^(\.\.(\/|\\|$))+/, "")
      .replace(/^[/\\]+/, "");

    const fullPath = path.join(resolvedTarget, safeRel);
    const resolvedFullPath = path.resolve(fullPath);

    if (!resolvedFullPath.startsWith(resolvedTarget)) {
      console.warn(`[writeGeneratedFiles] Blocked path traversal attempt: ${file.path}`);
      skipped.push(file.path);
      continue;
    }

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, file.code, "utf8");
    written.push(safeRel);
  }

  return { written, skipped };
};

/**
 * Maps arbitrary framework strings from LLM/Architect output (e.g. "React", "Next.js", "NestJS")
 * to the supported Framework enum values for scaffolding.
 */
export const normalizeFramework = (fw: unknown): Framework | undefined => {
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

export interface AiScaffoldRequestBody {
  prompt?: string;
  projectName?: string;
  files?: GeneratedFile[];
  frontend?: string;
  backend?: string;
  architecture?: any;
  model?: string;
  effort?: string;
}

/**
 * Controller to scaffold a project from AI JSON API response or directly via prompt.
 *
 * Workflow:
 * 1. Takes either pre-generated files JSON or a prompt to query the AI Engine.
 * 2. If prompt is provided without files, calls the AI Engine (Planner → Architect → H1 Coder).
 * 3. Automatically extracts frontend and backend frameworks from the Architect plan JSON.
 * 4. Creates project root and architectural subdirectories.
 * 5. Writes all AI-generated code files to the project directory.
 * 6. Scaffolds requested or AI-detected frontend/backend framework CLIs (React, Next.js, Express, NestJS, etc.).
 * 7. Saves the project record in the project store for IDE consumption.
 * 8. Returns 201 with project metadata, projectId, and file manifest.
 */
export const AiScaffoldController = async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      projectName,
      files,
      frontend,
      backend,
      architecture,
      model,
      effort,
    } = req.body as AiScaffoldRequestBody;

    let generatedFiles: GeneratedFile[] = Array.isArray(files) ? files : [];
    let resolvedProjectName = (projectName || "").trim();
    let aiArchitecture: any = architecture || null;

    // If no direct files are supplied, execute the AI Engine pipeline via prompt
    if (generatedFiles.length === 0) {
      if (!prompt || !prompt.trim()) {
        return res.status(400).json({
          error: "Either 'files' (from AI JSON API) or 'prompt' must be provided.",
        });
      }

      console.log(`[AiScaffold] Calling AI Engine with prompt: "${prompt.slice(0, 80)}..."`);
      try {
        const aiResult = await callAiEngine(prompt, { model, effort });
        generatedFiles = aiResult.files || [];
        aiArchitecture = aiResult.architecture || aiArchitecture;
        if (!resolvedProjectName) {
          resolvedProjectName = aiResult.projectName || "stackpilot-project";
        }
      } catch (aiErr: any) {
        console.error("[AiScaffold] Error calling AI Engine:", aiErr);
        return res.status(502).json({
          error: "Failed to generate project code from AI Engine",
          detail: aiErr.message,
        });
      }
    }

    if (!resolvedProjectName) {
      resolvedProjectName = "stackpilot-project";
    }

    // Resolve framework choices: explicit body parameter > detected from AI architecture plan
    const resolvedFrontend = normalizeFramework(
      frontend || aiArchitecture?.frontend?.framework
    );
    const resolvedBackend = normalizeFramework(
      backend || aiArchitecture?.backend?.framework
    );

    console.log(
      `[AiScaffold] Frameworks resolved - Frontend: ${resolvedFrontend || "none"}, Backend: ${resolvedBackend || "none"}`
    );

    const projectId = crypto.randomUUID();
    const baseName = resolvedProjectName
      .replace(/[^a-z0-9-]/gi, "-")
      .toLowerCase() || "stackpilot-project";

    // Use projectId as unique folder name (with fallback lookup support in TreeService)
    const mainFolder = path.join(PROJECTS_DIR, projectId);
    await fs.mkdir(mainFolder, { recursive: true });

    // Create architectural subdirectories
    const architectDir = path.join(mainFolder, `${baseName}-architect`);
    const aiEngineDir = path.join(mainFolder, `${baseName}-ai-engine`);
    await Promise.all([
      fs.mkdir(architectDir, { recursive: true }),
      fs.mkdir(aiEngineDir, { recursive: true }),
    ]);

    // Populate documentation and blueprints inside architect & ai-engine folders
    const architectMd = `# System Architecture Blueprint\n\nProject: **${resolvedProjectName}**\n\n## Tech Stack\n- **Frontend**: ${aiArchitecture?.frontend?.framework || resolvedFrontend || "React"} (${aiArchitecture?.frontend?.language || "TypeScript"})\n- **Backend**: ${aiArchitecture?.backend?.framework || resolvedBackend || "Express"} (${aiArchitecture?.backend?.language || "TypeScript"})\n- **Database**: ${aiArchitecture?.backend?.database || "PostgreSQL"}\n- **ORM**: ${aiArchitecture?.backend?.orm || "Prisma"}\n- **Caching**: ${aiArchitecture?.infrastructure?.caching || "Redis"}\n\n## Architecture Details\n\`\`\`json\n${JSON.stringify(aiArchitecture || {}, null, 2)}\n\`\`\`\n`;

    const aiEngineMd = `# StackPilot AI Pipeline Blueprint\n\nExecution timestamp: ${new Date().toISOString()}\n\n## Summary\n- Total files generated: ${generatedFiles.length}\n- Project Name: ${resolvedProjectName}\n- Primary prompt: ${prompt || "Auto-scaffold"}\n\n## Manifest\n${generatedFiles.map((f) => `- \`${f.path}\` (${f.action || "created"})`).join("\n")}\n`;

    await Promise.all([
      fs.writeFile(path.join(architectDir, "ARCHITECTURE.md"), architectMd, "utf8"),
      fs.writeFile(path.join(architectDir, "architecture.json"), JSON.stringify(aiArchitecture || {}, null, 2), "utf8"),
      fs.writeFile(path.join(aiEngineDir, "PIPELINE.md"), aiEngineMd, "utf8"),
      fs.writeFile(path.join(aiEngineDir, "manifest.json"), JSON.stringify({ files: generatedFiles }, null, 2), "utf8"),
    ]);

    // Write all AI generated files to the project directory
    const { written, skipped } = await writeGeneratedFiles(mainFolder, generatedFiles);
    console.log(
      `[AiScaffold] Wrote ${written.length} files to ${mainFolder} (${skipped.length} skipped)`
    );

    // Save project record in the store
    await saveProjectRecord({
      projectId,
      projectName: resolvedProjectName,
      baseName,
      folderName: projectId,
      frontend: resolvedFrontend,
      backend: resolvedBackend,
      createdAt: new Date().toISOString(),
    });

    // Run framework scaffolding CLIs safely if detected or requested
    if (resolvedFrontend) {
      console.log(`[AiScaffold] Scaffolding frontend framework: ${resolvedFrontend}`);
      try {
        await runScaffold(resolvedFrontend, `${baseName}-frontend`, mainFolder);
      } catch (scaffoldErr: any) {
        console.warn(`[AiScaffold] Frontend scaffold warning:`, scaffoldErr?.message);
      }
    }
    if (resolvedBackend) {
      console.log(`[AiScaffold] Scaffolding backend framework: ${resolvedBackend}`);
      try {
        await runScaffold(resolvedBackend, `${baseName}-backend`, mainFolder);
      } catch (scaffoldErr: any) {
        console.warn(`[AiScaffold] Backend scaffold warning:`, scaffoldErr?.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Project scaffolded successfully from AI output",
      projectId,
      projectName: resolvedProjectName,
      baseName,
      folderName: projectId,
      filesCreated: written.length,
      files: written,
      skipped,
      frontend: resolvedFrontend ? `${resolvedFrontend} scaffolded` : undefined,
      backend: resolvedBackend ? `${resolvedBackend} scaffolded` : undefined,
      architecture: aiArchitecture,
      structure: {
        mainFolder: projectId,
        frontend: resolvedFrontend ? `${baseName}-frontend` : null,
        backend: resolvedBackend ? `${baseName}-backend` : null,
        architect: `${baseName}-architect`,
        aiEngine: `${baseName}-ai-engine`,
      },
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[AiScaffold] Unhandled error during scaffolding:", error);
    return res.status(500).json({
      error: "Failed to scaffold project",
      detail: error?.message,
      stdout: error?.stdout,
      stderr: error?.stderr,
    });
  }
};

/**
 * Controller for streaming AI scaffolding via Server-Sent Events (SSE).
 * Streams generation logs and steps in real time, then writes files and emits the final result.
 */
export const AiScaffoldStreamController = async (req: Request, res: Response) => {
  const { prompt, projectName, frontend, backend, model, effort } =
    req.body as AiScaffoldRequestBody;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required for streaming generation." });
  }

  // Set SSE Headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const sendEvent = (type: string, data: any) => {
    res.write(`data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`);
  };

  sendEvent("step", "Connecting to StackPilot AI Engine...");

  const emitter = callAiEngineStream(prompt, { model, effort });

  emitter.on("log", (line: string) => {
    sendEvent("log", { line });
  });

  emitter.on("step", (step: string) => {
    sendEvent("step", { step });
  });

  emitter.on("error", (error: string) => {
    sendEvent("error", { error });
  });

  emitter.on("result", async (aiResult: AiGenerateResult) => {
    try {
      sendEvent("step", "AI Generation finished. Writing project files to disk...");
      const finalProjectName = (projectName || aiResult.projectName || "stackpilot-project").trim();
      const projectId = crypto.randomUUID();
      const baseName = finalProjectName
        .replace(/[^a-z0-9-]/gi, "-")
        .toLowerCase() || "stackpilot-project";

      const mainFolder = path.join(PROJECTS_DIR, projectId);
      await fs.mkdir(mainFolder, { recursive: true });

      const architectDir = path.join(mainFolder, `${baseName}-architect`);
      const aiEngineDir = path.join(mainFolder, `${baseName}-ai-engine`);
      await Promise.all([
        fs.mkdir(architectDir, { recursive: true }),
        fs.mkdir(aiEngineDir, { recursive: true }),
      ]);

      const architectMd = `# System Architecture Blueprint\n\nProject: **${finalProjectName}**\n\n## Tech Stack\n- **Frontend**: ${aiResult.architecture?.frontend?.framework || "React"}\n- **Backend**: ${aiResult.architecture?.backend?.framework || "Express"}\n\n## Architecture Details\n\`\`\`json\n${JSON.stringify(aiResult.architecture || {}, null, 2)}\n\`\`\`\n`;
      const aiEngineMd = `# StackPilot AI Pipeline Blueprint\n\nExecution timestamp: ${new Date().toISOString()}\n\n## Summary\n- Total files: ${(aiResult.files || []).length}\n- Project: ${finalProjectName}\n`;

      await Promise.all([
        fs.writeFile(path.join(architectDir, "ARCHITECTURE.md"), architectMd, "utf8"),
        fs.writeFile(path.join(architectDir, "architecture.json"), JSON.stringify(aiResult.architecture || {}, null, 2), "utf8"),
        fs.writeFile(path.join(aiEngineDir, "PIPELINE.md"), aiEngineMd, "utf8"),
      ]);

      const { written, skipped } = await writeGeneratedFiles(mainFolder, aiResult.files || []);

      const resolvedFrontend = normalizeFramework(
        frontend || aiResult.architecture?.frontend?.framework
      );
      const resolvedBackend = normalizeFramework(
        backend || aiResult.architecture?.backend?.framework
      );

      await saveProjectRecord({
        projectId,
        projectName: finalProjectName,
        baseName,
        folderName: projectId,
        frontend: resolvedFrontend,
        backend: resolvedBackend,
        createdAt: new Date().toISOString(),
      });

      if (resolvedFrontend) {
        sendEvent("step", `Scaffolding frontend: ${resolvedFrontend}...`);
        try {
          await runScaffold(resolvedFrontend, `${baseName}-frontend`, mainFolder);
        } catch (err: any) {
          console.warn(`[AiScaffoldStream] Frontend warning:`, err?.message);
        }
      }
      if (resolvedBackend) {
        sendEvent("step", `Scaffolding backend: ${resolvedBackend}...`);
        try {
          await runScaffold(resolvedBackend, `${baseName}-backend`, mainFolder);
        } catch (err: any) {
          console.warn(`[AiScaffoldStream] Backend warning:`, err?.message);
        }
      }

      sendEvent("result", {
        projectId,
        projectName: finalProjectName,
        baseName,
        filesCreated: written.length,
        files: written,
        skipped,
        frontend: resolvedFrontend,
        backend: resolvedBackend,
      });
      sendEvent("done", { success: true, projectId });
      res.end();
    } catch (err: any) {
      sendEvent("error", { error: err.message });
      res.end();
    }
  });

  emitter.on("done", () => {
    // If not already ended by the result handler
    if (!res.writableEnded) {
      res.end();
    }
  });

  req.on("close", () => {
    emitter.removeAllListeners();
  });
};

/**
 * Health check endpoint for AI Backend connection
 */
export const checkAiHealthController = async (_req: Request, res: Response) => {
  const isHealthy = await checkAiBackendHealth();
  return res.status(200).json({
    success: true,
    aiBackendOnline: isHealthy,
  });
};

