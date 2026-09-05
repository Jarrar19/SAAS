import cors, { CorsOptions } from "cors";
import { config } from "./env.js";

/**
 * CORS configuration explicitly restricted to the designated frontend origin.
 * Wildcard ('*') is intentionally prohibited to prevent unauthorized cross-origin requests
 * and ensure production-grade security from day one.
 */
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    // Check against configured frontend origin(s)
    const allowedOrigins = config.CORS_ORIGIN.split(",").map((o) => o.trim());
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy rejection: Origin '${origin}' is not allowed.`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
