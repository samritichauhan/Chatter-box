import Call from "../models/Call.model.js";

export const getCallHistory = async (req, res) => {
  try {
    const calls = await Call.find({
      $or: [{ caller: req.user._id }, { receiver: req.user._id }],
    })
      .populate("caller", "fullName username avatar")
      .populate("receiver", "fullName username avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(calls);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const initiateCall = async (req, res) => {
  try {
    const { receiverId, callType, conversationId } = req.body;

    const call = await Call.create({
      caller: req.user._id,
      receiver: receiverId,
      callType,
      conversationId,
    });

    res.status(201).json(call);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
