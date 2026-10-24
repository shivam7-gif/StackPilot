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
  getAllProjects,
  updateProjectRecord,
  deleteProjectRecord,
  type ProjectRecord,
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
  if (clean.includes("fastapi") || clean.includes("fast")) return "fastapi";
  return undefined;
};

export interface AiScaffoldRequestBody {
  projectId?: string;
  prompt?: string;
  projectName?: string;
  files?: GeneratedFile[];
  frontend?: string;
  backend?: string;
  database?: string;
  language?: string;
  styling?: string;
  architecture?: any;
  model?: string;
  effort?: string;
  libraries?: string[];
}

/**
 * Builds a comprehensive, working project structure with selected libraries,
 * configurations, UI entrypoints, and documentation.
 */
export const generateFoundationalFiles = (options: {
  projectName: string;
  baseName: string;
  prompt: string;
  frontend: string;
  backend: string;
  database?: string;
  language?: string;
  styling?: string;
  libraries: string[];
}): GeneratedFile[] => {
  const {
    projectName,
    baseName,
    prompt,
    frontend,
    backend,
    database = "sqlite",
    language = "typescript",
    styling = "tailwind",
    libraries = [],
  } = options;

  const files: GeneratedFile[] = [];

  // ==================== ROOT FILES ====================
  const rootPkg = {
    name: baseName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "npm run dev:frontend",
      "dev:frontend": "cd frontend && npm run dev",
      "dev:backend": "cd backend && npm run dev",
      build: "cd frontend && npm run build",
    },
  };

  const gitignore = `node_modules/
dist/
build/
.next/
.env
.env.local
.DS_Store
__pycache__/
*.pyc
*.pyo
.cache/
.turbo/
`;

  const rootReadme = `# ${projectName}

> Full-stack project scaffolded by **StackPilot** • AI-Powered Development Environment

## Overview
${prompt || "Modern full-stack web application designed for scalable execution."}

## Architecture
- **Frontend Directory:** \`frontend/\` — **${frontend}** (with hot reload & component library)
- **Backend Directory:** \`backend/\` — **${backend}** (REST API endpoints & health checks)
- **Database:** ${database}
- **Language:** ${language}
- **Styling:** ${styling}

## Getting Started

### 1. Frontend Development
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
Frontend dev server will launch at: \`http://localhost:3000\`

### 2. Backend Development
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`
Backend API server will run at: \`http://localhost:5001\`
`;

  files.push({ path: "package.json", code: JSON.stringify(rootPkg, null, 2) });
  files.push({ path: "README.md", code: rootReadme });
  files.push({ path: ".gitignore", code: gitignore });

  // ==================== FRONTEND FILES ====================
  const isNext = frontend.includes("next");
  const isVue = frontend.includes("vue");
  const isSvelte = frontend.includes("svelte");

  if (isNext) {
    const nextPkg = {
      name: `${baseName}-frontend`,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev -p 3000 -H 0.0.0.0",
        build: "next build",
        start: "next start -p 3000 -H 0.0.0.0",
      },
      dependencies: {
        next: "^14.2.15",
        react: "^18.3.1",
        "react-dom": "^18.3.1",
        "lucide-react": "^1.55.0",
        axios: "^1.7.9",
      },
      devDependencies: {
        "@types/node": "^20.14.0",
        "@types/react": "^18.3.12",
        "@types/react-dom": "^18.3.1",
        typescript: "^5.6.3",
      },
    };

    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`;

    const tsConfig = `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "incremental": true,
    "module": "esnext",
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"]
}
`;

    const nextLayout = `import React from "react";
import "./globals.css";

