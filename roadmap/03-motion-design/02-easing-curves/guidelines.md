# Easing Curves

## 1. Concept Overview

Easing curves define how animation values change over time. They transform a linear progression (0 to 1) into a natural-feeling motion curve.

Types of easing:
- **Linear** — Constant speed (rarely used in UI)
- **Ease-in** — Starts slow, ends fast (for exits)
- **Ease-out** — Starts fast, ends slow (for entrances)
- **Ease-in-out** — Slow start and end (for position changes)
- **Spring** — Physics-based with overshoot
- **Custom bezier** — Fine-tuned for specific needs

Easing is expressed as cubic bezier curves: `cubic-bezier(x1, y1, x2, y2)`

## 2. Why This Matters for Design Engineers

Easing is what makes animation feel "right":
- Linear motion feels robotic and artificial
- Wrong easing makes animations feel sluggish or jarring
- Proper easing creates natural, physical movement

As a Design Engineer, you must:
- Choose appropriate easing for each animation type
- Understand how easing affects perceived speed
- Create consistent easing systems
- Know when to use CSS vs. spring physics

The difference between amateur and professional animation is often just easing. Linear looks like a prototype; proper easing looks polished.

## 3. Key Principles / Mental Models

### Real Objects Don't Move Linearly
In the physical world:
- Objects accelerate when starting (ease-out)
- Objects decelerate when stopping (ease-in)
- Friction affects all movement

### Ease-Out for Entrances
When something appears, it should feel like it's arriving at its destination:
- Starts fast (already in motion)
- Slows down as it settles
- `cubic-bezier(0, 0, 0.2, 1)` or similar

### Ease-In for Exits
When something disappears, it should feel like it's leaving:
- Starts slow (accelerating away)
- Speeds up as it exits
- `cubic-bezier(0.4, 0, 1, 1)` or similar

### Springs for Interactive Motion
For UI that responds to user input, spring physics feel more natural:
- Overshoot and settle
- Interruptible
- Velocity-aware

### Standard Easing Values

```
Linear:        cubic-bezier(0, 0, 1, 1)
Ease:          cubic-bezier(0.25, 0.1, 0.25, 1)
Ease-In:       cubic-bezier(0.4, 0, 1, 1)
Ease-Out:      cubic-bezier(0, 0, 0.2, 1)
Ease-In-Out:   cubic-bezier(0.4, 0, 0.2, 1)

Material:      cubic-bezier(0.4, 0, 0.2, 1)
Apple:         cubic-bezier(0.25, 0.46, 0.45, 0.94)
Smooth:        cubic-bezier(0.45, 0, 0.55, 1)
```

## 4. Implementation in React

### Easing System

```tsx
// easing.ts
export const easing = {
  // Standard easings
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  
  // Expressive easings
  emphasized: [0.2, 0, 0, 1],
  decelerate: [0, 0, 0, 1],
  accelerate: [0.3, 0, 1, 1],
  
  // Bounce easings
  bounceOut: [0.34, 1.56, 0.64, 1],
  backOut: [0.34, 1.4, 0.64, 1],
  
  // As CSS string
  asCss: (curve: number[]) => `cubic-bezier(${curve.join(', ')})`,
} as const;

// Spring configurations
export const springs = {
  gentle: { stiffness: 120, damping: 14 },
  default: { stiffness: 300, damping: 30 },
  snappy: { stiffness: 400, damping: 30 },
  bouncy: { stiffness: 600, damping: 15 },
  stiff: { stiffness: 700, damping: 30 },
};
```

### Using Easing in Framer Motion

```tsx
import { motion } from 'framer-motion';
import { easing, springs } from './easing';

// Cubic bezier easing
function FadeIn({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: easing.easeOut, // [0, 0, 0.2, 1]
      }}
    >
      {children}
    </motion.div>
  );
}

// Spring easing
function SpringScale({ children }) {
  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'spring',
        ...springs.bouncy,
      }}
    >
      {children}
    </motion.div>
  );
}

// Different easing for different properties
function MultiEasing({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        opacity: { duration: 0.2, ease: easing.easeOut },
        x: { type: 'spring', ...springs.snappy },
      }}
    >
      {children}
    </motion.div>
  );
}
```

### CSS Easing System

