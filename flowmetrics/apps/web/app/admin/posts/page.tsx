"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AuthGuard } from "../../../components/admin/AuthGuard";
import { AdminNav } from "../../../components/admin/AdminNav";
import { PostForm } from "../../../components/admin/PostForm";
import {
  BlogPost,
  fetchAdminPosts,
  deleteAdminPost,
  updateAdminPost,
} from "../../../lib/api";
import { getStoredToken } from "../../../lib/auth";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Delete confirmation modal state
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load posts from API
  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const token = getStoredToken();
    if (!token) {
      setErrorMessage("Authentication token missing. Please sign in.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetchAdminPosts(token);
      if (res.success && res.data) {
        setPosts(res.data);
      } else {
        setErrorMessage(res.error?.message || "Failed to load blog posts.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to connect to backend server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setSelectedPost(null);
    setIsFormOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setIsFormOpen(true);
  };

  // Quick toggle published status
  const handleTogglePublish = async (post: BlogPost) => {
    const token = getStoredToken();
    if (!token) return;

    try {
      const res = await updateAdminPost(
        post._id,
        { published: !post.published },
        token
      );
      if (res.success && res.data) {
        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? res.data! : p))
        );
      } else {
        alert(res.error?.message || "Failed to toggle status.");
      }
    } catch (err: any) {
      alert(err.message || "Network error while updating post.");
    }
  };

  // Confirm and delete
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    const token = getStoredToken();
    if (!token) return;

    setIsDeleting(true);
    try {
      const res = await deleteAdminPost(postToDelete._id, token);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p._id !== postToDelete._id));
        setPostToDelete(null);
      } else {
        alert(res.error?.message || "Failed to delete blog post.");
      }
    } catch (err: any) {
      alert(err.message || "Network error while deleting post.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Callback when post is saved in modal
  const handlePostSaved = (savedPost: BlogPost) => {
    loadPosts();
  };

  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;
  const featuredCount = posts.filter((p) => p.featured).length;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AdminNav />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-border">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                  Blog Posts
                </h1>
                <span className="rounded-full bg-border px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
                  {posts.length} total
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                Draft, edit, and publish engineering insights with TipTap rich-text formatting.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadPosts}
                disabled={isLoading}
                title="Refresh list"
                className="rounded-md border border-border p-2 text-ink-muted hover:text-ink hover:bg-surface transition-colors"
              >
                <svg
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>

              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors shadow-xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Post</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Published Posts
              </div>
              <div className="text-2xl font-bold text-ink mt-1 flex items-center gap-2">
                <span>{publishedCount}</span>
                <span className="h-2 w-2 rounded-full bg-accent" />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Drafts (Private)
              </div>
              <div className="text-2xl font-bold text-ink-muted mt-1 flex items-center gap-2">
                <span>{draftCount}</span>
                <span className="h-2 w-2 rounded-full bg-amber-500" />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4 col-span-2 sm:col-span-1">
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Featured Highlights
              </div>
              <div className="text-2xl font-bold text-ink mt-1 flex items-center gap-2">
                <span>{featuredCount}</span>
                <span className="h-2 w-2 rounded-full bg-accent-hover" />
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Posts Table / Cards */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg border border-border bg-surface animate-pulse"
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
              <h3 className="text-base font-semibold text-ink">No blog posts found</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Create and publish your first article to share updates on the landing page.
              </p>
              <button
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
              >
                Create Post
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-background/60 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    <tr>
                      <th className="px-6 py-3.5">Article</th>
                      <th className="px-6 py-3.5">Slug</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Published Date</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {posts.map((post) => (
                      <tr key={post._id} className="hover:bg-background/40 transition-colors">
                        {/* Article Title & Thumbnail */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {post.coverImage ? (
                              <div className="h-10 w-14 rounded overflow-hidden border border-border bg-background shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={post.coverImage}
                                  alt={post.title}
                                  className="h-full w-full object-cover"
                                  onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                                />
                              </div>
                            ) : null}
                            <div className="min-w-0 max-w-sm">
                              <div className="font-semibold text-ink truncate flex items-center gap-2">
                                <span>{post.title}</span>
                                {post.featured && (
                                  <span className="rounded bg-accent-subtle px-1.5 py-0.5 text-[10px] font-semibold text-accent uppercase tracking-wider border border-accent/20">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-ink-muted truncate mt-0.5">
                                {post.excerpt}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs text-ink-muted">
                            {post.published ? (
                              <Link
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline flex items-center gap-1"
                              >
                                <span>/{post.slug}</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </Link>
                            ) : (
                              <span>/{post.slug}</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(post)}
                            title="Click to toggle status"
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                          >
                            {post.published ? (
                              <span className="inline-flex items-center gap-1.5 text-accent bg-accent-subtle px-2 py-0.5 rounded-full border border-accent/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                Draft
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Published Date */}
                        <td className="px-6 py-4 text-xs text-ink-muted font-mono">
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(post)}
                              className="rounded border border-border px-2.5 py-1 text-xs font-medium text-ink hover:bg-background transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setPostToDelete(post)}
                              className="rounded border border-border px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* Create / Edit Post Modal */}
        <PostForm
          isOpen={isFormOpen}
          initialData={selectedPost}
          onClose={() => setIsFormOpen(false)}
          onSaved={handlePostSaved}
        />

        {/* Delete Confirmation Modal */}
        {postToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl bg-surface border border-border p-6 shadow-xl">
              <h3 className="text-base font-semibold text-ink">Delete Blog Post</h3>
              <p className="mt-2 text-sm text-ink-muted">
                Are you sure you want to delete <strong className="text-ink">{postToDelete.title}</strong>?
                This action cannot be undone.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPostToDelete(null)}
                  disabled={isDeleting}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  {isDeleting ? "Deleting..." : "Delete Post"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
