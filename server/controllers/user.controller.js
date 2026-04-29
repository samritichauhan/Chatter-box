import User from "../models/User.model.js";
import { uploadToCloudinary } from "../utils/helpers.js";

export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, about, phone } = req.body;
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (about !== undefined) updates.about = about;
    if (phone !== undefined) updates.phone = phone;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    const result = await uploadToCloudinary(req.file.buffer, "chatterbox/avatars");
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { fullName: { $regex: q, $options: "i" } },
            { username: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        },
      ],
    }).limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const blockUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { blockedUsers: req.params.id },
    });
    res.json({ message: "User blocked" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { blockedUsers: req.params.id },
    });
    res.json({ message: "User unblocked" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
