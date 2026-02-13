import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { getAllBlogs, getBlogBySlug } from "@/lib/blog";
import { formatDate } from "@/lib/date";
import { mdxComponents } from "@/lib/mdx-components";
import { Container } from "@/components/molecules/container";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const blogs = getAllBlogs();
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Abhay Bhardwaj`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: ["Abhay Bhardwaj"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <Container className="mb-30">
      <article className="mt-8">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <time dateTime={post.date} className="tabular-nums font-medium">
              {formatDate(post.date)}
            </time>
            <span aria-hidden="true">·</span>
            <span>{post.readingTime}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground text-pretty mb-4">
            {post.title}
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
            {post.description}
          </p>
        </header>

        {/* Section Divider */}
        <div className="flex items-center gap-4 mb-10">
          <span className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Article
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Content */}
        <div className="prose-wrapper max-w-none">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  [
                    rehypePrettyCode,
                    {
                      theme: {
                        dark: "github-dark",
                        light: "github-light",
                      },
                      keepBackground: false,
                      defaultLang: "plaintext",
                      cssVariablePrefix: "--shiki-",
                    },
                  ],
                ],
              },
            }}
          />
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to Blog
          </Link>
        </footer>
      </article>
    </Container>
  );
}
