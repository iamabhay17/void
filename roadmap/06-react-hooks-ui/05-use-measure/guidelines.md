# useMeasure

## 1. Concept Overview

`useMeasure` tracks element dimensions (width, height, position) in real-time using ResizeObserver. It's essential for:
- Dynamic layouts
- Responsive animations
- Flexible UI components
- Content-aware positioning

Unlike static measurements, useMeasure reacts to size changes from content, window resize, or CSS transitions.

## 2. Why This Matters for Design Engineers

Element measurement enables adaptive UI:
- Animate height for accordion content
- Position tooltips and popovers
- Create responsive text truncation
- Build flexible grid layouts

As a Design Engineer, you must:
- Measure without causing layout thrashing
- Handle the async nature of ResizeObserver
- Avoid infinite loops from measure → animate → remeasure
- Use measurements for smooth animations

## 3. Key Principles / Mental Models

### When to Measure
- **On mount** — Initial size
- **On content change** — Dynamic content
- **On window resize** — Responsive layouts
- **On CSS change** — Animations, transitions

### ResizeObserver vs. Manual Measurement
```tsx
// ❌ Manual: Only measures once or on window resize
const { width } = element.getBoundingClientRect();

// ✅ ResizeObserver: Reacts to any size change
observer.observe(element); // Fires callback on any dimension change
```

### Content vs. Border Box
```tsx
// contentRect: Content area (excluding padding, border)
entry.contentRect.width

// borderBoxSize: Full box size (including padding, border)
entry.borderBoxSize[0].inlineSize
```

## 4. Implementation in React

### Basic useMeasure

```tsx
import { useRef, useState, useLayoutEffect } from 'react';

interface Dimensions {
  width: number;
  height: number;
  top: number;
  left: number;
  x: number;
  y: number;
  right: number;
  bottom: number;
}

function useMeasure<T extends HTMLElement>(): [
  React.RefObject<T>,
  Dimensions
] {
  const ref = useRef<T>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    x: 0,
    y: 0,
    right: 0,
    bottom: 0,
  });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        const rect = element.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          x: rect.x,
          y: rect.y,
          right: rect.right,
          bottom: rect.bottom,
        });
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, dimensions];
}
```

### Usage Examples

```tsx
// Responsive component
function ResponsiveCard() {
  const [ref, { width }] = useMeasure<HTMLDivElement>();
  
  const variant = width > 400 ? 'large' : 'small';

  return (
    <div ref={ref} className="w-full">
      {variant === 'large' ? (
        <LargeCardLayout />
      ) : (
        <SmallCardLayout />
      )}
    </div>
  );
}

// Dynamic height animation
function AnimatedAccordion({ isOpen, children }: AccordionProps) {
  const [ref, { height }] = useMeasure<HTMLDivElement>();

  return (
    <motion.div
      animate={{ height: isOpen ? height : 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      className="overflow-hidden"
    >
      <div ref={ref}>{children}</div>
    </motion.div>
  );
}
```

### With Debounce

```tsx
function useMeasureDebounced<T extends HTMLElement>(
  delay = 100
): [React.RefObject<T>, Dimensions] {
  const ref = useRef<T>(null);
  const [dimensions, setDimensions] = useState<Dimensions>(initialDimensions);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(entries => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const rect = element.getBoundingClientRect();
        setDimensions(/* ... */);
      }, delay);
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutRef.current);
    };
  }, [delay]);

  return [ref, dimensions];
}
```

## 5. React Patterns to Use

### Height Auto Animation

```tsx
function AutoHeightContainer({ children }: { children: ReactNode }) {
  const [ref, { height }] = useMeasure<HTMLDivElement>();

  return (
    <motion.div
      animate={{ height }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="overflow-hidden"
    >
      <div ref={ref}>{children}</div>
    </motion.div>
  );
}

// Usage
function ExpandableSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button onClick={() => setExpanded(!expanded)}>Toggle</button>
      <AutoHeightContainer>
        {expanded && (
          <>
            <p>First paragraph...</p>
            <p>Second paragraph...</p>
            <p>Third paragraph...</p>
          </>
        )}
      </AutoHeightContainer>
    </div>
  );
}
```

### Positioned Tooltip

