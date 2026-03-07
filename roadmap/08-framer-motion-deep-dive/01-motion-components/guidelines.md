# Motion Components

## 1. Concept Overview

Motion components are the foundation of Framer Motion. They're enhanced versions of HTML and SVG elements that can be animated declaratively. Any HTML element can become a motion component by prefixing with `motion.`:

```tsx
<motion.div>  // Animatable div
<motion.span> // Animatable span
<motion.svg>  // Animatable SVG
<motion.path> // Animatable SVG path
```

Motion components support animation props (`animate`, `initial`, `exit`), gesture props (`whileHover`, `whileTap`), and layout props (`layout`, `layoutId`).

## 2. Why This Matters for Design Engineers

Motion components enable:
- Declarative animation API
- Automatic GPU acceleration
- Spring physics out of the box
- Seamless gesture integration
- Layout animation handling

As a Design Engineer, you must:
- Understand motion component capabilities
- Know when to use motion vs. regular elements
- Optimize which elements become motion components
- Create custom motion components

## 3. Key Principles / Mental Models

### The Animation Lifecycle
```tsx
<motion.div
  initial={{ opacity: 0 }}    // Starting state
  animate={{ opacity: 1 }}    // Target state
  exit={{ opacity: 0 }}       // Exit state (requires AnimatePresence)
  transition={{ duration: 0.3 }}
/>
```

### Prop Hierarchy
Motion components accept:
1. **Animation props** — initial, animate, exit, transition
2. **Gesture props** — whileHover, whileTap, whileFocus, whileDrag
3. **Layout props** — layout, layoutId
4. **Scroll props** — whileInView, viewport
5. **Standard HTML props** — className, style, onClick, etc.

### Animatable Properties
- **Transform** — x, y, z, rotate, rotateX, scale, skew
- **CSS** — opacity, backgroundColor, borderRadius, boxShadow
- **SVG** — pathLength, strokeDasharray, fill
- **Layout** — width, height (via layout prop)

## 4. Implementation in React

### Basic Motion Component

```tsx
import { motion } from 'framer-motion';

function AnimatedBox() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="p-6 bg-blue-500 rounded-lg"
    >
      Hello, I'm animated!
    </motion.div>
  );
}
```

### Motion Component with State

```tsx
function ToggleAnimation() {
  const [isOn, setIsOn] = useState(false);

  return (
    <motion.button
      onClick={() => setIsOn(!isOn)}
      animate={{ 
        backgroundColor: isOn ? '#10b981' : '#6b7280',
        scale: isOn ? 1.05 : 1,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="px-6 py-3 rounded-lg text-white"
    >
      {isOn ? 'ON' : 'OFF'}
    </motion.button>
  );
}
```

### Custom Motion Component

```tsx
import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated';
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ variant = 'default', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          y: variant === 'elevated' ? -8 : -4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="p-6 bg-white rounded-xl shadow-lg"
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';
```

### Motion Component for SVG

```tsx
function AnimatedIcon() {
  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      initial="hidden"
      animate="visible"
    >
      <motion.path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="2"
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

### Wrapping Existing Components

```tsx
import { motion } from 'framer-motion';
import { Button } from './Button';

// Create motion version of existing component
const MotionButton = motion(Button);

function AnimatedButton() {
  return (
    <MotionButton
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Click me
    </MotionButton>
  );
}
```

### Motion Config for Global Defaults

```tsx
import { MotionConfig } from 'framer-motion';

function App() {
  return (
    <MotionConfig
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      reducedMotion="user" // Respect OS preference
    >
      {/* All motion components use these defaults */}
      <motion.div animate={{ x: 100 }}>Uses spring</motion.div>
    </MotionConfig>
  );
}
```

### LazyMotion for Bundle Size

```tsx
import { LazyMotion, domAnimation, m } from 'framer-motion';

// Only load animation features you need
function App() {
  return (
    <LazyMotion features={domAnimation}>
      {/* Use `m` instead of `motion` */}
      <m.div animate={{ opacity: 1 }} />
    </LazyMotion>
  );
}

// For full features including layout animations:
// import { domMax } from 'framer-motion'
// <LazyMotion features={domMax}>
```

### Motion Value as Prop

```tsx
function ProgressBar({ progress }: { progress: MotionValue<number> }) {
  const width = useTransform(progress, [0, 1], ['0%', '100%']);

  return (
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-blue-500"
        style={{ width }}
      />
    </div>
  );
}
```

## 6. Important Hooks

### useAnimation

```tsx
import { motion, useAnimation } from 'framer-motion';

