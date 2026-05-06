import express from "express";
import {
  getConversations,
  createOrGetPrivateConversation,
  createGroup,
  updateGroup,
  addToGroup,
  removeFromGroup,
  leaveGroup,
  pinConversation,
  deleteConversation,
} from "../controllers/conversation.controller.js";
import auth from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", auth, getConversations);
router.post("/", auth, createOrGetPrivateConversation);
router.post("/group", auth, createGroup);
router.put("/group/:id", auth, upload.single("groupAvatar"), updateGroup);
router.post("/group/:id/add", auth, addToGroup);
router.post("/group/:id/remove", auth, removeFromGroup);
router.delete("/group/:id/leave", auth, leaveGroup);
router.delete("/:id", auth, deleteConversation);
router.put("/:id/pin", auth, pinConversation);

export default router;
