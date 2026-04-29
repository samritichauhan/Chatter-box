import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000" : "https://chatterbox-thuu.onrender.com";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});

export default socket;
