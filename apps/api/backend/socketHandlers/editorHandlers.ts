import fs from "fs/promises";
import { Namespace, Socket } from "socket.io";
import path from "path";
import { PROJECTS_DIR } from "../src/services/project.service.js";
import { getProjectRoomId } from "../src/sockets/editorRooms.js";

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

function isPathInProject(projectId: string, filePath: string): boolean {
  const resolved = path.resolve(filePath);
  const projectRoot = path.resolve(PROJECTS_DIR, projectId);
  return resolved === projectRoot || resolved.startsWith(`${projectRoot}${path.sep}`);
}

export const handleEditorSocketEvents = (
  socket: Socket,
  projectId: string,
  editorNamespace: Namespace,
): void => {
  const roomId = getProjectRoomId(projectId);

  const rejectInvalidPath = (filePath: string): boolean => {
    if (!isPathInProject(projectId, filePath)) {
      socket.emit("error", { data: "File path is outside the project" });
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

      if (rejectInvalidPath(pathToFileFolder)) return;

      try {
        await fs.writeFile(pathToFileFolder, data, "utf-8");

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

  // Create File
  socket.on("createFile", async ({ pathToFileFolder }: FilePayload) => {
    if (!pathToFileFolder) {
      socket.emit("error", { data: "Invalid createFile payload" });
      return;
    }

    if (rejectInvalidPath(pathToFileFolder)) return;

    try {
      await fs.access(pathToFileFolder);

      socket.emit("error", {
        data: "File already exists",
      });
    } catch {
      try {
        await fs.writeFile(pathToFileFolder, "", "utf-8");

        socket.emit("createFileSuccess", {
          data: "File created successfully",
        });

        editorNamespace.to(roomId).emit("fileSystemChanged", {
          type: "createFile",
          path: pathToFileFolder,
        });
      } catch (error) {
        console.error("Error creating file:", error);

        socket.emit("error", {
          data: "Error creating file",
        });
      }
    }
  });

  // Read File
  socket.on("readFile", async ({ pathToFileFolder }: FilePayload) => {
    if (!pathToFileFolder) {
      socket.emit("error", { data: "Invalid readFile payload" });
      return;
    }

    if (rejectInvalidPath(pathToFileFolder)) return;

    const ext = path.extname(pathToFileFolder);

    try {
      if (IMAGE_EXTENSIONS.has(ext.toLowerCase())) {
        const buffer = await fs.readFile(pathToFileFolder);
        const mimeType = getImageMimeType(ext);
        const value = `data:${mimeType};base64,${buffer.toString("base64")}`;

        socket.emit("readFileSuccess", {
          path: pathToFileFolder,
          fileType: "image",
          value,
        });
        return;
      }

      const content = await fs.readFile(pathToFileFolder, "utf-8");

      socket.emit("readFileSuccess", {
        path: pathToFileFolder,
        value: content,
      });
    } catch (error) {
      console.error("Error reading file:", error);

      socket.emit("error", {
        data: "Error reading file",
      });
    }
  });

  // Delete File
  socket.on("deleteFile", async ({ pathToFileFolder }: FilePayload) => {
    if (!pathToFileFolder) {
      socket.emit("error", { data: "Invalid deleteFile payload" });
      return;
    }

    if (rejectInvalidPath(pathToFileFolder)) return;

    try {
      await fs.unlink(pathToFileFolder);

      socket.emit("deleteFileSuccess", {
        data: "File deleted successfully",
      });

      editorNamespace.to(roomId).emit("fileSystemChanged", {
        type: "deleteFile",
        path: pathToFileFolder,
      });
    } catch (error) {
      console.error("Error deleting file:", error);

      socket.emit("error", {
        data: "Error deleting file",
      });
    }
  });

  // Create Folder
  socket.on("createFolder", async ({ pathToFileFolder }: FilePayload) => {
    if (!pathToFileFolder) {
      socket.emit("error", { data: "Invalid createFolder payload" });
      return;
    }

    if (rejectInvalidPath(pathToFileFolder)) return;

    try {
      await fs.mkdir(pathToFileFolder, {
        recursive: true,
      });

      socket.emit("createFolderSuccess", {
        data: "Folder created successfully",
      });

      editorNamespace.to(roomId).emit("fileSystemChanged", {
        type: "createFolder",
        path: pathToFileFolder,
      });
    } catch (error) {
      console.error("Error creating folder:", error);

      socket.emit("error", {
        data: "Error creating folder",
      });
    }
  });

  // Rename File or Folder
  socket.on(
    "renamePath",
    async ({
      pathToFileFolder,
      newPath,
    }: FilePayload & { newPath: string }) => {
      if (!pathToFileFolder || !newPath) {
        socket.emit("error", { data: "Invalid renamePath payload" });
        return;
      }

      if (rejectInvalidPath(pathToFileFolder) || rejectInvalidPath(newPath)) {
        return;
      }

      try {
        await fs.rename(pathToFileFolder, newPath);

        socket.emit("renamePathSuccess", {
          oldPath: pathToFileFolder,
          newPath,
        });

        editorNamespace.to(roomId).emit("fileSystemChanged", {
          type: "renamePath",
          path: pathToFileFolder,
          newPath,
        });
      } catch (error) {
        console.error("Error renaming path:", error);

        socket.emit("error", {
          data: "Error renaming file or folder",
        });
      }
    },
  );

  // Delete Folder
  socket.on("deleteFolder", async ({ pathToFileFolder }: FilePayload) => {
    if (!pathToFileFolder) {
      socket.emit("error", { data: "Invalid deleteFolder payload" });
      return;
    }

    if (rejectInvalidPath(pathToFileFolder)) return;

    try {
      await fs.rm(pathToFileFolder, {
        recursive: true,
        force: true,
      });

      socket.emit("deleteFolderSuccess", {
        data: "Folder deleted successfully",
      });

      editorNamespace.to(roomId).emit("fileSystemChanged", {
        type: "deleteFolder",
        path: pathToFileFolder,
      });
    } catch (error) {
      console.error("Error deleting folder:", error);

      socket.emit("error", {
        data: "Error deleting folder",
      });
    }
  });
};
