# Enter/Exit Animations

## 1. Concept Overview

Enter/exit animations control how elements appear and disappear from the DOM. They transform jarring additions and removals into smooth, intentional transitions that maintain visual continuity.

Key concepts:
- **Enter animation:** Element fades/slides/scales in when mounted
- **Exit animation:** Element fades/slides/scales out before unmounting
- **AnimatePresence:** React wrapper that enables exit animations

Without exit animations, elements simply disappear — breaking the illusion of a continuous interface.

## 2. Why This Matters for Design Engineers

Enter/exit animations create polished experiences:
- Modals feel like natural overlays
- Lists feel dynamic and alive
- Notifications communicate urgency
- Page transitions feel spatial

As a Design Engineer, you must:
- Choose appropriate animation styles for context
- Coordinate enter/exit with AnimatePresence
- Handle layout shifts gracefully
- Consider reduced motion preferences

## 3. Key Principles / Mental Models

### Consistency of Motion Direction
Elements should exit the way they entered, or move to their "destination":
- Modal: Enter from center (scale up), exit to center (scale down)
- Sidebar: Enter from left, exit to left
- Dropdown: Enter from top, exit to top
- Toast: Enter from side, exit to side (or up when dismissed)

### Animation Characteristics
| Enter | Exit |
|-------|------|
| Slower (300-400ms) | Faster (200-250ms) |
| Ease-out | Ease-in |
| Draws attention | Quick and unobtrusive |

### The AnimatePresence Pattern
```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}    // Starting state
      animate={{ opacity: 1 }}    // Active state
      exit={{ opacity: 0 }}       // Exit state (requires AnimatePresence)
    />
  )}
</AnimatePresence>
```

## 4. Implementation in React

### Basic Enter/Exit

```tsx
import { motion, AnimatePresence } from 'framer-motion';

function FadeInOut({ isVisible, children }: {
  isVisible: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Slide In/Out

```tsx
const slideVariants = {
  initial: { x: '100%', opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 30 
    }
  },
  exit: { 
    x: '100%', 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  },
};

function SlideInPanel({ isOpen, children }: PanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl"
        >
          {children}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
```

### Scale Modal

```tsx
const modalVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    y: 10,
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.15 }
  },
};

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-white rounded-xl p-6 pointer-events-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

## 5. React Patterns to Use

### Mode for Sequential Animations

```tsx
// wait: Exit completes before enter starts
// popLayout: Layout animates smoothly
// sync: Enter and exit happen simultaneously

function PageTransition({ children, key }: { children: ReactNode; key: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### List with Enter/Exit

```tsx
function AnimatedList({ items }: { items: Item[] }) {
  return (
    <AnimatePresence mode="popLayout">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, x: -20, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            scale: 1,
            transition: { delay: index * 0.05 }
          }}
          exit={{ 
            opacity: 0, 
            x: 20, 
            scale: 0.95,
            transition: { duration: 0.2 }
          }}
          className="p-4 bg-white rounded-lg mb-2"
        >
          {item.content}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
```

### Direction-Aware Page Transitions

```tsx
function usePageDirection(pathname: string) {
  const prevPath = useRef(pathname);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    // Simple direction based on path depth
    const prevDepth = prevPath.current.split('/').length;
    const currentDepth = pathname.split('/').length;
    
    setDirection(currentDepth > prevDepth ? 1 : -1);
    prevPath.current = pathname;
  }, [pathname]);

  return direction;
}

