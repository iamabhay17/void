import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Example, ExampleWrapper } from "@/components/ui/example";
import { Callout } from "@/components/ui/callout";
import { Steps, Step } from "@/components/ui/steps";
import { CommandBlock } from "@/components/ui/command-block";
import {
  ComponentPreview,
  ComponentPreviewStacked,
  Preview,
} from "@/components/ui/component-preview";

// Heading with anchor link
function Heading({
  as: Tag,
  className,
  children,
  id,
  ...props
}: {
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  children?: React.ReactNode;
  id?: string;
} & React.HTMLAttributes<HTMLHeadingElement>) {
  if (!id) {
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={cn("group flex flex-row items-center gap-2", className)}
      id={id}
      {...props}
    >
      <a href={`#${id}`} className="peer">
        {children}
      </a>
      <LinkIcon
        className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Link to section"
      />
    </Tag>
  );
}

export function useMDXComponents(): MDXComponents {
  return {
    // Custom Example components (legacy)
    Example,
    ExampleWrapper,

    // Component Preview (chanhdai.com style)
    ComponentPreview,
    ComponentPreviewStacked,
    Preview,

    // Custom components
    Callout,
    Steps,
    Step,
    CommandBlock,

    // Headings with anchor links
    h1: ({ className, ...props }) => (
      <Heading
        as="h1"
        className={cn(
          "mt-8 scroll-m-20 text-xl md:text-2xl font-bold tracking-tight text-foreground first:mt-0",
          className,
        )}
        {...props}
      />
    ),
    h2: ({ className, ...props }) => (
      <Heading
        as="h2"
        className={cn(
          "mt-10 scroll-m-20 border-b border-border pb-2 text-lg md:text-xl font-semibold tracking-tight text-foreground first:mt-0",
          className,
        )}
        {...props}
      />
    ),
    h3: ({ className, ...props }) => (
      <Heading
        as="h3"
        className={cn(
          "mt-8 scroll-m-20 text-base md:text-lg font-semibold tracking-tight text-foreground",
          className,
        )}
        {...props}
      />
    ),
    h4: ({ className, ...props }) => (
      <Heading
        as="h4"
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
          "mt-3 text-sm leading-relaxed text-muted-foreground not-first:mt-3",
          className,
        )}
        {...props}
      />
    ),

    // Lists
    ul: ({ className, ...props }) => (
      <ul
        className={cn(
          "my-3 ml-6 list-disc text-sm text-muted-foreground [&>li]:mt-1.5",
          className,
        )}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={cn(
          "my-3 ml-6 list-decimal text-sm text-muted-foreground [&>li]:mt-1.5",
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
          "relative mt-4 rounded-r-lg border-l-4 rounded-l-sm border-primary/60 bg-muted py-3 pl-6 pr-4 text-sm italic text-muted-foreground",
          "[&>p]:mt-0 [&>p:not(:first-child)]:mt-2",
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
        className={cn("group relative overflow-x-auto", className)}
        {...props}
      >
        {children}
      </pre>
    ),
    code: ({ className, children, ...props }) => {
      // Check if it's a code block (has data-language) or inline
      const isCodeBlock = "data-language" in props;
      if (isCodeBlock) {
        return (
          <code className={cn("font-mono text-sm", className)} {...props}>
            {children}
          </code>
        );
      }
      // Inline code
      return (
        <code className={cn("code-inline", className)} {...props}>
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
