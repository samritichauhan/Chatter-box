import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000" : "https://chatterbox-thuu.onrender.com";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});

socket.on("connect", () => {
  console.log("[Socket] Connected to server, socketId:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("[Socket] Connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("[Socket] Disconnected from server, reason:", reason);
});

export default socket;
