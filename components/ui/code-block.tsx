"use client";

import { useState, useRef, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy text");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-md border border-border bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? (
        <Check className="size-4 text-green-500" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
  "data-language"?: string;
}

export function CodeBlock({
  children,
  className,
  "data-language": language,
  ...props
}: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);

  const getCodeText = (): string => {
    if (preRef.current) {
      return preRef.current.textContent || "";
    }
    return "";
  };

  return (
    <div className="group relative my-6">
      {language && (
        <div className="absolute left-4 top-0 z-10 -translate-y-1/2 rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {language}
        </div>
      )}
      <CopyButton
        text={getCodeText()}
        className="opacity-0 transition-opacity group-hover:opacity-100"
      />
      <pre
        ref={preRef}
        className={cn(
          "overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 pt-8 text-sm leading-relaxed",
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}

export function InlineCode({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        "rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}
