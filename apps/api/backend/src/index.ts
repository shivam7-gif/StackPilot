import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { createServer } from "http";
import { initSocket } from "./sockets/index.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;
const server = createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
  next();
});

// Debug endpoint to inspect stored project records
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

// Initialize Socket.IO inside the sockets module to avoid duplicate instances
initSocket(server);

app.use("/api", routes);
// Also mount routes at root to support direct paths like /projects/:id/tree
app.use("/", routes);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
