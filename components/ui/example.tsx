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
        "my-6 max-w-lg rounded-xl border border-border bg-card shadow-sm overflow-hidden",
        className,
      )}
    >
      <div className="p-6">{children}</div>
    </div>
  );
}

// ============================================================================
// Example Loading Fallback
// ============================================================================

function ExampleSkeleton() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="size-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
        Loading example...
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
