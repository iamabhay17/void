# useReducedMotion

## 1. Concept Overview

`useReducedMotion` detects when users have enabled "Reduce Motion" in their operating system settings. This accessibility preference should disable or simplify animations for users who experience motion sickness, vestibular disorders, or simply prefer less movement.

The `prefers-reduced-motion` media query:
```css
@media (prefers-reduced-motion: reduce) {
  /* Simplified or no animations */
}
```

In React, we use a hook to access this preference and adapt our animations accordingly.

## 2. Why This Matters for Design Engineers

Motion accessibility is not optional:
- ~35% of adults experience vestibular disorders
- Parallax, zooming, and spinning cause physical discomfort
- Legal requirements (WCAG 2.1 AA)
- Ethical responsibility

As a Design Engineer, you must:
- Detect and respect user preferences
- Provide meaningful alternatives to motion
- Never remove essential functionality
- Test with reduced motion enabled

## 3. Key Principles / Mental Models

### What to Reduce vs. Remove
**Remove:**
- Parallax effects
- Auto-playing animations
- Zooming/scaling transitions
- Spinning/rotating elements

**Simplify:**
- Fade instead of slide
- Instant instead of animated
- Reduce duration significantly

**Keep:**
- Essential state feedback (loading spinners)
- User-initiated interactions (with reduced motion)
- Static visual indicators

### The Alternative, Not Absence
Reduced motion ≠ no motion. Provide alternatives:
```tsx
// Full motion: slide + fade
initial={{ x: 50, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}

// Reduced motion: fade only
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
```

## 4. Implementation in React

### Basic useReducedMotion Hook

```tsx
import { useState, useEffect } from 'react';

function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);
    
    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Usage
function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: prefersReducedMotion ? 0.01 : 0.3,
      }}
    >
      Content
    </motion.div>
  );
}
```

### SSR-Safe Implementation

```tsx
function useReducedMotion(): boolean {
  // SSR-safe: default to no preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
```

### Framer Motion's Built-in Hook

```tsx
import { useReducedMotion } from 'framer-motion';

function Component() {
  const prefersReducedMotion = useReducedMotion();
  
  // Framer Motion also supports global reduction:
  // <MotionConfig reducedMotion="user">
  //   {/* All animations respect preference */}
  // </MotionConfig>
}
```

## 5. React Patterns to Use

### Motion-Safe Variants

```tsx
const fadeSlideVariants = {
  hidden: (reducedMotion: boolean) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 20,
  }),
  visible: {
    opacity: 1,
    y: 0,
  },
};

function Card() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      custom={prefersReducedMotion}
      variants={fadeSlideVariants}
      initial="hidden"
      animate="visible"
      transition={{
        duration: prefersReducedMotion ? 0.01 : 0.4,
        ease: 'easeOut',
      }}
    >
      Card content
    </motion.div>
  );
}
```

### Global Motion Context

```tsx
interface MotionPreferencesContextValue {
  prefersReducedMotion: boolean;
  duration: (defaultDuration: number) => number;
  spring: (defaultSpring: SpringOptions) => SpringOptions | { duration: number };
}

const MotionPreferencesContext = createContext<MotionPreferencesContextValue>({
  prefersReducedMotion: false,
  duration: (d) => d,
  spring: (s) => s,
});

function MotionPreferencesProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  const value = useMemo(() => ({
    prefersReducedMotion,
    duration: (defaultDuration: number) => 
      prefersReducedMotion ? 0.01 : defaultDuration,
    spring: (defaultSpring: SpringOptions) =>
      prefersReducedMotion 
        ? { duration: 0.01 } 
        : defaultSpring,
  }), [prefersReducedMotion]);

  return (
    <MotionPreferencesContext.Provider value={value}>
      {children}
    </MotionPreferencesContext.Provider>
  );
}

function useMotionPreferences() {
  return useContext(MotionPreferencesContext);
}

// Usage
function AnimatedButton() {
  const { duration, prefersReducedMotion } = useMotionPreferences();

  return (
    <motion.button
      whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
      whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
      transition={{ duration: duration(0.2) }}
    >
      Click me
    </motion.button>
  );
}
```

### Conditional Animation Component

```tsx
interface SafeMotionProps extends MotionProps {
  children: ReactNode;
  reducedMotionVariant?: 'fade' | 'instant' | 'static';
}

function SafeMotion({ 
  children, 
  reducedMotionVariant = 'fade',
  initial,
  animate,
  exit,
  transition,
  ...props 
}: SafeMotionProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    switch (reducedMotionVariant) {
      case 'instant':
        return <motion.div {...props}>{children}</motion.div>;
      case 'static':
        return <div {...props}>{children}</div>;
      case 'fade':
      default:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            {...props}
          >
            {children}
          </motion.div>
        );
    }
  }

  return (
    <motion.div
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

## 6. Important Hooks

### useMotionSafe

```tsx
function useMotionSafe<T extends Record<string, any>>(
  fullMotion: T,
  reducedMotion: Partial<T>
): T {
  const prefersReducedMotion = useReducedMotion();
  
  return useMemo(() => {
    if (prefersReducedMotion) {
      return { ...fullMotion, ...reducedMotion };
    }
    return fullMotion;
  }, [prefersReducedMotion, fullMotion, reducedMotion]);
}

