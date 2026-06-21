import chokidar from "chokidar";
import type { Namespace } from "socket.io";
import path from "path";
import { PROJECTS_DIR } from "../services/project.service.js";

export function getProjectRoomId(projectId: string): string {
  return `project:${projectId}`;
}

type WatcherEntry = {
  watcher: chokidar.FSWatcher;
  refCount: number;
};

const projectWatchers = new Map<string, WatcherEntry>();

export function acquireProjectWatcher(
  projectId: string,
  editorNamespace: Namespace,
): void {
  const roomId = getProjectRoomId(projectId);
  const existing = projectWatchers.get(projectId);

  if (existing) {
    existing.refCount += 1;
    return;
  }

  const watchPath = path.join(PROJECTS_DIR, projectId);
  const watcher = chokidar.watch(watchPath, {
    ignored: (filePath) => filePath.includes("node_modules"),
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
    },
    ignoreInitial: true,
  });

  watcher.on("all", (event, filePath) => {
    editorNamespace.to(roomId).emit("fileSystemChanged", {
      event,
      path: filePath,
    });
  });

  projectWatchers.set(projectId, { watcher, refCount: 1 });
}

export async function releaseProjectWatcher(
  projectId: string,
): Promise<void> {
  const entry = projectWatchers.get(projectId);
  if (!entry) return;

  entry.refCount -= 1;
  if (entry.refCount <= 0) {
    await entry.watcher.close();
    projectWatchers.delete(projectId);
  }
}

export async function emitRoomPresence(
  editorNamespace: Namespace,
  projectId: string,
): Promise<void> {
  const roomId = getProjectRoomId(projectId);
  const clientsInRoom = await editorNamespace.in(roomId).fetchSockets();

  editorNamespace.to(roomId).emit("room:presence", {
    projectId,
    users: clientsInRoom.length,
  });
}
