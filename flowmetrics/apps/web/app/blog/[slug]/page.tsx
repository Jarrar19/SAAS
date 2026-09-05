import { fetchPostBySlug } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently published";

  return (
    <article className="py-12 md:py-20 bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-xs font-medium text-ink-muted hover:text-ink transition-colors"
          >
            ← Back to all articles
          </Link>
        </div>

        {/* Header */}
        <header className="space-y-3 pb-8 border-b border-border">
          <div className="flex items-center gap-3 text-xs text-ink-muted">
            {post.featured && (
              <span className="font-semibold text-accent bg-accent-subtle border border-accent/20 px-2 py-0.5 rounded">
                Featured story
              </span>
            )}
            <time dateTime={post.publishedAt || ""}>{formattedDate}</time>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight leading-[1.18]">
            {post.title}
          </h1>

          <p className="text-base text-ink-muted leading-relaxed">
            {post.excerpt}
          </p>
        </header>

        {/* Cover Image */}
        <div className="my-8 overflow-hidden rounded-lg border border-border aspect-[16/9] w-full bg-border">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Rich Text Content */}
        <div
          className="space-y-5 text-ink leading-relaxed text-sm sm:text-base
            [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-ink [&>h2]:mt-8 [&>h2]:mb-3
            [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-ink [&>h3]:mt-6 [&>h3]:mb-2
            [&>p]:text-ink-muted [&>p]:leading-relaxed
            [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul]:text-ink-muted
            [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1.5 [&>ol]:text-ink-muted
            [&>blockquote]:border-l-2 [&>blockquote]:border-accent [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-ink-muted
            [&>a]:text-accent [&>a]:underline hover:[&>a]:text-accent-hover
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer Link */}
        <div className="mt-14 pt-6 border-t border-border">
          <Link
            href="/"
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            Return to Flowmetrics Homepage
          </Link>
        </div>
      </div>
    </article>
  );
}
