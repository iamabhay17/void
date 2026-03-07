# Scroll-Linked Animations

## 1. Concept Overview

Scroll-linked animations tie visual changes directly to scroll position, creating dynamic, engaging experiences. Unlike scroll-triggered animations (which start when visible), scroll-linked animations continuously update based on scroll progress.

Key types:
- **Parallax** — Elements move at different rates
- **Progress indicators** — Track reading position
- **Reveal effects** — Content fades/slides based on position
- **Sticky transformations** — Elements change while stuck
- **Horizontal scroll** — Scroll down to move sideways

Framer Motion's `useScroll` hook makes scroll-linked animations declarative and performant.

## 2. Why This Matters for Design Engineers

Scroll-linked animations create immersive storytelling:
- Marketing pages that unfold narratives
- Data visualizations that build progressively
- Product showcases with cinematic reveals
- Reading experiences with context indicators

As a Design Engineer, you must:
- Choose appropriate scroll effects for content
- Ensure smooth 60fps performance
- Respect reduced motion preferences
- Handle edge cases (fast scroll, reverse scroll)

## 3. Key Principles / Mental Models

### Scroll Progress
```tsx
// Window scroll: 0 at top, 1 at bottom
const { scrollYProgress } = useScroll();

// Element scroll: 0 when enters viewport, 1 when exits
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ['start end', 'end start'],
});
```

### Offset Configuration
```
offset: ['start end', 'end start']
          │      │       │    │
          │      │       │    └── relative to container (viewport)
          │      │       └────── animation end point
          │      └────────────── relative to container (viewport)
          └───────────────────── animation start point

'start end' = element's start reaches container's end
'end start' = element's end reaches container's start
```

### Transform Mapping
```tsx
// Map scroll progress (0-1) to visual values
const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
```

## 4. Implementation in React

### Basic Scroll Progress

```tsx
import { useScroll, motion } from 'framer-motion';

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

### Parallax Effect

```tsx
function ParallaxSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <div ref={ref} className="h-screen relative overflow-hidden">
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 bg-gradient-to-b from-blue-500 to-purple-600"
      />
      <motion.div
        style={{ y: textY, opacity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <h1 className="text-6xl text-white font-bold">Scroll Down</h1>
      </motion.div>
    </div>
  );
}
```

### Element Reveal on Scroll

```tsx
function ScrollReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'start 0.3'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

  return (
    <motion.div ref={ref} style={{ opacity, y, scale }}>
      {children}
    </motion.div>
  );
}
```

### Sticky with Transformation

```tsx
function StickyTransform() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div ref={containerRef} className="h-[300vh] relative">
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <motion.div
          style={{ scale, rotate, borderRadius }}
          className="w-64 h-64 bg-blue-500"
        />
      </div>
    </div>
  );
}
```

## 5. React Patterns to Use

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
    <div ref={containerRef} style={{ height: `${items.length * 100}vh` }}>
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
              <h2 className="text-4xl">{item.title}</h2>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
```

### Scroll-Linked Counter

```tsx
function ScrollCounter({ target }: { target: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'start 0.3'],
  });

  const count = useTransform(scrollYProgress, [0, 1], [0, target]);
  const rounded = useTransform(count, (v) => Math.round(v));

  return (
    <motion.div ref={ref} className="text-6xl font-bold tabular-nums">
      {rounded}
    </motion.div>
  );
}
```

### Multi-Layer Parallax

```tsx
function MultiLayerParallax() {
  const { scrollY } = useScroll();

  const layer1Y = useTransform(scrollY, [0, 1000], [0, -100]);
  const layer2Y = useTransform(scrollY, [0, 1000], [0, -200]);
  const layer3Y = useTransform(scrollY, [0, 1000], [0, -300]);

  return (
    <div className="h-[200vh] relative overflow-hidden">
      <motion.div
        style={{ y: layer3Y }}
        className="absolute inset-0 bg-[url('/mountains-back.png')] bg-cover"
      />
      <motion.div
        style={{ y: layer2Y }}
        className="absolute inset-0 bg-[url('/mountains-mid.png')] bg-cover"
      />
      <motion.div
        style={{ y: layer1Y }}
        className="absolute inset-0 bg-[url('/mountains-front.png')] bg-cover"
      />
    </div>
  );
}
```

### Scroll-Driven Text Reveal

```tsx
function TextReveal({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.25'],
  });

  const words = text.split(' ');

  return (
    <p ref={ref} className="text-4xl leading-relaxed">
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
}

function Word({ 
  children, 
  progress, 
  range 
}: { 
  children: string; 
  progress: MotionValue<number>; 
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  
  return (
    <motion.span style={{ opacity }} className="inline-block mr-2">
      {children}
    </motion.span>
  );
}
```

