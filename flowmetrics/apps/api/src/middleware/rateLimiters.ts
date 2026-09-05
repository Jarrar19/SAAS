import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

/**
 * Login Rate Limiter:
 * Scoped strictly to POST /api/auth/login.
 * 
 * Parameters:
 * - windowMs: 15 * 60 * 1000 (15 minutes)
 * - max: 5 requests per IP
 * 
 * Rationale:
 * Bcrypt password verification is intentionally computationally heavy (~100ms).
 * Limiting failed login attempts to 5 per 15-minute window per IP neutralizes
 * brute-force password guessing and credential stuffing attacks without impacting
 * legitimate administrators who know their password.
 * 
 * Keying Strategy:
 * Uses IP-based keying (req.ip). In this single-admin architecture, IP-based
 * throttling stops distributed dictionary attacks before credentials are even checked.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  standardHeaders: true, // Return standard RateLimit headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many login attempts from this IP. Please try again after 15 minutes.",
        details: [
          {
            field: "rateLimit",
            issue: "Maximum of 5 login attempts allowed per 15-minute window.",
          },
        ],
      },
    });
  },
});

/**
 * Admin Write Operations Rate Limiter:
 * Scoped exclusively to mutating endpoints: POST, PUT, DELETE under /api/admin/*.
 * GET routes (dashboard browsing) are completely exempt.
 * 
 * Parameters:
 * - windowMs: 60 * 1000 (1 minute)
 * - max: 30 write operations per minute per IP
 * 
 * Rationale:
 * A human administrator creating or editing plans and posts will never legitimately
 * exceed 30 writes per minute. This ceiling guards against runaway UI script loops,
 * accidental double-submissions, and unauthorized scraping/mutation flood.
 * 
 * Middleware Order:
 * Mounted AFTER requireAuth and requireRole("admin").
 * This ensures unauthenticated requests (which receive 401/403) do not consume the
 * legitimate admin's rate-limiting allowance.
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 write requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many write requests. Please slow down and try again shortly.",
        details: [
          {
            field: "rateLimit",
            issue: "Maximum of 30 write operations allowed per minute.",
          },
        ],
      },
    });
  },
});
