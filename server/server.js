import "dotenv/config"; // must be first — loads .env before any other module reads process.env
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";

import connectDB from "./config/db.js";
import { initSocket } from "./config/socket.js";
import setupSocket from "./socket/index.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import messageRoutes from "./routes/message.routes.js";
import callRoutes from "./routes/call.routes.js";

const app = express();
const httpServer = createServer(app);

// Socket.io
const io = initSocket(httpServer);
setupSocket(io);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/calls", callRoutes);

app.get("/", (req, res) => {
  res.json({ message: "ChatterBox API is running" });
});

// Global error handler — catches multer errors, validation errors, etc.
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || "Server error" });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
