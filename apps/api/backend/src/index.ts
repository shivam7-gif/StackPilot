console.log("=== STACKPILOT BACKEND BOOTING ===");
console.log("Node version:", process.version);
console.log("Environment PORT:", process.env.PORT);

process.on("uncaughtException", (err) => {
  console.error("FATAL UNCAUGHT EXCEPTION:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("FATAL UNHANDLED REJECTION:", reason);
});

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "http-proxy-middleware";
import {
  getProjectPort,
  getActiveProjectForClient,
} from "./services/previewService.js";
import routes from "./routes/index.js";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { Server } from "socket.io";
import { handleEditorSocketEvents } from "../socketHandlers/editorHandlers.js";
import { handleTerminalSocket } from "../socketHandlers/terminalHandlers.js";
import { handleProjectSocket } from "./sockets/project.socket.js";
import {
  acquireProjectWatcher,
  emitRoomPresence,
  getProjectRoomId,
  releaseProjectWatcher,
} from "./sockets/editorRooms.js";
import { handleContainerCreate } from "../containers/handleContainerCreate.js";
import {
  getMetricsHandler,
  metricsMiddleware,
  socketIoConnections,
} from "./monitoring/metrics.js";
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

app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());

// Prometheus scrape endpoint (exempt from rate limits)
app.get("/metrics", getMetricsHandler);

// Metrics collection middleware for tracking requests & latency
app.use(metricsMiddleware);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  skip: (req) => Boolean(req.originalUrl && req.originalUrl.includes("socket.io")),
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

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
      "../projects/project-records.json"
    );
    const raw = await fs.readFile(recordsPath, "utf8");
    res.status(200).json(JSON.parse(raw || "[]"));
  } catch (err: any) {
    res.status(500).json({ error: String(err) });
  }
});

// app.use("/api", routes);
app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", message: "StackPilot API is running" });
});

// Proxy root-relative dev server requests (Vite assets, HMR, React components) originating from preview iframes
app.use((req, res, next) => {
  // Never intercept standard backend API endpoints
  if (
    req.path === "/" ||
    req.path.startsWith("/api/preview") ||
    req.path.startsWith("/preview") ||
    req.path.startsWith("/projects") ||
    req.path.startsWith("/api/projects") ||
    req.path.startsWith("/metrics") ||
    req.path.startsWith("/_debug") ||
    req.path.startsWith("/socket.io")
  ) {
    return next();
  }

  // Determine projectId from Cookie, Referer, or Client Session
  let projectId: string | null | undefined = null;

  // 1. From Cookie:
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/stackpilot_preview_project=([a-zA-Z0-9_-]+)/);
    if (match?.[1]) projectId = match[1];
  }

  // 2. From Referer:
  if (!projectId && req.headers.referer) {
    const match = req.headers.referer.match(/\/preview\/([a-zA-Z0-9_-]+)/);
    if (match?.[1]) projectId = match[1];
  }

  // 3. From Client IP session:
  if (!projectId) {
    const forwarded = req.headers["x-forwarded-for"];
    const clientKey =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "default";
    projectId = getActiveProjectForClient(clientKey);
  }

  // If a preview session is active, proxy this asset request to the project's dev server
  if (projectId) {
    const port = getProjectPort(projectId);
    return createProxyMiddleware({
      target: `http://127.0.0.1:${port}`,
      changeOrigin: true,
      ws: true,
      on: {
        proxyRes: (proxyRes) => {
          delete proxyRes.headers["x-frame-options"];
          delete proxyRes.headers["content-security-policy"];
          proxyRes.headers["access-control-allow-origin"] = "*";
        },
      },
    })(req, res, next);
  }

  next();
});

app.use("/", routes);

io.on("connection", (socket) => {
  socketIoConnections.inc({ namespace: "/" });
  console.log(`A user connected : ${socket.id}`);
  handleProjectSocket(socket);

  socket.on("disconnect", () => {
    socketIoConnections.dec({ namespace: "/" });
  });
});
const editorNamespace = io.of("/editor");
editorNamespace.on("connection", async (socket) => {
  socketIoConnections.inc({ namespace: "/editor" });
  const rawProjectId = socket.handshake.auth?.projectId ?? socket.handshake.query?.projectId;
  const projectId = Array.isArray(rawProjectId)
    ? rawProjectId[0]
    : rawProjectId;

  if (!projectId || typeof projectId !== "string") {
    socket.emit("error", { data: "projectId is required" });
    socket.disconnect(true);
    socketIoConnections.dec({ namespace: "/editor" });
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
    socketIoConnections.dec({ namespace: "/editor" });
    await releaseProjectWatcher(projectId);
    await emitRoomPresence(editorNamespace, projectId);
    console.log(`Editor disconnected: ${socket.id} left ${roomId}`);
  });
});

const terminalNamespace = io.of("/terminal");

terminalNamespace.on("connection", async (socket) => {
  socketIoConnections.inc({ namespace: "/terminal" });
  const rawProjectId = socket.handshake.auth?.projectId ?? socket.handshake.query?.projectId;

  const projectId = Array.isArray(rawProjectId)
    ? rawProjectId[0]
    : rawProjectId;

  if (!projectId || typeof projectId !== "string") {
    socket.emit("error", {
      data: "projectId is required",
    });

    socket.disconnect(true);
    socketIoConnections.dec({ namespace: "/terminal" });
    return;
  }

  console.log(`Terminal connected : ${socket.id} for project ${projectId}`);
  handleTerminalSocket(socket, projectId, terminalNamespace);

  socket.on("disconnect", () => {
    socketIoConnections.dec({ namespace: "/terminal" });
  });
});

server.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
