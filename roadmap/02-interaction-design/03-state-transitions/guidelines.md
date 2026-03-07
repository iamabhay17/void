# State Transitions

## 1. Concept Overview

State transitions are the animated changes between different states of a UI element or view. They communicate change, maintain context, and guide user attention.

Common state transitions:
- **Component states** — default → hover → active → disabled
- **Data states** — loading → success/error
- **View states** — collapsed → expanded
- **Page states** — list view → detail view
- **Presence states** — mounting → unmounting

Good state transitions help users understand:
- What changed
- Why it changed
- What they can do next

## 2. Why This Matters for Design Engineers

State transitions are how your UI "breathes":
- Abrupt changes feel jarring and confusing
- Smooth transitions create perceived continuity
- Thoughtful transitions guide attention to what matters

As a Design Engineer, you must:
- Identify all states an element can be in
- Design transitions between every state pair
- Handle interruptions gracefully
- Ensure transitions serve UX, not just aesthetics

Linear excels at state transitions — elements flow smoothly between states, making the interface feel alive and responsive.

## 3. Key Principles / Mental Models

### States Are Exhaustive
For any component, list ALL possible states:
- Default, Hover, Active, Focus, Disabled
- Loading, Success, Error, Empty
- Selected, Unselected
- Open, Closed

Then design transitions between each pair.

### Transition Duration by Scope
- **Micro (buttons, icons):** 100-200ms
- **Small (cards, dropdowns):** 200-300ms  
- **Medium (modals, panels):** 300-400ms
- **Large (page transitions):** 400-600ms

### Exit Before Enter
When content changes, exit the old content before entering the new:
1. Old content fades/slides out
2. Brief pause (optional)
3. New content fades/slides in

### Continuity Over Flash
Shared elements should maintain visual continuity:
- A card expanding into a modal
- An avatar moving to a new position
- A color morphing rather than switching

## 4. Implementation in React

### Component State Transitions

```tsx
import { motion, AnimatePresence } from 'framer-motion';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

function StatefulButton({ onClick }: { onClick: () => Promise<void> }) {
  const [state, setState] = useState<ButtonState>('idle');

  const handleClick = async () => {
    setState('loading');
    try {
      await onClick();
      setState('success');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const stateStyles = {
    idle: 'bg-blue-600 hover:bg-blue-700',
    loading: 'bg-blue-600 cursor-wait',
    success: 'bg-green-600',
    error: 'bg-red-600',
  };

  const stateContent = {
    idle: 'Submit',
    loading: <Spinner className="w-5 h-5" />,
    success: <CheckIcon className="w-5 h-5" />,
    error: <XIcon className="w-5 h-5" />,
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={state !== 'idle'}
      className={cn(
        'px-6 py-2 text-white rounded-md font-medium',
        'transition-colors duration-200',
        stateStyles[state]
      )}
      animate={{
        scale: state === 'success' ? [1, 1.05, 1] : 1,
      }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="flex items-center justify-center"
        >
          {stateContent[state]}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
```

### Expandable Card

```tsx
function ExpandableCard({ title, preview, content }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className="bg-white rounded-lg border border-gray-200 cursor-pointer overflow-hidden"
      transition={{
        layout: { type: 'spring', stiffness: 400, damping: 30 },
      }}
    >
      <motion.div layout className="p-4">
        <motion.h3 layout="position" className="font-medium text-gray-900">
          {title}
        </motion.h3>
        
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.p
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-gray-500 text-sm"
            >
              {preview}
            </motion.p>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-gray-600"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
```

### Data State Transitions

```tsx
type DataState<T> = 
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
  | { status: 'empty' };

function DataContainer<T>({ 
  state, 
  renderData 
}: { 
  state: DataState<T>;
  renderData: (data: T) => React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      {state.status === 'loading' && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center py-12"
        >
          <Spinner />
        </motion.div>
      )}
      
      {state.status === 'success' && (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderData(state.data)}
        </motion.div>
      )}
      
      {state.status === 'error' && (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="text-center py-12 text-red-600"
        >
          <AlertIcon className="w-12 h-12 mx-auto mb-4" />
          <p>{state.error}</p>
        </motion.div>
      )}
      
      {state.status === 'empty' && (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center py-12 text-gray-500"
        >
          <EmptyIcon className="w-12 h-12 mx-auto mb-4" />
          <p>No items found</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## 5. React Patterns to Use

### State Machine Pattern

```tsx
import { useMachine } from '@xstate/react';
import { createMachine } from 'xstate';

const toggleMachine = createMachine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: {
      on: { TOGGLE: 'active' },
    },
    active: {
      on: { TOGGLE: 'inactive' },
    },
  },
});