function ControlledAnimation() {
  const controls = useAnimation();

  const handleStart = async () => {
    await controls.start({ x: 100, transition: { duration: 0.5 } });
    await controls.start({ y: 100 });
    await controls.start({ rotate: 180 });
  };

  return (
    <>
      <button onClick={handleStart}>Animate</button>
      <motion.div
        animate={controls}
        className="w-20 h-20 bg-blue-500 rounded-lg"
      />
    </>
  );
}
```

### useMotionValue and useTransform

```tsx
function TransformExample() {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
  const scale = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  const rotate = useTransform(x, [-200, 200], [-90, 90]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      style={{ x, opacity, scale, rotate }}
      className="w-20 h-20 bg-blue-500 rounded-lg cursor-grab"
    />
  );
}
```

## 7. Animation Considerations

### Keyframes

```tsx
function KeyframeAnimation() {
  return (
    <motion.div
      animate={{
        x: [0, 100, 100, 0, 0],
        y: [0, 0, 100, 100, 0],
        rotate: [0, 90, 180, 270, 360],
      }}
      transition={{
        duration: 4,
        times: [0, 0.25, 0.5, 0.75, 1],
        repeat: Infinity,
        ease: 'linear',
      }}
      className="w-16 h-16 bg-blue-500 rounded-lg"
    />
  );
}
```

### Repeat and Loop

```tsx
function LoopingAnimation() {
  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse', // or 'loop' or 'mirror'
        ease: 'easeInOut',
      }}
      className="w-16 h-16 bg-blue-500 rounded-full"
    />
  );
}
```

### Dynamic Animation Values

```tsx
function DynamicAnimation({ count }: { count: number }) {
  return (
    <motion.div
      // Animate whenever count changes
      animate={{ 
        x: count * 50,
        backgroundColor: count > 5 ? '#ef4444' : '#3b82f6',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      Count: {count}
    </motion.div>
  );
}
```

## 8. Performance Considerations

### Avoid Re-creating Animation Objects

```tsx
// ❌ New object every render
<motion.div animate={{ x: 100, y: 100 }} />

// ✅ Stable reference
const animation = { x: 100, y: 100 };
// or useMemo for dynamic values
const animation = useMemo(() => ({ x: value * 10 }), [value]);

<motion.div animate={animation} />
```

### Use transformTemplate for Complex Transforms

```tsx
function CustomTransform() {
  return (
    <motion.div
      style={{ x: 100, rotateY: 45 }}
      transformTemplate={({ x, rotateY }) => 
        `perspective(500px) translateX(${x}) rotateY(${rotateY})`
      }
    />
  );
}
```

### Layout="position" for Text Elements

```tsx
// ❌ Text might distort during layout animation
<motion.p layout>Text content</motion.p>

// ✅ Only animate position, not size
<motion.p layout="position">Text content</motion.p>
```

## 9. Common Mistakes

### 1. Animating Non-Animatable Properties
**Problem:** Trying to animate display, position, etc.
**Solution:** Use opacity/scale/translate for show/hide.

### 2. Missing Initial State
**Problem:** Animation flashes on mount.
**Solution:** Always set initial matching the starting state.

### 3. Over-Animating
**Problem:** Every element has motion props.
**Solution:** Only use motion on elements that need animation.

### 4. Conflicting Animations
**Problem:** animate and whileHover fight each other.
**Solution:** Understand animation priority and use variants.

### 5. Not Handling Reduced Motion
**Problem:** Animations ignore user preferences.
**Solution:** Use MotionConfig reducedMotion="user".

## 10. Practice Exercises

### Exercise 1: Animated Counter
Build a counter with number that animates when changing.

### Exercise 2: Loading States
Create a component with multiple loading animation states.

### Exercise 3: Toggle Switch
Build a toggle switch with smooth animations.

### Exercise 4: Animated Avatar
Create an avatar with presence indicator animation.

### Exercise 5: Motion Card Grid
Build a grid of cards with coordinated animations.

## 11. Advanced Topics

- **Custom Transitions** — Creating reusable transition presets
- **Motion Values Network** — Connecting multiple motion values
- **3D Transforms** — Perspective and rotateX/Y/Z
- **SVG Animation** — Path morphing and drawing
- **Dynamic Variants** — Variants based on props
- **Animation Events** — onAnimationStart, onAnimationComplete