```tsx
function MeasuredTooltip({ 
  target, 
  content 
}: { 
  target: RefObject<HTMLElement>;
  content: ReactNode;
}) {
  const [tooltipRef, tooltipDimensions] = useMeasure<HTMLDivElement>();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!target.current) return;
    
    const rect = target.current.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2 - tooltipDimensions.width / 2,
      y: rect.top - tooltipDimensions.height - 8,
    });
  }, [target, tooltipDimensions]);

  return (
    <motion.div
      ref={tooltipRef}
      style={{ 
        position: 'fixed',
        left: position.x,
        top: position.y,
      }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {content}
    </motion.div>
  );
}
```

### Responsive Text

```tsx
function FitText({ children }: { children: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [containerMeasure] = useMeasure<HTMLDivElement>();
  const [fontSize, setFontSize] = useState(16);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    // Binary search for optimal font size
    let min = 8;
    let max = 200;
    
    while (max - min > 1) {
      const mid = Math.floor((min + max) / 2);
      text.style.fontSize = `${mid}px`;
      
      if (text.scrollWidth <= container.clientWidth) {
        min = mid;
      } else {
        max = mid;
      }
    }
    
    setFontSize(min);
  }, [children, containerMeasure.width]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <span ref={textRef} style={{ fontSize, whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </div>
  );
}
```

### Masonry Layout

```tsx
function MasonryGrid({ items, columns = 3 }: MasonryProps) {
  const [containerRef, { width: containerWidth }] = useMeasure<HTMLDivElement>();
  const columnWidth = containerWidth / columns;
  const columnHeights = useRef<number[]>(new Array(columns).fill(0));
  
  const positions = useMemo(() => {
    columnHeights.current = new Array(columns).fill(0);
    
    return items.map((item) => {
      // Find shortest column
      const minHeight = Math.min(...columnHeights.current);
      const column = columnHeights.current.indexOf(minHeight);
      
      const position = {
        x: column * columnWidth,
        y: columnHeights.current[column],
      };
      
      // Update column height (estimate based on aspect ratio)
      columnHeights.current[column] += item.estimatedHeight;
      
      return position;
    });
  }, [items, columnWidth, columns]);

  return (
    <div ref={containerRef} className="relative w-full">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          layout
          style={{
            position: 'absolute',
            width: columnWidth,
            left: positions[index].x,
            top: positions[index].y,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <ItemCard item={item} />
        </motion.div>
      ))}
    </div>
  );
}
```

## 6. Important Hooks

### useBoundingClientRect

```tsx
function useBoundingClientRect<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const measure = useCallback(() => {
    if (ref.current) {
      setRect(ref.current.getBoundingClientRect());
    }
  }, []);

  useLayoutEffect(() => {
    measure();
    
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  return [ref, rect] as const;
}
```

### useElementSize

```tsx
function useElementSize<T extends HTMLElement>(): [
  RefObject<T>,
  { width: number; height: number }
] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(entries => {
      const { inlineSize, blockSize } = entries[0].borderBoxSize[0];
      setSize({ width: inlineSize, height: blockSize });
    });

    observer.observe(element, { box: 'border-box' });
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}
```

### useContainerQuery

```tsx
function useContainerQuery<T extends HTMLElement>(
  queries: Record<string, string>
): [RefObject<T>, Record<string, boolean>] {
  const [ref, { width }] = useMeasure<T>();
  
  const matches = useMemo(() => {
    const result: Record<string, boolean> = {};
    
    Object.entries(queries).forEach(([name, query]) => {
      // Simple min-width parser
      const minWidthMatch = query.match(/min-width:\s*(\d+)px/);
      if (minWidthMatch) {
        result[name] = width >= parseInt(minWidthMatch[1]);
      }
      
      const maxWidthMatch = query.match(/max-width:\s*(\d+)px/);
      if (maxWidthMatch) {
        result[name] = width <= parseInt(maxWidthMatch[1]);
      }
    });
    
    return result;
  }, [width, queries]);

  return [ref, matches];
}

// Usage
function ResponsiveComponent() {
  const [ref, matches] = useContainerQuery<HTMLDivElement>({
    compact: 'max-width: 300px',
    normal: 'min-width: 301px',
    wide: 'min-width: 600px',
  });

  return (
    <div ref={ref} className="w-full">
      {matches.compact && <CompactLayout />}
      {matches.normal && !matches.wide && <NormalLayout />}
      {matches.wide && <WideLayout />}
    </div>
  );
}
```

## 7. Animation Considerations

### FLIP with Measurement

