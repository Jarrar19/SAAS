import Link from "next/link";
import { BlogPost } from "@/lib/api";

interface BlogSectionProps {
  posts: BlogPost[];
}

export function BlogSection({ posts }: BlogSectionProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="py-20 md:py-28 border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Latest from our blog
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            Practical writing on async engineering cadence, workload heatmaps, and capacity planning.
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => {
            const isFeatured = post.featured;
            const formattedDate = post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently published";

            return (
              <article
                key={post._id}
                className={`rounded-lg bg-surface flex flex-col justify-between overflow-hidden ${
                  isFeatured
                    ? "border-2 border-accent"
                    : "border border-border"
                }`}
              >
                <div>
                  {/* Cover Image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-border">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                    {/* Restrained plain-text badge for featured post */}
                    {isFeatured && (
                      <div className="absolute top-3 left-3">
                        <span className="rounded bg-surface px-2.5 py-1 text-[11px] font-semibold text-accent border border-border">
                          Featured story
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="p-5">
                    <time dateTime={post.publishedAt || ""} className="text-xs text-ink-muted">
                      {formattedDate}
                    </time>
                    <h3 className="mt-2 text-base font-semibold text-ink leading-snug">
                      <Link href={`/blog/${post.slug}`} className="hover:text-accent transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-xs text-ink-muted line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                {/* Plain Text Link without Arrow */}
                <div className="px-5 pb-5 pt-1">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                  >
                    Read article
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
