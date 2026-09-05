import { Router } from "express";
import {
  getPublicPlans,
  getPublicPosts,
  getPublicPostBySlug,
  getPublicTestimonials,
} from "../controllers/publicController.js";

const router = Router();

// Public routes: all filter published: true at database query level
router.get("/plans", getPublicPlans);
router.get("/posts", getPublicPosts);
router.get("/posts/:slug", getPublicPostBySlug);
router.get("/testimonials", getPublicTestimonials);

export default router;
