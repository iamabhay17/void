# Motion Values

## 1. Concept Overview

Motion values are Framer Motion's reactive animation primitives. Unlike React state, motion values update without causing component re-renders, making them perfect for high-frequency updates like gestures and scroll animations.

Key characteristics:
- **No re-renders** — Updates happen outside React's render cycle
- **Subscribable** — Listen for changes with callbacks
- **Composable** — Transform and derive new values
- **Animatable** — Can be animated with spring physics

```tsx
const x = useMotionValue(0);
const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
```

## 2. Why This Matters for Design Engineers

Motion values enable:
- Smooth gesture-driven animations
- Complex scroll effects
- Physics-based interactions
- Dynamic style interpolation

As a Design Engineer, you must:
- Know when to use motion values vs. state
- Master useTransform for derived values
- Understand spring physics
- Build composable animation systems

## 3. Key Principles / Mental Models

### Motion Values vs. React State
| Motion Values | React State |
|---------------|-------------|
| No re-renders | Triggers re-render |
| Direct DOM update | Virtual DOM reconciliation |
| Ideal for animation | Ideal for UI logic |
| Imperative updates | Declarative |

### The Transform Pipeline
```tsx
// Source value
const x = useMotionValue(0);

// Derived values (computed from source)
const scale = useTransform(x, [0, 100], [1, 2]);
const rotate = useTransform(x, [0, 100], [0, 180]);

// Further derivation (chained)
const opacity = useTransform(scale, [1, 2], [1, 0]);
```

### Value Subscription
```tsx
x.get()        // Get current value
x.set(100)     // Set new value
x.on('change', v => ...) // Subscribe to changes
```

## 4. Implementation in React

### Basic Motion Value

```tsx
import { motion, useMotionValue } from 'framer-motion';

function DraggableBox() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  return (
    <motion.div
      drag
      style={{ x, y }}
      className="w-24 h-24 bg-blue-500 rounded-lg cursor-grab"
    />
  );
}
```

### Transform for Derived Values

```tsx
import { useMotionValue, useTransform, motion } from 'framer-motion';

function TransformExample() {
  const x = useMotionValue(0);
  
  // Map x position to other properties
  const rotate = useTransform(x, [-200, 0, 200], [-45, 0, 45]);
  const scale = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  const backgroundColor = useTransform(
    x,
    [-200, 0, 200],
    ['#ef4444', '#3b82f6', '#22c55e']
  );

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      style={{ x, rotate, scale, backgroundColor }}
      className="w-24 h-24 rounded-lg cursor-grab"
    />
  );
}
```

### Spring Animation

```tsx
import { useMotionValue, useSpring, motion } from 'framer-motion';

function SpringFollower() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Springy followers
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    x.set(e.clientX - 50);
    y.set(e.clientY - 50);
  };

  return (
    <div onMouseMove={handleMouseMove} className="w-full h-screen">
      {/* Instant follower */}
      <motion.div
        style={{ x, y }}
        className="fixed w-4 h-4 bg-blue-500 rounded-full pointer-events-none"
      />
      {/* Spring follower */}
      <motion.div
        style={{ x: springX, y: springY }}
        className="fixed w-24 h-24 bg-blue-500/20 rounded-full pointer-events-none"
      />
    </div>
  );
}
```

### Multiple Input Transform

```tsx
function MultiInputTransform() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Combine multiple motion values
  const distance = useTransform([x, y], ([latestX, latestY]: number[]) => {
    return Math.sqrt(latestX ** 2 + latestY ** 2);
  });

  const scale = useTransform(distance, [0, 200], [1, 0.5]);
  const opacity = useTransform(distance, [0, 200], [1, 0]);

  return (
    <motion.div
      drag
      dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
      style={{ x, y, scale, opacity }}
      className="w-24 h-24 bg-blue-500 rounded-lg cursor-grab"
    />
  );
}
```

## 5. React Patterns to Use

### Motion Value Context

