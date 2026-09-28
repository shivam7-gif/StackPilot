import fs from "fs/promises";
import { Namespace, Socket } from "socket.io";
import path from "path";
import { PROJECTS_DIR } from "../src/services/project.service.js";
import { getProjectRoomId } from "../src/sockets/editorRooms.js";
import { resolveProjectHostPath } from "../containers/resolveProjectHostPath.js";

interface FilePayload {
  pathToFileFolder: string;
}

interface WriteFilePayload extends FilePayload {
  data: string;
}

const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".bmp",
]);

function getImageMimeType(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".bmp":
      return "image/bmp";
    default:
      return "application/octet-stream";
  }
}

export const handleEditorSocketEvents = (
  socket: Socket,
  projectId: string,
  editorNamespace: Namespace,
): void => {
  const roomId = getProjectRoomId(projectId);

  const resolveTarget = async (filePath: string): Promise<string> => {
    if (path.isAbsolute(filePath)) return path.resolve(filePath);
    const hostPath = await resolveProjectHostPath(projectId);
    return path.resolve(hostPath, filePath);
  };

  const rejectInvalidPath = (targetPath: string): boolean => {
    const projectsDir = path.resolve(PROJECTS_DIR);
    if (!targetPath.startsWith(`${projectsDir}${path.sep}`) && targetPath !== projectsDir) {
      socket.emit("error", { data: "File path is outside the project directory" });
      return true;
    }
    return false;
  };

  // Write File
  socket.on(
    "writeFile",
    async ({ data, pathToFileFolder }: WriteFilePayload) => {
      if (!pathToFileFolder || data === undefined) {
        socket.emit("error", { data: "Invalid writeFile payload" });
        return;
      }

      const targetPath = await resolveTarget(pathToFileFolder);
      if (rejectInvalidPath(targetPath)) return;

      try {
        await fs.writeFile(targetPath, data, "utf-8");

        socket.emit("writeFileSuccess", {
          path: pathToFileFolder,
          data: "File written successfully",
        });

        socket.to(roomId).emit("fileChanged", {
          path: pathToFileFolder,
          value: data,
          authorId: socket.id,
        });
      } catch (error) {
        console.error("Error writing file:", error);
        socket.emit("error", {
          data: "Error writing file",
        });
      }
    },
  );

  // Read File
  socket.on("readFile", async ({ pathToFileFolder }: FilePayload) => {
    if (!pathToFileFolder) {
      socket.emit("error", { data: "Invalid readFile payload" });
      return;
    }

    const targetPath = await resolveTarget(pathToFileFolder);
    if (rejectInvalidPath(targetPath)) return;

    const ext = path.extname(targetPath);

    try {
      if (IMAGE_EXTENSIONS.has(ext.toLowerCase())) {
        const buffer = await fs.readFile(targetPath);
        const mimeType = getImageMimeType(ext);
        const value = `data:${mimeType};base64,${buffer.toString("base64")}`;

        socket.emit("readFileSuccess", {
          path: pathToFileFolder,
          fileType: "image",
          value,
        });
        return;
      }

      const content = await fs.readFile(targetPath, "utf-8");

      socket.emit("readFileSuccess", {
        path: pathToFileFolder,
        value: content,
      });
    } catch (error: any) {
      console.error("Error reading file:", error);
      socket.emit("error", {
        data: `Error reading file: ${error?.message || error}`,
      });
    }
  });

  // Create File
  socket.on("createFile", async ({ pathToFileFolder }: FilePayload) => {
    if (!pathToFileFolder) {
      socket.emit("error", { data: "Invalid createFile payload" });
      return;
    }

    const targetPath = await resolveTarget(pathToFileFolder);
    if (rejectInvalidPath(targetPath)) return;

    try {
      await fs.writeFile(targetPath, "");
      socket.emit("createFileSuccess", {
        path: pathToFileFolder,
        data: "File created successfully",
      });
    } catch (error: any) {
      console.error("Error creating file:", error);
      socket.emit("error", {
        data: "Error creating file",
      });
    }
  });

  // Create Folder
  socket.on("createFolder", async ({ pathToFileFolder }: FilePayload) => {
    if (!pathToFileFolder) {
      socket.emit("error", { data: "Invalid createFolder payload" });
      return;
    }

    const targetPath = await resolveTarget(pathToFileFolder);
    if (rejectInvalidPath(targetPath)) return;

    try {
      await fs.mkdir(targetPath, { recursive: true });
      socket.emit("createFolderSuccess", {
        path: pathToFileFolder,
        data: "Folder created successfully",
      });
    } catch (error) {
      console.error("Error creating folder:", error);
      socket.emit("error", {
        data: "Error creating folder",
      });
    }
  });

  // Delete File
  socket.on("deleteFile", async ({ pathToFileFolder }: FilePayload) => {
    if (!pathToFileFolder) {
      socket.emit("error", { data: "Invalid deleteFile payload" });
      return;
    }

    const targetPath = await resolveTarget(pathToFileFolder);
    if (rejectInvalidPath(targetPath)) return;

    try {
      await fs.rm(targetPath, { recursive: true, force: true });
      socket.emit("deleteFileSuccess", {
        path: pathToFileFolder,
        data: "File deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      socket.emit("error", {
        data: "Error deleting file",
      });
    }
  });

  // Rename Path
  socket.on(
    "renamePath",
    async ({
      pathToFileFolder,
      newPath,
    }: {
      pathToFileFolder: string;
      newPath: string;
    }) => {
      if (!pathToFileFolder || !newPath) {
        socket.emit("error", { data: "Invalid renamePath payload" });
        return;
      }

      const targetPath = await resolveTarget(pathToFileFolder);
      const targetNewPath = await resolveTarget(newPath);

      if (rejectInvalidPath(targetPath) || rejectInvalidPath(targetNewPath)) return;

      try {
        await fs.rename(targetPath, targetNewPath);
        socket.emit("renamePathSuccess", {
          oldPath: pathToFileFolder,
          newPath,
          data: "Renamed successfully",
        });
      } catch (error) {
        console.error("Error renaming path:", error);
        socket.emit("error", {
          data: "Error renaming path",
        });
      }
    },
  );
};
