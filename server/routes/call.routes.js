import express from "express";
import { getCallHistory, initiateCall } from "../controllers/call.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/history", auth, getCallHistory);
router.post("/initiate", auth, initiateCall);

export default router;
