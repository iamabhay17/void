"use client";

import { useRef, ReactNode } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
  "data-language"?: string;
  "data-theme"?: string;
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const codeRef = useRef<HTMLPreElement>(null);

  const getCodeText = () => {
    if (codeRef.current) {
      return codeRef.current.textContent || "";
    }
    return "";
  };

  return (
    <pre
      ref={codeRef}
      className={cn(
        "group relative my-6 overflow-x-auto rounded-lg border border-border text-sm",
        className,
      )}
      {...props}
    >
      <CopyButton text={getCodeText()} />
      {children}
    </pre>
  );
}
