import { Server } from "socket.io";
import { handleProjectSocket } from "./project.socket.js";

export function initSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    handleProjectSocket(socket);
  });
}