function DirectionalPageTransition({ children, pathname }: Props) {
  const direction = usePageDirection(pathname);

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={pathname}
        custom={direction}
        variants={{
          enter: (dir: number) => ({
            x: dir > 0 ? '100%' : '-100%',
            opacity: 0,
          }),
          center: {
            x: 0,
            opacity: 1,
          },
          exit: (dir: number) => ({
            x: dir > 0 ? '-100%' : '100%',
            opacity: 0,
          }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Conditional Animations Based on Exit Reason

```tsx
type ExitReason = 'dismiss' | 'complete' | 'replace';

function Toast({ 
  id, 
  message, 
  onExit 
}: { 
  id: string; 
  message: string; 
  onExit: (id: string, reason: ExitReason) => void;
}) {
  const [exitReason, setExitReason] = useState<ExitReason>('dismiss');

  const handleDismiss = () => {
    setExitReason('dismiss');
    onExit(id, 'dismiss');
  };

  const exitVariants = {
    dismiss: { x: '100%', opacity: 0 },
    complete: { y: -20, opacity: 0 },
    replace: { scale: 0.8, opacity: 0 },
  };

  return (
    <motion.div
      layout
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={exitVariants[exitReason]}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {message}
      <button onClick={handleDismiss}>×</button>
    </motion.div>
  );
}
```

## 6. Important Hooks

### usePresence

```tsx
import { usePresence } from 'framer-motion';

function CustomExitAnimation() {
  const [isPresent, safeToRemove] = usePresence();

  useEffect(() => {
    if (!isPresent) {
      // Perform custom exit animation
      const animation = animate(element, { opacity: 0 }, { duration: 0.3 });
      animation.then(() => safeToRemove?.());
    }
  }, [isPresent, safeToRemove]);

  return <div>Content</div>;
}
```

### useExitAnimation Hook

```tsx
function useExitAnimation(
  ref: RefObject<HTMLElement>,
  variants: { exit: AnimationControls }
) {
  const [isPresent, safeToRemove] = usePresence();

  useEffect(() => {
    if (!isPresent && ref.current) {
      animate(ref.current, variants.exit)
        .then(() => safeToRemove?.());
    }
  }, [isPresent, safeToRemove, ref, variants]);

  return isPresent;
}
```

## 7. Animation Considerations

### Enter vs. Exit Timing

```tsx
const asymmetricVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1], // Ease-out
    }
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1], // Ease-in
    }
  },
};
```

### Staggered Enter/Exit

```tsx
const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1, // Reverse order for exit
    }
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

function StaggeredList({ items }: { items: Item[] }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {items.map(item => (
        <motion.li key={item.id} variants={itemVariants}>
          {item.content}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Preserving Exit Animation State

```tsx
// For exit animations that need current animated values
function PositionPreservingExit({ items }: { items: Item[] }) {
  return (
    <AnimatePresence>
      {items.map(item => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            // Use layout: true to maintain position during exit
          }}
        >
          {item.content}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
```

## 8. Performance Considerations

### Avoid Layout Thrashing

```tsx
// ❌ Causes layout thrash during exit
exit={{ height: 0, opacity: 0 }}

// ✅ Use transform properties
exit={{ 
  opacity: 0, 
  scale: 0.95,
  y: -10 
}}
```

### Use mode="popLayout" for Lists

```tsx
// Prevents layout jumps when items exit
<AnimatePresence mode="popLayout">
  {items.map(item => (
    <motion.div 
      key={item.id}
      layout
      exit={{ opacity: 0 }}
    />
  ))}
</AnimatePresence>
```

## 9. Common Mistakes

### 1. Missing Key Prop
**Problem:** AnimatePresence can't track elements.
**Solution:** Always provide unique key to direct children.

### 2. Wrapping Multiple Children
**Problem:** Exit animations don't work on fragments.
**Solution:** Wrap in motion component or use key on wrapper.

### 3. Mode Mismatch
**Problem:** Enter and exit overlap unexpectedly.
**Solution:** Use mode="wait" for sequential transitions.

### 4. Not Using Initial False
**Problem:** Animation plays on initial mount.
**Solution:** Use `initial={false}` when not desired.

### 5. Forgetting AnimatePresence
**Problem:** Exit animation never plays.
**Solution:** Wrap conditional render in AnimatePresence.

## 10. Practice Exercises

### Exercise 1: Notification System
Build a notification system with enter from right, exit to right.

### Exercise 2: Modal Stack
Create modals that stack with scale reduction on background modals.

### Exercise 3: Tab Content
Build tabs where content cross-fades between tabs.

### Exercise 4: Wizard Steps
Create a multi-step wizard with direction-aware transitions.

### Exercise 5: Collapsible Section
Build an accordion with smooth height animation.

## 11. Advanced Topics

- **Shared Layout Transitions** — Elements morphing between states
- **Portal Exit Animations** — Animating portaled content
- **Route-Based Transitions** — SPA navigation animations
- **Orchestration** — Complex multi-element choreography
- **Custom Exit Triggers** — Swipe-to-dismiss patterns
- **Memory Management** — Cleaning up after exit animations
