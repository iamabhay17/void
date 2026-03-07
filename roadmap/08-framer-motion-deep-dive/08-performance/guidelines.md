# Performance Optimization

## 1. Concept Overview

Performance optimization in Framer Motion ensures animations run at 60fps without causing jank, excessive memory usage, or battery drain. Understanding what makes animations performant—and what causes issues—is essential for production-quality interfaces.

Key areas:
- GPU-accelerated properties
- Avoiding layout triggers
- Motion value efficiency
- Bundle size optimization
- Memory management

## 2. Why This Matters for Design Engineers

Performance directly impacts user experience:
- 60fps feels smooth; 30fps feels janky
- Battery drain frustrates mobile users
- Memory leaks crash apps
- Large bundles slow initial load

As a Design Engineer, you must:
- Know which properties are cheap to animate
- Profile and measure animation performance
- Make informed tradeoffs
- Build performant patterns by default

## 3. Key Principles / Mental Models

### The Animation Performance Hierarchy
1. **Compositor properties** (Best) — opacity, transform
2. **Paint properties** — color, background, shadows
3. **Layout properties** (Worst) — width, height, position

### GPU vs. Main Thread
```
GPU (Compositor):  opacity, transform (translate, scale, rotate)
Main Thread:       everything else

GPU animations don't block JavaScript
Main thread animations can cause jank
```

### The Cost Equation
```
Cost = (Number of elements) × (Property cost) × (Frequency of change)
```

## 4. Implementation in React

### Use Transform Properties

```tsx
// ✅ GPU-accelerated
<motion.div
  animate={{ 
    x: 100,       // translateX
    y: 50,        // translateY
    scale: 1.2,
    rotate: 45,
    opacity: 0.8,
  }}
/>

// ❌ Triggers layout
<motion.div
  animate={{ 
    width: '200px',
    height: '150px',
    marginTop: 20,
    left: 100,
  }}
/>
```

### Layout Animations Done Right

```tsx
// ❌ Animating width/height directly
<motion.div
  animate={{ width: isOpen ? 300 : 100 }}
>
  Content
</motion.div>

// ✅ Using layout prop (Framer handles transform magic)
<motion.div layout className={isOpen ? 'w-[300px]' : 'w-[100px]'}>
  Content
</motion.div>

// ✅ Using scale for collapse effects
<motion.div
  animate={{ scaleY: isOpen ? 1 : 0 }}
  style={{ originY: 0 }}
>
  Content
</motion.div>
```

### Efficient Exit Animations

```tsx
// ✅ Transform-based exit
<AnimatePresence>
  {isVisible && (
    <motion.div
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0"
    />
  )}
</AnimatePresence>

// ❌ Layout-triggering exit
<motion.div
  exit={{ height: 0, padding: 0 }}
/>
```

### LazyMotion for Bundle Size

```tsx
import { LazyMotion, domAnimation, m } from 'framer-motion';

// Load only animation features (~17KB vs ~28KB)
function App() {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Smaller bundle!
      </m.div>
    </LazyMotion>
  );
}

// For full features (layout animations, etc.)
import { domMax } from 'framer-motion';
<LazyMotion features={domMax}>
```

## 5. React Patterns to Use

### Motion Value Over State

```tsx
// ❌ Re-renders on every scroll frame
function BadScrollEffect() {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return <div style={{ transform: `translateY(${-scrollY * 0.5}px)` }} />;
}

// ✅ No re-renders
function GoodScrollEffect() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, v => -v * 0.5);

  return <motion.div style={{ y }} />;
}
```

### Memoize Variants

```tsx
// ❌ New object every render
function BadComponent() {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }}
    />
  );
}

// ✅ Stable reference
const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

function GoodComponent() {
  return <motion.div variants={variants} />;
}

// ✅ For dynamic variants
function DynamicComponent({ scale }: { scale: number }) {
  const variants = useMemo(() => ({
    active: { scale },
  }), [scale]);

  return <motion.div variants={variants} />;
}
```

### Limit Animated Elements

```tsx
// ❌ All 100 items animate
function BadList({ items }: { items: Item[] }) {
  return items.map(item => (
    <motion.div
      key={item.id}
      layout
      whileHover={{ scale: 1.05 }}
    >
      {item.content}
    </motion.div>
  ));
}

// ✅ Only visible items animate
function GoodList({ items }: { items: Item[] }) {
  const visibleItems = useVisibleItems(items);
  
  return items.map(item => {
    const isVisible = visibleItems.includes(item.id);
    
    return (
      <motion.div
        key={item.id}
        layout={isVisible}
        whileHover={isVisible ? { scale: 1.05 } : undefined}
      >
        {item.content}
      </motion.div>
    );
  });
}
```

### Disable Animations When Appropriate

```tsx
function ConditionalAnimation({ 
  isInteractive,
  children 
}: { 
  isInteractive: boolean;
  children: ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = isInteractive && !prefersReducedMotion;

  return (
    <motion.div
      whileHover={shouldAnimate ? { scale: 1.05 } : undefined}
      whileTap={shouldAnimate ? { scale: 0.95 } : undefined}
      transition={shouldAnimate ? undefined : { duration: 0 }}
    >
      {children}
    </motion.div>
  );
}
```