function Toggle() {
  const [state, send] = useMachine(toggleMachine);
  
  return (
    <motion.button
      onClick={() => send('TOGGLE')}
      animate={{
        backgroundColor: state.matches('active') ? '#3b82f6' : '#e5e7eb',
      }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        animate={{ x: state.matches('active') ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}
```

### Transition Component Factory

```tsx
function createTransition(config: {
  initial: any;
  animate: any;
  exit: any;
  transition?: any;
}) {
  return function Transition({ 
    children, 
    show 
  }: { 
    children: React.ReactNode; 
    show: boolean;
  }) {
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            initial={config.initial}
            animate={config.animate}
            exit={config.exit}
            transition={config.transition}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
}

// Create reusable transitions
const FadeTransition = createTransition({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
});

const SlideUpTransition = createTransition({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
});

const ScaleTransition = createTransition({
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 },
});

// Usage
<FadeTransition show={isVisible}>
  <Content />
</FadeTransition>
```

### Presence-Based Transitions

```tsx
function PresenceList({ items }) {
  return (
    <AnimatePresence>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            transition: { delay: index * 0.05 },
          }}
          exit={{ 
            opacity: 0, 
            x: 20,
            transition: { duration: 0.2 },
          }}
          layout
          className="p-4 bg-white border-b"
        >
          {item.content}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
```

## 6. Important Hooks

### useTransitionState

```tsx
function useTransitionState<T>(
  value: T,
  duration: number = 300
): { current: T; previous: T | null; isTransitioning: boolean } {
  const [state, setState] = useState({
    current: value,
    previous: null as T | null,
    isTransitioning: false,
  });

  useEffect(() => {
    if (value !== state.current) {
      setState(prev => ({
        current: value,
        previous: prev.current,
        isTransitioning: true,
      }));

      const timeout = setTimeout(() => {
        setState(prev => ({ ...prev, isTransitioning: false }));
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [value, duration]);

  return state;
}

// Usage
function Counter({ count }) {
  const { current, previous, isTransitioning } = useTransitionState(count);
  
  return (
    <div className="relative">
      {isTransitioning && previous !== null && (
        <motion.span
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -20 }}
          className="absolute inset-0"
        >
          {previous}
        </motion.span>
      )}
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {current}
      </motion.span>
    </div>
  );
}
```

### useAnimationState

```tsx
function useAnimationState(states: Record<string, any>) {
  const [currentState, setCurrentState] = useState(Object.keys(states)[0]);
  
  const transition = useCallback((to: string) => {
    if (states[to]) {
      setCurrentState(to);
    }
  }, [states]);

  return {
    state: currentState,
    props: states[currentState],
    transition,
  };
}

// Usage
function AnimatedBox() {
  const { state, props, transition } = useAnimationState({
    idle: { scale: 1, backgroundColor: '#e5e7eb' },
    hovered: { scale: 1.05, backgroundColor: '#dbeafe' },
    pressed: { scale: 0.98, backgroundColor: '#bfdbfe' },
  });

  return (
    <motion.div
      animate={props}
      onHoverStart={() => transition('hovered')}
      onHoverEnd={() => transition('idle')}
      onTapStart={() => transition('pressed')}
      onTap={() => transition('hovered')}
    />
  );
}
```

## 7. Animation Considerations

### Interruptible Transitions

```tsx
// Framer Motion handles interruptions automatically
<motion.div
  animate={{ x: isOpen ? 200 : 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
/>
// If isOpen changes mid-animation, it smoothly transitions to new target
```

### Exit Animations

```tsx
// Always wrap exiting elements in AnimatePresence
<AnimatePresence mode="wait">
  {items.map(item => (
    <motion.div
      key={item.id}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      {item.content}
    </motion.div>
  ))}
</AnimatePresence>
```

### Coordinated Transitions

```tsx
function CoordinatedTransition({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop appears first */}
          <motion.div
            className="fixed inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Content appears after backdrop */}
          <motion.div
            className="fixed inset-4 bg-white rounded-lg"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## 8. Performance Considerations

### Avoid Layout Animations on Many Elements

```tsx
// ❌ Layout animation on every list item
{items.map(item => (
  <motion.div key={item.id} layout>
    {item.content}
  </motion.div>
))}

// ✅ Layout animation only on container
<motion.div layout>
  {items.map(item => (
    <div key={item.id}>{item.content}</div>
  ))}
</motion.div>
```

### Use layoutId for Shared Element Transitions

```tsx
// This is more performant than manually coordinating two elements
<motion.div layoutId={`card-${id}`}>
  {/* This element will smoothly transition between positions */}
</motion.div>
```

### Measure Once, Animate Many

```tsx
// ❌ Reading layout during animation
const handleAnimate = () => {
  const height = element.getBoundingClientRect().height; // Forces layout
  setAnimatedHeight(height);
};

// ✅ Measure before animation starts
const cachedHeight = useRef(0);
useLayoutEffect(() => {
  cachedHeight.current = element.getBoundingClientRect().height;
}, []);
```

## 9. Common Mistakes

### 1. Missing Exit Animations
**Problem:** Elements just disappear.
**Solution:** Always use AnimatePresence for mounting/unmounting.

### 2. Transitions Too Slow
**Problem:** Users wait for animations to complete.
**Solution:** Keep transitions under 400ms. Let users interrupt.

### 3. Inconsistent State Styling
**Problem:** Error state looks different across components.
**Solution:** Create standardized state styles and transitions.

### 4. No Loading States
**Problem:** UI freezes during async operations.
**Solution:** Always show loading states with transitions.

### 5. Breaking on Interruption
**Problem:** Animation breaks if user acts mid-transition.
**Solution:** Use spring animations that handle interruptions gracefully.

## 10. Practice Exercises

### Exercise 1: Multi-State Button
Build a button with idle, hover, loading, success, and error states with smooth transitions.

### Exercise 2: Expanding Card
Create a card that expands to show more content with layout animation.

### Exercise 3: Tab Transition
Implement a tab component with cross-fade transitions between panels.

### Exercise 4: List Reorder
Build a list that animates smoothly when items are reordered.

### Exercise 5: Page Transition
Create a page transition with coordinated exit and enter animations.

## 11. Advanced Topics

- **Shared Element Transitions** — Hero animations between views
- **View Transitions API** — Browser-native page transitions
- **FLIP Technique** — First, Last, Invert, Play for layout animations
- **State Machines** — XState for complex state management
- **Gesture-Driven Transitions** — Drag to dismiss, swipe to navigate
- **Predictive Preloading** — Preloading content for instant transitions
