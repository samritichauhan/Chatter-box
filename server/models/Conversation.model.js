import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      required: true,
    },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    groupName: { type: String, default: "" },
    groupAvatar: { type: String, default: "" },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