## 6. Important Techniques

### will-change Optimization

```tsx
// Framer Motion handles this automatically for animating elements
// But for manual cases:

function ManualWillChange() {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <motion.div
      style={{ 
        willChange: isAnimating ? 'transform, opacity' : 'auto' 
      }}
      onAnimationStart={() => setIsAnimating(true)}
      onAnimationComplete={() => setIsAnimating(false)}
    />
  );
}
```

### Layout Animation Optimization

```tsx
// ✅ Use layout="position" for text
<motion.p layout="position">
  Text won't distort
</motion.p>

// ✅ Limit layout scope
<LayoutGroup>
  {/* Only elements in same group coordinate */}
  <motion.div layout />
</LayoutGroup>

// ✅ Use layoutDependency to prevent unnecessary recalculation
<motion.div 
  layout 
  layoutDependency={items.length}
/>
```

### Throttle Expensive Operations

```tsx
function ThrottledEffect() {
  const { scrollY } = useScroll();
  
  // ❌ Runs every frame
  useMotionValueEvent(scrollY, 'change', (latest) => {
    expensiveOperation(latest);
  });
  
  // ✅ Throttled
  const throttledOperation = useThrottledCallback(
    (value: number) => expensiveOperation(value),
    100
  );
  
  useMotionValueEvent(scrollY, 'change', throttledOperation);
}
```

## 7. Animation Considerations

### Spring Configuration for Performance

```tsx
// Faster springs complete sooner
const snappySpring = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};

// Slower springs run longer
const floatySpring = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
};

// restDelta controls when animation "finishes"
const efficientSpring = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  restDelta: 0.01, // Finish sooner (default: 0.01)
};
```

### Reduce Motion Complexity

```tsx
function ResponsiveAnimation() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const prefersReducedMotion = useReducedMotion();

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        // Simpler animation on mobile
        duration: isMobile ? 0.2 : 0.4,
        // Instant for reduced motion
        ...(prefersReducedMotion && { duration: 0.01 }),
      },
    },
  };

  return <motion.div variants={variants} />;
}
```

## 8. Performance Measurement

### Chrome DevTools

```tsx
// 1. Open DevTools → Performance
// 2. Record while animating
// 3. Look for:
//    - Long tasks (red triangles)
//    - Frame drops below 60fps
//    - Layout thrashing

// Enable "Show FPS meter" in DevTools Rendering tab
```

### React DevTools Profiler

```tsx
// 1. Open React DevTools → Profiler
// 2. Record interaction
// 3. Check for:
//    - Components re-rendering during animation
//    - Long render times

// Wrap with Profiler for specific measurement
<Profiler id="AnimatedList" onRender={onRenderCallback}>
  <AnimatedList items={items} />
</Profiler>
```

### Custom Performance Hook

```tsx
function useAnimationPerformance(name: string) {
  const frameCount = useRef(0);
  const startTime = useRef(0);

  const start = () => {
    frameCount.current = 0;
    startTime.current = performance.now();
  };

  const tick = () => {
    frameCount.current++;
  };

  const end = () => {
    const duration = performance.now() - startTime.current;
    const fps = (frameCount.current / duration) * 1000;
    console.log(`${name}: ${fps.toFixed(1)} fps over ${duration.toFixed(0)}ms`);
  };

  return { start, tick, end };
}
```

## 9. Common Mistakes

### 1. Animating Layout Properties
**Problem:** Animating width, height, margin triggers layout.
**Solution:** Use transform or layout prop.

### 2. Too Many Motion Components
**Problem:** Every element has motion props.
**Solution:** Only animate elements that need it.

### 3. Re-creating Variants
**Problem:** Inline variant objects cause re-renders.
**Solution:** Define variants outside component or memoize.

### 4. Heavy Scroll Handlers
**Problem:** Complex logic on every scroll frame.
**Solution:** Use motion values and useTransform.

### 5. Forgetting Reduced Motion
**Problem:** Animations run despite user preference.
**Solution:** Always check useReducedMotion.

## 10. Practice Exercises

### Exercise 1: Profile and Fix
Take a janky animation and optimize it to 60fps.

### Exercise 2: Bundle Analysis
Reduce Framer Motion bundle impact with LazyMotion.

### Exercise 3: List Optimization
Create a 1000-item list with smooth scroll and hover animations.

### Exercise 4: Mobile Optimization
Build animations that perform well on mobile devices.

### Exercise 5: Memory Leak Hunt
Find and fix memory leaks in animation code.

## 11. Advanced Topics

- **Hardware Acceleration** — Understanding GPU layers
- **Main Thread Work** — Minimizing JavaScript during animation
- **Memory Profiling** — Finding animation memory leaks
- **Battery Impact** — Reducing animation energy usage
- **Code Splitting** — Loading animations on demand
- **Server Components** — Animation with React Server Components
