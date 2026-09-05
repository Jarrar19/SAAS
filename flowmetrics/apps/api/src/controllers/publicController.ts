import { Request, Response, NextFunction } from "express";
import { PricingPlan } from "../models/PricingPlan.js";
import { BlogPost } from "../models/BlogPost.js";
import { Testimonial } from "../models/Testimonial.js";

/**
 * GET /api/plans
 * Returns only published pricing plans sorted by display order ascending.
 * Database-level filter: { published: true }
 */
export async function getPublicPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plans = await PricingPlan.find({ published: true })
      .sort({ order: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/posts
 * Returns published blog posts sorted by featured first (desc), then publishedAt (desc).
 * Supports optional ?limit= query parameter (positive integer).
 * Database-level filter: { published: true }
 */
export async function getPublicPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limitQuery = req.query.limit;
    let limitNum: number | undefined;

    if (limitQuery !== undefined) {
      const parsed = parseInt(String(limitQuery), 10);
      // Validate positive integer and clamp between 1 and 50
      // Non-numeric (NaN), negative, or zero inputs degrade gracefully to default query
      if (!isNaN(parsed) && parsed > 0) {
        const MAX_POSTS_LIMIT = 50;
        limitNum = Math.min(parsed, MAX_POSTS_LIMIT);
      }
    }

    let query = BlogPost.find({ published: true })
      .sort({ featured: -1, publishedAt: -1 })
      .lean();

    if (limitNum) {
      query = query.limit(limitNum);
    }

    const posts = await query.exec();

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/posts/:slug
 * Returns a single published post by slug.
 * Crucially: if a post exists with the slug but published is false, returns 404.
 * Database-level filter: { slug, published: true }
 */
export async function getPublicPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;

    // Database query strictly enforces published: true
    const post = await BlogPost.findOne({ slug: slug.toLowerCase().trim(), published: true }).lean();

    if (!post) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `Post with slug '${slug}' was not found or is not published.`,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/testimonials
 * Returns only published testimonials sorted by order ascending.
 * Database-level filter: { published: true }
 */
export async function getPublicTestimonials(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const testimonials = await Testimonial.find({ published: true })
      .sort({ order: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    next(error);
  }
}
