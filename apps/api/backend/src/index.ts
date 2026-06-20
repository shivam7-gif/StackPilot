import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { Server } from "socket.io";
import chokidar from "chokidar";
import { handleEditorSocketEvents } from "../socketHandlers/editorHandlers.js";
import { handleProjectSocket } from "./sockets/project.socket.js";
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
editorNamespace.on("connection", (socket) => {
  console.log("editor connected");
  const projectId = socket.handshake.query?.projectId;
  console.log("Project id received after connection : ", projectId);
  console.log("handshake query : ", socket.handshake?.query);
  console.log("handshake  URL :", socket.handshake.url);

  if (projectId) {
    var watcher = chokidar.watch(`./projects/${projectId}`, {
      ignored: (path) => path.includes("node_modules"),
      persistent: true, //keeps the watcher in running state till the time app is running
      awaitWriteFinish: {
        stabilityThreshold: 2000, //ensures statbility of files before triggering events
      },
      ignoreInitial: true, // ignore the initial files in the directory
    });
    watcher.on("all", (event, path) => {
      console.log(event, path);
    });
  }
  handleEditorSocketEvents(socket);
  socket.on("disconnect", async () => {
    await watcher.close();
    console.log("editor disconnected");
  });
});
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
