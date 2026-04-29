import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    callType: {
      type: String,
      enum: ["audio", "video"],
      required: true,
    },
    status: {
      type: String,
      enum: ["ringing", "ongoing", "ended", "missed", "rejected", "busy"],
      default: "ringing",
    },
    startedAt: Date,
    endedAt: Date,
    duration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Call = mongoose.model("Call", callSchema);
export default Call;
