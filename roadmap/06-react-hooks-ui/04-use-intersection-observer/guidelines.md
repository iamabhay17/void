# useIntersectionObserver

## 1. Concept Overview

`useIntersectionObserver` wraps the browser's Intersection Observer API to detect when elements enter or exit the viewport. It's the performant way to implement:
- Lazy loading
- Infinite scroll
- Scroll-triggered animations
- Visibility tracking

Unlike scroll events, Intersection Observer runs asynchronously off the main thread, making it extremely efficient.

## 2. Why This Matters for Design Engineers

Intersection Observer enables efficient visibility detection:
- Trigger animations only when elements are visible
- Lazy load images and components
- Track which content users actually see
- Implement sticky behaviors

As a Design Engineer, you must:
- Know when to use IO vs. scroll events
- Configure thresholds and margins properly
- Handle the async nature correctly
- Integrate with animation libraries

## 3. Key Principles / Mental Models

### Scroll Events vs. Intersection Observer
| Scroll Events | Intersection Observer |
|---------------|----------------------|
| Fires constantly | Fires on intersection change |
| Main thread | Off main thread |
| Manual visibility calc | Automatic visibility calc |
| Simple but expensive | Complex but efficient |

### Observer Options
```tsx
{
  root: null,        // Viewport (or container element)
  rootMargin: '0px', // Margin around root
  threshold: 0,      // Percentage visible to trigger (0-1 or array)
}
```

### Threshold Behavior
- `0` — Trigger when any part becomes visible
- `1` — Trigger when fully visible
- `[0, 0.5, 1]` — Trigger at 0%, 50%, and 100% visibility

## 4. Implementation in React

### Basic useIntersectionObserver

```tsx
import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

function useIntersectionObserver<T extends Element>(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<T>, boolean, IntersectionObserverEntry | undefined] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options;

  const ref = useRef<T>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const frozen = useRef(false);

  const isVisible = entry?.isIntersecting ?? false;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (frozen.current && freezeOnceVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        if (entry.isIntersecting && freezeOnceVisible) {
          frozen.current = true;
          observer.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  return [ref, isVisible, entry];
}
```

### Usage Examples

```tsx
// Basic visibility detection
function FadeInOnScroll({ children }: { children: ReactNode }) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    freezeOnceVisible: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

// Lazy loading images
function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '200px', // Start loading 200px before visible
    freezeOnceVisible: true,
  });

  return (
    <div ref={ref} className="aspect-video bg-gray-200">
      {isVisible && (
        <motion.img
          src={src}
          alt={alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
```

### Framer Motion useInView

```tsx
import { useInView, motion } from 'framer-motion';

function FramerMotionInView() {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true,
    margin: '-100px',
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      Animates when in view
    </motion.div>
  );
}
```

## 5. React Patterns to Use

### Staggered List Animation

```tsx
function StaggeredList({ items }: { items: Item[] }) {
  const containerRef = useRef<HTMLUListElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  return (
    <motion.ul
      ref={containerRef}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {items.map(item => (
        <motion.li
          key={item.id}
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
          }}
        >
          {item.name}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Infinite Scroll

```tsx
function useInfiniteScroll(onLoadMore: () => void, hasMore: boolean) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0,
    rootMargin: '200px',
  });

  useEffect(() => {
    if (isVisible && hasMore) {
      onLoadMore();
    }
  }, [isVisible, hasMore, onLoadMore]);

  return ref;
}

function InfiniteList() {
  const [items, setItems] = useState<Item[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    
    const newItems = await fetchItems(items.length);
    setItems(prev => [...prev, ...newItems]);
    setHasMore(newItems.length > 0);
    setLoading(false);
  };

  const sentinelRef = useInfiniteScroll(loadMore, hasMore);

  return (
    <div>
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
      
      {/* Sentinel element */}
      <div ref={sentinelRef} className="h-10">
        {loading && <Spinner />}
      </div>
    </div>
  );
}
```

### Scroll Spy Navigation

```tsx
function useScrollSpy(sectionIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(id);
          }
        },
        { rootMargin: '-50% 0px -50% 0px' } // Middle of viewport
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [sectionIds]);

  return activeId;
}

function TableOfContents({ sections }: { sections: Section[] }) {
  const sectionIds = sections.map(s => s.id);
  const activeId = useScrollSpy(sectionIds);

  return (
    <nav className="sticky top-20">
      {sections.map(section => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={cn(
            'block py-2 px-4 border-l-2 transition-colors',
            activeId === section.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500'
          )}
        >
          {section.title}
        </a>
      ))}
    </nav>
  );
}
```

### Progress Tracking

```tsx
function useVisibilityProgress<T extends Element>(
  thresholds: number[] = Array.from({ length: 101 }, (_, i) => i / 100)
) {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setProgress(entry.intersectionRatio);
      },
      { threshold: thresholds }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [thresholds]);

  return [ref, progress] as const;
}

