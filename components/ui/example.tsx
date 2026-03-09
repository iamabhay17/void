"use client";

import { Suspense, lazy, ComponentType } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Example Wrapper Component
// Wraps any content in a card-like container
// ============================================================================

interface ExampleWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ExampleWrapper({ children, className }: ExampleWrapperProps) {
  return (
    <div
      className={cn(
        "group relative my-8 w-full rounded-2xl overflow-hidden",
        "bg-gradient-to-b from-muted/30 to-muted/10",
        "border border-border/50",
        "shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.04)]",
        "dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.15)]",
        "transition-shadow duration-300 hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)]",
        "dark:hover:shadow-[0_2px_6px_rgba(0,0,0,0.3),0_8px_24px_rgba(0,0,0,0.2)]",
        className,
      )}
    >
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,var(--border)_49%,var(--border)_51%,transparent_51%,transparent_100%),linear-gradient(to_bottom,transparent_0%,transparent_49%,var(--border)_49%,var(--border)_51%,transparent_51%,transparent_100%)] bg-[size:24px_24px] opacity-[0.03] pointer-events-none" />
      
      <div className="relative p-8 md:p-10 flex items-center justify-center min-h-[200px]">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Example Loading Fallback
// ============================================================================

function ExampleSkeleton() {
  return (
    <div className="flex items-center justify-center p-8 min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-5 border-2 border-muted-foreground/20 border-t-muted-foreground/60 rounded-full animate-spin" />
        <span className="text-xs font-medium text-muted-foreground/60">Loading example...</span>
      </div>
    </div>
  );
}

// ============================================================================
// Example Component - Dynamic Import
// ============================================================================

interface ExampleProps {
  /** Path to the example relative to /examples folder (e.g., "visual-hierarchy/Good") */
  name: string;
  /** Additional className for the wrapper */
  className?: string;
}

// Cache for lazy-loaded components
const componentCache = new Map<string, ComponentType>();

function getExampleComponent(name: string): ComponentType {
  if (componentCache.has(name)) {
    return componentCache.get(name)!;
  }

  // Dynamic import based on example name
  // Name format: "folder/component" -> imports from @/examples/folder and renders component
  const [folder, componentName] = name.includes("/")
    ? [
        name.substring(0, name.lastIndexOf("/")),
        name.substring(name.lastIndexOf("/") + 1),
      ]
    : [name, "default"];

  const LazyComponent = lazy(async () => {
    try {
      // Dynamically import the module
      const module = await import(`@/examples/${folder}`);

      // Convert kebab-case to PascalCase for component lookup
      const pascalName = componentName
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");

      // Try different naming conventions
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
            Failed to load example: {name}
          </div>
        ),
      };
    }
  });

  componentCache.set(name, LazyComponent);
  return LazyComponent;
}

export function Example({ name, className }: ExampleProps) {
  const ExampleComponent = getExampleComponent(name);

  return (
    <ExampleWrapper className={className}>
      <Suspense fallback={<ExampleSkeleton />}>
        <ExampleComponent />
      </Suspense>
    </ExampleWrapper>
  );
}
