# Layout Triggers

## 1. Concept Overview

Layout is the browser's process of calculating the position and size of every element on the page. When you change certain CSS properties, you "trigger" layout—the browser must recalculate geometry for affected elements.

Layout triggers are the most expensive browser operation:
- They affect the entire render tree
- They cascade to child elements
- They block the main thread
- They cause subsequent paint and composite

Understanding layout triggers is fundamental to performant animations.

## 2. Why This Matters for Design Engineers

Poor animation performance usually stems from layout triggers:
- Animations that change `width`, `height`, `top`, `left` trigger layout
- Layout during animation causes jank (dropped frames)
- Even one layout trigger can cascade to thousands of elements

As a Design Engineer, you must:
- Know which properties trigger layout
- Avoid layout-triggering properties in animations
- Use transform and opacity for smooth animation
- Understand the rendering pipeline

The difference between a 60fps animation and a janky one is often just choosing `transform: translateX()` over `left:`.

## 3. Key Principles / Mental Models

### The Rendering Pipeline
```
JavaScript → Style → Layout → Paint → Composite
```

- **Layout** (reflow): Geometry calculations
- **Paint**: Filling in pixels
- **Composite**: Combining layers

### Properties That Trigger Layout
Changing these forces layout recalculation:
- `width`, `height`
- `top`, `right`, `bottom`, `left`
- `margin`, `padding`
- `border-width`
- `font-size`, `line-height`
- `display`
- `position`

### Properties That Skip Layout
These only trigger paint or composite:
- `color`, `background-color` (paint only)
- `transform` (composite only)
- `opacity` (composite only)
- `filter` (varies, often composite)

### The Golden Rule
**Animate only `transform` and `opacity`** — they can be handled entirely by the GPU without touching layout or paint.

## 4. Implementation in React

### Using Transform Instead of Position

```tsx
// ❌ Bad: Triggers layout on every frame
<motion.div
  animate={{ left: isOpen ? 0 : -300 }}
  style={{ position: 'absolute' }}
/>

// ✅ Good: Uses transform (no layout)
<motion.div
  animate={{ x: isOpen ? 0 : -300 }}
  style={{ position: 'absolute', left: 0 }}
/>
```

### Using Scale Instead of Width/Height

```tsx
// ❌ Bad: Triggers layout
<motion.div
  animate={{ width: isExpanded ? 400 : 200 }}
/>

// ✅ Good: Uses transform scale (no layout)
<motion.div
  initial={{ scaleX: 1 }}
  animate={{ scaleX: isExpanded ? 2 : 1 }}
  style={{ 
    width: 200, 
    transformOrigin: 'left center' 
  }}
/>
```

### Layout Animation with Framer Motion

```tsx
// Framer Motion's layout prop handles layout
// animations efficiently using FLIP technique
function LayoutExample() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      layout // Framer calculates and animates with transform
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        width: isExpanded ? 400 : 200,
        height: isExpanded ? 300 : 100,
      }}
    >
      <motion.p layout="position">
        Text content that repositions smoothly
      </motion.p>
    </motion.div>
  );
}
```

### Measuring Layout Safely

```tsx
function useMeasure() {
  const ref = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    
    // Use ResizeObserver for efficient measurement
    const observer = new ResizeObserver(([entry]) => {
      // Reading layout values is fine
      // Writing layout values in response causes thrashing
      setBounds({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, bounds] as const;
}

function ResponsiveAnimation() {
  const [ref, { width }] = useMeasure();
  
  return (
    <div ref={ref}>
      <motion.div
        // Using transform based on measured width
        animate={{ x: width > 600 ? 100 : 0 }}
      >
        Content
      </motion.div>
    </div>
  );
}
```

## 5. React Patterns to Use

### Layout-Safe Animation Wrapper

```tsx
type AnimatableProperty = 'x' | 'y' | 'scale' | 'scaleX' | 'scaleY' | 'rotate' | 'opacity';

interface LayoutSafeAnimationProps {
  animate: Partial<Record<AnimatableProperty, number>>;
  transition?: object;
  children: React.ReactNode;
}

function LayoutSafeAnimation({ 
  animate, 
  transition, 
  children 
}: LayoutSafeAnimationProps) {
  // Only allows transform and opacity properties
  return (
    <motion.div
      animate={animate}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

// Usage - TypeScript prevents layout-triggering props
<LayoutSafeAnimation animate={{ x: 100, opacity: 0.5 }}>
  Content
</LayoutSafeAnimation>
```

### FLIP Pattern Implementation

```tsx
// First, Last, Invert, Play
function useFLIP<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const firstRect = useRef<DOMRect | null>(null);

  const captureFirst = useCallback(() => {
    if (ref.current) {
      firstRect.current = ref.current.getBoundingClientRect();
    }
  }, []);

  const playAnimation = useCallback(() => {
    if (!ref.current || !firstRect.current) return;
    
    const last = ref.current.getBoundingClientRect();
    const first = firstRect.current;
    
    // Calculate the delta
    const deltaX = first.left - last.left;
    const deltaY = first.top - last.top;
    const deltaScaleX = first.width / last.width;
    const deltaScaleY = first.height / last.height;
    
    // Apply inverse transform
    ref.current.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaScaleX}, ${deltaScaleY})`;
    ref.current.style.transformOrigin = 'top left';
    
    // Force reflow
    ref.current.offsetHeight;
    
    // Animate to identity transform
    ref.current.style.transition = 'transform 0.3s ease-out';
    ref.current.style.transform = '';
    
    // Cleanup
    const cleanup = () => {
      if (ref.current) {
        ref.current.style.transition = '';
        ref.current.style.transformOrigin = '';
      }
    };
    
    ref.current.addEventListener('transitionend', cleanup, { once: true });
  }, []);

  return { ref, captureFirst, playAnimation };
}
```

## 6. Important Hooks

### useLayoutEffect for Measurements

```tsx
function useLayoutMeasurement() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // useLayoutEffect runs synchronously after DOM mutations
  // but before paint - perfect for measurements
  useLayoutEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }
  }, []);

  return [ref, size] as const;
}
```

### useDeferredValue for Heavy Layouts

```tsx
import { useDeferredValue } from 'react';

