"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminLogin } from "../../../lib/api";
import { getStoredToken, isTokenValid, setStoredToken } from "../../../lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to /admin/plans
  useEffect(() => {
    const token = getStoredToken();
    if (isTokenValid(token)) {
      router.replace("/admin/plans");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await adminLogin(email.trim(), password);

      if (res.success && res.data?.token) {
        setStoredToken(res.data.token, res.data.user?.email || email.trim());
        router.replace("/admin/plans");
      } else {
        setErrorMessage(
          res.error?.message || "Invalid credentials or authentication failed."
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to connect to API server.");
    } finally {
      setIsLoading(false);
    }
  };

  const isDev = process.env.NODE_ENV !== "production";

  const fillDemoCredentials = () => {
    if (!isDev) return;
    setEmail("admin@flowmetrics.io");
    setPassword("AdminFlowmetrics2026!");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
          <span className="h-3 w-3 rounded-full bg-accent" />
          <span className="text-xl font-bold tracking-tight text-ink">
            Flowmetrics
          </span>
          <span className="rounded bg-accent-subtle px-2 py-0.5 text-xs font-semibold text-accent uppercase tracking-wider">
            CMS
          </span>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Sign in to Admin CMS
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Manage pricing tiers, features, and rich-text blog publications.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@flowmetrics.io"
                autoComplete="email"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-accent py-2.5 px-4 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
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
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in to Dashboard</span>
              )}
            </button>
          </form>

          {/* Dev-only Seeded Credentials Helper */}
          {isDev && (
            <div className="mt-6 pt-5 border-t border-border">
              <div className="rounded-lg bg-background p-3.5 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">Demo Admin Account (Dev Only)</span>
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="text-xs font-semibold text-accent hover:text-accent-hover underline"
                  >
                    Fill credentials
                  </button>
                </div>
                <div className="mt-2 text-xs text-ink-muted font-mono space-y-0.5">
                  <div>Email: admin@flowmetrics.io</div>
                  <div>Pass: AdminFlowmetrics2026!</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-medium text-ink-muted hover:text-ink transition-colors"
          >
            ← Back to marketing site
          </Link>
        </div>
      </div>
    </div>
  );
}
