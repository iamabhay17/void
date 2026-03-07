# AnimatePresence

## 1. Concept Overview

AnimatePresence enables exit animations for components that are removed from the React tree. Without it, components unmount immediately—with it, they can animate out gracefully.

Key capabilities:
- Exit animations for conditionally rendered components
- Mode control (sync, wait, popLayout)
- Custom exit animations based on context
- Maintaining component state during exit

```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div exit={{ opacity: 0 }}>
      Now I can animate out!
    </motion.div>
  )}
</AnimatePresence>
```

## 2. Why This Matters for Design Engineers

Exit animations create polished experiences:
- Modals fade/slide out instead of disappearing
- List items animate away when removed
- Page transitions feel spatial
- Notifications dismiss gracefully

As a Design Engineer, you must:
- Understand when AnimatePresence is needed
- Choose appropriate exit modes
- Handle exit state for complex components
- Coordinate exits with enters

## 3. Key Principles / Mental Models

### The Exit Problem
React unmounts components synchronously:
```tsx
// Without AnimatePresence:
{isVisible && <div>I disappear instantly</div>}

// With AnimatePresence:
<AnimatePresence>
  {isVisible && <motion.div exit={{ opacity: 0 }}>I fade out</motion.div>}
</AnimatePresence>
```

### Mode Options
```tsx
// sync (default): Enter and exit happen simultaneously
<AnimatePresence mode="sync">

// wait: Exit completes before enter begins
<AnimatePresence mode="wait">

// popLayout: Exiting elements maintain position
<AnimatePresence mode="popLayout">
```

### Key Prop Importance
AnimatePresence tracks children by key:
```tsx
<AnimatePresence>
  <motion.div key={currentPage}> {/* Key change triggers exit/enter */}
    {pages[currentPage]}
  </motion.div>
</AnimatePresence>
```

## 4. Implementation in React

### Basic Modal Exit