```tsx
const MotionValueContext = createContext<{
  x: MotionValue<number>;
  progress: MotionValue<number>;
} | null>(null);

function MotionValueProvider({ children }: { children: ReactNode }) {
  const x = useMotionValue(0);
  const progress = useTransform(x, [-200, 200], [0, 1]);

  return (
    <MotionValueContext.Provider value={{ x, progress }}>
      {children}
    </MotionValueContext.Provider>
  );
}

function ChildComponent() {
  const context = useContext(MotionValueContext);
  if (!context) throw new Error('Missing provider');

  const { progress } = context;
  const opacity = useTransform(progress, [0, 0.5, 1], [0, 1, 0]);

  return <motion.div style={{ opacity }}>Linked to parent motion</motion.div>;
}
```

### Animate Motion Value

```tsx
import { useMotionValue, animate } from 'framer-motion';

function AnimateValue() {
  const x = useMotionValue(0);

  const handleClick = () => {
    animate(x, 200, {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      onComplete: () => {
        animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 });
      },
    });
  };

  return (
    <motion.div
      style={{ x }}
      onClick={handleClick}
      className="w-24 h-24 bg-blue-500 rounded-lg cursor-pointer"
    />
  );
}
```

### Motion Value with useMotionValueEvent

```tsx
import { useMotionValue, useMotionValueEvent } from 'framer-motion';

function MotionValueLogger() {
  const x = useMotionValue(0);

  useMotionValueEvent(x, 'change', (latest) => {
    console.log('x changed to', latest);
  });

  useMotionValueEvent(x, 'animationStart', () => {
    console.log('Animation started');
  });

  useMotionValueEvent(x, 'animationComplete', () => {
    console.log('Animation completed');
  });

  return (
    <motion.div
      drag="x"
      style={{ x }}
      className="w-24 h-24 bg-blue-500 rounded-lg cursor-grab"
    />
  );
}
```

### Custom Transform Functions

```tsx
function CustomTransform() {
  const x = useMotionValue(0);

  // Custom easing function
  const eased = useTransform(x, (v) => {
    const t = (v + 200) / 400; // Normalize to 0-1
    return t * t * (3 - 2 * t) * 400 - 200; // Smoothstep
  });

  // Mathematical transforms
  const sine = useTransform(x, (v) => Math.sin(v * 0.05) * 50);
  const cosine = useTransform(x, (v) => Math.cos(v * 0.05) * 50);

  return (
    <div className="relative h-64">
      <motion.div
        drag="x"
        style={{ x }}
        className="absolute w-8 h-8 bg-blue-500 rounded-full cursor-grab"
      />
      <motion.div
        style={{ x: eased }}
        className="absolute top-20 w-8 h-8 bg-green-500 rounded-full"
      />
      <motion.div
        style={{ x: sine, y: cosine }}
        className="absolute top-40 w-8 h-8 bg-red-500 rounded-full"
      />
    </div>
  );
}
```

## 6. Important Hooks

### useVelocity

```tsx
import { useMotionValue, useVelocity } from 'framer-motion';

function VelocityEffect() {
  const x = useMotionValue(0);
  const xVelocity = useVelocity(x);
  
  const skew = useTransform(xVelocity, [-2000, 0, 2000], [-15, 0, 15]);

  return (
    <motion.div
      drag="x"
      style={{ x, skewX: skew }}
      className="w-32 h-32 bg-blue-500 rounded-lg cursor-grab"
    />
  );
}
```

### useScroll with Motion Values

```tsx
function ScrollMotionValues() {
  const { scrollY, scrollYProgress } = useScroll();
  
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const y = useTransform(scrollY, [0, 500], [0, -200]);

  return (
    <motion.div style={{ opacity, scale, y }} className="fixed top-10 left-10">
      Scroll-linked element
    </motion.div>
  );
}
```

### useMotionTemplate

```tsx
import { useMotionValue, useMotionTemplate, motion } from 'framer-motion';

function GradientPosition() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const background = useMotionTemplate`
    radial-gradient(
      600px circle at ${mouseX}px ${mouseY}px,
      rgba(59, 130, 246, 0.15),
      transparent 80%
    )
  `;

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      style={{ background }}
      className="w-full h-screen"
    />
  );
}
```

