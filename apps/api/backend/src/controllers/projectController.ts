import type { Request, Response } from "express";
import util from "util";
import child_process from "child_process";
import fs from "fs/promises";
import crypto from "crypto";
import {
  getScaffoldCommand,
  type Framework,
  PROJECTS_DIR,
} from "../services/project.service.js";

const execPromisified = util.promisify(child_process.exec);

interface CreateProjectBody {
  projectName: string;
  frontend?: Framework;
  backend?: Framework;
}

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
    const mainFolder = path.join(PROJECTS_DIR,baseName);
    await fs.mkdir(mainFolder ,{recursive:true});

    // all subfolders
    const frontendFolder = path.join(mainFolder,`${baseName}-frontend`);
    const backendFolder = path.join(mainFolder,`${baseName}-backend`);
    const architectFolder = path.join(mainFolder,`${baseName}-architect`);
    const aiEngineFolder = path.join(mainFolder,`${baseName}-ai-engine`);

    await Promise.all([
      fs.mkdir(frontendFolder,{recursive:true}),
      fs.mkdir(backendFolder,{recursive:true}),
      fs.mkdir(architectFolder,{recursive:true}),
      fs.mkdir(aiEngineFolder,{recursive:true}),
    ])
    if (frontend) {
      const {command} = getScaffoldCommand(frontend ,".");
      await execPromisified(command,{
        cwd : frontendFolder,
        timeout:300_000,
      })
    }

    if (backend) {
      const {command} = getScaffoldCommand(backend,".");
      await execPromisified(command,{
        cwd : backendFolder,
        timeout:300_000,
      })
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
      date: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating project", error);
    return res.status(500).json({ error: "Failed to create project" });
  }
};
