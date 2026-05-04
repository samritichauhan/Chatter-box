import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((u) => u.trim()) : []),
  ].filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });
  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
