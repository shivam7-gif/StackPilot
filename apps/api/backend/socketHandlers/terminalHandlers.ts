import Docker from "dockerode";
import fs from "fs/promises";
import path from "path";
import { spawn, type IPty } from "node-pty";
import type { Duplex } from "stream";
import type { Namespace, Socket } from "socket.io";
import { ensureProjectContainer } from "../containers/handleContainerCreate.js";
import { resolveProjectHostPath } from "../containers/resolveProjectHostPath.js";
import { PROJECTS_DIR } from "../src/services/project.service.js";
import { setProjectPort, getProjectPreviewUrl } from "../src/services/previewService.js";

function getDefaultShell(): string {
  if (process.platform === "win32") {
    return process.env.COMSPEC || "powershell.exe";
  }
  return process.env.SHELL || "/bin/bash";
}

function createTerminalBanner(
  projectId: string,
  projectName: string,
  cwd: string,
  previewUrl?: string
) {
  return `
clear

echo ""
echo "┌─ StackPilot"
echo "├─ Project : ${projectName}"
echo "├─ ID      : ${projectId}"
echo "├─ Path    : ${cwd}"
echo "└─ Preview : ${previewUrl ?? "Not Running"}"
echo ""

unset PORT
export TERM=xterm-256color

alias ll='ls -lah --color=auto'
alias gs='git status'

export PS1='\[\e[38;5;45m\]➜\[\e[0m\] \[\e[38;5;82m\]\W\[\e[0m\] \[\e[38;5;214m\]$(git branch --show-current 2>/dev/null)\[\e[0m\] $ '

`;
}

async function attachLocalShell(
  socket: Socket,
  projectId: string
): Promise<() => void> {
  let ptyProcess: IPty | null = null;

  const cwd = await resolveProjectHostPath(projectId);
  const shell = getDefaultShell();
  const previewUrl = getProjectPreviewUrl(projectId);

  // Emit preview URL so the IDE preview tab is immediately ready
  socket.emit("container-ready", {
    projectId,
    previewUrl,
  });
  socket.emit("preview-url", {
    projectId,
    previewUrl,
  });

  // Never leak host service PORT (e.g. 10000 on Render) into project dev terminals
  const childEnv = { ...process.env, TERM: "xterm-256color" } as Record<string, string>;
  delete childEnv.PORT;

  ptyProcess = spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd,
    env: childEnv,
  });

  const hostPort = Number(process.env.PORT || 10000);

  ptyProcess.onData((data) => {
    socket.emit("shell-output", data);

    // Auto-detect dev server port from terminal logs (e.g. Vite: "Local: http://localhost:5173/")
    // Ignore error messages (such as EADDRINUSE) and never bind to host's own backend API port
    const portMatch = data.match(/(?:http:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):|(?:Local|Network):\s+http:\/\/[^:]+:)(\d{4,5})/i);
    if (portMatch && portMatch[1]) {
      const detectedPort = parseInt(portMatch[1], 10);
      if (detectedPort !== hostPort && detectedPort !== 5000 && detectedPort !== 80) {
        setProjectPort(projectId, detectedPort);
        socket.emit("preview-ready", {
          projectId,
          port: detectedPort,
          previewUrl,
        });
      }
    }
  });

  ptyProcess.onExit(() => {
    socket.emit("shell-output", "\r\n\x1b[90m[Process exited]\x1b[0m\r\n");
  });

  console.log(`Local terminal spawned for ${projectId} in ${cwd}`);

  const banner = createTerminalBanner(projectId, projectId.slice(0, 8), cwd, previewUrl);
  socket.emit("shell-output", banner.replace(/\n/g, "\r\n"));

  const onInput = (data: string) => {
    ptyProcess?.write(data);
  };

  const onResize = ({ cols, rows }: { cols: number; rows: number }) => {
    if (!ptyProcess || cols <= 0 || rows <= 0) return;
    try {
      ptyProcess.resize(cols, rows);
    } catch {
      // ignore resize races during spawn/teardown
    }
  };

  socket.on("shell-input", onInput);
  socket.on("shell-resize", onResize);

  return () => {
    socket.off("shell-input", onInput);
    socket.off("shell-resize", onResize);
    ptyProcess?.kill();
    ptyProcess = null;
  };
}

