# Scroll Animations

## 1. Concept Overview

Framer Motion provides powerful scroll animation capabilities through `useScroll`, `useInView`, and scroll-linked motion values. These enable scroll-triggered animations, parallax effects, progress indicators, and scroll-driven transformations.

Key hooks:
- `useScroll` — Track scroll position and progress
- `useInView` — Detect element visibility
- `useTransform` — Map scroll values to animation properties

```tsx
const { scrollYProgress } = useScroll();
const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
```

## 2. Why This Matters for Design Engineers

Scroll animations create immersive experiences:
- Storytelling marketing pages
- Progress indicators
- Parallax backgrounds
- Reveal-on-scroll content
- Sticky transformations

As a Design Engineer, you must:
- Choose scroll effects that enhance content
- Ensure smooth 60fps performance
- Respect reduced motion preferences
- Handle scroll direction and velocity

## 3. Key Principles / Mental Models

### Scroll Progress
```tsx
// Window scroll progress: 0 at top, 1 at bottom
const { scrollYProgress } = useScroll();

// Element scroll progress: 0 when enters, 1 when exits
const { scrollYProgress } = useScroll({
  target: elementRef,
  offset: ['start end', 'end start'],
});
```

### Offset Configuration
```
['start end', 'end start']
   │     │      │    │
   │     │      │    └─ container edge
   │     │      └────── end animation
   │     └───────────── container edge  
   └─────────────────── start animation

'start end' = element start reaches container end
'end start' = element end reaches container start
```

### Scroll Containers
```tsx
// Window scroll (default)
useScroll();

// Container scroll
useScroll({ container: containerRef });

// Element progress relative to viewport
useScroll({ target: elementRef });
```

## 4. Implementation in React

### Scroll Progress Bar

```tsx
function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left z-50"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
```

### Element Reveal on Scroll

```tsx
function ScrollReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: true, 
    margin: '-100px',
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

### Parallax Effect

```tsx
function ParallaxSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['-25%', '25%']);

  return (
    <div ref={ref} className="h-screen relative overflow-hidden">
      <motion.div
        style={{ y }}
        className="absolute inset-0 -top-[25%] -bottom-[25%]"
      >
        <img 
          src="/background.jpg" 
          className="w-full h-full object-cover"
          alt=""
        />
      </motion.div>
      <div className="relative z-10">
        Content
      </div>
    </div>
  );
}
```

### Scroll-Linked Opacity

```tsx
function FadeOnScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'start 0.3'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);

  return (
    <motion.div ref={ref} style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}
