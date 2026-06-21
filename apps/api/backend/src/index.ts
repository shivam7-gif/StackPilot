import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { Server } from "socket.io";
import { handleEditorSocketEvents } from "../socketHandlers/editorHandlers.js";
import { handleProjectSocket } from "./sockets/project.socket.js";
import {
  acquireProjectWatcher,
  emitRoomPresence,
  getProjectRoomId,
  releaseProjectWatcher,
} from "./sockets/editorRooms.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/_debug/project-records", async (_req, res) => {
  try {
    const recordsPath = path.join(
      __dirname,
      "../projects/project-records.json",
    );
    const raw = await fs.readFile(recordsPath, "utf8");
    res.status(200).json(JSON.parse(raw || "[]"));
  } catch (err: any) {
    res.status(500).json({ error: String(err) });
  }
});

// app.use("/api", routes);
app.use("/", routes);

io.on("connection", (socket) => {
  console.log(`A user connected : ${socket.id}`);
  handleProjectSocket(socket);
});
const editorNamespace = io.of("/editor");
editorNamespace.on("connection", async (socket) => {
  const rawProjectId = socket.handshake.query?.projectId;
  const projectId = Array.isArray(rawProjectId)
    ? rawProjectId[0]
    : rawProjectId;

  if (!projectId || typeof projectId !== "string") {
    socket.emit("error", { data: "projectId is required" });
    socket.disconnect(true);
    return;
  }

  const roomId = getProjectRoomId(projectId);
  await socket.join(roomId);
  socket.data.projectId = projectId;

  console.log(`Editor connected: ${socket.id} joined ${roomId}`);

  acquireProjectWatcher(projectId, editorNamespace);
  await emitRoomPresence(editorNamespace, projectId);

  const clientsInRoom = await editorNamespace.in(roomId).fetchSockets();
  socket.emit("room:joined", {
    projectId,
    roomId,
    socketId: socket.id,
    users: clientsInRoom.length,
  });

  handleEditorSocketEvents(socket, projectId, editorNamespace);

  socket.on("disconnect", async () => {
    await releaseProjectWatcher(projectId);
    await emitRoomPresence(editorNamespace, projectId);
    console.log(`Editor disconnected: ${socket.id} left ${roomId}`);
  });
});
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
