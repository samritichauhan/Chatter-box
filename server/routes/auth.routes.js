import express from "express";
import { register, login, logout, checkAuth, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import auth from "../middleware/auth.middleware.js";
import { registerValidation, loginValidation } from "../middleware/validate.middleware.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, please try again later" },
  skip: (req, res) => {
    // Skip X-Forwarded-For validation error for Vercel
    return false;
  },
  keyGenerator: (req, res) => {
    // Use X-Forwarded-For for Vercel, fallback to IP
    return req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  },
});

router.post("/register", authLimiter, registerValidation, register);
router.post("/login", authLimiter, loginValidation, login);
router.post("/logout", auth, logout);
router.get("/check", auth, checkAuth);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