```css
:root {
  /* Standard easings */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Expressive easings */
  --ease-emphasized: cubic-bezier(0.2, 0, 0, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Standard durations */
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
}

/* Component using easing system */
.button {
  transition: 
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.button:hover {
  background-color: var(--color-primary-hover);
}

.button:active {
  transform: scale(0.98);
}

/* Modal entrance */
.modal {
  animation: modal-enter var(--duration-slow) var(--ease-emphasized);
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

## 5. React Patterns to Use

### Easing Context

```tsx
type EasingPreset = 'default' | 'snappy' | 'gentle' | 'playful';

const easingPresets: Record<EasingPreset, {
  ease: number[];
  spring: { stiffness: number; damping: number };
}> = {
  default: {
    ease: [0.4, 0, 0.2, 1],
    spring: { stiffness: 300, damping: 30 },
  },
  snappy: {
    ease: [0.2, 0, 0, 1],
    spring: { stiffness: 500, damping: 30 },
  },
  gentle: {
    ease: [0.4, 0, 0.6, 1],
    spring: { stiffness: 150, damping: 20 },
  },
  playful: {
    ease: [0.34, 1.56, 0.64, 1],
    spring: { stiffness: 400, damping: 15 },
  },
};

const EasingContext = createContext(easingPresets.default);

function EasingProvider({ 
  preset = 'default', 
  children 
}: { 
  preset?: EasingPreset; 
  children: React.ReactNode;
}) {
  return (
    <EasingContext.Provider value={easingPresets[preset]}>
      {children}
    </EasingContext.Provider>
  );
}

function useEasing() {
  return useContext(EasingContext);
}

// Usage
function AnimatedCard({ children }) {
  const { ease, spring } = useEasing();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        opacity: { duration: 0.2, ease },
        y: { type: 'spring', ...spring },
      }}
    >
      {children}
    </motion.div>
  );
}
```

### Easing Visualization Component

```tsx
function EasingVisualizer({ easing, duration = 1 }) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const t = Math.min(elapsed / duration, 1);
      setProgress(t);
      
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isPlaying, duration]);

  return (
    <div className="space-y-4">
      {/* Easing curve visualization */}
      <svg viewBox="0 0 100 100" className="w-32 h-32 border rounded">
        <path
          d={`M 0 100 C ${easing[0] * 100} ${100 - easing[1] * 100}, ${easing[2] * 100} ${100 - easing[3] * 100}, 100 0`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx={progress * 100}
          cy={100 - bezierValue(progress, easing) * 100}
          r="4"
          fill="blue"
        />
      </svg>
      
      {/* Animated box */}
      <motion.div
        animate={{ x: progress * 200 }}
        className="w-8 h-8 bg-blue-500 rounded"
      />
      
      <button onClick={() => { setProgress(0); setIsPlaying(true); }}>
        Play
      </button>
    </div>
  );
}
```

## 6. Important Hooks

### useSpring for Custom Spring

```tsx
import { useSpring, animated } from '@react-spring/web';

function SpringButton({ children, onClick }) {
  const [springs, api] = useSpring(() => ({
    scale: 1,
    config: { tension: 400, friction: 20 },
  }));

  return (
    <animated.button
      style={{ transform: springs.scale.to(s => `scale(${s})`) }}
      onMouseDown={() => api.start({ scale: 0.95 })}
      onMouseUp={() => api.start({ scale: 1 })}
      onMouseLeave={() => api.start({ scale: 1 })}
      onClick={onClick}
    >
      {children}
    </animated.button>
  );
}
```

### useVelocity for Momentum

```tsx
import { useMotionValue, useVelocity, useTransform, motion } from 'framer-motion';

function VelocityAware() {
  const x = useMotionValue(0);
  const xVelocity = useVelocity(x);
  
  // Skew based on velocity
  const skewX = useTransform(xVelocity, [-1000, 0, 1000], [-10, 0, 10]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      style={{ x, skewX }}
      className="w-20 h-20 bg-blue-500 rounded-lg"
    />
  );
}
```

### Custom Easing Hook

```tsx
function useEasedValue(
  target: number,
  config: { duration: number; ease: number[] }
) {
  const [value, setValue] = useState(target);
  const startValue = useRef(target);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startValue.current = value;
    startTime.current = Date.now();

    const animate = () => {
      if (startTime.current === null) return;
      
      const elapsed = Date.now() - startTime.current;
      const t = Math.min(elapsed / config.duration, 1);
      const eased = bezierEval(t, config.ease);
      
      const newValue = startValue.current + (target - startValue.current) * eased;
      setValue(newValue);

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, config]);

  return value;
}
```

## 7. Animation Considerations

### Matching Easing to Action

```tsx
// Entrance: ease-out (arrives smoothly)
const entranceTransition = {
  duration: 0.3,
  ease: [0, 0, 0.2, 1],
};

