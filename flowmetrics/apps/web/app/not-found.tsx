import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4 bg-background">
      <div className="rounded-lg border border-border bg-surface p-8 max-w-sm w-full space-y-3 shadow-sm">
        <div className="text-xs font-semibold text-accent">404 — Page Not Found</div>
        <h1 className="text-xl font-bold text-ink tracking-tight">
          Content Unavailable
        </h1>
        <p className="text-xs text-ink-muted">
          The requested page or article was not found or is currently in draft status.
        </p>
        <div className="pt-3">
          <Link
            href="/"
            className="inline-flex rounded-md bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Return to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
