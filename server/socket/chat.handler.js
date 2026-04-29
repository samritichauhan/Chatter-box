export default function chatHandler(io, socket) {
  socket.on("message:send", (data) => {
    io.to(data.conversationId).emit("message:received", data);
  });

  socket.on("message:delivered", ({ messageId, userId }) => {
    socket.broadcast.emit("message:delivered", { messageId, userId });
  });

  socket.on("message:read", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("message:read", { conversationId, userId });
  });

  socket.on("message:delete", ({ messageId, conversationId, deleteType }) => {
    io.to(conversationId).emit("message:deleted", { messageId, deleteType });
  });

  socket.on("message:react", ({ messageId, conversationId, reactions }) => {
    io.to(conversationId).emit("message:reacted", { messageId, reactions });
  });

  socket.on("join:conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("leave:conversation", (conversationId) => {
    socket.leave(conversationId);
  });
}
