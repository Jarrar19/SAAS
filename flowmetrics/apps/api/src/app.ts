import express, { Application, Request, Response, NextFunction } from "express";
import { corsMiddleware } from "./config/cors.js";
import publicRoutes from "./routes/publicRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { requireAuth, requireRole } from "./middleware/auth.js";
import { globalErrorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp(): Application {
  const app = express();

  // Trust proxy for accurate client IP resolution behind reverse proxies (Render, Vercel)
  app.set("trust proxy", 1);

  // CORS middleware strictly scoped to configured frontend origin
  app.use(corsMiddleware);

  // Body parser with 10mb limit for rich text content
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Root index endpoint
  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      service: "Flowmetrics REST API",
      status: "running",
      endpoints: {
        health: "/health",
        public: "/api/plans, /api/posts, /api/testimonials",
        auth: "/api/auth/login",
        admin: "/api/admin/plans, /api/admin/posts",
      },
    });
  });

  // Basic health check (unauthenticated, unthrottled for Render health checks)
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  // Strix domain verification challenge endpoint
  app.get("/.well-known/strix-verify.txt", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send("strix-verify-0939e77d4b541d979f2aff9a45d42799");
  });

  // Public read-only routes mounted under /api
  app.use("/api", publicRoutes);

  // Auth routes mounted under /api/auth
  app.use("/api/auth", authRoutes);

  // Admin routes mounted under /api/admin
  app.use("/api/admin", adminRoutes);

  // Admin route verification test route
  app.get("/api/admin/verify", requireAuth, requireRole("admin"), (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        message: "Admin authentication and role verification successful.",
        user: req.user,
      },
    });
  });

  // Test route to verify 500 error handling — strictly excluded in production
  if (process.env.NODE_ENV !== "production") {
    app.get("/api/test-error", (req: Request, res: Response, next: NextFunction) => {
      next(new Error("Simulated unhandled internal server exception"));
    });
  }

  // 404 Route Not Found handler
  app.use(notFoundHandler);

  // Global Error Handler (must be 4-argument middleware mounted last)
  app.use(globalErrorHandler);

  return app;
}
