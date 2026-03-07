# Micro-Interactions

## 1. Concept Overview

Micro-interactions are small, contained moments of interaction that accomplish a single task. They're the tiny details that make interfaces feel alive:
- A toggle switch that animates smoothly
- A heart that bounces when liked
- A form field that shakes on error
- A button that subtly transforms on hover

Micro-interactions have four parts:
1. **Trigger** — User action or system event that starts it
2. **Rules** — What happens during the interaction
3. **Feedback** — What the user sees/feels
4. **Loops/Modes** — How it repeats or changes over time

## 2. Why This Matters for Design Engineers

Micro-interactions are where polish lives:
- They communicate state without words
- They add delight without being distracting
- They make interfaces feel responsive and alive
- They're often the difference between "good enough" and "exceptional"

As a Design Engineer, you must:
- Recognize opportunities for micro-interactions
- Implement them with perfect timing and easing
- Know when to use them (and when not to)
- Create reusable micro-interaction patterns

Study the iOS toggle switch or Stripe's checkout animations — these micro-interactions are invisible but make the experience feel premium.

## 3. Key Principles / Mental Models

### Purposeful, Not Decorative
Every micro-interaction should serve a purpose:
- Communicate status
- Guide attention
- Confirm actions
- Prevent errors

### Subtle is Usually Better
Micro-interactions should enhance, not distract:
- Fast animations (100-300ms)
- Small movements (2-8px)
- Subtle color changes
- Natural easing

### Signature Moments
A few strategic micro-interactions can become signature moments:
- Slack's emoji picker
- Twitter's heart animation
- Stripe's payment success

### Context Sensitivity
The same interaction can need different micro-interactions:
- Adding to cart vs. removing from cart
- Success vs. error
- First time vs. repeat use

## 4. Implementation in React

### Toggle Switch

```tsx
import { motion } from 'framer-motion';

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-12 h-7 rounded-full transition-colors duration-200',
        checked ? 'bg-blue-600' : 'bg-gray-200'
      )}
    >
      <motion.div
        className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
        animate={{
          x: checked ? 20 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      />
    </button>
  );
}
```

### Checkbox with Checkmark Animation

```tsx
function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <button
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center',
          'transition-colors duration-150',
          checked 
            ? 'bg-blue-600 border-blue-600' 
            : 'bg-white border-gray-300'
        )}
      >
        <motion.svg
          viewBox="0 0 24 24"
          className="w-3 h-3 text-white"
          initial={false}
          animate={checked ? 'checked' : 'unchecked'}
        >
          <motion.path
            d="M4 12l5 5L20 6"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              checked: {
                pathLength: 1,
                opacity: 1,
                transition: { duration: 0.2, delay: 0.1 },
              },
              unchecked: {
                pathLength: 0,
                opacity: 0,
                transition: { duration: 0.1 },
              },
            }}
          />
        </motion.svg>
      </button>
      <span className="text-gray-700">{label}</span>
    </label>
  );
}
```

### Like Button with Heart Animation

```tsx
function LikeButton({ liked, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      className="relative p-2"
      whileTap={{ scale: 0.9 }}
    >
      {/* Background burst */}
      <motion.div
        className="absolute inset-0 rounded-full bg-red-100"
        initial={false}
        animate={{
          scale: liked ? [0, 1.5, 0] : 0,
          opacity: liked ? [0, 0.5, 0] : 0,
        }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Heart icon */}
      <motion.svg
        viewBox="0 0 24 24"
        className="w-6 h-6 relative z-10"
        animate={{
          scale: liked ? [1, 1.3, 1] : 1,
          fill: liked ? '#ef4444' : 'transparent',
          stroke: liked ? '#ef4444' : '#9ca3af',
        }}
        transition={{
          scale: { duration: 0.3, ease: 'easeOut' },
          fill: { duration: 0.2 },
        }}
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          strokeWidth={2}
        />
      </motion.svg>
      
      {/* Particles */}
      {liked && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-red-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i * 60 * Math.PI) / 180) * 20,
                y: Math.sin((i * 60 * Math.PI) / 180) * 20,
              }}
              transition={{ duration: 0.4, delay: 0.1 }}
            />
          ))}
        </>
      )}
    </motion.button>
  );
}
```

### Form Field with Error Shake

```tsx
function Input({ error, ...props }) {
  const controls = useAnimation();
  
  useEffect(() => {
    if (error) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 },
      });
    }
  }, [error, controls]);

  return (
    <div>
      <motion.input
        animate={controls}
        className={cn(
          'w-full px-4 py-2 border rounded-md',
          'transition-colors duration-150',
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
        )}
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
```

## 5. React Patterns to Use

### Micro-interaction Hook Factory

```tsx
function createMicroInteraction(config: {
  initial: any;
  animate: any;
  transition: any;
}) {
  return function useMicroInteraction(trigger: boolean) {
    return {
      initial: config.initial,
      animate: trigger ? config.animate : config.initial,
      transition: config.transition,
    };
  };
}

// Define reusable micro-interactions
const useBounce = createMicroInteraction({
  initial: { scale: 1 },
  animate: { scale: [1, 1.2, 1] },
  transition: { duration: 0.3 },
});

const useShake = createMicroInteraction({
  initial: { x: 0 },
  animate: { x: [0, -10, 10, -10, 10, 0] },
  transition: { duration: 0.4 },
});

// Usage
function SuccessIcon({ success }) {
  const bounceProps = useBounce(success);
  return <motion.div {...bounceProps}>✓</motion.div>;
}
```

