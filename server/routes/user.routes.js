import express from "express";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  searchUsers,
  getUserById,
  blockUser,
  unblockUser,
} from "../controllers/user.controller.js";
import auth from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/avatar", auth, upload.single("avatar"), updateAvatar);
router.get("/search", auth, searchUsers);
router.get("/:id", auth, getUserById);
router.post("/block/:id", auth, blockUser);
router.post("/unblock/:id", auth, unblockUser);

export default router;