```tsx
function FlipCard({ children, key }: { children: ReactNode; key: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const prevRect = useRef<DOMRect>();

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !prevRect.current) return;

    const currentRect = element.getBoundingClientRect();
    const deltaX = prevRect.current.left - currentRect.left;
    const deltaY = prevRect.current.top - currentRect.top;

    if (deltaX === 0 && deltaY === 0) return;

    element.animate(
      [
        { transform: `translate(${deltaX}px, ${deltaY}px)` },
        { transform: 'translate(0, 0)' },
      ],
      { duration: 300, easing: 'ease-out' }
    );
  });

  useEffect(() => {
    return () => {
      if (ref.current) {
        prevRect.current = ref.current.getBoundingClientRect();
      }
    };
  });

  return <div ref={ref}>{children}</div>;
}
```

### Measure Before Remove

```tsx
function AnimatedList({ items }: { items: Item[] }) {
  const [leaving, setLeaving] = useState<Map<string, DOMRect>>(new Map());
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleRemove = (id: string) => {
    const element = itemRefs.current.get(id);
    if (element) {
      // Capture position before removal
      setLeaving(prev => new Map(prev).set(id, element.getBoundingClientRect()));
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            ref={(el) => {
              if (el) itemRefs.current.set(item.id, el);
              else itemRefs.current.delete(item.id);
            }}
            layout
            exit={{ 
              opacity: 0,
              position: 'absolute',
              left: leaving.get(item.id)?.left,
              top: leaving.get(item.id)?.top,
            }}
          >
            {item.content}
            <button onClick={() => handleRemove(item.id)}>Remove</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

## 8. Performance Considerations

### Avoiding Layout Thrashing

```tsx
// ❌ Causes layout thrashing
elements.forEach(el => {
  const height = el.offsetHeight; // Forces layout
  el.style.height = height + 10 + 'px'; // Invalidates layout
});

// ✅ Batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight); // All reads
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px'; // All writes
});
```

### Using useLayoutEffect

```tsx
// ❌ useEffect can cause flicker
useEffect(() => {
  const { height } = ref.current.getBoundingClientRect();
  setHeight(height);
}, []);

// ✅ useLayoutEffect measures before paint
useLayoutEffect(() => {
  const { height } = ref.current.getBoundingClientRect();
  setHeight(height);
}, []);
```

### Memoizing Expensive Calculations

```tsx
function ExpensiveLayout({ items }: { items: Item[] }) {
  const [ref, { width }] = useMeasure<HTMLDivElement>();

  // Only recalculate when width or items change
  const layout = useMemo(() => {
    return calculateComplexLayout(items, width);
  }, [items, width]);

  return (
    <div ref={ref}>
      {items.map((item, i) => (
        <div key={item.id} style={layout.positions[i]}>
          {item.content}
        </div>
      ))}
    </div>
  );
}
```

## 9. Common Mistakes

### 1. Infinite Measure Loops
**Problem:** Measure → set height → triggers measure → ...
**Solution:** Use separate measured and animated containers.

### 2. Not Using useLayoutEffect
**Problem:** Flicker from measuring after paint.
**Solution:** Measure in useLayoutEffect.

### 3. Forgetting Border/Padding
**Problem:** contentRect doesn't include border/padding.
**Solution:** Use borderBoxSize or account for box model.

### 4. Not Cleaning Up Observer
**Problem:** Memory leak from active observer.
**Solution:** Disconnect in cleanup function.

### 5. Measuring Hidden Elements
**Problem:** Hidden elements have 0 dimensions.
**Solution:** Measure before hiding or use visibility.

## 10. Practice Exercises

### Exercise 1: Animated Tabs
Build tabs with an animated indicator that measures and moves to active tab.

### Exercise 2: Auto-Height Textarea
Create a textarea that grows with content.

### Exercise 3: Responsive Grid
Build a grid that changes columns based on container width.

### Exercise 4: Position Popover
Create a popover that positions itself based on trigger and content size.

### Exercise 5: List Reorder
Implement drag-to-reorder with measured FLIP animations.

## 11. Advanced Topics

- **Content-Visibility** — Optimizing off-screen measurement
- **Container Queries** — Native CSS alternative
- **Virtual Measurement** — Measuring without DOM insertion
- **Writing Mode** — Handling vertical text
- **Print Layout** — Measuring for different contexts
- **Animation Coordination** — Multiple measured elements animating together