## 6. Important Hooks

### useScrollVelocity

```tsx
import { useScroll, useVelocity, useTransform, motion } from 'framer-motion';

function VelocitySkew() {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const skewX = useTransform(scrollVelocity, [-2000, 0, 2000], [10, 0, -10]);

  return (
    <motion.div style={{ skewX }}>
      This skews based on scroll speed
    </motion.div>
  );
}
```

### useScrollWithContainer

```tsx
function ScrollableContainer({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  return (
    <div ref={containerRef} className="h-96 overflow-y-auto">
      <motion.div
        className="fixed top-0 right-4 w-1 h-20 bg-blue-500"
        style={{ scaleY: scrollYProgress }}
      />
      {children}
    </div>
  );
}
```

### useSpring for Smooth Scroll Values

```tsx
function SmoothScrollProgress() {
  const { scrollYProgress } = useScroll();
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

## 7. Animation Considerations

### Performance with useTransform

```tsx
// ✅ No re-renders, GPU-accelerated
function PerformantParallax() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -150]);

  return <motion.div style={{ y }}>No re-renders!</motion.div>;
}

// ❌ Re-renders on every scroll frame
function BadParallax() {
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => setOffset(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <div style={{ transform: `translateY(${-offset * 0.3}px)` }} />;
}
```

### Responsive Scroll Values

```tsx
function ResponsiveParallax() {
  const { scrollY } = useScroll();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Less parallax on mobile for performance
  const y = useTransform(
    scrollY,
    [0, 500],
    [0, isMobile ? -50 : -150]
  );

  return <motion.div style={{ y }}>Responsive parallax</motion.div>;
}
```

### Scroll Snap Integration

```tsx
function ScrollSnapSection({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen snap-start snap-always">
      {children}
    </div>
  );
}

function ScrollSnapContainer({ sections }: { sections: ReactNode[] }) {
  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory">
      {sections.map((section, i) => (
        <ScrollSnapSection key={i}>{section}</ScrollSnapSection>
      ))}
    </div>
  );
}
```

## 8. Performance Considerations

### Avoid Layout Properties

```tsx
// ❌ Triggers layout on every frame
style={{ marginTop: scrollY * 0.5 }}

// ✅ Transform only - GPU accelerated
style={{ y: useTransform(scrollY, v => v * 0.5) }}
```

### Throttle Complex Calculations

```tsx
function ComplexScrollEffect() {
  const { scrollYProgress } = useScroll();
  
  // useTransform handles this efficiently
  const complexValue = useTransform(scrollYProgress, (progress) => {
    // Complex calculations are fine here
    return Math.sin(progress * Math.PI) * 100;
  });

  return <motion.div style={{ x: complexValue }} />;
}
```

### Lazy Load Sections

```tsx
function LazySection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: '200px' });

  return (
    <div ref={ref}>
      {isInView ? children : <div className="h-screen" />}
    </div>
  );
}
```

## 9. Common Mistakes

### 1. Too Many Scroll Listeners
**Problem:** Multiple useScroll hooks cause performance issues.
**Solution:** Share scroll values via context.

### 2. Not Using MotionValues
**Problem:** Using state for scroll position causes re-renders.
**Solution:** Use useTransform for derived values.

### 3. Ignoring Reduced Motion
**Problem:** Parallax causes motion sickness.
**Solution:** Disable or simplify with useReducedMotion.

### 4. Wrong Offset Configuration
**Problem:** Animation starts/ends at wrong scroll position.
**Solution:** Understand offset values: ['start end', 'end start'].

### 5. Layout Shift During Scroll
**Problem:** Elements jump when entering/exiting sticky.
**Solution:** Use proper heights and positioning.

## 10. Practice Exercises

### Exercise 1: Reading Progress
Build a progress bar that tracks article reading progress.

### Exercise 2: Parallax Hero
Create a multi-layer parallax hero section.

### Exercise 3: Product Showcase
Build a product page where features reveal as you scroll.

### Exercise 4: Timeline
Create a vertical timeline that animates as sections come into view.

### Exercise 5: Sticky Story
Build a "scrollytelling" experience with sticky content that transforms.

## 11. Advanced Topics

- **CSS Scroll-Driven Animations** — Native browser support
- **Scroll Snapping Integration** — Combining with CSS snap
- **Virtual Scrolling** — Scroll effects with virtualized lists
- **Scroll Restoration** — Maintaining position on navigation
- **Scroll Jacking** — When and how to control scroll (carefully)
- **3D Scroll Effects** — Perspective and depth during scroll
