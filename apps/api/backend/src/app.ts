import express from "express";
import cors from "cors";
import { createServer } from "http";
import routes from "./routes/index.js";
import dotenv from "dotenv";
import { initSocket } from "./sockets/index.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(routes);

initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
