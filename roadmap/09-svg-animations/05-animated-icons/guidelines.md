# Animated Icons

## 1. Concept Overview

Animated icons are interactive SVG graphics that respond to user actions or state changes. Unlike static icons, animated icons provide feedback, guide attention, and add personality to interfaces.

Types of icon animation:
- **State transitions** — Toggle between states (play/pause, open/close)
- **Feedback animations** — Confirm actions (check, loading, success)
- **Attention grabbers** — Attract user focus (bell, notification)
- **Micro-interactions** — Subtle hover/tap responses

## 2. Why This Matters for Design Engineers

Animated icons create:
- Clear state communication
- Delightful micro-interactions
- Reduced cognitive load
- Brand personality
- Professional polish

As a Design Engineer, you must:
- Design purposeful icon animations
- Keep animations fast and subtle
- Handle all interaction states
- Ensure accessibility

## 3. Key Principles / Mental Models

### Animation Purpose
```
Every icon animation should answer:
1. What state am I communicating?
2. What action did the user take?
3. What feedback do they need?
```

### Timing Guidelines
```
Hover feedback: 100-200ms
State change: 200-400ms
Loading loops: 1-2s per cycle
Attention grab: 300-500ms, then settle
```

### Animation Types
```
Transform: scale, rotate, translate
Path: draw, morph
Visibility: fade, reveal
Combined: multiple properties
```

## 4. Implementation in React

### Hover Animation Icon

```tsx
import { motion } from 'framer-motion';

function HoverIcon() {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="w-6 h-6 cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        whileHover={{ strokeWidth: 2.5 }}
      />
    </motion.svg>
  );
}
```

### Toggle Icon (Play/Pause)

```tsx
function PlayPauseIcon({ isPlaying, onClick }: { isPlaying: boolean; onClick: () => void }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="w-10 h-10 cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isPlaying ? (
          <motion.g
            key="pause"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <rect x="6" y="4" width="4" height="16" fill="currentColor" rx="1" />
            <rect x="14" y="4" width="4" height="16" fill="currentColor" rx="1" />
          </motion.g>
        ) : (
          <motion.path
            key="play"
            d="M6 4l14 8-14 8V4z"
            fill="currentColor"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </motion.svg>
  );
}
```

### Hamburger Menu Icon

```tsx
function HamburgerIcon({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  const lineVariants = {
    closed: { rotate: 0, y: 0 },
    open: (custom: number) => ({
      rotate: custom === 0 ? 45 : custom === 2 ? -45 : 0,
      y: custom === 0 ? 8 : custom === 2 ? -8 : 0,
      opacity: custom === 1 ? 0 : 1,
    }),
  };

  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="w-6 h-6 cursor-pointer"
      onClick={onClick}
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
    >
      {[0, 1, 2].map((i) => (
        <motion.line
          key={i}
          x1="3"
          x2="21"
          y1={4 + i * 8}
          y2={4 + i * 8}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          custom={i}
          variants={lineVariants}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ originX: '50%', originY: `${4 + i * 8}px` }}
        />
      ))}
    </motion.svg>
  );
}
```

### Checkbox Icon

```tsx
function CheckboxIcon({ isChecked, onChange }: { isChecked: boolean; onChange: () => void }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="w-6 h-6 cursor-pointer"
      onClick={onChange}
    >
      {/* Box */}
      <motion.rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        animate={{
          fill: isChecked ? '#3b82f6' : 'transparent',
          stroke: isChecked ? '#3b82f6' : 'currentColor',
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Checkmark */}
      <motion.path
        d="M6 12l4 4 8-8"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isChecked ? 1 : 0 }}
        transition={{ duration: 0.2, delay: isChecked ? 0.1 : 0 }}
      />
    </motion.svg>
  );
}
```

### Loading Spinner Icon

```tsx
function SpinnerIcon({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={cn('w-6 h-6', className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="60"
        strokeDashoffset="20"
        opacity="0.25"
      />
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="60"
        strokeDashoffset="45"
      />
    </motion.svg>
  );
}
```

## 5. React Patterns to Use

### Icon with Multiple States

```tsx
type IconState = 'idle' | 'loading' | 'success' | 'error';

function StatusIcon({ state }: { state: IconState }) {
  return (
    <motion.svg viewBox="0 0 24 24" className="w-6 h-6">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.circle
            key="idle"
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          />
        )}
        
        {state === 'loading' && (
          <motion.circle
            key="loading"
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="50"
            strokeDashoffset="0"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        
        {state === 'success' && (
          <motion.path
            key="success"
            d="M20 6L9 17l-5-5"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {state === 'error' && (
          <motion.g
            key="error"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
          >
            <line x1="6" y1="6" x2="18" y2="18" stroke="#ef4444" strokeWidth="2" />
            <line x1="18" y1="6" x2="6" y2="18" stroke="#ef4444" strokeWidth="2" />
          </motion.g>
        )}
      </AnimatePresence>
    </motion.svg>
  );
}
```

