import app from "./app";
import { createServer } from "http";
import { initSocket } from "./sockets/index.js";

const PORT = process.env.PORT || 5000;
const server = createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});