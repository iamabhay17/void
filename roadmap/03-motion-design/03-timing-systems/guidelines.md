# Timing Systems

## 1. Concept Overview

A timing system is a standardized set of duration values used throughout your interface. Just as you have a spacing system (8px, 16px, 24px...), you should have a timing system (100ms, 200ms, 300ms...).

Timing affects:
- **Perceived speed** — Same animation feels different at different speeds
- **Hierarchy** — Important elements animate differently than secondary ones
- **Consistency** — Similar actions should have similar durations
- **Personality** — Fast = snappy/professional, slow = deliberate/luxurious

A well-designed timing system makes your animations feel cohesive and intentional.

## 2. Why This Matters for Design Engineers

Without a timing system:
- Animations feel random and inconsistent
- Similar actions have different durations
- The interface lacks rhythmic coherence

As a Design Engineer, you must:
- Define a timing scale
- Match duration to animation type and distance
- Ensure timing supports, not hinders, usability
- Balance speed with legibility

Stripe's animations feel precise because their timing is systematic—every transition has a considered duration that matches its importance.

## 3. Key Principles / Mental Models

### Duration Perception
| Duration | Perception |
|----------|------------|
| 0-100ms | Instant, barely perceptible |
| 100-200ms | Fast, snappy |
| 200-300ms | Standard, comfortable |
| 300-500ms | Deliberate, noticeable |
| 500ms+ | Slow, potentially frustrating |

### Duration by Animation Type
| Type | Duration |
|------|----------|
| Hover states | 100-150ms |
| Button feedback | 100-150ms |
| Fade in/out | 150-200ms |
| Scale/Transform | 200-300ms |
| Slide/Move | 200-350ms |
| Modal enter | 200-300ms |
| Modal exit | 150-200ms |
| Page transition | 300-500ms |

### The Size-Duration Relationship
Larger movements need more time:
- Small icon: 100-150ms
- Card: 200-250ms  
- Modal: 250-300ms
- Page: 300-400ms

### Exit Faster Than Enter
Elements should leave faster than they arrive:
- Enter: 250ms
- Exit: 150-200ms

Users care about what's appearing, not what's leaving.

## 4. Implementation in React

### Timing System Definition

```tsx
// timing.ts
export const duration = {
  instant: 50,
  fast: 100,
  normal: 200,
  slow: 300,
  slower: 400,
  slowest: 500,
} as const;

// Semantic durations
export const timing = {
  // Micro-interactions
  hover: duration.fast,
  tap: duration.fast,
  toggle: duration.normal,
  
  // Transitions
  fadeIn: duration.normal,
  fadeOut: duration.fast,
  slideIn: duration.slow,
  slideOut: duration.normal,
  
  // Layout
  expand: duration.slow,
  collapse: duration.normal,
  
  // Navigation
  pageEnter: duration.slower,
  pageExit: duration.slow,
  modalEnter: duration.slow,
  modalExit: duration.normal,
  
  // Stagger
  staggerDelay: 50,
} as const;

// As CSS
export const cssVariables = `
  :root {
    --duration-instant: ${duration.instant}ms;
    --duration-fast: ${duration.fast}ms;
    --duration-normal: ${duration.normal}ms;
    --duration-slow: ${duration.slow}ms;
    --duration-slower: ${duration.slower}ms;
    --duration-slowest: ${duration.slowest}ms;
  }
`;
```

### Using Timing in Components

```tsx
import { motion } from 'framer-motion';
import { timing, duration } from './timing';

function Modal({ isOpen, children, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: timing.fadeIn / 1000,
              exit: { duration: timing.fadeOut / 1000 }
            }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-4 max-w-md mx-auto bg-white rounded-xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: timing.modalEnter / 1000,
              exit: { duration: timing.modalExit / 1000 },
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Staggered Timing

```tsx
function StaggeredList({ items }) {
  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: timing.staggerDelay / 1000,
          },
        },
      }}
    >
      {items.map(item => (
        <motion.li
          key={item.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: timing.slideIn / 1000 }
            },
          }}
        >
          {item.content}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Responsive Timing