function HeavyLayout({ items }) {
  // Defer rendering of heavy layouts
  const deferredItems = useDeferredValue(items);
  
  return (
    <div>
      {deferredItems.map(item => (
        <ComplexLayoutItem key={item.id} {...item} />
      ))}
    </div>
  );
}
```

### useResizeObserver

```tsx
function useResizeObserver<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(entries => {
      // Use contentBoxSize for more accurate measurements
      const entry = entries[0];
      const { inlineSize: width, blockSize: height } = entry.contentBoxSize[0];
      setDimensions({ width, height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, dimensions] as const;
}
```

## 7. Animation Considerations

### Reading vs. Writing Layout

```tsx
// ❌ Layout thrashing: read-write-read-write
function badLayoutAccess() {
  const el1 = document.getElementById('el1')!;
  const el2 = document.getElementById('el2')!;
  
  // Read
  const width1 = el1.offsetWidth;
  // Write (invalidates layout)
  el1.style.width = width1 + 10 + 'px';
  // Read (forces layout recalculation)
  const width2 = el2.offsetWidth;
  // Write
  el2.style.width = width2 + 10 + 'px';
}

// ✅ Batch reads, then batch writes
function goodLayoutAccess() {
  const el1 = document.getElementById('el1')!;
  const el2 = document.getElementById('el2')!;
  
  // Batch reads
  const width1 = el1.offsetWidth;
  const width2 = el2.offsetWidth;
  
  // Batch writes (single layout recalc)
  el1.style.width = width1 + 10 + 'px';
  el2.style.width = width2 + 10 + 'px';
}
```

### Avoiding Layout During Animation

```tsx
// ❌ Changes width during animation
function BadAnimation() {
  return (
    <motion.div
      animate={{
        width: [100, 200, 100],
      }}
      transition={{ repeat: Infinity, duration: 2 }}
    />
  );
}

// ✅ Uses transform for same visual effect
function GoodAnimation() {
  return (
    <motion.div
      style={{ width: 100 }}
      animate={{
        scaleX: [1, 2, 1],
      }}
      transition={{ repeat: Infinity, duration: 2 }}
    />
  );
}
```

## 8. Performance Considerations

### Isolating Layout

```tsx
// CSS containment prevents layout from propagating
function IsolatedLayout({ children }) {
  return (
    <div style={{ 
      contain: 'layout', // Layout changes don't affect ancestors
      // or: contain: 'strict' for full isolation
    }}>
      {children}
    </div>
  );
}
```

### content-visibility for Off-Screen Content

```tsx
function VirtualizedSection({ children, isNearViewport }) {
  return (
    <div
      style={{
        contentVisibility: isNearViewport ? 'visible' : 'auto',
        containIntrinsicSize: '0 500px', // Estimated size
      }}
    >
      {children}
    </div>
  );
}
```

### Debouncing Resize Handlers

```tsx
function useDebounceResize(callback: () => void, delay: number = 100) {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [callback, delay]);
}
```

## 9. Common Mistakes

### 1. Animating Width/Height
**Problem:** `animate={{ width: 200 }}` triggers layout every frame.
**Solution:** Use `scaleX`/`scaleY` transforms instead.

### 2. Animating Top/Left
**Problem:** `animate={{ top: 100 }}` triggers layout.
**Solution:** Use `animate={{ y: 100 }}` (transform: translateY).

### 3. Layout Thrashing
**Problem:** Alternating reads and writes causes multiple layouts.
**Solution:** Batch reads, then batch writes.

### 4. Measuring During Animation
**Problem:** Reading `offsetWidth` during animation causes layout.
**Solution:** Measure before animation starts, use cached values.

### 5. Ignoring CSS Containment
**Problem:** Small layout changes cascade to entire page.
**Solution:** Use `contain: layout` to isolate sections.

## 10. Practice Exercises

### Exercise 1: DevTools Layout Detection
Open DevTools Performance panel. Record an animation and identify layout triggers.

### Exercise 2: Transform Migration
Take an animation using position properties and convert to transforms.

### Exercise 3: FLIP Animation
Implement a smooth reordering animation using the FLIP technique.

### Exercise 4: Layout Isolation
Add CSS containment to a component and measure performance improvement.

### Exercise 5: Resize Observer
Build a component that responds to container size without layout thrashing.

## 11. Advanced Topics

- **Layout Instability API** — Measuring and debugging layout shifts
- **CSS Containment** — Advanced containment strategies
- **Virtual DOM Implications** — How React's reconciliation affects layout
- **Web Workers** — Offloading layout calculations
- **ResizeObserver Patterns** — Efficient responsive components
- **Layout Boundary Components** — Creating isolated layout contexts