// Usage
function AnimatedList({ items }: { items: Item[] }) {
  const transition = useMotionSafe(
    { type: 'spring', stiffness: 300, damping: 25 },
    { duration: 0.01 }
  );

  const variants = useMotionSafe(
    {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
    },
    {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    }
  );

  return (
    <motion.ul initial="hidden" animate="visible">
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          variants={variants}
          transition={{ ...transition, delay: i * 0.1 }}
        >
          {item.name}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### useAccessibleAnimation

```tsx
interface AccessibleAnimationOptions {
  full: MotionProps;
  reduced?: MotionProps;
  skip?: boolean;
}

function useAccessibleAnimation({ 
  full, 
  reduced, 
  skip = false 
}: AccessibleAnimationOptions): MotionProps {
  const prefersReducedMotion = useReducedMotion();

  if (skip || !prefersReducedMotion) {
    return full;
  }

  // Default reduced animation is instant opacity
  const defaultReduced: MotionProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.1 },
  };

  return reduced || defaultReduced;
}
```

## 7. Animation Considerations

### Essential vs. Decorative Motion

```tsx
function LoadingSpinner() {
  const prefersReducedMotion = useReducedMotion();

  // Loading indicators should still animate but can be simplified
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: prefersReducedMotion ? 2 : 1, // Slower if reduced
        repeat: Infinity,
        ease: 'linear',
      }}
      className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
    />
  );
}

function ProgressBar({ value }: { value: number }) {
  const prefersReducedMotion = useReducedMotion();

  // Progress should still show progress, just without spring
  return (
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-blue-500"
        animate={{ width: `${value}%` }}
        transition={{
          // Use simple tween instead of spring for reduced motion
          type: prefersReducedMotion ? 'tween' : 'spring',
          duration: prefersReducedMotion ? 0.2 : undefined,
          stiffness: 100,
          damping: 20,
        }}
      />
    </div>
  );
}
```

### Page Transitions

```tsx
function PageTransition({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
```

### Parallax Alternative

```tsx
function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  
  // Only apply parallax if motion is allowed
  const y = useTransform(
    scrollY, 
    [0, 300], 
    [0, prefersReducedMotion ? 0 : 100]
  );

  return (
    <motion.div 
      style={{ y }}
      className="h-screen bg-gradient-to-b from-blue-500 to-purple-500"
    >
      <h1>Hero Content</h1>
    </motion.div>
  );
}
```

## 8. Performance Considerations

### Avoiding Unnecessary Re-renders

```tsx
// The hook already uses state, so components re-render on preference change
// Memoize components that don't need to change

const StaticContent = memo(function StaticContent() {
  // This doesn't use motion, no need to re-render
  return <div>Static content</div>;
});

function Page() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <AnimatedHeader prefersReducedMotion={prefersReducedMotion} />
      <StaticContent /> {/* Won't re-render */}
      <AnimatedFooter prefersReducedMotion={prefersReducedMotion} />
    </>
  );
}
```

### CSS-Only Alternative

```tsx
// For simple cases, CSS might be more performant
function CSSReducedMotion() {
  return (
    <div className="animate-slide-in motion-reduce:animate-none">
      Content
    </div>
  );
}

// Tailwind CSS config:
// @media (prefers-reduced-motion: reduce) {
//   .motion-reduce\:animate-none { animation: none; }
// }
```

## 9. Common Mistakes

### 1. Removing All Animation
**Problem:** Reduced motion = no visual feedback.
**Solution:** Provide alternative feedback (color, opacity changes).

### 2. Only Checking on Mount
**Problem:** User changes preference, app doesn't respond.
**Solution:** Listen for media query changes.

### 3. SSR Mismatch
**Problem:** Server renders with motion, client without.
**Solution:** Default to no preference, update on mount.

### 4. Forgetting Essential Animation
**Problem:** Loading spinners, progress bars stop.
**Solution:** Keep essential animations, simplify them.

### 5. Not Testing
**Problem:** Assumes reduced motion path works.
**Solution:** Test with preference enabled in OS settings.

## 10. Practice Exercises

### Exercise 1: Modal Transition
Build a modal with full slide animation and reduced fade alternative.

### Exercise 2: List Stagger
Create a staggered list that becomes instant in reduced motion.

### Exercise 3: Parallax Hero
Build a parallax hero that becomes static with reduced motion.

### Exercise 4: Motion Toggle
Add a manual motion toggle in addition to OS preference.

### Exercise 5: Testing Suite
Write tests that verify both motion paths work correctly.

## 11. Advanced Topics

- **User Override** — Allow users to override OS preference in-app
- **Analytics** — Track reduced motion usage
- **Animation Budget** — Reduce animation quantity, not just style
- **Cognitive Load** — Motion reduction for focus, not just vestibular
- **CSS vs. JS** — When to use CSS motion-reduce
- **Testing Tools** — Emulating reduced motion in development