```tsx
function useResponsiveTiming() {
  const [timingScale, setTimingScale] = useState(1);

  useEffect(() => {
    // Reduce animation duration on mobile for perceived performance
    const isMobile = window.innerWidth < 768;
    setTimingScale(isMobile ? 0.8 : 1);
  }, []);

  return {
    fast: duration.fast * timingScale,
    normal: duration.normal * timingScale,
    slow: duration.slow * timingScale,
  };
}
```

## 5. React Patterns to Use

### Timing Context

```tsx
type TimingMode = 'normal' | 'fast' | 'slow' | 'instant';

const timingModes: Record<TimingMode, number> = {
  instant: 0,
  fast: 0.5,
  normal: 1,
  slow: 1.5,
};

const TimingContext = createContext<number>(1);

function TimingProvider({ 
  mode = 'normal', 
  children 
}: { 
  mode?: TimingMode;
  children: React.ReactNode;
}) {
  return (
    <TimingContext.Provider value={timingModes[mode]}>
      {children}
    </TimingContext.Provider>
  );
}

function useTiming(baseDuration: number) {
  const scale = useContext(TimingContext);
  return baseDuration * scale;
}

// Usage
function AnimatedCard() {
  const enterDuration = useTiming(timing.slideIn);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: enterDuration / 1000 }}
    >
      Card content
    </motion.div>
  );
}

// Switch entire app to fast mode
<TimingProvider mode="fast">
  <App />
</TimingProvider>
```

### Duration Calculator

```tsx
function useDurationByDistance(distance: number): number {
  // Base duration 200ms, add 1ms per pixel of movement
  const baseDuration = duration.normal;
  const durationPerPixel = 0.5;
  
  return Math.min(
    baseDuration + (distance * durationPerPixel),
    duration.slowest
  );
}

// Usage
function SlidingPanel({ position }) {
  const prevPosition = usePrevious(position);
  const distance = Math.abs(position - (prevPosition || 0));
  const animationDuration = useDurationByDistance(distance);
  
  return (
    <motion.div
      animate={{ x: position }}
      transition={{ duration: animationDuration / 1000 }}
    />
  );
}
```

## 6. Important Hooks

### useTimeoutState

```tsx
function useTimeoutState<T>(
  initialValue: T,
  timeout: number
): [T, (value: T) => void] {
  const [value, setValue] = useState(initialValue);
  const [displayValue, setDisplayValue] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // When value changes, update display after timeout
    clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setDisplayValue(value);
    }, timeout);

    return () => clearTimeout(timeoutRef.current);
  }, [value, timeout]);

  return [displayValue, setValue];
}

// Usage: Debounced display
function SearchResults({ query }) {
  const [debouncedQuery, setQuery] = useTimeoutState('', timing.slow);
  
  useEffect(() => {
    setQuery(query);
  }, [query]);

  return <Results query={debouncedQuery} />;
}
```

### useAnimationFrame

```tsx
function useAnimationFrame(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);
}

// Usage: Frame-accurate timing
function Timer() {
  const [elapsed, setElapsed] = useState(0);
  
  useAnimationFrame((deltaTime) => {
    setElapsed(prev => prev + deltaTime);
  });

  return <span>{Math.floor(elapsed / 1000)}s</span>;
}
```

### useSequence

```tsx
function useSequence(steps: { duration: number; action: () => void }[]) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length) {
      setIsPlaying(false);
      return;
    }

    const { duration, action } = steps[currentStep];
    action();

    const timeout = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, duration);

    return () => clearTimeout(timeout);
  }, [isPlaying, currentStep, steps]);

  return { play, currentStep, isPlaying };
}

// Usage: Choreographed sequence
function Celebration() {
  const { play } = useSequence([
    { duration: 200, action: () => showConfetti() },
    { duration: 300, action: () => showBadge() },
    { duration: 500, action: () => showMessage() },
  ]);

  return <button onClick={play}>Celebrate!</button>;
}
```

## 7. Animation Considerations

### Hierarchical Timing

```tsx
function DashboardEnter() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            // Primary elements first
            when: 'beforeChildren',
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {/* Level 1: Page title - appears first (0ms) */}
      <motion.h1
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.3 }
          },
        }}
      >
        Dashboard
      </motion.h1>
      
      {/* Level 2: Primary cards - appear second (100ms) */}
      <motion.div variants={cardVariants}>
        <StatsCard />
      </motion.div>
      
      {/* Level 3: Secondary content - appears last (200ms+) */}
      <motion.div variants={cardVariants}>
        <ActivityFeed />
      </motion.div>
    </motion.div>
  );
}
```

