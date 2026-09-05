"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken, isTokenValid } from "../../lib/auth";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    if (isTokenValid(token)) {
      router.replace("/admin/plans");
    } else {
      router.replace("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-xs text-ink-muted">Redirecting to CMS dashboard...</div>
    </div>
  );
}
