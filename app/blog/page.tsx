import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { getPaginatedBlogs } from "@/lib/blog";
import { formatDate } from "@/lib/date";
import { Container } from "@/components/molecules/container";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Blog | Abhay Bhardwaj",
  description:
    "Thoughts on software engineering, web development, and building great products.",
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { blogs, totalPages, hasNextPage, hasPrevPage, total } =
    getPaginatedBlogs(page, 10);

  return (
    <Container className="mb-30">
      {/* Header */}
      <header className="mb-12 mt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Badge variant="secondary">Blogs</Badge>
          <Badge variant="secondary">Engineering Nuggets</Badge>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground text-pretty mb-4">
          Engineering Thoughts &amp; Insights
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          What I’ve learned about writing better code, designing scalable
          systems, and building products that last.
          {total}+ articles and growing.
        </p>
      </header>

      {/* Section Header */}
      <section>
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            All Posts
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Blog List */}
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              No blog posts yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {blogs.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block -mx-4 px-4 py-5 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <article className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-1 md:gap-12">
                  <span className="text-xs font-medium md:text-sm tabular-nums text-muted-foreground">
                    {formatDate(post.date)}
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-sm lg:text-base font-semibold text-foreground inline-flex items-center gap-1.5 group-hover:text-primary transition-colors">
                      <span className="text-pretty">{post.title}</span>
                      <ArrowUpRight
                        className="size-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-hidden="true"
                      />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {post.description}
                    </p>
                    <span className="text-xs text-muted-foreground/70">
                      {post.readingTime}
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="mt-10 flex items-center justify-between border-t border-border pt-6"
            aria-label="Blog pagination"
          >
            <div>
              {hasPrevPage ? (
                <Link
                  href={`/blog?page=${page - 1}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                  Previous
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/50 cursor-not-allowed">
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                  Previous
                </span>
              )}
            </div>

            <span className="text-xs text-muted-foreground tabular-nums">
              Page {page} of {totalPages}
            </span>

            <div>
              {hasNextPage ? (
                <Link
                  href={`/blog?page=${page + 1}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Next
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/50 cursor-not-allowed">
                  Next
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              )}
            </div>
          </nav>
        )}
      </section>
    </Container>
  );
}
