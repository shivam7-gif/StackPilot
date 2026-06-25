import fs from "fs/promises";
import path from "path";
import { spawn, type IPty } from "node-pty";
import type { Duplex } from "stream";
import type { Namespace, Socket } from "socket.io";
import { ensureProjectContainer } from "../containers/handleContainerCreate.js";
import { resolveProjectHostPath } from "../containers/resolveProjectHostPath.js";
import { PROJECTS_DIR } from "../src/services/project.service.js";

function getDefaultShell(): string {
  if (process.platform === "win32") {
    return process.env.COMSPEC || "powershell.exe";
  }
  return process.env.SHELL || "bash";
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

export TERM=xterm-256color

alias ll='ls -lah --color=auto'
alias gs='git status'

export PS1='\\[\\e[38;5;45m\\]➜\\[\\e[0m\\] \\[\\e[38;5;82m\\]\\W\\[\\e[0m\\] \\[\\e[38;5;214m\\]$(git branch --show-current 2>/dev/null)\\[\\e[0m\\] $ '

`;
}
async function attachLocalShell(
  socket: Socket,
  projectId: string
): Promise<() => void> {
  let ptyProcess: IPty | null = null;

  const cwd = await resolveProjectHostPath(projectId);
  const shell = getDefaultShell();

  ptyProcess = spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd,
    env: process.env as Record<string, string>,
  });

  ptyProcess.onData((data) => {
    socket.emit("shell-output", data);
  });

  ptyProcess.onExit(() => {
    socket.emit("shell-output", "\r\n\x1b[90m[Process exited]\x1b[0m\r\n");
  });

  console.log(`Local terminal spawned for ${projectId} in ${cwd}`);

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

  if (hostPort5173) {
    socket.emit("container-ready", {
      projectId,
      hostPort5173,
      previewUrl: `http://localhost:${hostPort5173}`,
    });
  }
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
  stream.write(`
export PS1='\\[\\e[38;5;39m\\]➜ \\[\\e[38;5;82m\\]\\W\\[\\e[0m\\] \\[\\e[33m\\]$(git branch --show-current 2>/dev/null)\\[\\e[0m\\] $ '
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
    if (cols <= 0 || rows <= 0) {
      return;
    }

    try {
      await exec.resize({
        w: cols,
        h: rows,
      });
    } catch {
      // ignore resize race
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
      console.log("Attaching docker shell");
      cleanup = await attachDockerShell(socket, projectId);
    } catch (err) {
      console.error(
        `Docker terminal failed for ${projectId}, falling back to local shell`,
        err
      );
      socket.emit("shell-output", "\r\nHELLO FROM BACKEND\r\n");
      cleanup = await attachLocalShell(socket, projectId);
    }
  })();

  socket.on("disconnect", () => {
    cleanup?.();
    cleanup = null;
    console.log(`Terminal disconnected: ${socket.id}`);
  });
}

/** Kept for callers that resolve cwd without Docker. */
export async function resolveProjectCwd(projectId: string): Promise<string> {
  try {
    return await resolveProjectHostPath(projectId);
  } catch {
    await fs.mkdir(PROJECTS_DIR, { recursive: true });
    return path.join(PROJECTS_DIR, projectId);
  }
}
