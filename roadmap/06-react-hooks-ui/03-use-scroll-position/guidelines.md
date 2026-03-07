# useScrollPosition

## 1. Concept Overview

`useScrollPosition` tracks scroll position to enable scroll-based animations, sticky headers, progress indicators, and parallax effects. It's one of the most common hooks for creating dynamic, scroll-aware interfaces.

Key capabilities:
- Track vertical/horizontal scroll position
- Calculate scroll progress (0-1)
- Detect scroll direction
- Measure distance to elements

This hook is fundamental for scroll-triggered animations and dynamic UI behaviors.

## 2. Why This Matters for Design Engineers

Scroll-aware UI creates engaging experiences:
- Sticky headers that transform on scroll
- Progress bars for article reading
- Parallax backgrounds
- Lazy-loading content
- Scroll-triggered animations

As a Design Engineer, you must:
- Optimize scroll handlers for 60fps
- Use appropriate techniques (passive listeners, RAF)
- Integrate with animation libraries
- Handle scroll containers (not just window)

## 3. Key Principles / Mental Models

### Scroll Position vs. Scroll Progress
```tsx
scrollY = 500;        // Pixels scrolled from top
scrollProgress = 0.5; // 50% through the page (0-1)
```

### Performance Hierarchy
1. **CSS scroll-driven animations** — Best performance, limited support
2. **Intersection Observer** — For element visibility
3. **Motion values + useScroll** — GPU-accelerated with Framer Motion
4. **Native scroll events** — Most flexible, needs optimization

### Scroll Container Awareness
```tsx
// Window scroll (default)
const scrollY = window.scrollY;

// Container scroll
const scrollY = containerRef.current.scrollTop;
```

## 4. Implementation in React

### Basic useScrollPosition

```tsx
import { useState, useEffect } from 'react';

interface ScrollPosition {
  x: number;
  y: number;
}

function useScrollPosition(): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Set initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return position;
}
```

### With Throttling

```tsx
function useScrollPosition(throttleMs = 0): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 });
  const lastUpdate = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      if (throttleMs > 0 && now - lastUpdate.current < throttleMs) {
        return;
      }
      lastUpdate.current = now;
      
      setPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [throttleMs]);

  return position;
}
```

### Using RAF for Smooth Updates

```tsx
function useScrollPositionRAF(): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 });
  const rafId = useRef<number>();
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        rafId.current = requestAnimationFrame(() => {
          setPosition({
            x: window.scrollX,
            y: window.scrollY,
          });
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return position;
}
```

## 5. React Patterns to Use

### Framer Motion useScroll (Recommended)

```tsx
import { useScroll, useTransform, motion } from 'framer-motion';

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left z-50"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

function ParallaxHero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <motion.div 
      className="h-screen relative overflow-hidden"
      style={{ y }}
    >
      <motion.h1 style={{ opacity }} className="text-6xl">
        Scroll Down
      </motion.h1>
    </motion.div>
  );
}
```

### Element-Based Scroll Progress

```tsx
function ElementScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'], // When element enters/exits viewport
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className="h-96 bg-blue-500 rounded-xl"
    >
      This animates based on its scroll position
    </motion.div>
  );
}
```

### Sticky Header with Transform

```tsx
function StickyHeader() {
  const { scrollY } = useScroll();
  
  // Header shrinks after scrolling 100px
  const height = useTransform(scrollY, [0, 100], [80, 60]);
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255,255,255,0)', 'rgba(255,255,255,1)']
  );
  const boxShadow = useTransform(
    scrollY,
    [0, 100],
    ['0 0 0 rgba(0,0,0,0)', '0 4px 20px rgba(0,0,0,0.1)']
  );

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-6"
      style={{ height, backgroundColor, boxShadow }}
    >
      <Logo />
      <Navigation />
    </motion.header>
  );
}
```

### Scroll Direction Detection

```tsx
function useScrollDirection() {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current) {
        setDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setDirection('up');
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return direction;
}

// Auto-hiding header
function AutoHidingHeader() {
  const direction = useScrollDirection();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      if (latest > 100) {
        setHidden(direction === 'down');
      } else {
        setHidden(false);
      }
    });
  }, [direction, scrollY]);

  return (
    <motion.header
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="fixed top-0 left-0 right-0 h-16 bg-white shadow z-50"
    >
      Header content
    </motion.header>
  );
}
```

## 6. Important Hooks

### useScrollContainer

```tsx
function useScrollContainer(ref: RefObject<HTMLElement>) {
  const [scroll, setScroll] = useState({ x: 0, y: 0, progress: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const { scrollTop, scrollLeft, scrollHeight, clientHeight } = element;
      const maxScroll = scrollHeight - clientHeight;
      
      setScroll({
        x: scrollLeft,
        y: scrollTop,
        progress: maxScroll > 0 ? scrollTop / maxScroll : 0,
      });
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => element.removeEventListener('scroll', handleScroll);
  }, [ref]);

  return scroll;
}

// Usage
function ScrollableList() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { progress } = useScrollContainer(containerRef);

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className="h-64 overflow-y-auto"
      >
        {items.map(item => <Item key={item.id} item={item} />)}
      </div>
      <div 
        className="absolute right-0 top-0 w-1 h-full bg-gray-200"
      >
        <div 
          className="bg-blue-500 w-full transition-all"
          style={{ height: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
```

