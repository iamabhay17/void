import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface BlogPost {
  title: string;
  description: string;
  date: string;
  url: string;
}

const blogPosts: BlogPost[] = [
  {
    title: "Building Accessible React Components",
    description:
      "A deep dive into creating inclusive user interfaces that work for everyone.",
    date: "Jan 2026",
    url: "#",
  },
  {
    title: "The Art of Code Review",
    description:
      "Lessons learned from reviewing thousands of pull requests over the years.",
    date: "Dec 2025",
    url: "#",
  },
  {
    title: "Performance Patterns in Modern Web Apps",
    description:
      "Practical techniques for building fast, responsive applications.",
    date: "Nov 2025",
    url: "#",
  },
];

export function BlogsSection() {
  return (
    <section className="mt-20">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Recent Writing
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="space-y-2">
        {blogPosts.map((post, index) => (
          <Link
            key={index}
            href={post.url}
            className="group block -mx-4 px-4 py-5 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <article className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-1 md:gap-12">
              <span className="text-xs lg:text-sm tabular-nums text-muted-foreground">
                {post.date}
              </span>
              <div className="space-y-1.5">
                <h3 className="text-sm lg:text-base font-medium text-foreground inline-flex items-center gap-1.5 group-hover:text-primary transition-colors">
                  <span className="text-balance">{post.title}</span>
                  <ArrowUpRight className="size-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
                  {post.description}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          View all posts
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}
