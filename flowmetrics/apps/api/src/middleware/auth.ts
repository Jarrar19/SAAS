import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token.js";

/**
 * Authentication Middleware:
 * 1. Checks for Authorization header with 'Bearer <token>' pattern.
 * 2. Validates token signature and expiration against process.env.JWT_SECRET.
 * 3. Populates req.user with { sub: string, role: string }.
 * Rejects with 401 UNAUTHORIZED if missing, malformed, or expired.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication token is missing or malformed.",
      },
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: error.name === "TokenExpiredError" ? "Token has expired." : "Invalid authentication token.",
      },
    });
  }
}

/**
 * Authorization Middleware Factory:
 * Runs strictly AFTER requireAuth to enforce role-based access control (RBAC).
 *
 * Execution order & checks:
 * 1. Defensive verification that req.user exists (fails closed if requireAuth was bypassed).
 * 2. Compares req.user.role with requiredRole.
 * 3. Returns 403 FORBIDDEN if token is valid but role does not match.
 */
export function requireRole(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Fail-safe check: If requireAuth did not run or req.user is undefined, deny immediately
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required before checking role permissions.",
        },
      });
      return;
    }

    if (req.user.role !== requiredRole) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Access denied. Requires '${requiredRole}' role.`,
        },
      });
      return;
    }

    next();
  };
}
