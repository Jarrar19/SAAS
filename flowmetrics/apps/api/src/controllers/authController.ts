import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { AdminUser } from "../models/AdminUser.js";
import { signToken } from "../utils/token.js";

// Fixed precomputed bcrypt constant (10 rounds) for timing equalization without CPU waste on module load
const DUMMY_HASH = "$2a$10$WsC29JCQXdVckCe9GBOJs.2ypMp2kixipbrrGAzqGMQ1jDj8C9yd2";

/**
 * POST /api/auth/login
 * Body: { email, password }
 *
 * Security Requirements:
 * 1. Same 401 status, identical message, and identical error shape for
 *    "user does not exist" and "incorrect password" to eliminate enumeration.
 * 2. Compares against dummy hash if user is not found to prevent side-channel timing attacks.
 * 3. Token payload contains only { sub: userId, role: "admin" } - never password hash or plaintext.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body || {};

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Email and password are required strings.",
        },
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const admin = await AdminUser.findOne({ email: normalizedEmail });

    // Standardized generic credentials error
    const credentialsError = {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid email or password.",
      },
    };

    if (!admin) {
      // Execute dummy bcrypt comparison to equalize computation time (~100ms)
      await bcrypt.compare(password, DUMMY_HASH);
      res.status(401).json(credentialsError);
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      res.status(401).json(credentialsError);
      return;
    }

    // Generate JWT with minimal payload
    const token = signToken(String(admin._id), admin.role);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: String(admin._id),
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Protected endpoint returning current authenticated user from token
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Not authenticated.",
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      userId: req.user.sub,
      role: req.user.role,
    },
  });
}
