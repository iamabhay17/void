import { ArrowUpRight } from "lucide-react";
import { Link } from "next-view-transitions";
import { formatDate } from "@/lib/date";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime?: string;
}

interface BlogCardProps {
  post: BlogPost;
  showReadingTime?: boolean;
}

export function BlogCard({ post, showReadingTime = false }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-md border border-border bg-card p-4 sm:p-5 hover:border-primary/30 hover:bg-accent/30 transition-all duration-200"
    >
      <article className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium tabular-nums text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
              {formatDate(post.date)}
            </span>
            {showReadingTime && post.readingTime && (
              <span className="text-xs text-muted-foreground/70">
                {post.readingTime}
              </span>
            )}
          </div>
          <ArrowUpRight
            className="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-200"
            aria-hidden="true"
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm lg:text-base font-semibold text-foreground group-hover:text-primary transition-colors text-pretty">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {post.description}
          </p>
        </div>
      </article>
    </Link>
  );
}