function ProgressReveal({ children }: { children: ReactNode }) {
  const [ref, progress] = useVisibilityProgress<HTMLDivElement>();

  return (
    <div ref={ref} style={{ opacity: progress }}>
      {children}
    </div>
  );
}
```

## 6. Important Hooks

### useInViewAnimation

```tsx
interface UseInViewAnimationOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
  delay?: number;
}

function useInViewAnimation(options: UseInViewAnimationOptions = {}) {
  const { threshold = 0.1, triggerOnce = true, rootMargin = '0px', delay = 0 } = options;
  const ref = useRef<HTMLElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const isInView = useInView(ref, {
    once: triggerOnce,
    margin: rootMargin,
    amount: threshold,
  });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShouldAnimate(true), delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, delay]);

  return { ref, shouldAnimate, isInView };
}

// Usage
function AnimatedCard() {
  const { ref, shouldAnimate } = useInViewAnimation({
    threshold: 0.2,
    triggerOnce: true,
    delay: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      Card content
    </motion.div>
  );
}
```

### useOnScreen

```tsx
function useOnScreen<T extends Element>(
  options?: IntersectionObserverInit
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [isOnScreen, setIsOnScreen] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsOnScreen(entry.isIntersecting),
      options
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options?.threshold, options?.root, options?.rootMargin]);

  return [ref, isOnScreen];
}
```

## 7. Animation Considerations

### Direction-Aware Animations

```tsx
function DirectionAwareReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<'up' | 'down'>('down');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let lastY = element.getBoundingClientRect().top;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const currentY = entry.boundingClientRect.top;
        setDirection(currentY < lastY ? 'up' : 'down');
        lastY = currentY;
      },
      { threshold: [0, 0.1, 0.9, 1] }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const isInView = useInView(ref, { once: true });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'down' ? 50 : -50,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
}
```

### Scale on Visibility

```tsx
function ScaleOnVisible({ children }: { children: ReactNode }) {
  const [ref, isVisible, entry] = useIntersectionObserver<HTMLDivElement>({
    threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
  });

  const ratio = entry?.intersectionRatio ?? 0;
  const scale = 0.8 + ratio * 0.2; // Scale from 0.8 to 1

  return (
    <motion.div
      ref={ref}
      animate={{ scale, opacity: ratio }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}
```

## 8. Performance Considerations

### Reusing Observers

```tsx
// Single observer for multiple elements
function useSharedIntersectionObserver(
  elements: RefObject<Element>[],
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    const observer = new IntersectionObserver(callback, options);
    
    elements.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, [elements, callback, options]);
}
```

### Lazy Component Loading

```tsx
function LazyComponent({ 
  loader, 
  fallback 
}: { 
  loader: () => Promise<{ default: React.ComponentType }>;
  fallback: ReactNode;
}) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '200px',
    freezeOnceVisible: true,
  });
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (isVisible && !Component) {
      loader().then(module => setComponent(() => module.default));
    }
  }, [isVisible, Component, loader]);

  return (
    <div ref={ref}>
      {Component ? <Component /> : fallback}
    </div>
  );
}
```

## 9. Common Mistakes

### 1. Creating New Observer Each Render
**Problem:** Observer recreated unnecessarily.
**Solution:** Use useEffect with stable dependencies.

### 2. Wrong Threshold Array
**Problem:** Expecting callbacks at specific percentages.
**Solution:** Understand threshold is "at least" not "exactly".

### 3. Forgetting Root Margin Direction
**Problem:** Elements animate too early/late.
**Solution:** Negative margin shrinks trigger zone, positive expands.

### 4. Not Handling SSR
**Problem:** IntersectionObserver undefined on server.
**Solution:** Check for browser environment.

### 5. Memory Leaks
**Problem:** Observer not disconnected.
**Solution:** Always disconnect in cleanup.

## 10. Practice Exercises

### Exercise 1: Image Gallery
Build a gallery that lazy-loads images with blur-up animation.

### Exercise 2: Section Counter
Create a counter that animates when scrolled into view.

### Exercise 3: Parallax Cards
Build cards that scale/rotate based on visibility ratio.

### Exercise 4: Video Auto-Play
Auto-play videos when visible, pause when not.

### Exercise 5: Breadcrumb Trail
Build breadcrumbs that update based on visible sections.

## 11. Advanced Topics

- **Resize Observer Integration** — Combined visibility and size
- **Multiple Observers** — Different thresholds for different effects
- **Virtual Lists** — IO for virtualization
- **Analytics Integration** — Tracking viewport time
- **Prefetching** — Loading resources before visible
- **CSS Scroll Animations** — Native browser alternative
