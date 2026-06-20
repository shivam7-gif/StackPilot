import fs from "fs/promises";
import { Socket } from "socket.io";

interface FilePayload {
  pathToFileFolder: string;
}

interface WriteFilePayload extends FilePayload {
  data: string;
}

export const handleEditorSocketEvents = (socket: Socket): void => {
  // Write File
  socket.on(
    "writeFile",
    async ({ data, pathToFileFolder }: WriteFilePayload) => {
      try {
        await fs.writeFile(pathToFileFolder, data);

        socket.emit("writeFileSuccess", {
          data: "File written successfully",
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
    try {
      await fs.access(pathToFileFolder);

      socket.emit("error", {
        data: "File already exists",
      });
    } catch {
      try {
        await fs.writeFile(pathToFileFolder, "");

        socket.emit("createFileSuccess", {
          data: "File created successfully",
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
    
    try {
      const content = await fs.readFile(pathToFileFolder, "utf-8");

      socket.emit("readFileSuccess", {
        path: pathToFileFolder,
        value: content,
      });
      console.log("content", content);
    } catch (error) {
      console.error("Error reading file:", error);

      socket.emit("error", {
        data: "Error reading file",
      });
    }
  });

  // Delete File
  socket.on("deleteFile", async ({ pathToFileFolder }: FilePayload) => {
    try {
      await fs.unlink(pathToFileFolder);

      socket.emit("deleteFileSuccess", {
        data: "File deleted successfully",
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
    try {
      await fs.mkdir(pathToFileFolder, {
        recursive: true,
      });

      socket.emit("createFolderSuccess", {
        data: "Folder created successfully",
      });
    } catch (error) {
      console.error("Error creating folder:", error);

      socket.emit("error", {
        data: "Error creating folder",
      });
    }
  });

  // Delete Folder
  socket.on("deleteFolder", async ({ pathToFileFolder }: FilePayload) => {
    try {
      await fs.rm(pathToFileFolder, {
        recursive: true,
        force: true,
      });

      socket.emit("deleteFolderSuccess", {
        data: "Folder deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting folder:", error);

      socket.emit("error", {
        data: "Error deleting folder",
      });
    }
  });
};
