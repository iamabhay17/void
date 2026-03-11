"use client";

import { CodeXmlIcon, EyeIcon, RepeatIcon, Copy, Check } from "lucide-react";
import { useTheme } from "next-themes";
import React, { Suspense, lazy, ComponentType, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ============================================================================
// Loading Skeleton
// ============================================================================

function PreviewSkeleton() {
  return (
    <div className="flex items-center justify-center p-8 min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-5 border-2 border-muted-foreground/20 border-t-muted-foreground/60 rounded-full animate-spin" />
        <span className="text-xs font-medium text-muted-foreground/60">
          Loading...
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Copy Button
// ============================================================================

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex size-8 items-center justify-center rounded-md border border-border bg-background/80 text-muted-foreground backdrop-blur-sm transition-all hover:bg-accent hover:text-foreground",
        copied && "text-green-500",
        className,
      )}
      aria-label={copied ? "Copied!" : "Copy code"}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

// ============================================================================
// Component Cache & Dynamic Import
// ============================================================================

const componentCache = new Map<string, ComponentType>();

function getExampleComponent(name: string): ComponentType {
  if (componentCache.has(name)) {
    return componentCache.get(name)!;
  }

  const [folder, componentName] = name.includes("/")
    ? [
        name.substring(0, name.lastIndexOf("/")),
        name.substring(name.lastIndexOf("/") + 1),
      ]
    : [name, "default"];

  const LazyComponent = lazy(async () => {
    try {
      const module = await import(`@/examples/${folder}`);

      const pascalName = componentName
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");

      const Component =
        module[pascalName] ||
        module[`${pascalName}Example`] ||
        module[componentName] ||
        module.default;

      if (!Component) {
        throw new Error(`Component "${componentName}" not found in module`);
      }

      return { default: Component };
    } catch (error) {
      console.error(`Failed to load example "${name}":`, error);
      return {
        default: () => (
          <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
            Failed to load: {name}
          </div>
        ),
      };
    }
  });

  componentCache.set(name, LazyComponent);
  return LazyComponent;
}

// ============================================================================
// Component Preview (Tabs Version - like chanhdai v1)
// ============================================================================

interface ComponentPreviewProps extends React.ComponentProps<"div"> {
  /** Path to the example component (e.g., "visual-hierarchy/Good") */
  name: string;
  /** Whether to show replay button for animations */
  canReplay?: boolean;
  /** Whether to remount component when theme changes */
  remountOnThemeChange?: boolean;
  /** Code to display in the code tab */
  children?: React.ReactNode;
}

export function ComponentPreview({
  className,
  name,
  canReplay = false,
  remountOnThemeChange = false,
  children,
  ...props
}: ComponentPreviewProps) {
  const { resolvedTheme } = useTheme();
  const [replay, setReplay] = useState(0);

  const ExampleComponent = useMemo(() => getExampleComponent(name), [name]);

  const codeElement = React.Children.toArray(children)[0] as
    | React.ReactElement
    | undefined;

  return (
    <div className={cn("my-6 not-prose", className)} {...props}>
      <Tabs defaultValue="preview" className="w-full flex flex-col gap-3">
        {/* Header with tabs and replay button */}
        <div className="flex items-center justify-between">
          <TabsList className="h-9">
            <TabsTrigger className="gap-1.5 px-3 text-xs" value="preview">
              <EyeIcon className="size-3.5" />
              Preview
            </TabsTrigger>
            {codeElement && (
              <TabsTrigger className="gap-1.5 px-3 text-xs" value="code">
                <CodeXmlIcon className="size-3.5" />
                Code
              </TabsTrigger>
            )}
          </TabsList>

          {canReplay && (
            <button
              onClick={() => setReplay((v) => v + 1)}
              className="flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Replay animation"
            >
              <RepeatIcon className="size-3.5" />
            </button>
          )}
        </div>

        {/* Preview Panel */}
        <TabsContent value="preview" className="mt-0">
          <div className="rounded-xl border border-border overflow-hidden">
            {/* Grid pattern background */}
            <div
              className="relative flex min-h-[280px] items-center justify-center bg-muted/30 p-6"
              style={{
                backgroundImage: `radial-gradient(circle, var(--border) 1px, transparent 1px)`,
                backgroundSize: "16px 16px",
              }}
            >
              <div
                key={`${replay}-${remountOnThemeChange ? resolvedTheme : "static"}`}
                className="relative z-10"
              >
                <Suspense fallback={<PreviewSkeleton />}>
                  <ExampleComponent />
                </Suspense>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Code Panel */}
        {codeElement && (
          <TabsContent value="code" className="mt-0">
            <div className="rounded-xl border border-border overflow-hidden bg-muted/30 [&>pre]:border-0 [&>pre]:rounded-none [&>pre]:m-0 [&_figure]:m-0 [&_figure]:rounded-none [&_figure]:border-0 [&_[data-rehype-pretty-code-figure]]:m-0 [&_[data-rehype-pretty-code-figure]]:rounded-none [&_[data-rehype-pretty-code-figure]]:border-0">
              {codeElement}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ============================================================================
// Component Preview V2 (Stacked Version - like chanhdai v2)
// Shows preview on top, code below
// ============================================================================

export function ComponentPreviewStacked({
  className,
  name,
  canReplay = false,
  remountOnThemeChange = false,
  children,
  ...props
}: ComponentPreviewProps) {
  const { resolvedTheme } = useTheme();
  const [replay, setReplay] = useState(0);

  const ExampleComponent = useMemo(() => getExampleComponent(name), [name]);

  const codeElement = React.Children.toArray(children)[0] as
    | React.ReactElement
    | undefined;

  return (
    <div className={cn("my-6 not-prose", className)} {...props}>
      {/* Preview Section */}
      <div
        className={cn(
          "border border-border bg-muted/30 overflow-hidden",
          codeElement ? "rounded-t-xl border-b-0" : "rounded-xl",
        )}
      >
        {canReplay && (
          <div className="flex justify-end p-2 pb-0">
            <button
              onClick={() => setReplay((v) => v + 1)}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Replay animation"
            >
              <RepeatIcon className="size-3.5" />
            </button>
          </div>
        )}

        <div
          className="relative flex min-h-[280px] items-center justify-center p-6"
          style={{
            backgroundImage: `radial-gradient(circle, var(--border) 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
        >
          <div
            key={`${replay}-${remountOnThemeChange ? resolvedTheme : "static"}`}
            className="relative z-10"
          >
            <Suspense fallback={<PreviewSkeleton />}>
              <ExampleComponent />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Code Section */}
      {codeElement && (
        <div className="rounded-b-xl border border-t-0 border-border overflow-hidden [&>pre]:border-0 [&>pre]:rounded-none [&>pre]:m-0 [&_figure]:m-0 [&_figure]:rounded-none [&_figure]:border-0 [&_[data-rehype-pretty-code-figure]]:m-0 [&_[data-rehype-pretty-code-figure]]:rounded-none [&_[data-rehype-pretty-code-figure]]:border-0 [&_pre]:max-h-80 [&_pre]:overflow-y-auto">
          {codeElement}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Simple Preview (Just the preview, no code)
// ============================================================================

export function Preview({
  className,
  name,
  canReplay = false,
  remountOnThemeChange = false,
  ...props
}: Omit<ComponentPreviewProps, "children">) {
  const { resolvedTheme } = useTheme();
  const [replay, setReplay] = useState(0);

  const ExampleComponent = useMemo(() => getExampleComponent(name), [name]);

  return (
    <div className={cn("my-6 not-prose", className)} {...props}>
      <div className="rounded-xl border border-border overflow-hidden">
        {canReplay && (
          <div className="flex justify-end p-2 pb-0 bg-muted/30">
            <button
              onClick={() => setReplay((v) => v + 1)}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Replay animation"
            >
              <RepeatIcon className="size-3.5" />
            </button>
          </div>
        )}

        <div
          className="relative flex min-h-[280px] items-center justify-center bg-muted/30 p-6"
          style={{
            backgroundImage: `radial-gradient(circle, var(--border) 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
        >
          <div
            key={`${replay}-${remountOnThemeChange ? resolvedTheme : "static"}`}
            className="relative z-10"
          >
            <Suspense fallback={<PreviewSkeleton />}>
              <ExampleComponent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
