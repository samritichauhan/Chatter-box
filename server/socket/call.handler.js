import User from "../models/User.model.js";

// Emit to a user by their _id — tries their stored socketId first (reliable),
// then falls back to the socket room (userId) in case the DB is stale.
async function emitToUser(io, userId, event, data) {
  const user = await User.findById(userId).select("socketId").lean();
  if (user?.socketId) {
    io.to(user.socketId).emit(event, data);
  } else {
    // fallback: room-based (works if they're still in the room)
    io.to(userId.toString()).emit(event, data);
  }
}

export default function callHandler(io, socket) {
  socket.on("call:initiate", async ({ to, callType, signal, from }) => {
    await emitToUser(io, to, "call:incoming", { from, callType, signal });
  });

  socket.on("call:accept", async ({ to, signal }) => {
    await emitToUser(io, to, "call:accepted", { signal });
  });

  socket.on("call:reject", async ({ to }) => {
    await emitToUser(io, to, "call:rejected", {});
  });

  socket.on("call:end", async ({ to }) => {
    await emitToUser(io, to, "call:ended", {});
  });

  socket.on("call:ice-candidate", async ({ to, candidate }) => {
    await emitToUser(io, to, "call:ice-candidate", { candidate });
  });
}