## 7. Animation Considerations

### Clamp Values

```tsx
function ClampedValue() {
  const x = useMotionValue(0);
  
  // Clamp output to range
  const clamped = useTransform(x, (v) => Math.max(-100, Math.min(100, v)));
  
  // Or use input/output mapping
  const mapped = useTransform(
    x,
    [-200, -100, 100, 200],
    [-100, -100, 100, 100] // Clamped outputs
  );

  return <motion.div style={{ x: clamped }} />;
}
```

### Smooth Value Changes

```tsx
function SmoothValue() {
  const rawValue = useMotionValue(0);
  
  // Apply spring for smooth interpolation
  const smoothValue = useSpring(rawValue, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return <motion.div style={{ x: smoothValue }} />;
}
```

### Chained Transforms

```tsx
function ChainedTransforms() {
  const progress = useMotionValue(0);
  
  // Chain of transformations
  const scaled = useTransform(progress, [0, 1], [0, 100]);
  const eased = useTransform(scaled, (v) => v * v / 100); // Quadratic ease
  const final = useTransform(eased, [0, 100], [0, 360]); // To degrees

  return (
    <motion.div style={{ rotate: final }}>
      Chained transform
    </motion.div>
  );
}
```

## 8. Performance Considerations

### Avoid Re-creating Motion Values

```tsx
// ❌ Creates new motion value every render
function Bad() {
  const x = useMotionValue(0); // This is fine
  const derived = useTransform(x, v => v * 2); // Also fine
  
  // But don't create inline functions that change
  const bad = useTransform(x, createExpensiveMapper()); // ❌
}

// ✅ Memoize complex mappers
function Good() {
  const x = useMotionValue(0);
  const mapper = useMemo(() => createExpensiveMapper(), []);
  const derived = useTransform(x, mapper);
}
```

### Limit Subscribers

```tsx
// ❌ Many components subscribing
function Parent() {
  const x = useMotionValue(0);
  
  return (
    <>
      {items.map(item => (
        <Child key={item.id} x={x} /> // Each creates subscription
      ))}
    </>
  );
}

// ✅ Single transform, pass down
function BetterParent() {
  const x = useMotionValue(0);
  const transforms = useMemo(() => 
    items.map((_, i) => useTransform(x, v => v + i * 10)),
    [items, x]
  );
  
  return (
    <>
      {items.map((item, i) => (
        <Child key={item.id} value={transforms[i]} />
      ))}
    </>
  );
}
```

## 9. Common Mistakes

### 1. Using Motion Values for UI State
**Problem:** Motion value changes don't trigger re-renders.
**Solution:** Use React state for UI logic, motion values for animation.

### 2. Reading Motion Values in Render
**Problem:** `.get()` returns stale value during animation.
**Solution:** Use useMotionValueEvent or useTransform.

### 3. Creating Motion Values Conditionally
**Problem:** Hooks rules violation.
**Solution:** Always create motion values at top level.

### 4. Not Disposing Subscriptions
**Problem:** Memory leaks from manual subscriptions.
**Solution:** Use useMotionValueEvent or return cleanup.

### 5. Complex Transforms in Render
**Problem:** Expensive computation every frame.
**Solution:** Memoize transform functions.

## 10. Practice Exercises

### Exercise 1: Cursor Trail
Create a trail of elements following the cursor with delay.

### Exercise 2: 3D Card
Build a card that rotates based on cursor position.

### Exercise 3: Audio Visualizer
Create bars that respond to motion values (simulate audio data).

### Exercise 4: Elastic Drag
Build a draggable with elastic overshoot effect.

### Exercise 5: Connected Elements
Create multiple elements whose animations are mathematically linked.

## 11. Advanced Topics

- **useMotionValueEvent** — Event-based subscriptions
- **Motion Value Interpolation** — Custom easing functions
- **Velocity Tracking** — Physics-based effects
- **Template Strings** — Complex CSS value composition
- **Motion Value Sync** — Keeping values in sync
- **Performance Profiling** — Measuring motion value impact
