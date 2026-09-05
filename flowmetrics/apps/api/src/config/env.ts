import dotenv from "dotenv";
import path from "path";

// Load .env file
dotenv.config();

const jwtSecret = process.env.JWT_SECRET || "fallback_flowmetrics_dev_jwt_secret_key_2026";
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable must be set in production!");
}

export const config = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/flowmetrics",
  JWT_SECRET: jwtSecret,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@flowmetrics.io",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "AdminFlowmetrics2026!",
  NODE_ENV: process.env.NODE_ENV || "development",
};
