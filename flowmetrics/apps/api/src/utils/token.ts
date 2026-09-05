import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { JwtPayload } from "../types/express.js";

/**
 * Signs a short-lived JSON Web Token (2-hour expiry).
 * Payload is strictly minimal: { sub: userId, role: userRole }
 * Sensitive data (e.g. passwordHash, email) is NEVER embedded into the token.
 */
export function signToken(userId: string, role: string): string {
  const payload: JwtPayload = {
    sub: userId,
    role,
  };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: "2h",
  });
}

/**
 * Verifies a JWT against the server secret from environment configuration.
 * Throws an error if invalid, expired, or tampered with.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
}
