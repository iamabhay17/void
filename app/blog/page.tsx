import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPaginatedBlogs } from "@/lib/blog";
import { Container } from "@/components/molecules/container";
import { Badge } from "@/components/ui/badge";
import { BlogCard } from "@/components/ui/blog-card";
import * as Fade from "@/components/motion/fade";

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
    <Fade.Container>
      <Container className="mb-30">
        {/* Header */}
        <header className="mb-12 mt-4">
          <Fade.Item>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Badge variant="secondary">Blogs</Badge>
              <Badge variant="secondary">Engineering Nuggets</Badge>
            </div>
          </Fade.Item>
          <Fade.Item>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground text-pretty mb-4">
              Engineering Thoughts &amp; Insights
            </h1>
          </Fade.Item>
          <Fade.Item>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              What I’ve learned about writing better code, designing scalable
              systems, and building products that last.
              {total}+ articles and growing.
            </p>
          </Fade.Item>
        </header>

        {/* Section Header */}
        <section>
          <Fade.Item>
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                All Posts
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>
          </Fade.Item>

          {/* Blog List */}
          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                No blog posts yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {blogs.map((post) => (
                <Fade.Item key={post.slug}>
                  <BlogCard post={post} showReadingTime />
                </Fade.Item>
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
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
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
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
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
    </Fade.Container>
  );
}
