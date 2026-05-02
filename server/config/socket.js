import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  // CORS configuration for both development and production
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    process.env.CLIENT_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
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
