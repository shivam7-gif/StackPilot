import type { Request, Response } from "express";
import util from "util";
import child_process from "child_process";
import fs from "fs/promises";
import crypto from "crypto";
import path from "path";
import {
  getScaffoldCommand,
  type Framework,
  PROJECTS_DIR,
} from "../services/project.service.js";

const execPromisified = util.promisify(child_process.exec);

// These CLIs MUST create their own folder (will prompt if folder already exists)
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

// These CLIs scaffold INTO the current dir (need pre-created folder + run inside it)
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
    // Pre-create the folder and scaffold INTO it using "."
    await fs.mkdir(targetFolder, { recursive: true });
    cwd = targetFolder;
  } else {
    // DO NOT pre-create — let the CLI create the named folder itself
    // Vite/Next/etc will prompt "destination not empty" if folder exists
    cwd = mainFolder;
  }

  const { command } = getScaffoldCommand(framework, dirName);

  console.log(`🔧 [${framework}] Running: ${command}`);
  console.log(`📂 [${framework}] cwd: ${cwd}`);

  const { stdout, stderr } = await execPromisified(command, {
    cwd,
    timeout: 300_000,
    env: {
      ...process.env,
      CI: "true", // suppresses interactive prompts for most Node CLIs
      npm_config_yes: "true", // forces yes on npx prompts
    },
  });

  console.log(`📜 [${framework}] stdout: ${stdout}`);
  if (stderr) console.warn(`⚠️ [${framework}] stderr: ${stderr}`);

  // Verify the folder was actually created
  try {
    await fs.access(targetFolder);
    console.log(`✅ [${framework}] Folder verified: ${targetFolder}`);
  } catch {
    const contents = await fs.readdir(mainFolder);
    console.warn(
      `⚠️ [${framework}] Expected folder missing. mainFolder contains: [${contents.join(", ")}]`
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
    // 1. Create main folder
    await fs.mkdir(mainFolder, { recursive: true });
    console.log("Main folder created:", mainFolder);

    // 2. Pre-create only non-scaffolded folders
    await Promise.all([
      fs.mkdir(path.join(mainFolder, `${baseName}-architect`), {
        recursive: true,
      }),
      fs.mkdir(path.join(mainFolder, `${baseName}-ai-engine`), {
        recursive: true,
      }),
    ]);
    console.log("✅ Architect + AI Engine folders created");

    // 3. Scaffold frontend & backend sequentially (avoid npx cache conflicts)
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
    console.error("❌ Error creating project:", error);
    return res.status(500).json({
      error: "Failed to create project",
      detail: error?.message,
      stdout: error?.stdout,
      stderr: error?.stderr,
    });
  }
};
