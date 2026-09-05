import { z } from "zod";

/**
 * Zod validation schema for BlogPost creation.
 * Strict rules aligned with Mongoose schema & business rules:
 * - title: non-empty trimmed string
 * - slug: strictly kebab-case (lowercase alphanumeric + hyphens)
 * - excerpt: non-empty trimmed summary string
 * - content: non-empty rich-text HTML string
 * - coverImage: valid URL string
 * - featured: boolean (default false)
 * - published: boolean (default false)
 * - publishedAt: date or null (optional)
 */
export const createBlogPostSchema = z.object({
  title: z.string({ required_error: "Post title is required" })
    .trim()
    .min(1, "Post title cannot be empty"),
  slug: z.string({ required_error: "Slug is required" })
    .trim()
    .min(1, "Slug cannot be empty")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens (e.g. 'my-first-post')"),
  excerpt: z.string({ required_error: "Excerpt is required" })
    .trim()
    .min(1, "Excerpt cannot be empty"),
  content: z.string({ required_error: "Content is required" })
    .trim()
    .min(1, "Content cannot be empty"),
  coverImage: z.string({ required_error: "Cover image URL is required" })
    .trim()
    .url("Cover image must be a valid URL"),
  featured: z.boolean({ invalid_type_error: "Featured must be a boolean" })
    .optional()
    .default(false),
  published: z.boolean({ invalid_type_error: "Published must be a boolean" })
    .optional()
    .default(false),
  publishedAt: z.coerce.date().nullable().optional(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