### Interruptible Timing

```tsx
function InterruptibleAnimation() {
  const [target, setTarget] = useState(0);

  return (
    <div>
      <motion.div
        animate={{ x: target }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          // Spring animations are naturally interruptible
          // They maintain velocity when target changes
        }}
        className="w-20 h-20 bg-blue-500 rounded"
      />
      
      <div className="flex gap-2 mt-4">
        <button onClick={() => setTarget(0)}>Left</button>
        <button onClick={() => setTarget(200)}>Right</button>
      </div>
    </div>
  );
}
```

### Reduced Motion Timing

```tsx
function useAccessibleTiming() {
  const prefersReducedMotion = useReducedMotion();

  return {
    duration: prefersReducedMotion ? 0 : duration.normal,
    staggerDelay: prefersReducedMotion ? 0 : timing.staggerDelay,
    transition: prefersReducedMotion 
      ? { duration: 0 }
      : { duration: duration.normal / 1000, ease: [0.4, 0, 0.2, 1] },
  };
}
```

## 8. Performance Considerations

### Avoid Long Animations on Critical Path

```tsx
// ❌ User waits 500ms before they can interact
<motion.button
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Submit
</motion.button>

// ✅ User can interact while animation plays
<motion.button
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.15 }}
>
  Submit
</motion.button>
```

### Batch Animations in Same Frame

```tsx
// ❌ Multiple state updates = multiple renders
onClick={() => {
  setA(true);
  setB(true);
  setC(true);
}}

// ✅ Single update
onClick={() => {
  setState({ a: true, b: true, c: true });
}}

// Or use flushSync for critical animations
import { flushSync } from 'react-dom';

onClick={() => {
  flushSync(() => setState(newValue));
}
```

### requestIdleCallback for Non-Critical

```tsx
function useIdleAnimation(callback: () => void) {
  useEffect(() => {
    const id = requestIdleCallback(callback, { timeout: 1000 });
    return () => cancelIdleCallback(id);
  }, [callback]);
}

// Usage: Animate non-critical elements after main content
function SecondaryContent() {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  
  useIdleAnimation(() => setShouldAnimate(true));
  
  return (
    <motion.div
      initial={false}
      animate={shouldAnimate ? { opacity: 1 } : { opacity: 0 }}
    >
      Secondary content
    </motion.div>
  );
}
```

## 9. Common Mistakes

### 1. Everything Takes 300ms
**Problem:** All animations have the same duration.
**Solution:** Scale duration to element size and importance.

### 2. Exit Same as Enter
**Problem:** Elements take as long to leave as to enter.
**Solution:** Exits should be 20-40% faster than entrances.

### 3. Animations Block Interaction
**Problem:** Users wait for animations to complete.
**Solution:** Keep interactive element animations under 200ms.

### 4. No Stagger System
**Problem:** All elements animate at once (looks like a flash).
**Solution:** Stagger related elements by 50-100ms.

### 5. Inconsistent Duration for Same Actions
**Problem:** Buttons have random animation durations.
**Solution:** Create a timing system and use it consistently.

## 10. Practice Exercises

### Exercise 1: Timing Scale
Create a complete timing scale (6-8 values) and document when to use each.

### Exercise 2: Button States
Implement a button with appropriate timing for hover, press, and release.

### Exercise 3: List Animation
Create a list with staggered entrance animations and faster exit.

### Exercise 4: Modal Choreography
Build a modal with timed sequence: backdrop → modal → content elements.

### Exercise 5: Page Transition
Create a page transition with appropriate timing for exit, enter, and stagger.

## 11. Advanced Topics

- **Orchestration** — Coordinating timing across multiple animations
- **Timeline Animation** — GSAP-style timeline control
- **Tempo Systems** — Musical timing relationships
- **Dynamic Duration** — Calculating duration from distance/complexity
- **Perceived Time** — How animation affects time perception
- **Animation Throttling** — Reducing animations under CPU pressure
