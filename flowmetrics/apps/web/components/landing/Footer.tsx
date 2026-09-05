import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface text-ink-muted">
      {/* Final Conversion CTA */}
      <div className="border-b border-border py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Ready to give your team clarity without burnout?
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              Start with a fourteen-day free trial. Setup takes under five minutes with GitHub or Linear.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#pricing"
                className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
              >
                Start free trial
              </a>
              <Link
                href="/admin/login"
                className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
              >
                Admin portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation & Copyright */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 text-xs">
          <div className="space-y-3">
            <div className="font-semibold text-ink">Product</div>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-ink transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-ink transition-colors">Pricing</a></li>
              <li><a href="#testimonials" className="hover:text-ink transition-colors">Testimonials</a></li>
              <li><a href="#blog" className="hover:text-ink transition-colors">Blog</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-semibold text-ink">Integrations</div>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-ink transition-colors">GitHub</a></li>
              <li><a href="#features" className="hover:text-ink transition-colors">GitLab</a></li>
              <li><a href="#features" className="hover:text-ink transition-colors">Linear</a></li>
              <li><a href="#features" className="hover:text-ink transition-colors">Jira</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-semibold text-ink">Admin</div>
            <ul className="space-y-2">
              <li><Link href="/admin/login" className="hover:text-ink transition-colors">Admin login</Link></li>
              <li><Link href="/admin/plans" className="hover:text-ink transition-colors">Manage plans</Link></li>
              <li><Link href="/admin/posts" className="hover:text-ink transition-colors">Manage posts</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-semibold text-ink">About</div>
            <p className="text-ink-muted leading-relaxed">
              Flowmetrics is team productivity and workload analytics software for distributed engineering organizations.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-3">
          <div>© {new Date().getFullYear()} Flowmetrics. All rights reserved.</div>
          <div>Built with Next.js, Express, and MongoDB.</div>
        </div>
      </div>
    </footer>
  );
}
