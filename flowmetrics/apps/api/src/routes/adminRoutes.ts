import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { writeLimiter } from "../middleware/rateLimiters.js";
import {
  createPricingPlanSchema,
  updatePricingPlanSchema,
} from "../schemas/pricingPlan.schema.js";
import {
  createBlogPostSchema,
  updateBlogPostSchema,
} from "../schemas/blogPost.schema.js";
import {
  getAdminPlans,
  getAdminPlanById,
  createAdminPlan,
  updateAdminPlan,
  deleteAdminPlan,
} from "../controllers/adminPlansController.js";
import {
  getAdminPosts,
  createAdminPost,
  updateAdminPost,
  deleteAdminPost,
} from "../controllers/adminPostsController.js";

const router = Router();

// Protect all admin routes with authentication + admin role check
router.use(requireAuth);
router.use(requireRole("admin"));

// Pricing Plans CRUD
// GET routes are NOT rate-limited (dashboard browsing is unaffected)
router.get("/plans", getAdminPlans);
router.get("/plans/:id", getAdminPlanById);
router.post("/plans", writeLimiter, validateBody(createPricingPlanSchema), createAdminPlan);
router.put("/plans/:id", writeLimiter, validateBody(updatePricingPlanSchema), updateAdminPlan);
router.delete("/plans/:id", writeLimiter, deleteAdminPlan);

// Blog Posts CRUD
// GET routes are NOT rate-limited (dashboard browsing is unaffected)
router.get("/posts", getAdminPosts);
router.post("/posts", writeLimiter, validateBody(createBlogPostSchema), createAdminPost);
router.put("/posts/:id", writeLimiter, validateBody(updateBlogPostSchema), updateAdminPost);
router.delete("/posts/:id", writeLimiter, deleteAdminPost);

export default router;
