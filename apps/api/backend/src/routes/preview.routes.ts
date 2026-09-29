import express from "express";
import path from "path";
import fs from "fs";
import { createProxyMiddleware } from "http-proxy-middleware";
import { getProjectPort } from "../services/previewService.js";
import { PROJECTS_DIR } from "../services/project.service.js";

const router = express.Router();

/**
 * Helper to render a sleek, dark-themed status page inside the preview iframe
 */
function renderStatusPage(
  title: string,
  message: string,
  hint: string,
  isError = false
): string {
  const icon = isError ? "⚠️" : "🚀";
  const badgeColor = isError ? "#f87171" : "#38bdf8";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - StackPilot Live Preview</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0c0d0e;
      color: #e4e4e7;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: grid;
      place-items: center;
      min-height: 100vh;
      padding: 24px;
      text-align: center;
    }
    .card {
      background: #18191b;
      border: 1px solid #27272a;
      border-radius: 16px;
      padding: 36px 32px;
      max-width: 440px;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
    }
    .icon { font-size: 40px; margin-bottom: 16px; }
    h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 8px; color: #fff; }
    p { font-size: 0.9rem; color: #a1a1aa; line-height: 1.5; margin-bottom: 20px; }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid ${badgeColor};
      color: ${badgeColor};
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
      margin-bottom: 16px;
    }
    .terminal-box {
      background: #09090b;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 12px 14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.85rem;
      color: #38bdf8;
      text-align: left;
      user-select: all;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <div class="badge">${title}</div>
    <h2>Live Preview Standby</h2>
    <p>${message}</p>
    <div class="terminal-box">$ ${hint}</div>
  </div>
</body>
</html>`;
}

/**
 * Primary Preview Handler for a given project ID
 */
router.use("/:projectId", (req, res, next) => {
  const { projectId } = req.params;
  const projectDir = path.join(PROJECTS_DIR, projectId);

  // If path doesn't end with slash on root, redirect so relative assets resolve properly
  if (req.path === "" || req.path === "/") {
    if (!req.originalUrl.endsWith("/")) {
      return res.redirect(301, req.originalUrl + "/");
    }
  }

  const port = getProjectPort(projectId);

  // Attempt proxying to the active internal dev server
  const proxy = createProxyMiddleware({
    target: `http://127.0.0.1:${port}`,
    changeOrigin: true,
    ws: true,
    pathRewrite: (pathStr) => {
      // Strip /api/preview/:projectId prefix so Vite receives standard root paths
      const rewritten = pathStr.replace(new RegExp(`^/api/preview/${projectId}`), "") || "/";
      return rewritten;
    },
    on: {
      error: (_err: any, _req: any, res: any) => {
        // Dev server connection refused. Check for static build files first
        const distDir = path.join(projectDir, "dist");
        const indexPath = path.join(projectDir, "index.html");

        if (fs.existsSync(distDir)) {
          return express.static(distDir)(req, res, next);
        }

        if (fs.existsSync(indexPath)) {
          return express.static(projectDir)(req, res, next);
        }

        // No running dev server and no static files found
        if (!res.headersSent && typeof res.status === "function") {
          res.status(503).send(
            renderStatusPage(
              "Dev Server Offline",
              "The development server is not running yet. Run the start command in your IDE terminal to launch the live app.",
              "npm run dev"
            )
          );
        }
      },
    },
  });

  return proxy(req, res, next);
});

export default router;