```

## 5. React Patterns to Use

### Sticky Section with Transform

```tsx
function StickyTransform() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div ref={containerRef} className="h-[300vh]">
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <motion.div
          style={{ scale, rotate, borderRadius }}
          className="w-48 h-48 bg-blue-500"
        />
      </div>
    </div>
  );
}
```

### Horizontal Scroll Section

```tsx
function HorizontalScroll({ items }: { items: Item[] }) {
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
    <div 
      ref={containerRef} 
      style={{ height: `${items.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          style={{ x }}
          className="flex h-full"
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              className="min-w-full h-full flex items-center justify-center"
            >
              {item.content}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
```

### Scroll Velocity Effects

```tsx
import { useScroll, useVelocity, useTransform, motion } from 'framer-motion';

function VelocityText() {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  const skewX = useTransform(scrollVelocity, [-2000, 0, 2000], [-10, 0, 10]);
  const scale = useTransform(scrollVelocity, [-2000, 0, 2000], [0.9, 1, 0.9]);

  return (
    <motion.h1 
      style={{ skewX, scale }}
      className="text-6xl font-bold"
    >
      Scroll Fast!
    </motion.h1>
  );
}
```

### whileInView Animation

```tsx
function WhileInViewSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      This animates when scrolled into view
    </motion.div>
  );
}
```

### Scroll Counter

```tsx
function ScrollCounter({ target }: { target: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'start 0.3'],
  });

  const count = useTransform(scrollYProgress, [0, 1], [0, target]);
  const rounded = useTransform(count, v => Math.round(v));

  return (
    <motion.div ref={ref} className="text-6xl font-bold tabular-nums">
      {rounded}
    </motion.div>
  );
}
```

## 6. Important Hooks

### useScroll Options

```tsx
const { scrollX, scrollY, scrollXProgress, scrollYProgress } = useScroll({
  // Track window scroll (default)
  
  // Or track container scroll
  container: containerRef,
  
  // Or track element visibility
  target: elementRef,
  
  // Custom offset for element tracking
  offset: ['start end', 'end start'],
  
  // Smooth the values
  smooth: 0.5,
});
```

### useSpring for Smooth Scroll Values

```tsx
function SmoothScrollProgress() {
  const { scrollYProgress } = useScroll();
  
  // Add spring physics for smoother progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left"
      style={{ scaleX: smoothProgress }}
    />
  );
}
```

### useMotionValueEvent

```tsx
import { useMotionValueEvent, useScroll } from 'framer-motion';

function ScrollDirection() {
  const { scrollY } = useScroll();
  const [direction, setDirection] = useState<'up' | 'down'>('down');

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious();
    setDirection(latest > previous ? 'down' : 'up');
  });

  return <div>Scrolling: {direction}</div>;
}
```

## 7. Animation Considerations

### Performance with useTransform

```tsx
// ✅ No re-renders - uses motion values
function PerformantScroll() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  
  return <motion.div style={{ y }} />;
}

// ❌ Re-renders on every scroll frame
function BadScroll() {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);
  
  return <div style={{ transform: `translateY(${-scrollY}px)` }} />;
}
```

### Reduced Motion

```tsx
function AccessibleScrollAnimation() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, prefersReducedMotion ? 0 : -200]
  );

  return <motion.div style={{ y }} />;
}
```

### Lazy Scroll Effects

```tsx
function LazyScrollSection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: '200px' });
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (isInView) setHasEntered(true);
  }, [isInView]);

  // Only create scroll effects after first view
  const { scrollYProgress } = useScroll({
    target: hasEntered ? ref : undefined,
  });

  return (
    <div ref={ref}>
      {hasEntered ? (
        <AnimatedContent progress={scrollYProgress} />
      ) : (
        <Placeholder />
      )}
    </div>
  );
}
```

## 8. Performance Considerations

### Avoid Layout Properties

```tsx
// ❌ Causes layout on every frame
style={{ marginTop: scrollY }}

// ✅ Uses transforms only
style={{ y: useTransform(scrollY, v => v * 0.5) }}
```

### Throttle Heavy Callbacks

```tsx
useMotionValueEvent(scrollY, 'change', (latest) => {
  // This runs every frame - keep it light
  updateLightweightState(latest);
  
  // Debounce heavy operations
  debouncedHeavyOperation(latest);
});
```

### Use will-change Sparingly

```tsx
// Only on elements that actually animate
<motion.div 
  style={{ y, willChange: 'transform' }}
>
  Parallax element
</motion.div>
```

## 9. Common Mistakes

### 1. Wrong Offset Values
**Problem:** Animation starts/ends at wrong scroll position.
**Solution:** Understand offset: ['element edge container edge', ...].

### 2. Too Many Scroll Listeners
**Problem:** Performance issues from multiple useScroll.
**Solution:** Share scroll context or use single useScroll.

### 3. Not Using MotionValues
**Problem:** Component re-renders on every scroll.
**Solution:** Use useTransform, not useState.

### 4. Ignoring Reduced Motion
**Problem:** Users get motion sickness.
**Solution:** Check useReducedMotion and simplify.

### 5. Scroll Jank
**Problem:** Animations stutter during scroll.
**Solution:** Only animate transform/opacity.

## 10. Practice Exercises

### Exercise 1: Reading Progress
Build a progress indicator for article reading.

### Exercise 2: Parallax Hero
Create multi-layer parallax with different speeds.

### Exercise 3: Scrollytelling
Build a storytelling page with sticky sections.

### Exercise 4: Reveal Timeline
Create a timeline that reveals events on scroll.

### Exercise 5: Gallery Reveal
Build an image gallery with staggered scroll reveal.

## 11. Advanced Topics

- **CSS Scroll-Driven Animations** — Browser-native alternative
- **Scroll Snap Integration** — Combining with CSS snap
- **Virtual Scrolling** — Scroll effects with virtualization
- **Overscroll Effects** — Custom bounce/pull-to-refresh
- **Scroll Direction Lock** — Preventing unwanted scroll
- **Scroll Restoration** — Maintaining position on navigation