export const metadata = {
  title: "${projectName} - StackPilot",
  description: "Scaffolded with Next.js & StackPilot",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

    const nextPage = `"use client";
import React, { useState } from "react";
import { Sparkles, Layers, Server, Code2, Play } from "lucide-react";

export default function Page() {
  const [count, setCount] = useState(0);

  return (
    <main className="container">
      <header className="header">
        <div className="badge">SP</div>
        <div>
          <h1>${projectName}</h1>
          <p className="subtitle">Next.js App Router • ${backend} Backend</p>
        </div>
      </header>

      <section className="card">
        <h2>${prompt || "Next.js Application"}</h2>
        <p>Edit <code>frontend/app/page.tsx</code> to start building your components.</p>
        <div className="counter-box">
          <button onClick={() => setCount(c => c - 1)}>-</button>
          <span>{count}</span>
          <button onClick={() => setCount(c => c + 1)}>+</button>
        </div>
      </section>
    </main>
  );
}
`;

    const nextCss = `body {
  margin: 0;
  background: #09090b;
  color: #f4f4f5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.container {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
}
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.badge {
  background: #ea580c;
  color: #fff;
  font-weight: bold;
  padding: 10px 14px;
  border-radius: 8px;
}
.subtitle {
  color: #a1a1aa;
  font-size: 14px;
}
.card {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 24px;
}
.counter-box {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}
button {
  background: #27272a;
  border: 1px solid #3f3f46;
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}
button:hover { background: #3f3f46; }
`;

    files.push(
      { path: "frontend/package.json", code: JSON.stringify(nextPkg, null, 2) },
      { path: "frontend/next.config.js", code: nextConfig },
      { path: "frontend/tsconfig.json", code: tsConfig },
      { path: "frontend/app/layout.tsx", code: nextLayout },
      { path: "frontend/app/page.tsx", code: nextPage },
      { path: "frontend/app/globals.css", code: nextCss },
      { path: "frontend/README.md", code: `# Frontend (${frontend})\n\nRun:\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n` }
    );
  } else if (isVue) {
    const vuePkg = {
      name: `${baseName}-frontend`,
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        dev: "vite --host 0.0.0.0 --port 3000",
        build: "vue-tsc && vite build",
        preview: "vite preview --host 0.0.0.0 --port 3000",
      },
      dependencies: {
        vue: "^3.5.12",
        axios: "^1.7.9",
        "lucide-vue-next": "^1.55.0",
      },
      devDependencies: {
        "@vitejs/plugin-vue": "^5.1.4",
        typescript: "^5.6.3",
        vite: "^5.4.11",
        "vue-tsc": "^2.1.6",
      },
    };

    const viteConfig = `import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});
`;

    const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName} - Vue</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;

    const mainTs = `import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

createApp(App).mount("#app");
`;

    const appVue = `<script setup lang="ts">
import { ref } from "vue";
const count = ref(0);
</script>

<template>
  <div class="container">
    <header class="header">
      <div class="badge">SP</div>
      <div>
        <h1>${projectName}</h1>
        <p class="subtitle">Vue 3 + Vite • ${backend} Backend</p>
      </div>
    </header>

    <div class="card">
      <h2>${prompt || "Vue 3 Application"}</h2>
      <p>Edit <code>frontend/src/App.vue</code> to start developing.</p>
      <div class="counter-box">
        <button @click="count--">-</button>
        <span>{{ count }}</span>
        <button @click="count++">+</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container { max-width: 900px; margin: 40px auto; padding: 0 20px; }
.header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.badge { background: #42b883; color: #fff; font-weight: bold; padding: 10px 14px; border-radius: 8px; }
.subtitle { color: #a1a1aa; font-size: 14px; }
.card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; }
.counter-box { display: flex; align-items: center; gap: 16px; margin-top: 20px; }
button { background: #27272a; border: 1px solid #3f3f46; color: #fff; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
button:hover { background: #3f3f46; }
</style>
`;

    const styleCss = `body { margin: 0; background: #09090b; color: #f4f4f5; font-family: -apple-system, sans-serif; }`;

    files.push(
      { path: "frontend/package.json", code: JSON.stringify(vuePkg, null, 2) },
      { path: "frontend/vite.config.ts", code: viteConfig },
      { path: "frontend/index.html", code: indexHtml },
      { path: "frontend/src/main.ts", code: mainTs },
      { path: "frontend/src/App.vue", code: appVue },
      { path: "frontend/src/style.css", code: styleCss },
      { path: "frontend/README.md", code: `# Frontend (Vue 3)\n\nRun:\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n` }
    );
  } else if (isSvelte) {
    const sveltePkg = {
      name: `${baseName}-frontend`,
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        dev: "vite --host 0.0.0.0 --port 3000",
        build: "vite build",
        preview: "vite preview --host 0.0.0.0 --port 3000",
      },
      dependencies: {
        svelte: "^4.2.19",
        axios: "^1.7.9",
        "lucide-svelte": "^1.55.0",
      },
      devDependencies: {
        "@sveltejs/vite-plugin-svelte": "^3.1.2",
        typescript: "^5.6.3",
        vite: "^5.4.11",
      },
    };

    const viteConfig = `import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});
`;

    const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName} - Svelte</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;

    const mainTs = `import App from "./App.svelte";
import "./app.css";

const app = new App({
  target: document.getElementById("app")!,
});

export default app;
`;

    const appSvelte = `<script lang="ts">
  let count = 0;
</script>

<main class="container">
  <header class="header">
    <div class="badge">SP</div>
    <div>
      <h1>${projectName}</h1>
      <p class="subtitle">Svelte + Vite • ${backend} Backend</p>
    </div>
  </header>

  <div class="card">
    <h2>${prompt || "Svelte Application"}</h2>
    <p>Edit <code>frontend/src/App.svelte</code> to start developing.</p>
    <div class="counter-box">
      <button on:click={() => count--}>-</button>
      <span>{count}</span>
      <button on:click={() => count++}>+</button>
    </div>
  </div>
</main>

<style>
  .container { max-width: 900px; margin: 40px auto; padding: 0 20px; }
  .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
  .badge { background: #ff3e00; color: #fff; font-weight: bold; padding: 10px 14px; border-radius: 8px; }
  .subtitle { color: #a1a1aa; font-size: 14px; }
  .card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; }
  .counter-box { display: flex; align-items: center; gap: 16px; margin-top: 20px; }
  button { background: #27272a; border: 1px solid #3f3f46; color: #fff; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
  button:hover { background: #3f3f46; }
</style>
`;

    const appCss = `body { margin: 0; background: #09090b; color: #f4f4f5; font-family: -apple-system, sans-serif; }`;

    files.push(
      { path: "frontend/package.json", code: JSON.stringify(sveltePkg, null, 2) },
      { path: "frontend/vite.config.ts", code: viteConfig },
      { path: "frontend/index.html", code: indexHtml },
      { path: "frontend/src/main.ts", code: mainTs },
      { path: "frontend/src/App.svelte", code: appSvelte },
      { path: "frontend/src/app.css", code: appCss },
      { path: "frontend/README.md", code: `# Frontend (Svelte)\n\nRun:\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n` }
    );
  } else {
    // Default: React + Vite + TS
    const reactPkg = {
      name: `${baseName}-frontend`,
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        dev: "vite --host 0.0.0.0 --port 3000",
        build: "tsc && vite build",
        preview: "vite preview --host 0.0.0.0 --port 3000",
      },
      dependencies: {
        react: "^18.3.1",
        "react-dom": "^18.3.1",
        "lucide-react": "^1.55.0",
        clsx: "^2.1.1",
        axios: "^1.7.9",
      },
      devDependencies: {
        "@types/react": "^18.3.12",
        "@types/react-dom": "^18.3.1",
        "@vitejs/plugin-react": "^4.3.4",
        typescript: "^5.6.3",
        vite: "^5.4.11",
      },
    };

    const viteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: false,
    hmr: {
      clientPort: 3000,
    },
  },
});
`;

    const tsConfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false
  },
  "include": ["src"]
}
`;

    const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName} - StackPilot</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

    const mainTsx = `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

    const appTsx = `import React, { useState } from "react";
