import User from "../models/User.model.js";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const user = await User.create({ fullName, email, username, password });
    generateToken(user._id, res);

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      about: user.about,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      about: user.about,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastSeen: new Date(),
    });

    res.cookie("jwt", "", { maxAge: 0 });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
