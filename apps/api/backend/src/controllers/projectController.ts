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
    database = "postgresql",
    language = "typescript",
    styling = "tailwind",
    libraries = [],
  } = options;

  // Map selected libraries to npm package entries
  const dependencies: Record<string, string> = {
    react: "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^1.55.0",
    clsx: "^2.1.1",
  };

  const devDependencies: Record<string, string> = {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    typescript: "^5.6.3",
    vite: "^5.4.11",
  };

  if (backend.includes("express")) {
    dependencies["express"] = "^4.21.2";
    dependencies["cors"] = "^2.8.5";
    devDependencies["@types/express"] = "^4.17.21";
    devDependencies["@types/cors"] = "^2.8.17";
  }

  // Add user-selected libraries
  for (const lib of libraries) {
    if (lib === "axios") dependencies["axios"] = "^1.7.9";
    if (lib === "zod") dependencies["zod"] = "^3.24.1";
    if (lib === "zustand") dependencies["zustand"] = "^5.0.3";
    if (lib === "tanstack-query") dependencies["@tanstack/react-query"] = "^5.66.0";
    if (lib === "react-router-dom") dependencies["react-router-dom"] = "^7.1.5";
    if (lib === "react-hook-form") dependencies["react-hook-form"] = "^7.54.2";
    if (lib === "jsonwebtoken") dependencies["jsonwebtoken"] = "^9.0.2";
    if (lib === "prisma") {
      dependencies["@prisma/client"] = "^6.3.1";
      devDependencies["prisma"] = "^6.3.1";
    }
    if (lib === "drizzle") dependencies["drizzle-orm"] = "^0.39.1";
    if (lib === "pg") dependencies["pg"] = "^8.13.1";
    if (lib === "mongodb") dependencies["mongodb"] = "^6.13.0";
    if (lib === "tailwindcss") devDependencies["tailwindcss"] = "^4.0.0";
    if (lib === "vitest") devDependencies["vitest"] = "^3.0.5";
  }

  const pkgJson = {
    name: baseName,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      dev: "vite --host 0.0.0.0 --port 3000",
      build: "tsc && vite build",
      preview: "vite preview --host 0.0.0.0 --port 3000",
      server: "node server.js",
    },
    dependencies,
    devDependencies,
  };

  const viteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
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

  const tsconfig = `{
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
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
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
import { Sparkles, Terminal, Layers, Code2, Server, Database, CheckCircle2, Play } from "lucide-react";

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
            and terminal integration. Edit files in <code>src/App.tsx</code> to see live updates.
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
          <h3><Server className="icon-sm text-orange" /> Embedded Express REST Endpoints</h3>
          <p className="card-desc">Run <code>npm run server</code> in your StackPilot terminal to start the backend.</p>
          <div className="endpoint-list">
            <div className="endpoint">
              <span className="method get">GET</span>
              <code>/api/health</code>
              <span className="endpoint-desc">Service health and uptime</span>
            </div>
            <div className="endpoint">
              <span className="method get">GET</span>
              <code>/api/project</code>
              <span className="endpoint-desc">Project metadata and manifest</span>
            </div>
            <div className="endpoint">
              <span className="method post">POST</span>
              <code>/api/action</code>
              <span className="endpoint-desc">Custom application command handler</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "architecture" && (
        <div className="card">
          <h3><Code2 className="icon-sm text-orange" /> Project Architecture</h3>
          <p className="card-desc">Review <code>ARCHITECTURE.md</code> in your file tree for comprehensive blueprints.</p>
          <pre className="code-block">
{\`├── src/
│   ├── App.tsx          # Main interactive interface
│   ├── main.tsx         # Application entry
│   └── index.css        # Core styling
├── server.js            # Express REST server
├── package.json         # Validated dependencies
├── ARCHITECTURE.md      # Architecture blueprint
└── .env.example         # Environment template\`}
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
  --accent: #5227ff;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

body {
  background-color: var(--bg);
  color: var(--text-main);
  min-height: 100vh;
}

.app-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--surface-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge {
  width: 38px;
  height: 38px;
  background: var(--primary);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  font-family: monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.subtitle {
  font-size: 12px;
  color: var(--text-muted);
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #34d399;
  font-size: 12px;
  font-family: monospace;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.pulse {
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse 1.6s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.hero-card {
  margin-top: 24px;
  padding: 24px;
  border-radius: 16px;
  background: var(--surface);
  border: 1px solid var(--surface-border);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 640px) {
  .hero-card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--primary);
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.hero-content h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #fff;
}

.hero-content p {
  font-size: 13px;
  color: var(--text-muted);
  max-width: 520px;
  line-height: 1.5;
}

code {
  font-family: monospace;
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.interactive-box {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--surface-border);
  padding: 16px 20px;
  border-radius: 12px;
  text-align: center;
  min-width: 180px;
}

.counter-label {
  font-size: 11px;
  color: var(--text-muted);
  font-family: monospace;
  margin-bottom: 8px;
}

.counter-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.counter-val {
  font-size: 22px;
  font-weight: 700;
  min-width: 32px;
  font-family: monospace;
}

.btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--surface-border);
  background: var(--surface);
  color: var(--text-main);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn:hover {
  background: #27272a;
}

.btn-primary {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.tab-nav {
  display: flex;
  gap: 8px;
  margin-top: 24px;
  border-bottom: 1px solid var(--surface-border);
  padding-bottom: 8px;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab.active {
  background: var(--surface);
  color: #fff;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 16px;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}

.card {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
}

.card h3 {
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card ul {
  list-style: none;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-muted);
}

.card ul strong {
  color: var(--text-main);
}

.pill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.pill {
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--surface-border);
  font-size: 12px;
  font-family: monospace;
}

.icon-sm {
  width: 16px;
  height: 16px;
}

.text-orange { color: var(--primary); }
.text-emerald { color: #10b981; }

.code-block {
  background: #000;
  border: 1px solid var(--surface-border);
  padding: 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  color: #38bdf8;
  overflow-x: auto;
  line-height: 1.5;
  margin-top: 12px;
}

.endpoint-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.endpoint {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--surface-border);
  font-size: 13px;
}

.method {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.method.get { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.method.post { background: rgba(16, 185, 129, 0.2); color: #34d399; }

.endpoint-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: auto;
}
`;

  const serverJs = `import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health status endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "${projectName}",
    framework: "${backend}",
    timestamp: new Date().toISOString(),
  });
});

// Project metadata
app.get("/api/project", (req, res) => {
  res.json({
    projectName: "${projectName}",
    frontend: "${frontend}",
    backend: "${backend}",
    database: "${database}",
    libraries: ${JSON.stringify(libraries)},
    prompt: "${prompt.replace(/"/g, '\\"')}",
  });
});

// Custom action endpoint
app.post("/api/action", (req, res) => {
  const { action, payload } = req.body;
  res.json({
    success: true,
    action: action || "default",
    received: payload || null,
    processedAt: new Date().toISOString(),
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(\`[${projectName}] Server running on http://0.0.0.0:\${PORT}\`);
});
`;

  const envExample = `# StackPilot Project Environment
PORT=3000
SERVER_PORT=5001
NODE_ENV=development
PROJECT_NAME=${projectName}
DATABASE_URL=postgresql://user:password@localhost:5432/${baseName}
`;

  const readmeMd = `# ${projectName}

> Scaffolded by **StackPilot** • AI-Powered Development Environment

## Overview
${prompt || "Modern full-stack web application designed for scalable execution."}

## Tech Stack
- **Frontend:** ${frontend} (Vite + React)
- **Backend:** ${backend} REST Server
- **Database:** ${database}
- **Language:** ${language}
- **Styling:** ${styling}

## Configured Libraries
${libraries.map((l) => `- \`${l}\``).join("\n") || "- Standard foundational packages"}