import { Sparkles, Layers, Code2, Server, Database, CheckCircle2 } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"overview" | "api" | "architecture">("overview");
  const [counter, setCounter] = useState(0);

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="header">
        <div className="brand">
          <div className="badge">SP</div>
          <div>
            <h1 className="title">${projectName}</h1>
            <p className="subtitle">Scaffolded with StackPilot • ${frontend} + ${backend}</p>
          </div>
        </div>

        <div className="status-pill">
          <span className="dot pulse" />
          <span>Dev Runtime Active</span>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="hero-card">
        <div className="hero-content">
          <div className="tag">
            <Sparkles className="icon-sm" />
            <span>AI Architecture Ready</span>
          </div>
          <h2>${prompt || "Modern Full-Stack Project"}</h2>
          <p>
            Your application workspace is running with full HMR, Monaco code synchronization,
            and terminal integration. Edit files in <code>frontend/src/App.tsx</code> to see live updates.
          </p>
        </div>

        <div className="interactive-box">
          <p className="counter-label">State Counter Test</p>
          <div className="counter-row">
            <button className="btn" onClick={() => setCounter((c) => c - 1)}>-</button>
            <span className="counter-val">{counter}</span>
            <button className="btn btn-primary" onClick={() => setCounter((c) => c + 1)}>+</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav">
        <button
          className={activeTab === "overview" ? "tab active" : "tab"}
          onClick={() => setActiveTab("overview")}
        >
          <Layers className="icon-sm" /> Overview
        </button>
        <button
          className={activeTab === "api" ? "tab active" : "tab"}
          onClick={() => setActiveTab("api")}
        >
          <Server className="icon-sm" /> API Endpoints
        </button>
        <button
          className={activeTab === "architecture" ? "tab active" : "tab"}
          onClick={() => setActiveTab("architecture")}
        >
          <Code2 className="icon-sm" /> Tech Stack
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="grid">
          <div className="card">
            <h3><Layers className="icon-sm text-orange" /> Stack Configuration</h3>
            <ul>
              <li><strong>Frontend:</strong> ${frontend} (Vite + React)</li>
              <li><strong>Backend:</strong> ${backend} REST Server</li>
              <li><strong>Database:</strong> ${database}</li>
              <li><strong>Language:</strong> ${language}</li>
              <li><strong>Styling:</strong> ${styling}</li>
            </ul>
          </div>

          <div className="card">
            <h3><CheckCircle2 className="icon-sm text-emerald" /> Selected Libraries (${libraries.length})</h3>
            <div className="pill-list">
              {${JSON.stringify(libraries)}.map((lib) => (
                <span key={lib} className="pill">{lib}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "api" && (
        <div className="card">
          <h3><Server className="icon-sm text-orange" /> Embedded ${backend} Endpoints</h3>
          <p className="card-desc">Run backend in the <code>backend/</code> folder to start your API.</p>
          <div className="endpoint-list">
            <div className="endpoint">
              <span className="method get">GET</span>
              <code>/health</code>
              <span className="endpoint-desc">Service health and uptime</span>
            </div>
            <div className="endpoint">
              <span className="method get">GET</span>
              <code>/api/status</code>
              <span className="endpoint-desc">Backend system status</span>
            </div>
            <div className="endpoint">
              <span className="method get">GET</span>
              <code>/api/items</code>
              <span className="endpoint-desc">Data query endpoint</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "architecture" && (
        <div className="card">
          <h3><Code2 className="icon-sm text-orange" /> Full-Stack Architecture</h3>
          <p className="card-desc">Two dedicated directories: <code>frontend/</code> and <code>backend/</code>.</p>
          <pre className="code-block">
{\`├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main interactive UI
│   │   ├── main.tsx         # React entrypoint
│   │   └── index.css        # Core styling
│   ├── index.html           # HTML template
│   ├── vite.config.ts       # Vite config
│   └── package.json         # Frontend packages
├── backend/
│   ├── src/                 # Backend controllers & routes
│   └── package.json         # Backend dependencies
├── README.md                # Quickstart guide
└── package.json             # Root workspace scripts\`}
          </pre>
        </div>
      )}
    </div>
  );
}
`;

    const indexCss = `/* StackPilot Application Stylesheet */
:root {
  --bg: #09090b;
  --surface: #18181b;
  --surface-border: #27272a;
  --text-main: #f4f4f5;
  --text-muted: #a1a1aa;
  --primary: #ea580c;
  --primary-hover: #f97316;
}
* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
body { background-color: var(--bg); color: var(--text-main); min-height: 100vh; }
.app-container { max-width: 960px; margin: 0 auto; padding: 32px 24px; }
.header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 24px; border-bottom: 1px solid var(--surface-border); }
.brand { display: flex; align-items: center; gap: 12px; }
.badge { width: 38px; height: 38px; background: var(--primary); color: #fff; font-weight: 700; font-size: 13px; font-family: monospace; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
.title { font-size: 20px; font-weight: 700; color: #fff; }
.subtitle { font-size: 12px; color: var(--text-muted); }
.status-pill { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 9999px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); color: #34d399; font-size: 12px; font-family: monospace; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
.pulse { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); animation: pulse 1.6s infinite; }
@keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
.hero-card { margin-top: 24px; padding: 24px; border-radius: 16px; background: var(--surface); border: 1px solid var(--surface-border); display: flex; flex-direction: column; gap: 16px; }
@media (min-width: 640px) { .hero-card { flex-direction: row; align-items: center; justify-content: space-between; } }
.tag { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--primary); letter-spacing: 0.05em; margin-bottom: 8px; }
.hero-content h2 { font-size: 18px; font-weight: 600; margin-bottom: 6px; color: #fff; }
.hero-content p { font-size: 13px; color: var(--text-muted); max-width: 520px; line-height: 1.5; }
code { font-family: monospace; background: rgba(255, 255, 255, 0.08); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
.interactive-box { background: rgba(0, 0, 0, 0.25); border: 1px solid var(--surface-border); padding: 16px 20px; border-radius: 12px; text-align: center; min-width: 180px; }
.counter-label { font-size: 11px; color: var(--text-muted); font-family: monospace; margin-bottom: 8px; }
.counter-row { display: flex; align-items: center; justify-content: center; gap: 12px; }
.counter-val { font-size: 22px; font-weight: 700; min-width: 32px; font-family: monospace; }
.btn { padding: 6px 14px; border-radius: 8px; border: 1px solid var(--surface-border); background: var(--surface); color: var(--text-main); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; }
.btn:hover { background: #27272a; }
.btn-primary { background: var(--primary); border-color: var(--primary); color: #fff; }
.btn-primary:hover { background: var(--primary-hover); }
.tab-nav { display: flex; gap: 8px; margin-top: 24px; border-bottom: 1px solid var(--surface-border); padding-bottom: 8px; }
.tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; border: none; background: transparent; color: var(--text-muted); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s ease; }
.tab.active { background: var(--surface); color: #fff; }
.grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 16px; }
@media (min-width: 640px) { .grid { grid-template-columns: 1fr 1fr; } }
.card { background: var(--surface); border: 1px solid var(--surface-border); border-radius: 12px; padding: 20px; margin-top: 16px; }
.card h3 { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.card ul { list-style: none; font-size: 13px; line-height: 1.8; color: var(--text-muted); }
.card ul strong { color: var(--text-main); }
.pill-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.pill { padding: 4px 10px; border-radius: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--surface-border); font-size: 12px; font-family: monospace; }
.icon-sm { width: 16px; height: 16px; }
.text-orange { color: var(--primary); }
.text-emerald { color: #10b981; }
.code-block { background: #000; border: 1px solid var(--surface-border); padding: 16px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #38bdf8; overflow-x: auto; line-height: 1.5; margin-top: 12px; }
.endpoint-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.endpoint { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--surface-border); font-size: 13px; }
.method { font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
.method.get { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.endpoint-desc { font-size: 12px; color: var(--text-muted); margin-left: auto; }
`;

    files.push(
      { path: "frontend/package.json", code: JSON.stringify(reactPkg, null, 2) },
      { path: "frontend/vite.config.ts", code: viteConfig },
      { path: "frontend/tsconfig.json", code: tsConfig },
      { path: "frontend/index.html", code: indexHtml },
      { path: "frontend/src/main.tsx", code: mainTsx },
      { path: "frontend/src/App.tsx", code: appTsx },
      { path: "frontend/src/index.css", code: indexCss },
      { path: "frontend/README.md", code: `# Frontend (${frontend})\n\nScaffolded with React + Vite + TypeScript.\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n` }
    );
  }

  // ==================== BACKEND FILES ====================
  const isFastApi = backend.includes("fastapi") || backend.includes("fast");
  const isNest = backend.includes("nest");
  const isDjango = backend.includes("django");

  if (isFastApi) {
    const reqTxt = `fastapi>=0.110.0
uvicorn[standard]>=0.29.0
pydantic>=2.6.0
python-dotenv>=1.0.1
`;

    const mainPy = `import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import api

app = FastAPI(title="${projectName} API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router, prefix="/api")

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "${projectName}-backend",
        "framework": "fastapi"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
`;

    const apiPy = `from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/status")
def get_status():
    return {
        "project": "${projectName}",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/items")
def get_items():
    return [
        {"id": 1, "title": "Welcome to ${projectName}", "completed": False},
        {"id": 2, "title": "StackPilot API Ready", "completed": True}
    ]
`;

    const backendEnv = `PORT=5001
DEBUG=True
PROJECT_NAME=${projectName}
`;

    files.push(
      { path: "backend/requirements.txt", code: reqTxt },
      { path: "backend/main.py", code: mainPy },
      { path: "backend/routers/__init__.py", code: "" },
      { path: "backend/routers/api.py", code: apiPy },
      { path: "backend/.env", code: backendEnv },
      { path: "backend/README.md", code: `# Backend (${backend})\n\nRun:\n\`\`\`bash\npip install -r requirements.txt\nuvicorn main:app --reload --port 5001\n\`\`\`\n` }
    );
  } else if (isNest) {
    const nestPkg = {
      name: `${baseName}-backend`,
      version: "0.1.0",
      scripts: {
        dev: "nest start --watch",
        build: "nest build",
        start: "node dist/main",
      },
      dependencies: {
        "@nestjs/common": "^10.4.0",
        "@nestjs/core": "^10.4.0",
        "@nestjs/platform-express": "^10.4.0",
        "reflect-metadata": "^0.2.2",
        rxjs: "^7.8.1",
      },
      devDependencies: {
        "@types/express": "^4.17.21",
        "@types/node": "^20.14.0",
        typescript: "^5.6.3",
      },
    };

    const mainTs = `import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(\`NestJS application is running on: http://localhost:\${port}\`);
}
bootstrap();
`;

    const appModule = `import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`;

    const appController = `import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  getHealth() {
    return { status: "ok", service: "${projectName}-backend", framework: "nestjs" };
  }

  @Get("api/status")
  getStatus() {
    return this.appService.getStatus();
  }

  @Get("api/items")
  getItems() {
    return this.appService.getItems();
  }
}
`;

    const appService = `import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getStatus() {
    return { project: "${projectName}", status: "operational", timestamp: new Date().toISOString() };
  }

  getItems() {
    return [
      { id: 1, title: "Welcome to ${projectName}", completed: false },
      { id: 2, title: "NestJS Backend Configured", completed: true }
    ];
  }
}
`;

    files.push(
      { path: "backend/package.json", code: JSON.stringify(nestPkg, null, 2) },
      { path: "backend/src/main.ts", code: mainTs },
      { path: "backend/src/app.module.ts", code: appModule },
      { path: "backend/src/app.controller.ts", code: appController },
      { path: "backend/src/app.service.ts", code: appService },
      { path: "backend/.env", code: `PORT=5001\n` },
      { path: "backend/README.md", code: `# Backend (NestJS)\n\nRun:\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n` }
    );
  } else if (isDjango) {
    const reqTxt = `django>=5.0.0
django-cors-headers>=4.3.0
djangorestframework>=3.15.0
`;

    const managePy = `#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and available on your PYTHONPATH?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
`;

    const settingsPy = `import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'stackpilot-insecure-key'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

ROOT_URLCONF = 'core.urls'
WSGI_APPLICATION = 'core.wsgi.application'
CORS_ALLOW_ALL_ORIGINS = True
`;

    const urlsPy = `from django.urls import path
from django.http import JsonResponse

def health(request):
    return JsonResponse({"status": "ok", "service": "${projectName}-backend", "framework": "django"})

def status(request):
    return JsonResponse({"project": "${projectName}", "status": "operational"})

urlpatterns = [
    path('health', health),
    path('api/status', status),
]
`;

    const wsgiPy = `import os
from django.core.wsgi import get_wsgi_application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
application = get_wsgi_application()
`;

    files.push(
      { path: "backend/requirements.txt", code: reqTxt },
      { path: "backend/manage.py", code: managePy },
      { path: "backend/core/__init__.py", code: "" },
      { path: "backend/core/settings.py", code: settingsPy },
      { path: "backend/core/urls.py", code: urlsPy },
      { path: "backend/core/wsgi.py", code: wsgiPy },
      { path: "backend/.env", code: `PORT=5001\nDEBUG=True\n` },
      { path: "backend/README.md", code: `# Backend (Django)\n\nRun:\n\`\`\`bash\npip install -r requirements.txt\npython manage.py runserver 0.0.0.0:5001\n\`\`\`\n` }
    );
  } else {
    // Default: Express.js REST API
    const expressPkg = {
      name: `${baseName}-backend`,
      version: "0.1.0",
      type: "module",
      scripts: {
        dev: "node src/index.js",
        start: "node src/index.js",
      },
      dependencies: {
        express: "^4.21.2",
        cors: "^2.8.5",
        dotenv: "^16.4.7",
      },
      devDependencies: {
        "@types/express": "^4.17.21",
        "@types/cors": "^2.8.17",
      },
    };

    const indexJs = `import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Main API routes
app.use("/api", apiRouter);

// Service health probe
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "${projectName}-backend",
    framework: "${backend}",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(\`[${projectName}] Express server running on http://0.0.0.0:\${PORT}\`);
});
`;

    const apiJs = `import { Router } from "express";

const router = Router();

router.get("/status", (req, res) => {
  res.json({
    project: "${projectName}",
    status: "operational",
    framework: "${backend}",
    timestamp: new Date().toISOString(),
  });
});

router.get("/items", (req, res) => {
  res.json([
    { id: 1, title: "Welcome to ${projectName}", completed: false },
    { id: 2, title: "StackPilot API Endpoints Initialized", completed: true },
  ]);
});

router.post("/action", (req, res) => {
  const { action, payload } = req.body;
  res.json({
    success: true,
    action: action || "default",
    payload: payload || null,
    processedAt: new Date().toISOString(),
  });
});

export default router;
`;

    const envFile = `# Backend Environment
PORT=5001
NODE_ENV=development
PROJECT_NAME=${projectName}
`;

    files.push(
      { path: "backend/package.json", code: JSON.stringify(expressPkg, null, 2) },
      { path: "backend/src/index.js", code: indexJs },
      { path: "backend/src/routes/api.js", code: apiJs },
      { path: "backend/.env", code: envFile },
      { path: "backend/README.md", code: `# Backend (${backend})\n\nScaffolded with Express.js REST API.\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n` }
    );
  }

  return files;
};

/**
 * Controller to scaffold a project from AI JSON API response or directly via prompt.
 */
export const AiScaffoldController = async (req: Request, res: Response) => {
  try {
    const {
      projectId: reqProjectId,
      prompt = "",
      projectName,
      files,
      frontend,
      backend,
      database,
      language,
      styling,
      architecture,
      model,
      effort,
      libraries,
    } = req.body as AiScaffoldRequestBody;

    // Use passed projectId (e.g. from draft in Onboarding) or generate a new unique UUID
    const projectId = (reqProjectId || crypto.randomUUID()).trim();

    // Check if a draft project record already exists
    const existingDraft = await getProjectRecord(projectId);

    let generatedFiles: GeneratedFile[] = Array.isArray(files) ? files : [];
    let resolvedProjectName = (
      projectName ||
      existingDraft?.projectName ||
      "stackpilot-project"
    ).trim();
    let aiArchitecture: any = architecture || null;

    const resolvedFrontend =
      normalizeFramework(
        frontend || existingDraft?.frontend || aiArchitecture?.frontend?.framework
      ) || "react";
    const resolvedBackend =
      normalizeFramework(
        backend || existingDraft?.backend || aiArchitecture?.backend?.framework
      ) || "express";
    const selectedLibs =
      Array.isArray(libraries) && libraries.length > 0
        ? libraries
        : existingDraft?.libraries || ["lucide-react", "tailwindcss", "axios", "zod"];

    const baseName = resolvedProjectName
      .replace(/[^a-z0-9-]/gi, "-")
      .toLowerCase() || "stackpilot-project";

    // 1. Generate foundational files for frontend and backend matching chosen frameworks
    const foundationalFiles = generateFoundationalFiles({
      projectName: resolvedProjectName,
      baseName,
      prompt: prompt || existingDraft?.description || "StackPilot Project",
      frontend: resolvedFrontend,
      backend: resolvedBackend,
      database: database || existingDraft?.database || "sqlite",
      language: language || existingDraft?.language || "typescript",
      styling: styling || existingDraft?.styling || "tailwind",
      libraries: selectedLibs,
    });

    // 2. Call AI Engine if prompt is provided and no files supplied directly
    let aiFiles: GeneratedFile[] = [];
    if (generatedFiles.length === 0 && prompt && prompt.trim()) {
      console.log(`[AiScaffold] Calling AI Engine with prompt: "${prompt.slice(0, 80)}..."`);
      try {
        const aiResult = await callAiEngine(prompt, { model, effort });
        aiFiles = aiResult.files || [];
        aiArchitecture = aiResult.architecture || aiArchitecture;
        if (aiResult.projectName) {
          resolvedProjectName = aiResult.projectName;
        }
      } catch (aiErr: any) {
        console.warn(
          `[AiScaffold] AI Engine call unavailable or timed out (${aiErr?.message}). Using foundational scaffolding.`
        );
      }
    }

    // 3. Assemble complete project file set
    // Start with foundational files map
    const fileMap = new Map<string, GeneratedFile>();
    for (const f of foundationalFiles) {
      fileMap.set(f.path, f);
    }

    // Merge any files passed in request or from AI Engine
    const incomingFiles = [...generatedFiles, ...aiFiles];
    for (const f of incomingFiles) {
      if (!f || !f.path) continue;
      let targetPath = f.path;

      // If incoming file is root src/... and not explicitly frontend/ or backend/, route to frontend/
      if (
        (targetPath.startsWith("src/") ||
          targetPath.startsWith("components/") ||
          targetPath.startsWith("public/") ||
          targetPath.endsWith(".tsx") ||
          targetPath.endsWith(".jsx")) &&
        !targetPath.startsWith("frontend/") &&
        !targetPath.startsWith("backend/")
      ) {
        targetPath = `frontend/${targetPath}`;
      } else if (
        (targetPath.startsWith("server") ||
          targetPath.startsWith("api/") ||
          targetPath.endsWith(".py") ||
          targetPath.includes("controller") ||
          targetPath.includes("service")) &&
        !targetPath.startsWith("frontend/") &&
        !targetPath.startsWith("backend/")
      ) {
        targetPath = `backend/${targetPath}`;
      }

      fileMap.set(targetPath, { ...f, path: targetPath });
    }

    const filesToWrite = Array.from(fileMap.values());

    // Use projectId as unique folder name in PROJECTS_DIR
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
    const architectMd = `# System Architecture Blueprint\n\nProject: **${resolvedProjectName}**\n\n## Tech Stack\n- **Frontend**: ${resolvedFrontend} (${language || "TypeScript"})\n- **Backend**: ${resolvedBackend} (${language || "TypeScript"})\n- **Database**: ${database || "PostgreSQL"}\n- **Styling**: ${styling || "Tailwind CSS"}\n\n## Selected Libraries\n${selectedLibs.map((l: string) => `- \`${l}\``).join("\n")}\n\n## Architecture Details\n\`\`\`json\n${JSON.stringify(aiArchitecture || {}, null, 2)}\n\`\`\`\n`;

    const aiEngineMd = `# StackPilot AI Pipeline Blueprint\n\nExecution timestamp: ${new Date().toISOString()}\n\n## Summary\n- Total files generated: ${filesToWrite.length}\n- Project Name: ${resolvedProjectName}\n- Primary prompt: ${prompt || "Auto-scaffold"}\n\n## Manifest\n${filesToWrite.map((f) => `- \`${f.path}\` (${f.action || "created"})`).join("\n")}\n`;

    await Promise.all([
      fs.writeFile(path.join(architectDir, "ARCHITECTURE.md"), architectMd, "utf8"),
      fs.writeFile(path.join(architectDir, "architecture.json"), JSON.stringify(aiArchitecture || {}, null, 2), "utf8"),
      fs.writeFile(path.join(aiEngineDir, "PIPELINE.md"), aiEngineMd, "utf8"),
      fs.writeFile(path.join(aiEngineDir, "manifest.json"), JSON.stringify({ files: filesToWrite }, null, 2), "utf8"),
    ]);

    // Write all code files to the project directory
    const { written, skipped } = await writeGeneratedFiles(mainFolder, filesToWrite);
    console.log(
      `[AiScaffold] Wrote ${written.length} files to ${mainFolder} (${skipped.length} skipped)`
    );

    // Persist or update project record in the store
    await saveProjectRecord({
      projectId,
      projectName: resolvedProjectName,
      baseName,
      folderName: projectId,
      description: prompt || existingDraft?.description || "StackPilot Project",
      prompt: prompt || existingDraft?.prompt || "",
      category: existingDraft?.category || "Full-Stack Application",
      ownerId: existingDraft?.ownerId || "default-user",
      status: "ready",
      frontend: resolvedFrontend,
      backend: resolvedBackend,
      database: database || existingDraft?.database || "sqlite",
      language: language || existingDraft?.language || "typescript",
      styling: styling || existingDraft?.styling || "tailwind",
      libraries: selectedLibs,
      model: model || existingDraft?.model || "openrouter/free",
      createdAt: existingDraft?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: "Project scaffolded successfully with frontend and backend",
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
        frontend: "frontend",
        backend: "backend",
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

      const resolvedFrontend = normalizeFramework(
        frontend || aiResult.architecture?.frontend?.framework
      ) || "react";
      const resolvedBackend = normalizeFramework(
        backend || aiResult.architecture?.backend?.framework
      ) || "express";

      // Generate complete foundational files for frontend and backend
      const foundationalFiles = generateFoundationalFiles({
        projectName: finalProjectName,
        baseName,
        prompt: prompt || "StackPilot Project",
        frontend: resolvedFrontend,
        backend: resolvedBackend,
        database: "sqlite",
        language: "typescript",
        styling: "tailwind",
        libraries: ["lucide-react", "tailwindcss", "axios"],
      });

      const fileMap = new Map<string, GeneratedFile>();
      for (const f of foundationalFiles) {
        fileMap.set(f.path, f);
      }

      for (const f of aiResult.files || []) {
        if (!f || !f.path) continue;
        let targetPath = f.path;
        if (
          (targetPath.startsWith("src/") ||
            targetPath.startsWith("components/") ||
            targetPath.endsWith(".tsx") ||
            targetPath.endsWith(".jsx")) &&
          !targetPath.startsWith("frontend/") &&
          !targetPath.startsWith("backend/")
        ) {
          targetPath = `frontend/${targetPath}`;
        } else if (
          (targetPath.startsWith("server") ||
            targetPath.startsWith("api/") ||
            targetPath.endsWith(".py")) &&
          !targetPath.startsWith("frontend/") &&
          !targetPath.startsWith("backend/")
        ) {
          targetPath = `backend/${targetPath}`;
        }
        fileMap.set(targetPath, { ...f, path: targetPath });
      }

      const filesToWrite = Array.from(fileMap.values());
      const { written, skipped } = await writeGeneratedFiles(mainFolder, filesToWrite);

      await saveProjectRecord({
        projectId,
        projectName: finalProjectName,
        baseName,
        folderName: projectId,
        frontend: resolvedFrontend,
        backend: resolvedBackend,
        createdAt: new Date().toISOString(),
      });

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

/**
 * POST /projects/draft
 * Creates a persistent draft project from the Dashboard prompt before full scaffolding
 */
export const createDraftProjectController = async (req: Request, res: Response) => {
  try {
    const {
      projectName,
      description,
      prompt,
      category,
      model,
      ownerId = "default-user",
      frontend,
      backend,
      database,
      language,
      styling,
    } = req.body;

    const projectId = crypto.randomUUID();
    const resolvedName = (projectName || "").trim() || "my-stackpilot-project";
    const baseName = resolvedName.replace(/[^a-z0-9-]/gi, "-").toLowerCase();

    const record: ProjectRecord = {
      projectId,
      projectName: resolvedName,
      baseName,
      folderName: projectId,
      description: description || prompt || "StackPilot Project",
      prompt: prompt || description || "",
      category: category || "Full-Stack Application",
      ownerId,
      status: "draft",
      model: model || "openrouter/free",
      frontend: frontend || "react",
      backend: backend || "express",
      database: database || "postgresql",
      language: language || "typescript",
      styling: styling || "tailwind",
      libraries: [],
      createdAt: new Date().toISOString(),
    };

    await saveProjectRecord(record);

    return res.status(201).json({
      success: true,
      projectId,
      project: record,
    });
  } catch (err: any) {
    console.error("[createDraftProject] Error:", err);
    return res.status(500).json({ error: err.message || "Failed to create draft project" });
  }
};

/**
 * GET /projects
 * Lists all projects for the dashboard (optionally filtered by owner)
 */
export const getProjectListController = async (req: Request, res: Response) => {
  try {
    const ownerId = req.query.ownerId as string | undefined;
    const projects = await getAllProjects(ownerId);
    return res.json({ success: true, projects });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to list projects" });
  }
};

/**
 * GET /projects/:projectId
 * Returns single project details
 */
export const getProjectDetailsController = async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.projectId || "");
    const project = await getProjectRecord(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    return res.json({ success: true, project });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to get project details" });
  }
};

/**
 * PUT /projects/:projectId
 * Updates project configuration (stack, dependencies, settings)
 */
export const updateProjectController = async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.projectId || "");
    const updates = req.body;
    const updated = await updateProjectRecord(projectId, updates);
    if (!updated) {
      return res.status(404).json({ error: "Project not found" });
    }
    return res.json({ success: true, project: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update project" });
  }
};

/**
 * DELETE /projects/:projectId
 * Deletes a project record and workspace directory
 */
export const deleteProjectController = async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.projectId || "");
    const deleted = await deleteProjectRecord(projectId);
    return res.json({ success: deleted });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to delete project" });
  }
};