### Compound Micro-interaction Components

```tsx
const InteractiveIcon = ({ children }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        rotate: isHovered ? [0, -10, 10, 0] : 0,
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

InteractiveIcon.Spin = ({ children, onClick }) => (
  <motion.div
    onClick={onClick}
    whileTap={{ rotate: 360 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

InteractiveIcon.Pulse = ({ children, active }) => (
  <motion.div
    animate={active ? {
      scale: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 1 },
    } : {}}
  >
    {children}
  </motion.div>
);
```

## 6. Important Hooks

### useDelayedState

```tsx
function useDelayedState<T>(value: T, delay: number) {
  const [delayedValue, setDelayedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDelayedValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return delayedValue;
}

// Usage: Delay the "success" state for animation to complete
function SubmitButton({ isSubmitting, isSuccess }) {
  const showSuccess = useDelayedState(isSuccess, 300);
  
  return (
    <button>
      {showSuccess ? <CheckIcon /> : 'Submit'}
    </button>
  );
}
```

### usePrevious

```tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

// Usage: Detect direction of change
function Counter({ count }) {
  const prevCount = usePrevious(count);
  const direction = prevCount !== undefined 
    ? (count > prevCount ? 'up' : 'down') 
    : null;

  return (
    <motion.span
      key={count}
      initial={{ y: direction === 'up' ? 20 : -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: direction === 'up' ? -20 : 20, opacity: 0 }}
    >
      {count}
    </motion.span>
  );
}
```

### useInterval (for continuous micro-interactions)

```tsx
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// Usage: Pulsing notification dot
function NotificationDot({ count }) {
  const [pulse, setPulse] = useState(false);
  
  useInterval(() => {
    setPulse(true);
    setTimeout(() => setPulse(false), 300);
  }, count > 0 ? 2000 : null);

  return (
    <motion.div
      className="w-2 h-2 bg-red-500 rounded-full"
      animate={{ scale: pulse ? 1.3 : 1 }}
    />
  );
}
```

## 7. Animation Considerations

### Timing is Everything

```tsx
// Quick micro-interactions (toggles, hovers)
const quickTransition = { duration: 0.15, ease: 'easeOut' };

// Standard micro-interactions (state changes)
const standardTransition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] };

// Bouncy micro-interactions (likes, celebrations)
const bouncyTransition = { 
  type: 'spring', 
  stiffness: 400, 
  damping: 15 
};

// Smooth micro-interactions (toggles, switches)
const smoothTransition = { 
  type: 'spring', 
  stiffness: 500, 
  damping: 30 
};
```

### Layered Animations

```tsx
function NotificationBell({ hasNotifications }) {
  return (
    <div className="relative">
      {/* Bell swing */}
      <motion.div
        animate={hasNotifications ? {
          rotate: [0, 15, -15, 10, -10, 0],
        } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <BellIcon />
      </motion.div>
      
      {/* Badge pop */}
      <AnimatePresence>
        {hasNotifications && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

## 8. Performance Considerations

### Use Transform Properties

```tsx
// ❌ Animates layout-triggering properties
<motion.div animate={{ left: isOpen ? 100 : 0 }} />

// ✅ Animates transform (GPU-accelerated)
<motion.div animate={{ x: isOpen ? 100 : 0 }} />
```

### Limit Simultaneous Animations

```tsx
// ❌ Too many animated elements
{items.map(item => (
  <motion.div key={item.id} animate={{ ... }} /> // 100 animations
))}

// ✅ Animate container, or limit visible animations
<motion.div animate={{ opacity: 1 }}>
  {items.map(item => <div key={item.id}>{item}</div>)}
</motion.div>
```

### Use will-change Sparingly

```css
/* Only apply to elements that will animate */
.will-animate {
  will-change: transform;
}
```

## 9. Common Mistakes

### 1. Too Many Micro-interactions
**Problem:** Everything bounces and spins.
**Solution:** Be selective. Not everything needs a micro-interaction.

### 2. Animations Too Slow
**Problem:** 500ms animations feel laggy.
**Solution:** Keep micro-interactions fast (100-300ms).

### 3. Ignoring Reduced Motion
**Problem:** Animations play for all users.
**Solution:** Check `prefers-reduced-motion` and simplify or disable.

### 4. Inconsistent Easing
**Problem:** Different easings feel jarring.
**Solution:** Define standard easing curves and use them consistently.

### 5. Animation on Every State Change
**Problem:** Text that animates on every keystroke.
**Solution:** Only animate meaningful state changes.

## 10. Practice Exercises

### Exercise 1: Toggle Switch
Build a toggle switch with smooth thumb movement and color transition.

### Exercise 2: Like Button
Create a like button with heart fill, scale bounce, and particle burst.

### Exercise 3: Notification Badge
Build a notification badge that pops in, pulses, and scales on count change.

### Exercise 4: Progress Ring
Create a circular progress indicator with animated stroke.

### Exercise 5: Menu Item Hover
Design a menu item with smooth highlight slide and icon animation.

## 11. Advanced Topics

- **Gesture-Based Micro-interactions** — Drag, pinch, rotate responses
- **Sound Design** — Audio paired with micro-interactions
- **Haptic Feedback** — Physical feedback on mobile devices
- **Lottie Animations** — Complex micro-interactions from After Effects
- **State Machine Micro-interactions** — XState for complex interaction flows
- **Performance Profiling** — Measuring animation frame rates
