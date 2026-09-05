import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 text-ink font-semibold tracking-tight text-base hover:opacity-90">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span>Flowmetrics</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm text-ink-muted">
          <a href="#features" className="hover:text-ink transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-ink transition-colors">
            Pricing
          </a>
          <a href="#testimonials" className="hover:text-ink transition-colors">
            Testimonials
          </a>
          <a href="#blog" className="hover:text-ink transition-colors">
            Blog
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink hover:border-border-strong transition-colors"
          >
            Admin
          </Link>
          <a
            href="#pricing"
            className="rounded-md bg-accent px-3.5 py-1.5 text-xs font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Start free trial
          </a>
        </div>
      </div>
    </header>
  );
}
