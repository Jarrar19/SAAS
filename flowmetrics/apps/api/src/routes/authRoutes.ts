import { Router } from "express";
import { login, getMe } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/rateLimiters.js";

const router = Router();

// POST /api/auth/login is protected with loginLimiter (5 attempts per 15 min per IP)
router.post("/login", loginLimiter, login);

// GET /api/auth/me is protected with requireAuth (not rate-limited)
router.get("/me", requireAuth, getMe);

export default router;