async function attachDockerShell(
  socket: Socket,
  projectId: string
): Promise<() => void> {
  const { container, hostPort5173 } = await ensureProjectContainer(projectId);
  const previewUrl = getProjectPreviewUrl(projectId);

  if (hostPort5173) {
    socket.emit("container-ready", {
      projectId,
      hostPort5173,
      previewUrl,
    });
    socket.emit("preview-ready", {
      projectId,
      port: 5173,
      previewUrl,
    });
  }

  const exec = await container.exec({
    Cmd: ["/bin/bash", "-l"],
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    WorkingDir: "/home/sandbox/app",
    User: "sandbox",
  });
  console.log("Starting exec...");
  const stream = (await exec.start({
    hijack: true,
    stdin: true,
  })) as Duplex;
  console.log("Exec started");

  const workspacePath = "/home/sandbox/app";
  const projectName = projectId.slice(0, 8);

  stream.write(
    createTerminalBanner(
      projectId,
      projectName,
      workspacePath,
      hostPort5173 ? `http://localhost:${hostPort5173}` : undefined
    )
  );

  stream.write(`
export PS1='\[\e[38;5;39m\]➜ \[\e[38;5;82m\]\W\[\e[0m\] \[\e[33m\]$(git branch --show-current 2>/dev/null)\[\e[0m\] $ '
clear
\n`);

  try {
    await exec.resize({
      w: 80,
      h: 24,
    });
  } catch {
    // ignore
  }

  const onData = (chunk: Buffer) => {
    socket.emit("shell-output", chunk.toString("utf8"));
  };

  const onEnd = () => {
    socket.emit("shell-output", "\r\n\x1b[90m[Process exited]\x1b[0m\r\n");
  };

  const onError = (err: Error) => {
    console.error(`Docker stream error (${projectId})`, err);
    socket.emit(
      "shell-output",
      "\r\n\x1b[31m[Terminal connection lost]\x1b[0m\r\n"
    );
  };

  stream.on("data", onData);
  stream.on("end", onEnd);
  stream.on("error", onError);

  console.log(`Docker terminal attached for ${projectId}`);

  const onInput = (data: string) => {
    if (!stream.destroyed) {
      stream.write(data);
    }
  };

  const onResize = async ({ cols, rows }: { cols: number; rows: number }) => {
    if (cols <= 0 || rows <= 0) return;
    try {
      await exec.resize({ w: cols, h: rows });
    } catch {
      // ignore
    }
  };

  socket.on("shell-input", onInput);
  socket.on("shell-resize", onResize);

  return () => {
    socket.off("shell-input", onInput);
    socket.off("shell-resize", onResize);
    stream.off("data", onData);
    stream.off("end", onEnd);
    stream.off("error", onError);
    if (!stream.destroyed) {
      stream.destroy();
    }
    console.log(`Docker terminal cleaned up for ${projectId}`);
  };
}

export function handleTerminalSocket(
  socket: Socket,
  projectId: string,
  _namespace: Namespace
): void {
  let cleanup: (() => void) | null = null;

  void (async () => {
    try {
      const docker = new Docker();
      await docker.ping();
      console.log(`Docker daemon found, attaching docker shell for ${projectId}`);
      cleanup = await attachDockerShell(socket, projectId);
    } catch (err: any) {
      console.log(
        `Docker not available for ${projectId} (${err?.message}), using native local shell`
      );
      cleanup = await attachLocalShell(socket, projectId);
    }
  })();

  socket.on("disconnect", () => {
    cleanup?.();
    cleanup = null;
    console.log(`Terminal disconnected: ${socket.id}`);
  });
}

export async function resolveProjectCwd(projectId: string): Promise<string> {
  try {
    return await resolveProjectHostPath(projectId);
  } catch {
    await fs.mkdir(PROJECTS_DIR, { recursive: true });
    return path.join(PROJECTS_DIR, projectId);
  }
}