```tsx
function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-x-4 top-1/4 z-50 bg-white rounded-xl p-6"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### List with Item Exit

```tsx
function AnimatedList({ items, onRemove }: ListProps) {
  return (
    <ul className="space-y-2">
      <AnimatePresence>
        {items.map(item => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
            className="p-4 bg-white rounded-lg shadow flex justify-between"
          >
            {item.content}
            <button onClick={() => onRemove(item.id)}>×</button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
```

### Page Transitions with mode="wait"

```tsx
function PageTransition({ children, pageKey }: { children: ReactNode; pageKey: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
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

// Usage with router
function App() {
  const location = useLocation();

  return (
    <PageTransition pageKey={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </PageTransition>
  );
}
```

### Notification Stack

```tsx
interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function NotificationStack({ notifications, onDismiss }: Props) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 0.5, 
              transition: { duration: 0.2 } 
            }}
            className={cn(
              'p-4 rounded-lg shadow-lg',
              notification.type === 'success' && 'bg-green-500 text-white',
              notification.type === 'error' && 'bg-red-500 text-white',
              notification.type === 'info' && 'bg-blue-500 text-white',
            )}
          >
            {notification.message}
            <button onClick={() => onDismiss(notification.id)} className="ml-4">
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

## 5. React Patterns to Use

### Custom Exit Variants

```tsx
type ExitType = 'fade' | 'slide' | 'scale';

function DynamicExit({ exitType, children }: { exitType: ExitType; children: ReactNode }) {
  const exitVariants: Record<ExitType, Variant> = {
    fade: { opacity: 0 },
    slide: { x: '100%', opacity: 0 },
    scale: { scale: 0, opacity: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={exitVariants[exitType]}
    >
      {children}
    </motion.div>
  );
}
```

### Exit Direction Based on Action

```tsx
function DirectionalExit({ direction }: { direction: 'left' | 'right' }) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={currentSlide}
        custom={direction}
        variants={{
          enter: (dir: string) => ({
            x: dir === 'right' ? '100%' : '-100%',
            opacity: 0,
          }),
          center: { x: 0, opacity: 1 },
          exit: (dir: string) => ({
            x: dir === 'right' ? '-100%' : '100%',
            opacity: 0,
          }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
      >
        {slides[currentSlide]}
      </motion.div>
    </AnimatePresence>
  );
}
```

### PopLayout for List Items

```tsx
function SmoothListRemoval({ items }: { items: Item[] }) {
  return (
    <AnimatePresence mode="popLayout">
      {items.map(item => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          // popLayout maintains position during exit
          // so remaining items animate smoothly
        >
          {item.content}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
```

### onExitComplete Callback

```tsx
function ModalWithCallback({ isOpen, onClose, onClosed }: Props) {
  return (
    <AnimatePresence onExitComplete={onClosed}>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button onClick={onClose}>Close</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Usage
<ModalWithCallback
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onClosed={() => {
    // Runs after exit animation completes
    navigateAway();
  }}
/>
```

## 6. Important Hooks

### usePresence

```tsx
import { usePresence, motion } from 'framer-motion';

function CustomExitComponent() {
  const [isPresent, safeToRemove] = usePresence();

  useEffect(() => {
    if (!isPresent) {
      // Component is exiting - perform custom exit logic
      doExitAnimation().then(safeToRemove);
    }
  }, [isPresent, safeToRemove]);

  return <div>Custom exit handling</div>;
}
```

### useIsPresent

```tsx
import { useIsPresent } from 'framer-motion';

function ExitAwareComponent() {
  const isPresent = useIsPresent();

  return (
    <div className={isPresent ? 'present' : 'exiting'}>
      {isPresent ? 'Visible' : 'Exiting...'}
    </div>
  );
}
```

## 7. Animation Considerations

### Coordinating Enter and Exit

```tsx
const variants = {
  initial: { 
    opacity: 0, 
    y: 20,
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.2, // Faster exit
      ease: [0.4, 0, 1, 1],
    },
  },
};
```

### Exit with Children

```tsx
const containerVariants = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
  exit: {
    transition: { 
      staggerChildren: 0.05,
      staggerDirection: -1, // Reverse stagger on exit
      when: 'afterChildren', // Children exit first
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};
```

### Preserving State During Exit

```tsx
function PreservedStateModal({ isOpen }: { isOpen: boolean }) {
  const [formData, setFormData] = useState({});

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div exit={{ opacity: 0 }}>
          {/* Form data persists during exit animation */}
          <form>
            <input 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## 8. Performance Considerations

### Avoid Multiple AnimatePresence Wrappers

```tsx
// ❌ Inefficient
<AnimatePresence>
  {items.map(item => (
    <AnimatePresence key={item.id}>
      <motion.div exit={{ opacity: 0 }}>
        {item.content}
      </motion.div>
    </AnimatePresence>
  ))}
</AnimatePresence>

// ✅ Single wrapper
<AnimatePresence>
  {items.map(item => (
    <motion.div key={item.id} exit={{ opacity: 0 }}>
      {item.content}
    </motion.div>
  ))}
</AnimatePresence>
```

### Exit Only When Necessary

```tsx
// ❌ Always wrapping
<AnimatePresence>
  <motion.div>Static content without exit</motion.div>
</AnimatePresence>

// ✅ Only wrap conditional content
<motion.div>Static content</motion.div>
<AnimatePresence>
  {showOptional && (
    <motion.div exit={{ opacity: 0 }}>
      Conditional content
    </motion.div>
  )}
</AnimatePresence>
```

### Mode Selection

```tsx
// mode="sync" - Best performance, enter/exit overlap
// mode="wait" - Sequential, cleaner but slower perceived
// mode="popLayout" - Best for lists, prevents layout jumps
```

## 9. Common Mistakes

### 1. Missing Key Prop
**Problem:** AnimatePresence can't track which element exited.
**Solution:** Always provide unique key to direct children.

### 2. Exit Not Defined
**Problem:** Component has AnimatePresence but no exit prop.
**Solution:** Add exit variant/prop to motion component.

### 3. Multiple Direct Children Without Keys
**Problem:** AnimatePresence requires trackable children.
**Solution:** Wrap multiple children or provide keys.

### 4. Mode="wait" Performance
**Problem:** mode="wait" feels slow for lists.
**Solution:** Use mode="popLayout" for lists.

### 5. Exit Blocked by State Reset
**Problem:** Parent unmounts before exit completes.
**Solution:** Move state higher or use portal.

## 10. Practice Exercises

### Exercise 1: Toast System
Build a toast notification system with stacked enter/exit.

### Exercise 2: Image Carousel
Create a carousel with directional enter/exit animations.

### Exercise 3: Dropdown Menu
Build a dropdown with items that stagger out on close.

### Exercise 4: Modal Stack
Create stackable modals where each has independent exit.

### Exercise 5: Route Transitions
Implement page transitions with different modes for different routes.

## 11. Advanced Topics

- **Portal Exit Animations** — Animating portaled content
- **Exit Coordination** — Multiple elements exiting together
- **Exit Interruption** — Handling rapid open/close
- **Custom Exit Triggers** — Gesture-based dismissal
- **Exit with Data** — Preserving data during exit
- **SSR Considerations** — AnimatePresence with server rendering
