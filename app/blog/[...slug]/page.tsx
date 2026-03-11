import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getAllBlogs, getBlogBySlug } from "@/lib/blog";
import { formatDate } from "@/lib/date";
import { mdxComponents } from "@/lib/mdx-components";
import { Container } from "@/components/molecules/container";
import * as Fade from "@/components/motion/fade";
import {
  TableOfContents,
  MobileTableOfContents,
} from "@/components/molecules/toc";

interface BlogPostPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const blogs = getAllBlogs();
  return blogs.map((blog) => ({
    // Split the slug into segments for catch-all route
    slug: blog.slug.split("/"),
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  // Join slug segments back into a path
  const slugPath = slug.join("/");
  const post = getBlogBySlug(slugPath);

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
  // Join slug segments back into a path
  const slugPath = slug.join("/");
  const post = getBlogBySlug(slugPath);

  if (!post) {
    notFound();
  }

  return (
    <Fade.Container>
      <Container className="pb-32">
        <article className="mt-4">
          {/* Back Button */}
          <Fade.Item>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group"
            >
              <ArrowLeft
                className="size-3.5 group-hover:-translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
              Back to Blog
            </Link>
          </Fade.Item>

          {/* Header */}
          <header className="relative mb-12 pb-10 border-b border-border/50 b">
            <Fade.Item>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs tabular-nums font-medium text-primary/80 bg-primary/10 px-2.5 py-1 rounded-md">
                  {formatDate(post.date)}
                </span>
                <span className="text-xs text-muted-foreground/80 bg-muted/50 px-2.5 py-1 rounded-md">
                  {post.readingTime}
                </span>
              </div>
            </Fade.Item>
            <Fade.Item>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground text-balance leading-tight mb-4 md:mb-5">
                {post.title}
              </h1>
            </Fade.Item>
            <Fade.Item>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                {post.description}
              </p>
            </Fade.Item>
          </header>

          {/* Content */}
          <Fade.Item>
            <div className="max-w-none">
              <MDXRemote
                source={post.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [
                      rehypeSlug,
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
          </Fade.Item>

          {/* Footer */}
          <Fade.Item>
            <footer className="mt-16 pt-8 border-t border-border">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                Back to Blog
              </Link>
            </footer>
          </Fade.Item>
        </article>
        {/* TOC Sidebar - Desktop */}
        <aside className="hidden xl:block w-64 pl-10">
          <TableOfContents />
        </aside>
        {/* TOC - Mobile */}
        <MobileTableOfContents />
      </Container>
    </Fade.Container>
  );
}
