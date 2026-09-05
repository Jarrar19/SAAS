"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearStoredToken, getStoredUser } from "../../lib/auth";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleSignOut = () => {
    clearStoredToken();
    router.replace("/admin/login");
  };

  const navLinks = [
    { href: "/admin/plans", label: "Pricing Plans" },
    { href: "/admin/posts", label: "Blog Posts" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand & Section links */}
          <div className="flex items-center gap-8">
            <Link href="/admin/plans" className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="font-semibold tracking-tight text-ink text-base">
                Flowmetrics
              </span>
              <span className="rounded bg-accent-subtle px-1.5 py-0.5 text-[10px] font-semibold text-accent uppercase tracking-wider">
                CMS
              </span>
            </Link>

            <nav className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-background text-ink font-semibold"
                        : "text-ink-muted hover:text-ink hover:bg-background/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-ink-muted hover:text-ink transition-colors flex items-center gap-1"
            >
              <span>Public site</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Link>

            <div className="h-4 w-px bg-border hidden sm:block" />

            {user && (
              <span className="text-xs text-ink-muted hidden md:inline-block font-mono">
                {user.email}
              </span>
            )}

            <button
              onClick={handleSignOut}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink hover:border-border-strong transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
