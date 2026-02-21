import { ArrowUpRight } from "lucide-react";
import { Link as NextViewTransition } from "next-view-transitions";
import { getTopBlogs } from "@/lib/blog";
import * as Fade from "@/components/motion/fade";
import { BlogCard } from "@/components/ui/blog-card";

export function BlogsSection() {
  const blogPosts = getTopBlogs(3);

  if (blogPosts.length === 0) {
    return null;
  }

  return (
    <section className="mt-20">
      <Fade.Item>
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Recent Writing
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>
      </Fade.Item>

      <div className="space-y-4">
        {blogPosts.map((post) => (
          <Fade.Item key={post.slug}>
            <BlogCard post={post} />
          </Fade.Item>
        ))}
      </div>
      <Fade.Item>
        <div className="mt-4 pt-4">
          <NextViewTransition
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all posts
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </NextViewTransition>
        </div>
      </Fade.Item>
    </section>
  );
}
