# SVG Fundamentals

## 1. Concept Overview

SVG (Scalable Vector Graphics) is a vector image format that describes shapes mathematically. Unlike raster images (PNG, JPG), SVGs scale infinitely without quality loss and can be animated element-by-element.

Key SVG concepts:
- **ViewBox** — Coordinate system definition
- **Primitives** — rect, circle, ellipse, line, polygon, polyline
- **Paths** — Complex shapes with d attribute
- **Groups** — Nested organization with g element

```svg
<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="blue" />
</svg>
```

## 2. Why This Matters for Design Engineers

SVG mastery enables:
- Animated icons and logos
- Data visualizations
- Custom illustrations
- Micro-interactions
- Scalable graphics

As a Design Engineer, you must:
- Understand SVG coordinate systems
- Work with paths and shapes
- Optimize SVGs for animation
- Convert between design tools and code

## 3. Key Principles / Mental Models

### Coordinate System
```
viewBox="minX minY width height"
viewBox="0 0 100 100"

(0,0) -------- (100,0)
  |              |
  |    canvas    |
  |              |
(0,100) ------ (100,100)
```

### SVG Elements Hierarchy
```
<svg>
  <defs> (definitions: gradients, filters, symbols)
  <g> (groups)
    <shape> (rect, circle, path, etc.)
      attributes: fill, stroke, transform
```

### Presentational vs. Dimensional
```tsx
// Dimensional (affects layout)
<svg width="100" height="100">

// Presentational (styling only)
<svg viewBox="0 0 100 100" className="w-24 h-24">
```

## 4. Implementation in React

### Basic SVG Component

```tsx
function Icon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}
```

### SVG Primitives

```tsx
function SVGPrimitives() {
  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48">
      {/* Rectangle */}
      <rect x="10" y="10" width="40" height="30" fill="#3b82f6" rx="4" />
      
      {/* Circle */}
      <circle cx="90" cy="25" r="20" fill="#22c55e" />
      
      {/* Ellipse */}
      <ellipse cx="160" cy="25" rx="30" ry="15" fill="#f59e0b" />
      
      {/* Line */}
      <line x1="10" y1="80" x2="60" y2="80" stroke="#ef4444" strokeWidth="3" />
      
      {/* Polyline */}
      <polyline
        points="80,60 100,80 120,70 140,90"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      
      {/* Polygon */}
      <polygon points="160,60 180,100 140,100" fill="#ec4899" />
    </svg>
  );
}
```

### Path Commands

```tsx
function PathExample() {
  return (
    <svg viewBox="0 0 100 100" className="w-48 h-48">
      <path
        d={`
          M 10 50
          L 30 10
          L 50 50
          Q 70 90, 90 50
          C 70 10, 50 10, 40 50
          Z
        `}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

// Path commands:
// M x y - Move to (start point)
// L x y - Line to
// H x - Horizontal line
// V y - Vertical line
// Q cx cy x y - Quadratic curve
// C cx1 cy1 cx2 cy2 x y - Cubic bezier
// A rx ry rotation large-arc sweep x y - Arc
// Z - Close path
```

### SVG with Framer Motion

```tsx
import { motion } from 'framer-motion';

function AnimatedSVG() {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-24 h-24"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        stroke="#3b82f6"
        strokeWidth="4"
        fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { 
            pathLength: 1, 
            opacity: 1,
            transition: { duration: 2, ease: 'easeInOut' },
          },
        }}
      />
    </motion.svg>
  );
}
```

## 5. React Patterns to Use

### Dynamic SVG Props

```tsx
interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

function DynamicIcon({ 
  size = 24, 
  color = 'currentColor',
  strokeWidth = 2,
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      className={className}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
    </svg>
  );
}
```

### SVG Sprite System

```tsx
// sprite.svg
// <svg xmlns="http://www.w3.org/2000/svg">
//   <symbol id="icon-home" viewBox="0 0 24 24">
//     <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
//   </symbol>
//   <symbol id="icon-user" viewBox="0 0 24 24">
//     <circle cx="12" cy="7" r="4" />
//     <path d="M5.5 21c0-4.5 3-8 6.5-8s6.5 3.5 6.5 8" />
//   </symbol>
// </svg>

function SpriteIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={className}>
      <use href={`/sprite.svg#icon-${name}`} />
    </svg>
  );
}