### Notification Bell with Badge

```tsx
function BellIcon({ hasNotification }: { hasNotification: boolean }) {
  const bellVariants = {
    idle: { rotate: 0 },
    ring: {
      rotate: [0, 10, -10, 10, -10, 0],
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
  };

  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="w-6 h-6 cursor-pointer"
      variants={bellVariants}
      animate={hasNotification ? 'ring' : 'idle'}
    >
      <motion.path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        d="M13.73 21a2 2 0 01-3.46 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Notification dot */}
      <AnimatePresence>
        {hasNotification && (
          <motion.circle
            cx="18"
            cy="6"
            r="4"
            fill="#ef4444"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          />
        )}
      </AnimatePresence>
    </motion.svg>
  );
}
```

### Copy Icon with Feedback

```tsx
function CopyIcon({ onCopy }: { onCopy: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="w-5 h-5 cursor-pointer"
      onClick={handleCopy}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.path
            key="check"
            d="M20 6L9 17l-5-5"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        ) : (
          <motion.g
            key="copy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <rect x="9" y="9" width="13" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" fill="none" stroke="currentColor" strokeWidth="2" />
          </motion.g>
        )}
      </AnimatePresence>
    </motion.svg>
  );
}
```

## 6. Important Techniques

### Icon with Reveal on Scroll

```tsx
function ScrollRevealIcon() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.svg
      ref={ref}
      viewBox="0 0 24 24"
      className="w-12 h-12"
    >
      <motion.path
        d="M12 2L2 7l10 5 10-5-10-5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}
```

### Pulsing Attention Icon

```tsx
function PulsingIcon({ isPulsing }: { isPulsing: boolean }) {
  return (
    <div className="relative">
      {/* Pulse ring */}
      <AnimatePresence>
        {isPulsing && (
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-500"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
      
      {/* Icon */}
      <motion.svg viewBox="0 0 24 24" className="w-6 h-6 relative z-10">
        <circle cx="12" cy="12" r="10" fill="#3b82f6" />
      </motion.svg>
    </div>
  );
}
```

## 7. Animation Considerations

### Timing for Different Actions

```tsx
// Instant feedback (hover, tap)
transition={{ duration: 0.15 }}

// State change (toggle, select)
transition={{ duration: 0.25 }}

// Success confirmation
transition={{ duration: 0.4 }}

// Loading cycle
transition={{ duration: 1, repeat: Infinity }}
```

### Easing for Icons

```tsx
// Snappy interaction
transition={{ type: 'spring', stiffness: 500, damping: 30 }}

// Smooth state change
transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.3 }}

// Bouncy feedback
transition={{ type: 'spring', stiffness: 400, damping: 10 }}
```

## 8. Performance Considerations

### Keep Icons Simple

```tsx
// ❌ Too many animated elements
<motion.svg>
  {hundredPaths.map(path => (
    <motion.path animate={...} />
  ))}
</motion.svg>

// ✅ Animate key elements only
<motion.svg whileHover={{ scale: 1.1 }}>
  <path d="..." /> {/* Static */}
  <motion.path animate={...} /> {/* Animated */}
</motion.svg>
```

### Use CSS for Simple Animations

```tsx
// For simple hover effects, CSS is more efficient
<svg className="w-6 h-6 transition-transform hover:scale-110">
  ...
</svg>

// Use Framer Motion for complex animations
<motion.svg
  whileHover={{ scale: 1.1, rotate: 10 }}
  transition={{ type: 'spring' }}
>
  ...
</motion.svg>
```

## 9. Common Mistakes

### 1. Animation Too Slow
**Problem:** Icon feels sluggish.
**Solution:** Keep icon animations under 300ms.

### 2. Too Much Movement
**Problem:** Icon is distracting.
**Solution:** Use subtle animations for frequent interactions.

### 3. Missing Hover State
**Problem:** Icon doesn't feel interactive.
**Solution:** Add scale or color change on hover.

### 4. No Loading Feedback
**Problem:** User doesn't know action is processing.
**Solution:** Add loading state animation.

### 5. Ignoring Accessibility
**Problem:** Animation is only feedback.
**Solution:** Include aria-labels and text alternatives.

## 10. Practice Exercises

### Exercise 1: Like Button
Create a heart icon that fills and pulses when liked.

### Exercise 2: Download Icon
Build a download icon with progress indication.

### Exercise 3: Settings Gear
Create a gear that rotates on hover.

### Exercise 4: Audio Visualizer
Build animated audio bars icon.

### Exercise 5: Navigation Arrows
Create arrows that animate direction change.

## 11. Advanced Topics

- **Lottie Integration** — After Effects animations as icons
- **Icon Libraries** — Creating consistent animated icon sets
- **Performance Budgets** — Keeping animations lightweight
- **Accessibility** — Reduced motion and screen readers
- **Icon Systems** — Building scalable icon components
- **Testing** — Verifying animation behavior