// Exit: ease-in (accelerates away)
const exitTransition = {
  duration: 0.2,
  ease: [0.4, 0, 1, 1],
};

// Position change: ease-in-out (smooth throughout)
const moveTransition = {
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1],
};

// Interactive feedback: spring (natural, interruptible)
const interactiveTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

// Bounce effect: custom cubic with overshoot
const bounceTransition = {
  duration: 0.5,
  ease: [0.34, 1.56, 0.64, 1],
};
```

### Spring vs. Duration-Based

```tsx
// Use duration-based for:
// - Fades
// - Simple entrances/exits
// - Predictable timing needs

<motion.div
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
/>

// Use springs for:
// - Interactive elements
// - Scale/position changes
// - Natural, physics-based feel

<motion.div
  animate={{ scale: 1 }}
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
/>
```

### Easing for Different Durations

```tsx
// Fast animations need gentler easing
const fastAnimation = {
  duration: 0.1,
  ease: [0.25, 0.1, 0.25, 1], // Subtle
};

// Slow animations can use more dramatic easing
const slowAnimation = {
  duration: 0.5,
  ease: [0.2, 0, 0, 1], // Emphasized
};
```

## 8. Performance Considerations

### Spring Animation Completion

```tsx
// Springs can oscillate indefinitely at small values
// Set a restDelta to stop early
const springConfig = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  restDelta: 0.001, // Stop when change is < 0.001
  restSpeed: 0.001, // Stop when velocity is < 0.001
};
```

### Avoid Over-Bouncy Springs

```tsx
// ❌ Low damping = long settling time
const bouncyConfig = { stiffness: 400, damping: 10 }; // Takes forever to settle

// ✅ Balanced for UI
const balancedConfig = { stiffness: 400, damping: 25 }; // Slight overshoot, quick settle
```

### CSS vs. JS Easing

```tsx
// Use CSS for simple state transitions
<button className="transition-transform duration-150 ease-out hover:scale-105">
  Hover me
</button>

// Use JS for complex, coordinated animations
<motion.div
  animate={{ x: position.x, y: position.y }}
  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
/>
```

## 9. Common Mistakes

### 1. Using Linear Easing
**Problem:** Animations feel robotic.
**Solution:** Almost always use ease-out for entrances, ease-in for exits.

### 2. Same Easing for Everything
**Problem:** Animations lack personality and appropriateness.
**Solution:** Match easing to the type of motion (entrance, exit, interactive).

### 3. Over-Bouncy Springs
**Problem:** Elements bounce too much, feel unprofessional.
**Solution:** Increase damping. Most UI needs damping of 20-35.

### 4. Wrong Duration for Easing
**Problem:** Easing looks wrong at certain durations.
**Solution:** Adjust easing intensity based on duration.

### 5. Ignoring Velocity
**Problem:** Animations start from zero velocity abruptly.
**Solution:** Use springs for interactive elements that maintain velocity.

## 10. Practice Exercises

### Exercise 1: Easing Comparison
Create a demo showing the same animation with 5 different easings. Observe the difference.

### Exercise 2: Button Micro-interactions
Build a button with hover (ease-out), press (spring), and release (spring) easing.

### Exercise 3: Modal Animation
Create a modal with appropriate easing for overlay (fade), modal (scale + spring), and exit.

### Exercise 4: Page Transition
Build a page transition with staggered elements, each using appropriate easing.

### Exercise 5: Spring Tuning
Create a slider to adjust spring stiffness and damping in real-time. Find the perfect values.

## 11. Advanced Topics

- **Custom Bezier Curves** — Creating and visualizing custom curves
- **Spring Physics Math** — Understanding mass, tension, and friction
- **Velocity Preservation** — Maintaining momentum across animations
- **Easing Functions** — Implementing easing in vanilla JS
- **Animation Choreography** — Coordinating easing across multiple elements
- **Perceptual Easing** — Easing that accounts for human perception
