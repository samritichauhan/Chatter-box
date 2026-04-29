import User from "../models/User.model.js";

export default function presenceHandler(io, socket) {
  socket.on("user:online", async ({ userId }) => {
    socket.userId = userId;
    socket.join(userId);

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      socketId: socket.id,
    });

    io.emit("user:statusChanged", {
      userId,
      isOnline: true,
      lastSeen: new Date(),
    });
  });

  socket.on("user:typing", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("user:typing", { conversationId, userId });
  });

  socket.on("user:stopTyping", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("user:stopTyping", { conversationId, userId });
  });

  socket.on("disconnect", async () => {
    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
        socketId: "",
      });

      io.emit("user:statusChanged", {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date(),
      });
    }
  });
}
