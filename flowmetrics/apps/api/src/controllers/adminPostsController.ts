import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { BlogPost } from "../models/BlogPost.js";
import { CreateBlogPostInput, UpdateBlogPostInput } from "../schemas/blogPost.schema.js";
import { sanitizeContent } from "../utils/sanitize.js";

/**
 * GET /api/admin/posts
 * Returns all posts (both published and drafts), sorted by newest creation first.
 */
export async function getAdminPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/posts
 * Creates a new blog post.
 * Checks:
 * 1. Duplicate slug check -> 409 Conflict
 * 2. HTML content sanitization -> strips <script>, onerror, etc.
 * 3. publishedAt transition logic -> sets timestamp if published is true, otherwise null.
 */
export async function createAdminPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const postData = req.body as CreateBlogPostInput;
    const normalizedSlug = postData.slug.toLowerCase().trim();

    // 1. Check duplicate slug
    const existingSlug = await BlogPost.findOne({ slug: normalizedSlug });
    if (existingSlug) {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: `A blog post with slug '${normalizedSlug}' already exists.`,
          details: [{ field: "slug", issue: "Slug must be unique across all blog posts" }],
        },
      });
      return;
    }

    // 2. Sanitize rich text HTML content
    const cleanContent = sanitizeContent(postData.content);

    // 3. publishedAt logic
    let publishedAt: Date | null = null;
    if (postData.published) {
      publishedAt = new Date();
    }

    const newPost = await BlogPost.create({
      ...postData,
      slug: normalizedSlug,
      content: cleanContent,
      publishedAt,
    });

    res.status(201).json({
      success: true,
      data: newPost,
    });
  } catch (error: any) {
    // Handle MongoDB duplicate key error code 11000 defensively
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Duplicate key violation: a blog post with this slug already exists.",
        },
      });
      return;
    }
    next(error);
  }
}

/**
 * PUT /api/admin/posts/:id
 * Updates an existing blog post.
 * Rules:
 * 1. Checks slug uniqueness if slug changed -> 409 Conflict
 * 2. Content sanitization if content updated
 * 3. publishedAt ONLY updates on the false -> true transition!
 *    If already published: true, original publishedAt is strictly preserved.
 */
export async function updateAdminPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ID",
          message: `Invalid post ID '${id}'.`,
        },
      });
      return;
    }

    const existingPost = await BlogPost.findById(id);
    if (!existingPost) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `Blog post with ID '${id}' not found.`,
        },
      });
      return;
    }

    const updateData = { ...(req.body as UpdateBlogPostInput) };

    // 1. Slug check if updating slug
    if (updateData.slug) {
      const normalizedSlug = updateData.slug.toLowerCase().trim();
      if (normalizedSlug !== existingPost.slug) {
        const slugCollision = await BlogPost.findOne({
          slug: normalizedSlug,
          _id: { $ne: existingPost._id },
        });
        if (slugCollision) {
          res.status(409).json({
            success: false,
            error: {
              code: "CONFLICT",
              message: `A blog post with slug '${normalizedSlug}' already exists.`,
              details: [{ field: "slug", issue: "Slug must be unique across all blog posts" }],
            },
          });
          return;
        }
        updateData.slug = normalizedSlug;
      }
    }

    // 2. Sanitize content if provided
    if (updateData.content !== undefined) {
      updateData.content = sanitizeContent(updateData.content);
    }

    // 3. publishedAt transition logic
    if (updateData.published !== undefined) {
      if (!existingPost.published && updateData.published === true) {
        // Transition false -> true: set timestamp to now
        updateData.publishedAt = new Date();
      } else if (existingPost.published && updateData.published === true) {
        // Already published -> PRESERVE original publishedAt date!
        updateData.publishedAt = existingPost.publishedAt;
      } else if (updateData.published === false) {
        // Transition to draft -> unpublish
        updateData.publishedAt = null;
      }
    }

    const updatedPost = await BlogPost.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    res.status(200).json({
      success: true,
      data: updatedPost,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Duplicate key violation: a blog post with this slug already exists.",
        },
      });
      return;
    }
    next(error);
  }
}

/**
 * DELETE /api/admin/posts/:id
 * Deletes a blog post by ID.
 */
export async function deleteAdminPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ID",
          message: `Invalid post ID '${id}'.`,
        },
      });
      return;
    }

    const deletedPost = await BlogPost.findByIdAndDelete(id).lean();

    if (!deletedPost) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `Blog post with ID '${id}' not found.`,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        message: `Blog post '${deletedPost.title}' successfully deleted.`,
        id: deletedPost._id,
      },
    });
  } catch (error) {
    next(error);
  }
}
