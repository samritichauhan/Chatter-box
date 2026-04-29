import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, default: "" },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "document", "voice-note", "system"],
      default: "text",
    },
    mediaUrl: { type: String, default: "" },
    mediaName: { type: String, default: "" },
    mediaSize: { type: Number, default: 0 },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    readBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now },
      },
    ],
    deliveredTo: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        deliveredAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isEdited: { type: Boolean, default: false },
    isStarred: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: String,
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
