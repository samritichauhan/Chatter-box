import express from "express";
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  reactToMessage,
  starMessage,
  markAsRead,
  clearMessages,
} from "../controllers/message.controller.js";
import auth from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.delete("/clear/:conversationId", auth, clearMessages);
router.post("/read/:conversationId", auth, markAsRead);
router.get("/:conversationId", auth, getMessages);
router.post("/", auth, upload.single("media"), sendMessage);
router.put("/:id", auth, editMessage);
router.delete("/:id", auth, deleteMessage);
router.post("/:id/react", auth, reactToMessage);
router.post("/:id/star", auth, starMessage);

export default router;
