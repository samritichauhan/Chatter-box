import presenceHandler from "./presence.handler.js";
import chatHandler from "./chat.handler.js";
import callHandler from "./call.handler.js";

export default function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    presenceHandler(io, socket);
    chatHandler(io, socket);
    callHandler(io, socket);
  });
}