### useScrollTo

```tsx
function useScrollTo() {
  const scrollTo = useCallback((
    target: number | HTMLElement | string,
    options: { behavior?: 'smooth' | 'auto'; offset?: number } = {}
  ) => {
    const { behavior = 'smooth', offset = 0 } = options;
    
    let targetY: number;
    
    if (typeof target === 'number') {
      targetY = target;
    } else if (typeof target === 'string') {
      const element = document.querySelector(target);
      if (!element) return;
      targetY = element.getBoundingClientRect().top + window.scrollY;
    } else {
      targetY = target.getBoundingClientRect().top + window.scrollY;
    }
    
    window.scrollTo({
      top: targetY - offset,
      behavior,
    });
  }, []);

  return scrollTo;
}

// Usage
function TableOfContents({ headings }: { headings: Heading[] }) {
  const scrollTo = useScrollTo();

  return (
    <nav>
      {headings.map(heading => (
        <button
          key={heading.id}
          onClick={() => scrollTo(`#${heading.id}`, { offset: 80 })}
        >
          {heading.text}
        </button>
      ))}
    </nav>
  );
}
```

### useScrollVelocity

```tsx
import { useVelocity, useScroll } from 'framer-motion';

function ScrollVelocityText() {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const skewX = useTransform(scrollVelocity, [-1000, 1000], [-10, 10]);

  return (
    <motion.h1 style={{ skewX }} className="text-6xl">
      Scroll Fast!
    </motion.h1>
  );
}
```

## 7. Animation Considerations

### Scroll-Triggered Reveal

```tsx
function ScrollReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.5'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
    >
      {children}
    </motion.div>
  );
}
```

### Horizontal Scroll Section

```tsx
function HorizontalScrollSection({ items }: { items: Item[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', `-${(items.length - 1) * 100}%`]
  );

  return (
    <div ref={containerRef} className="h-[300vh] relative">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div
          style={{ x }}
          className="flex"
        >
          {items.map(item => (
            <div key={item.id} className="w-screen h-screen flex-shrink-0">
              {item.content}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
```

### Scroll-Linked Number Counter

```tsx
function ScrollCounter({ end }: { end: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'start 0.3'],
  });

  const count = useTransform(scrollYProgress, [0, 1], [0, end]);
  const rounded = useTransform(count, latest => Math.round(latest));

  return (
    <motion.span ref={ref} className="text-6xl font-bold">
      {rounded}
    </motion.span>
  );
}
```

## 8. Performance Considerations

### Using MotionValues (No Re-renders)

```tsx
// ❌ Re-renders on every scroll
function BadScrollHeader() {
  const { y } = useScrollPosition();
  return <div style={{ height: Math.max(60, 100 - y * 0.5) }} />;
}

// ✅ No re-renders
function GoodScrollHeader() {
  const { scrollY } = useScroll();
  const height = useTransform(scrollY, [0, 100], [100, 60]);
  
  return <motion.div style={{ height }} />;
}
```

### Passive Event Listeners

```tsx
// Always use passive: true for scroll events
window.addEventListener('scroll', handler, { passive: true });
```

### Intersection Observer Alternative

```tsx
// For visibility-based triggers, use IntersectionObserver instead
function useInView(ref: RefObject<Element>) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return isInView;
}
```

## 9. Common Mistakes

### 1. Scroll Handler Without Throttling
**Problem:** Handler fires 100s of times per second.
**Solution:** Use RAF or throttle.

### 2. Not Using Passive Listeners
**Problem:** Scroll jank from non-passive handlers.
**Solution:** Always use `{ passive: true }`.

### 3. Re-rendering on Every Scroll
**Problem:** Expensive re-renders during scroll.
**Solution:** Use motion values or refs.

### 4. Forgetting Container Scroll
**Problem:** Only handles window scroll.
**Solution:** Accept container ref parameter.

### 5. Not Cleaning Up
**Problem:** Memory leaks from listeners.
**Solution:** Remove listeners in cleanup.

## 10. Practice Exercises

### Exercise 1: Reading Progress
Build a progress bar that shows article reading progress.

### Exercise 2: Parallax Layers
Create a parallax scene with multiple layers moving at different speeds.

### Exercise 3: Snap Sections
Build full-page sections with scroll snapping and progress indicators.

### Exercise 4: Infinite Scroll
Implement infinite scroll with scroll position detection.

### Exercise 5: Scroll Spy Navigation
Create navigation that highlights based on visible section.

## 11. Advanced Topics

- **CSS Scroll-Driven Animations** — Native browser support
- **Scroll Snap** — CSS scroll snapping integration
- **Virtual Scrolling** — Scroll position in virtual lists
- **Horizontal Scroll** — Trackpad vs. scroll bar
- **Overscroll Effects** — Bounce and refresh behaviors
- **Scroll Restoration** — Maintaining position on navigation
