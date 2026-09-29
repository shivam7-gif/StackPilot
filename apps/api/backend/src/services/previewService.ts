import type { Request } from "express";

/**
 * In-memory map of project ID to their active internal dev server ports.
 * (e.g., Vite defaults to 5173, Next.js to 3000, etc.)
 */
const projectDevPorts = new Map<string, number>();

/**
 * Register or update the internal port for a project.
 */
export function setProjectPort(projectId: string, port: number): void {
  projectDevPorts.set(projectId, port);
}

/**
 * Get the internal port for a project (defaults to 5173 for Vite).
 */
export function getProjectPort(projectId: string): number {
  return projectDevPorts.get(projectId) || 5173;
}

/**
 * Generate the public live preview URL for a project.
 */
export function getProjectPreviewUrl(projectId: string, req?: Request): string {
  const envUrl = process.env.PUBLIC_API_URL;
  if (envUrl) {
    return `${envUrl.replace(/\/$/, "")}/api/preview/${projectId}/`;
  }
  if (req) {
    const host = req.get("x-forwarded-host") || req.get("host") || "localhost:5000";
    const proto = req.get("x-forwarded-proto") || req.protocol || "http";
    return `${proto}://${host}/api/preview/${projectId}/`;
  }
  return `https://stackpilot-api-7w8q.onrender.com/api/preview/${projectId}/`;
}
