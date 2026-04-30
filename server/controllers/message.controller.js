import Message from "../models/Message.model.js";
import Conversation from "../models/Conversation.model.js";
import { uploadToCloudinary } from "../utils/helpers.js";
import { getIO } from "../config/socket.js";

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { cursor, limit = 50 } = req.query;

    const query = {
      conversationId,
      deletedFor: { $ne: req.user._id },
    };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await Message.find(query)
      .populate("sender", "fullName username avatar")
      .populate("replyTo")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType = "text", replyTo } = req.body;

    const messageData = {
      conversationId,
      sender: req.user._id,
      content,
      messageType,
      readBy: [{ userId: req.user._id, readAt: new Date() }],
    };

    if (replyTo) messageData.replyTo = replyTo;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "chatterbox/messages");
      messageData.mediaUrl = result.secure_url;
      messageData.mediaName = req.file.originalname;
      messageData.mediaSize = req.file.size;
    }

    let message = await Message.create(messageData);
    message = await message.populate("sender", "fullName username avatar");
    if (replyTo) {
      message = await message.populate("replyTo");
    }

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    const io = getIO();
    io.to(conversationId).emit("message:received", message);

    res.status(201).json(message);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const fifteenMin = 15 * 60 * 1000;
    if (Date.now() - message.createdAt.getTime() > fifteenMin) {
      return res.status(400).json({ message: "Edit window has expired (15 min)" });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    const io = getIO();
    io.to(message.conversationId.toString()).emit("message:edited", message);

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { deleteType } = req.body; // "for_me" or "for_everyone"
    const message = await Message.findById(req.params.id);

    if (!message) return res.status(404).json({ message: "Message not found" });

    if (deleteType === "for_everyone") {
      if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
      message.isDeleted = true;
      message.content = "This message was deleted";
      await message.save();

      const io = getIO();
      io.to(message.conversationId.toString()).emit("message:deleted", {
        messageId: message._id,
        conversationId: message.conversationId,
      });
    } else {
      message.deletedFor.push(req.user._id);
      await message.save();
    }

    res.json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const existingReaction = message.reactions.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (existingReaction) {
      if (existingReaction.emoji === emoji) {
        message.reactions = message.reactions.filter(
          (r) => r.userId.toString() !== req.user._id.toString()
        );
      } else {
        existingReaction.emoji = emoji;
      }
    } else {
      message.reactions.push({ userId: req.user._id, emoji });
    }

    await message.save();

    const io = getIO();
    io.to(message.conversationId.toString()).emit("message:reacted", {
      messageId: message._id,
      reactions: message.reactions,
    });

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const starMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const isStarred = message.isStarred.includes(req.user._id);
    if (isStarred) {
      message.isStarred = message.isStarred.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      message.isStarred.push(req.user._id);
    }

    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversationId,
        "readBy.userId": { $ne: req.user._id },
      },
      {
        $addToSet: {
          readBy: { userId: req.user._id, readAt: new Date() },
        },
      }
    );

    const io = getIO();
    io.to(conversationId).emit("message:read", {
      conversationId,
      userId: req.user._id,
    });

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const clearMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId });

    // Update conversation's lastMessage to null
    await Conversation.findByIdAndUpdate(
      conversationId,
      { lastMessage: null, updatedAt: new Date() },
      { new: true }
    );

    const io = getIO();
    io.to(conversationId).emit("message:cleared", { conversationId });

    res.json({ message: "All messages cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