// Usage
<SpriteIcon name="home" className="w-6 h-6" />
```

### SVG as React Component

```tsx
// Import from SVGR or create manually
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      fill="none"
      stroke="currentColor"
    >
      <motion.path
        d="M5 13l4 4L19 7"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </svg>
  );
}
```

### Responsive SVG

```tsx
function ResponsiveSVG() {
  return (
    <svg
      viewBox="0 0 100 100"
      // Fill container
      className="w-full h-full"
      // Or aspect ratio
      // className="w-full aspect-square"
      preserveAspectRatio="xMidYMid meet"
    >
      <circle cx="50" cy="50" r="40" fill="currentColor" />
    </svg>
  );
}
```

## 6. Important Concepts

### ViewBox Deep Dive

```tsx
function ViewBoxExample() {
  return (
    <div className="flex gap-4">
      {/* Normal */}
      <svg viewBox="0 0 100 100" className="w-24 h-24 border">
        <circle cx="50" cy="50" r="40" fill="blue" />
      </svg>
      
      {/* Zoomed in (smaller viewBox) */}
      <svg viewBox="25 25 50 50" className="w-24 h-24 border">
        <circle cx="50" cy="50" r="40" fill="blue" />
      </svg>
      
      {/* Zoomed out (larger viewBox) */}
      <svg viewBox="-50 -50 200 200" className="w-24 h-24 border">
        <circle cx="50" cy="50" r="40" fill="blue" />
      </svg>
    </div>
  );
}
```

### Transforms

```tsx
function TransformExample() {
  return (
    <svg viewBox="0 0 100 100" className="w-48 h-48">
      {/* Translate */}
      <rect 
        x="0" y="0" width="20" height="20" 
        fill="blue"
        transform="translate(10, 10)"
      />
      
      {/* Rotate around center */}
      <rect 
        x="0" y="0" width="20" height="20" 
        fill="green"
        transform="translate(50, 50) rotate(45) translate(-10, -10)"
      />
      
      {/* Scale */}
      <rect 
        x="70" y="10" width="20" height="20" 
        fill="red"
        transform="scale(0.5)"
        transform-origin="80 20"
      />
    </svg>
  );
}
```

### Gradients and Filters

```tsx
function AdvancedSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-48 h-48">
      <defs>
        {/* Linear Gradient */}
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        
        {/* Radial Gradient */}
        <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </radialGradient>
        
        {/* Drop Shadow Filter */}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="2" floodOpacity="0.3" />
        </filter>
      </defs>
      
      <circle cx="30" cy="50" r="20" fill="url(#grad1)" filter="url(#shadow)" />
      <circle cx="70" cy="50" r="20" fill="url(#grad2)" />
    </svg>
  );
}
```

## 7. Animation Considerations

### Animatable SVG Properties
- `pathLength` — For line drawing effects
- `strokeDashoffset` — Manual path animation
- `fill` / `stroke` — Color changes
- `opacity` — Fade effects
- `transform` — Position, rotation, scale
- `d` (path data) — Shape morphing

### Path Animation Setup

```tsx
function DrawPath() {
  return (
    <motion.svg viewBox="0 0 100 100">
      <motion.path
        d="M10,50 Q50,10 90,50 Q50,90 10,50"
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}
```

## 8. Performance Considerations

### Optimize SVG Complexity

```tsx
// ❌ Too many decimal places
<path d="M10.123456789,20.987654321 L30.111111111,40.222222222" />

// ✅ Reduced precision (2-3 decimals usually sufficient)
<path d="M10.12,20.99 L30.11,40.22" />

// Tools: SVGO, SVGOMG
```

### Use Symbols for Repeated Elements

```tsx
function OptimizedSVG() {
  return (
    <svg viewBox="0 0 200 100">
      <defs>
        <symbol id="star" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </symbol>
      </defs>
      
      {/* Reuse symbol multiple times */}
      <use href="#star" x="0" y="40" width="20" height="20" fill="#f59e0b" />
      <use href="#star" x="40" y="40" width="20" height="20" fill="#f59e0b" />
      <use href="#star" x="80" y="40" width="20" height="20" fill="#f59e0b" />
    </svg>
  );
}
```

## 9. Common Mistakes

### 1. Missing ViewBox
**Problem:** SVG doesn't scale properly.
**Solution:** Always include viewBox attribute.

### 2. Hard-coded Colors
**Problem:** Icon doesn't inherit text color.
**Solution:** Use `currentColor` for fill/stroke.

### 3. Width/Height Instead of ViewBox
**Problem:** SVG is fixed size.
**Solution:** Use viewBox and CSS for sizing.

### 4. Complex Paths from Design Tools
**Problem:** Unnecessarily complex d attribute.
**Solution:** Simplify paths, use SVGO.

### 5. Forgetting stroke-linecap
**Problem:** Path ends look wrong.
**Solution:** Add strokeLinecap="round".

## 10. Practice Exercises

### Exercise 1: Icon Set
Create a consistent set of 5 icons as React components.

### Exercise 2: Logo Animation
Convert a logo SVG into an animated component.

### Exercise 3: Interactive Chart
Build a bar chart SVG with hover interactions.

### Exercise 4: Path Builder
Create a tool that generates SVG path commands.

### Exercise 5: SVG Optimizer
Build a component that displays SVG optimization stats.

## 11. Advanced Topics

- **Clipping and Masking** — Complex shape compositions
- **Pattern Fills** — Repeating textures
- **Text Paths** — Text following curves
- **foreignObject** — HTML inside SVG
- **SMIL Animation** — Native SVG animation (deprecated)
- **Accessibility** — Making SVGs screen-reader friendly
