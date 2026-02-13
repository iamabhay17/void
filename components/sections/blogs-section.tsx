import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getTopBlogs } from "@/lib/blog";
import { formatDate } from "@/lib/date";

export function BlogsSection() {
  const blogPosts = getTopBlogs(3);

  if (blogPosts.length === 0) {
    return null;
  }

  return (
    <section className="mt-20">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Recent Writing
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="space-y-2">
        {blogPosts.map((post) => (
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
                <p className="text-sm mt-1 text-muted-foreground leading-relaxed line-clamp-2">
                  {post.description}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          View all posts
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