## Getting Started
\`\`\`bash
# Install dependencies
npm install

# Start Vite frontend dev server (with HMR)
npm run dev

# Start Express backend API server
npm run server
\`\`\`
`;

  return [
    { path: "package.json", code: JSON.stringify(pkgJson, null, 2) },
    { path: "vite.config.ts", code: viteConfig },
    { path: "tsconfig.json", code: tsconfig },
    { path: "index.html", code: indexHtml },
    { path: "src/main.tsx", code: mainTsx },
    { path: "src/App.tsx", code: appTsx },
    { path: "src/index.css", code: indexCss },
    { path: "server.js", code: serverJs },
    { path: ".env.example", code: envExample },
    { path: "README.md", code: readmeMd },
  ];
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

    // If no direct files are supplied, try the AI Engine pipeline via prompt
    if (generatedFiles.length === 0) {
      if (prompt && prompt.trim()) {
        console.log(`[AiScaffold] Calling AI Engine with prompt: "${prompt.slice(0, 80)}..."`);
        try {
          const aiResult = await callAiEngine(prompt, { model, effort });
          generatedFiles = aiResult.files || [];
          aiArchitecture = aiResult.architecture || aiArchitecture;
          if (aiResult.projectName) {
            resolvedProjectName = aiResult.projectName;
          }
        } catch (aiErr: any) {
          console.warn(
            `[AiScaffold] AI Engine call unavailable or timed out (${aiErr?.message}). Generating foundational project workspace...`
          );
        }
      }

      // If AI Engine is offline or produced no files, generate foundational workspace
      if (generatedFiles.length === 0) {
        const baseNameGuess = resolvedProjectName
          .replace(/[^a-z0-9-]/gi, "-")
          .toLowerCase() || "stackpilot-project";

        generatedFiles = generateFoundationalFiles({
          projectName: resolvedProjectName,
          baseName: baseNameGuess,
          prompt: prompt || existingDraft?.description || "StackPilot Project",
          frontend: resolvedFrontend,
          backend: resolvedBackend,
          database: database || existingDraft?.database || "postgresql",
          language: language || existingDraft?.language || "typescript",
          styling: styling || existingDraft?.styling || "tailwind",
          libraries: selectedLibs,
        });
      }
    }

    const baseName = resolvedProjectName
      .replace(/[^a-z0-9-]/gi, "-")
      .toLowerCase() || "stackpilot-project";

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

    const aiEngineMd = `# StackPilot AI Pipeline Blueprint\n\nExecution timestamp: ${new Date().toISOString()}\n\n## Summary\n- Total files generated: ${generatedFiles.length}\n- Project Name: ${resolvedProjectName}\n- Primary prompt: ${prompt || "Auto-scaffold"}\n\n## Manifest\n${generatedFiles.map((f) => `- \`${f.path}\` (${f.action || "created"})`).join("\n")}\n`;

    await Promise.all([
      fs.writeFile(path.join(architectDir, "ARCHITECTURE.md"), architectMd, "utf8"),
      fs.writeFile(path.join(architectDir, "architecture.json"), JSON.stringify(aiArchitecture || {}, null, 2), "utf8"),
      fs.writeFile(path.join(aiEngineDir, "PIPELINE.md"), aiEngineMd, "utf8"),
      fs.writeFile(path.join(aiEngineDir, "manifest.json"), JSON.stringify({ files: generatedFiles }, null, 2), "utf8"),
    ]);

    // Write all code files to the project directory
    const { written, skipped } = await writeGeneratedFiles(mainFolder, generatedFiles);
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
      database: database || existingDraft?.database || "postgresql",
      language: language || existingDraft?.language || "typescript",
      styling: styling || existingDraft?.styling || "tailwind",
      libraries: selectedLibs,
      model: model || existingDraft?.model || "openrouter/free",
      createdAt: existingDraft?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

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


