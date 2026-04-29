import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import { uploadToCloudinary } from "../utils/helpers.js";

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "fullName username avatar isOnline lastSeen")
      .populate("lastMessage")
      .populate("groupAdmin", "fullName username")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createOrGetPrivateConversation = async (req, res) => {
  try {
    const { participantId } = req.body;

    let conversation = await Conversation.findOne({
      type: "private",
      participants: { $all: [req.user._id, participantId], $size: 2 },
    })
      .populate("participants", "fullName username avatar isOnline lastSeen")
      .populate("lastMessage");

    if (conversation) return res.json(conversation);

    conversation = await Conversation.create({
      type: "private",
      participants: [req.user._id, participantId],
    });

    conversation = await conversation.populate(
      "participants",
      "fullName username avatar isOnline lastSeen"
    );

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { groupName, participants } = req.body;

    if (!groupName) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const allParticipants = [req.user._id, ...participants];

    let conversation = await Conversation.create({
      type: "group",
      groupName,
      participants: allParticipants,
      groupAdmin: req.user._id,
    });

    // System message
    await Message.create({
      conversationId: conversation._id,
      sender: req.user._id,
      content: `${req.user.fullName} created group "${groupName}"`,
      messageType: "system",
    });

    conversation = await Conversation.findById(conversation._id)
      .populate("participants", "fullName username avatar isOnline lastSeen")
      .populate("groupAdmin", "fullName username");

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { groupName } = req.body;
    const updates = {};
    if (groupName) updates.groupName = groupName;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "chatterbox/groups");
      updates.groupAvatar = result.secure_url;
    }

    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    )
      .populate("participants", "fullName username avatar isOnline lastSeen")
      .populate("groupAdmin", "fullName username");

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const addToGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { participants: userId } },
      { new: true }
    )
      .populate("participants", "fullName username avatar isOnline lastSeen")
      .populate("groupAdmin", "fullName username");

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const removeFromGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { $pull: { participants: userId } },
      { new: true }
    )
      .populate("participants", "fullName username avatar isOnline lastSeen")
      .populate("groupAdmin", "fullName username");

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    await Conversation.findByIdAndUpdate(req.params.id, {
      $pull: { participants: req.user._id },
    });
    res.json({ message: "Left group" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const pinConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    conversation.isPinned = !conversation.isPinned;
    await conversation.save();
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
