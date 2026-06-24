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

async function attachLocalShell(
  socket: Socket,
  projectId: string,
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
  projectId: string,
): Promise<() => void> {
  const { container, hostPort5173 } = await ensureProjectContainer(projectId);

  if (hostPort5173) {
    socket.emit("container-ready", {
      projectId,
      hostPort5173,
      previewUrl: `http://localhost:${hostPort5173}`,
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

  const stream = (await exec.start({
    hijack: true,
    stdin: true,
  })) as Duplex;

  stream.on("data", (chunk: Buffer) => {
    socket.emit("shell-output", chunk.toString("utf8"));
  });

  stream.on("end", () => {
    socket.emit("shell-output", "\r\n\x1b[90m[Process exited]\x1b[0m\r\n");
  });

  console.log(`Docker terminal attached for ${projectId}`);

  const onInput = (data: string) => {
    stream.write(data);
  };

  const onResize = async ({ cols, rows }: { cols: number; rows: number }) => {
    if (cols <= 0 || rows <= 0) return;
    try {
      await exec.resize({ w: cols, h: rows });
    } catch {
      // ignore resize races during spawn/teardown
    }
  };

  socket.on("shell-input", onInput);
  socket.on("shell-resize", onResize);

  return () => {
    socket.off("shell-input", onInput);
    socket.off("shell-resize", onResize);
    stream.destroy();
  };
}

export function handleTerminalSocket(
  socket: Socket,
  projectId: string,
  _namespace: Namespace,
): void {
  let cleanup: (() => void) | null = null;

  void (async () => {
    try {
      cleanup = await attachDockerShell(socket, projectId);
    } catch (err) {
      console.error(`Docker terminal failed for ${projectId}, falling back to local shell`, err);
      socket.emit(
        "shell-output",
        "\r\nHELLO FROM BACKEND\r\n"
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

/** Kept for callers that resolve cwd without Docker. */
export async function resolveProjectCwd(projectId: string): Promise<string> {
  try {
    return await resolveProjectHostPath(projectId);
  } catch {
    await fs.mkdir(PROJECTS_DIR, { recursive: true });
    return path.join(PROJECTS_DIR, projectId);
  }
}
