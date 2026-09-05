"use client";

import React, { useEffect, useState } from "react";
import {
  BlogPost,
  BlogPostInput,
  createAdminPost,
  updateAdminPost,
  ApiError,
} from "../../lib/api";
import { getStoredToken } from "../../lib/auth";
import { TipTapEditor } from "./TipTapEditor";

interface PostFormProps {
  initialData?: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (post: BlogPost) => void;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function PostForm({
  initialData,
  isOpen,
  onClose,
  onSaved,
}: PostFormProps) {
  const isEdit = Boolean(initialData);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);
  const [content, setContent] = useState("<p></p>");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Sync state when opened or initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setSlug(initialData.slug);
      setIsSlugManuallyEdited(true);
      setExcerpt(initialData.excerpt);
      setCoverImage(initialData.coverImage);
      setFeatured(initialData.featured ?? false);
      setPublished(initialData.published ?? false);
      setContent(initialData.content || "<p></p>");
    } else {
      // Defaults for Create mode
      setTitle("");
      setSlug("");
      setIsSlugManuallyEdited(false);
      setExcerpt("");
      setCoverImage("https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80");
      setFeatured(false);
      setPublished(false);
      setContent("<p>Write the post article body here with rich text headings, bullet points, and code snippets.</p>");
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManuallyEdited && !isEdit) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    // Allow typing hyphens, lowercase letters, and digits without aggressively stripping trailing hyphens
    const normalized = val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setSlug(normalized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = getStoredToken();
    if (!token) {
      setError({
        code: "UNAUTHORIZED",
        message: "Your session has expired. Please sign in again.",
      });
      return;
    }

    // Client-side quick check
    if (!title.trim() || !slug.trim() || !excerpt.trim() || !content.trim()) {
      setError({
        code: "VALIDATION_ERROR",
        message: "Please fill in all required fields (title, slug, excerpt, content).",
      });
      return;
    }

    const payload: BlogPostInput = {
      title: title.trim(),
      slug: slug.trim().replace(/^-+|-+$/g, ""),
      excerpt: excerpt.trim(),
      coverImage: coverImage.trim() || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      featured,
      published,
      content,
    };

    setIsLoading(true);

    try {
      let res;
      if (isEdit && initialData?._id) {
        res = await updateAdminPost(initialData._id, payload, token);
      } else {
        res = await createAdminPost(payload, token);
      }

      if (res.success && res.data) {
        onSaved(res.data);
        onClose();
      } else {
        setError(
          res.error || {
            code: "SAVE_ERROR",
            message: "Failed to save post. Please review inputs.",
          }
        );
      }
    } catch (err: any) {
      setError({
        code: "UNEXPECTED_ERROR",
        message: err.message || "An unexpected error occurred while saving.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 sm:p-6 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl rounded-xl bg-surface border border-border shadow-xl my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-background/50">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {isEdit ? `Edit Post: ${initialData?.title}` : "Create New Blog Post"}
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Draft or publish insights with the TipTap rich-text editor and auto-slugging.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded p-1 text-ink-muted hover:text-ink hover:bg-background transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Error Banner */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="font-medium flex items-center gap-1.5">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error.message}</span>
              </div>
              {error.details && error.details.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-xs space-y-1">
                  {error.details.map((d, i) => (
                    <li key={i}>
                      {d.field ? <strong className="capitalize">{d.field}:</strong> : null} {d.issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Row 1: Title */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Post Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. 5 Signs Your Team Is Overloaded (and How to Spot Them Early)"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Row 2: Slug */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                Slug (URL Identifier) <span className="text-red-500">*</span>
              </label>
              {!isSlugManuallyEdited && (
                <span className="text-[11px] text-accent font-medium">Auto-generated from title</span>
              )}
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs text-ink-muted font-mono">/blog/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="5-signs-team-overloaded"
                className="w-full rounded-md border border-border bg-background pl-16 pr-3 py-2 text-sm font-mono text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <span className="text-[11px] text-ink-muted mt-1 block">
              Unique, URL-safe kebab-case string used for public routing: /blog/{slug || "your-slug"}
            </span>
          </div>

          {/* Row 3: Excerpt */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Excerpt / Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A concise 1-2 sentence preview for landing page cards and search engines."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed"
            />
          </div>

          {/* Row 4: Cover Image */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Cover Image URL <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                required
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {coverImage && (
                <div className="h-9 w-14 rounded overflow-hidden border border-border bg-background shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Row 5: Flags / Toggles */}
          <div className="p-4 rounded-lg border border-border bg-background/50 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent"
              />
              <div>
                <div className="text-sm font-medium text-ink">Featured Post</div>
                <div className="text-xs text-ink-muted">
                  Displays with a &quot;Featured&quot; badge and ranks higher in the landing page blog listing.
                </div>
              </div>
            </label>

            <div className="h-px bg-border" />

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent"
              />
              <div>
                <div className="text-sm font-medium text-ink">Published (Live on site)</div>
                <div className="text-xs text-ink-muted">
                  Sets <code className="font-mono">publishedAt</code> on initial publish. When unchecked, drafts are strictly hidden from public visitors.
                </div>
              </div>
            </label>
          </div>

          {/* Row 6: TipTap Rich Text Editor */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Article Content (Rich Text) <span className="text-red-500">*</span>
            </label>
            <TipTapEditor
              content={content}
              onChange={setContent}
              disabled={isLoading}
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink hover:bg-background transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? "Update Post" : "Create Post"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
