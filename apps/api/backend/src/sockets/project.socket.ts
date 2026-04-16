import { spawn } from "child_process";
import crypto from "crypto";
import fs from "fs/promises";
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

export const handleProjectSocket = (socket: any) => {
  socket.on(
    "createProject",
    async ({ frontend, backend, projectName }: ProjectCreatePayload) => {
      const projectId = projectName
        ? projectName.replace(/[^a-z0-9-]/gi, "-").toLowerCase()
        : crypto.randomUUID();
      socket.emit("project-log", `Creating project ${projectId}...`);

      await fs.mkdir(PROJECTS_DIR, { recursive: true });

      const supportedFrameworks = [
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

      if (!frontend && !backend) {
        socket.emit(
          "project-log",
          "No frontend or backend framework selected."
        );
        return;
      }

      if (frontend && !supportedFrameworks.includes(frontend)) {
        socket.emit(
          "project-log",
          `Unsupported frontend framework: ${frontend}`
        );
        return;
      }

      if (backend && !supportedFrameworks.includes(backend)) {
        socket.emit("project-log", `Unsupported backend framework: ${backend}`);
        return;
      }

      if (frontend) {
        const { command, cwd } = getScaffoldCommand(frontend, projectId);
        const proc = spawn(command, { cwd: PROJECTS_DIR, shell: true });

        proc.stdout.on("data", (data) =>
          socket.emit("project-log", data.toString())
        );
        proc.stderr.on("data", (data) =>
          socket.emit("project-log", data.toString())
        );
        proc.on("error", (error) =>
          socket.emit(
            "project-log",
            `Frontend command failed: ${error.message}`
          )
        );
        proc.on("close", (code) =>
          socket.emit(
            "project-log",
            `Frontend process exited with code ${code}`
          )
        );
      }

      if (backend) {
        const backendId = `${projectId}-backend`;
        const { command, cwd } = getScaffoldCommand(backend, backendId);
        const proc = spawn(command, { cwd: PROJECTS_DIR, shell: true });

        proc.stdout.on("data", (data) =>
          socket.emit("project-log", data.toString())
        );
        proc.stderr.on("data", (data) =>
          socket.emit("project-log", data.toString())
        );
        proc.on("error", (error) =>
          socket.emit("project-log", `Backend command failed: ${error.message}`)
        );
        proc.on("close", (code) =>
          socket.emit("project-log", `Backend process exited with code ${code}`)
        );
      }
    }
  );
};
