"use client";

/**
 * Visual Hierarchy Examples
 *
 * Each exported component becomes an example that can be used in MDX:
 * <Example name="visual-hierarchy/Good" />
 * <Example name="visual-hierarchy/Bad" />
 *
 * The component name after the slash should match the export name (PascalCase).
 */

// ============================================================================
// Good Example - Proper visual hierarchy
// ============================================================================

export function Good() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Primary Heading
        </h3>
        <p className="text-sm text-muted-foreground">
          Supporting text that provides context. Notice how the visual weight
          decreases as we move down the hierarchy.
        </p>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md">
          Primary Action
        </button>
        <button className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-md">
          Secondary
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Bad Example - Poor visual hierarchy (everything same weight)
// ============================================================================

export function Bad() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Primary Heading</p>
        <p className="text-sm text-muted-foreground">
          Supporting text. Everything looks the same weight, making it hard to
          scan and understand the content structure.
        </p>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-muted text-muted-foreground text-sm rounded-md">
          Primary Action
        </button>
        <button className="px-4 py-2 bg-muted text-muted-foreground text-sm rounded-md">
          Secondary
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Size Example - Hierarchy through size
// ============================================================================

export function Size() {
  return (
    <div className="flex items-end gap-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary rounded-lg" />
        <span className="text-xs text-muted-foreground mt-2 block">
          Primary
        </span>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 bg-primary/70 rounded-lg" />
        <span className="text-xs text-muted-foreground mt-2 block">
          Secondary
        </span>
      </div>
      <div className="text-center">
        <div className="w-8 h-8 bg-primary/40 rounded-lg" />
        <span className="text-xs text-muted-foreground mt-2 block">
          Tertiary
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Color Example - Hierarchy through color/contrast
// ============================================================================

export function Color() {
  return (
    <div className="space-y-2">
      <p className="text-foreground font-medium">
        High emphasis — Primary content
      </p>
      <p className="text-muted-foreground">
        Medium emphasis — Secondary content
      </p>
      <p className="text-muted-foreground/50">
        Low emphasis — Tertiary content
      </p>
    </div>
  );
}

// ============================================================================
// Typography Example - Hierarchy through font weight and style
// ============================================================================

export function Typography() {
  return (
    <div className="space-y-3">
      <p className="text-xl font-bold text-foreground">Bold Title</p>
      <p className="text-base font-medium text-foreground">
        Medium Weight Subtitle
      </p>
      <p className="text-sm font-normal text-muted-foreground">
        Regular body text with lighter weight for supporting information.
      </p>
      <p className="text-xs italic text-muted-foreground/70">
        Small italic caption or metadata
      </p>
    </div>
  );
}

// ============================================================================
// Spacing Example - Hierarchy through whitespace
// ============================================================================

export function Spacing() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-foreground">Section One</h4>
        <p className="text-xs text-muted-foreground">
          Tight spacing groups related content together.
        </p>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-foreground">Section Two</h4>
        <p className="text-xs text-muted-foreground">
          Large gap above separates this from the previous section.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Depth Example - Hierarchy through shadows and layering
// ============================================================================

export function Depth() {
  return (
    <div className="relative flex items-center justify-center gap-4 py-4">
      <div className="w-20 h-14 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
        Base
      </div>
      <div className="w-20 h-14 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center text-xs text-foreground">
        Elevated
      </div>
      <div className="w-20 h-14 rounded-lg bg-card border border-border shadow-lg flex items-center justify-center text-xs font-medium text-foreground">
        Focus
      </div>
    </div>
  );
}

// ============================================================================
// Combined Example - All techniques working together
// ============================================================================

export function Combined() {
  return (
    <div className="p-4 rounded-lg border border-border bg-card shadow-sm space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">
          Upgrade to Pro
        </h3>
        <p className="text-sm text-muted-foreground">
          Unlock all features and get priority support.
        </p>
      </div>

      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> Unlimited projects
        </li>
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> Advanced analytics
        </li>
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> Priority support
        </li>
      </ul>

      <div className="flex gap-2 pt-2">
        <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md shadow-sm">
          Upgrade Now
        </button>
        <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
          Learn more
        </button>
      </div>
    </div>
  );
}
