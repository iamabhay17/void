import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function useMDXComponents(): MDXComponents {
  return {
    // Headings - consistent with homepage (text-2xl md:text-3xl for h1)
    h1: ({ className, ...props }) => (
      <h1
        className={cn(
          "mt-10 scroll-m-20 text-xl md:text-2xl font-bold tracking-tight text-foreground first:mt-0",
          className,
        )}
        {...props}
      />
    ),
    h2: ({ className, ...props }) => (
      <h2
        className={cn(
          "mt-10 scroll-m-20 border-b border-border pb-2 text-lg md:text-xl font-semibold tracking-tight text-foreground first:mt-0",
          className,
        )}
        {...props}
      />
    ),
    h3: ({ className, ...props }) => (
      <h3
        className={cn(
          "mt-8 scroll-m-20 text-base md:text-lg font-semibold tracking-tight text-foreground",
          className,
        )}
        {...props}
      />
    ),
    h4: ({ className, ...props }) => (
      <h4
        className={cn(
          "mt-6 scroll-m-20 text-sm md:text-base font-semibold tracking-tight text-foreground",
          className,
        )}
        {...props}
      />
    ),

    // Paragraphs - consistent text-sm
    p: ({ className, ...props }) => (
      <p
        className={cn(
          "mt-4 text-sm leading-relaxed text-muted-foreground not-first:mt-4",
          className,
        )}
        {...props}
      />
    ),

    // Lists
    ul: ({ className, ...props }) => (
      <ul
        className={cn(
          "my-4 ml-6 list-disc text-sm text-muted-foreground [&>li]:mt-2",
          className,
        )}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={cn(
          "my-4 ml-6 list-decimal text-sm text-muted-foreground [&>li]:mt-2",
          className,
        )}
        {...props}
      />
    ),
    li: ({ className, ...props }) => (
      <li className={cn("leading-relaxed", className)} {...props} />
    ),

    // Blockquote
    blockquote: ({ className, ...props }) => (
      <blockquote
        className={cn(
          "relative mt-6 rounded-r-lg border-l-4 border-primary/60 bg-muted/40 py-4 pl-6 pr-4 text-sm italic text-muted-foreground shadow-sm",
          "[&>p]:mt-0 [&>p:not(:first-child)]:mt-3",
          "before:absolute before:left-3 before:top-3 before:text-2xl before:text-primary/30 before:content-['\\201C']",
          className,
        )}
        {...props}
      />
    ),

    // Links
    a: ({ className, href, ...props }) => {
      const isExternal = href?.startsWith("http");
      const Component = isExternal ? "a" : Link;
      return (
        <Component
          href={href || "#"}
          className={cn(
            "font-medium text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground",
            className,
          )}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          {...props}
        />
      );
    },

    // Code blocks with syntax highlighting support
    pre: ({ className, children, ...props }) => (
      <pre
        className={cn(
          "group relative my-6 overflow-x-auto rounded-lg border border-border bg-[#0d1117] p-4 text-sm",
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    ),
    code: ({ className, children, ...props }) => {
      // Check if it's a code block (has data-language) or inline
      const isCodeBlock = className?.includes("language-");
      if (isCodeBlock) {
        return (
          <code className={cn("font-mono text-[13px]", className)} {...props}>
            {children}
          </code>
        );
      }
      // Inline code
      return (
        <code
          className={cn(
            "rounded font-mono text-[13px] text-foreground",
            className,
            "inline-code",
          )}
          {...props}
        >
          {children}
        </code>
      );
    },

    // Table
    table: ({ className, ...props }) => (
      <div className="my-6 w-full overflow-x-auto rounded-lg border border-border">
        <table
          className={cn("w-full border-collapse text-xs", className)}
          {...props}
        />
      </div>
    ),
    thead: ({ className, ...props }) => (
      <thead className={cn("bg-muted/50", className)} {...props} />
    ),
    tbody: ({ className, ...props }) => (
      <tbody
        className={cn("[&>tr:last-child]:border-0", className)}
        {...props}
      />
    ),
    tr: ({ className, ...props }) => (
      <tr
        className={cn("border-b border-border transition-colors", className)}
        {...props}
      />
    ),
    th: ({ className, ...props }) => (
      <th
        className={cn(
          "px-3 py-2.5 text-left text-xs font-semibold text-foreground [[align=center]]:text-center [[align=right]]:text-right",
          className,
        )}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td
        className={cn(
          "px-3 py-2.5 text-xs text-muted-foreground [[align=center]]:text-center [[align=right]]:text-right",
          className,
        )}
        {...props}
      />
    ),

    // Horizontal rule
    hr: ({ ...props }) => <hr className="my-10 border-border" {...props} />,

    // Strong & Emphasis
    strong: ({ className, ...props }) => (
      <strong
        className={cn("font-semibold text-foreground", className)}
        {...props}
      />
    ),
    em: ({ className, ...props }) => (
      <em className={cn("italic", className)} {...props} />
    ),

    // Images
    img: ({ src, alt, width, height, ...props }) => {
      if (!src) return null;
      return (
        <figure className="my-6">
          <Image
            src={src}
            alt={alt || ""}
            width={Number(width) || 800}
            height={Number(height) || 400}
            className="rounded-lg border border-border"
            {...props}
          />
          {alt && (
            <figcaption className="mt-2 text-center text-xs text-muted-foreground">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    },
  };
}

export const mdxComponents = useMDXComponents();
