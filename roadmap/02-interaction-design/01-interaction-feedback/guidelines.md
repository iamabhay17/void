# Interaction Feedback

## 1. Concept Overview

Interaction feedback is the system's response to user actions. Every tap, click, hover, or keystroke should produce a perceptible response that confirms the action was registered.

Types of feedback:
- **Visual** — Color changes, animations, state changes
- **Haptic** — Vibrations on touch devices
- **Auditory** — Sounds and audio cues
- **Spatial** — Position and size changes

Good feedback is:
- **Immediate** — Responds within 100ms
- **Appropriate** — Matches the significance of the action
- **Consistent** — Same actions produce same feedback
- **Informative** — Communicates what happened and what's next

## 2. Why This Matters for Design Engineers

Feedback is what makes interfaces feel "alive":
- No feedback = "Is it broken?"
- Slow feedback = "This feels laggy"
- Good feedback = "This feels great"

As a Design Engineer, you must:
- Ensure instant visual responses to interactions
- Create appropriate feedback for different action types
- Balance feedback intensity (not everything needs a bounce)
- Handle loading and async states gracefully

Products like Linear feel incredible because every interaction has perfectly tuned feedback.

## 3. Key Principles / Mental Models

### The 100ms Rule
Users perceive delays over 100ms. Your visual feedback must start within this window, even if the action isn't complete.

### Feedback Hierarchy
Match feedback intensity to action significance:
- **Subtle** — Hover states, minor selections
- **Moderate** — Button clicks, form submissions
- **Significant** — Destructive actions, major completions

### Optimistic UI
Show feedback for expected outcomes immediately, then reconcile with reality:
1. User clicks "Like"
2. Heart fills instantly
3. Server request happens in background
4. If fails, revert with error message

### State Communication
Every interactive element has states. Communicate them:
- Default → Hover → Active → Focus → Disabled
- Loading → Success → Error

## 4. Implementation in React

### Button with Complete Feedback

```tsx
import { motion } from 'framer-motion';

function Button({ 
  children, 
  onClick, 
  isLoading,
  disabled 
}: {
  children: React.ReactNode;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isLoading}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        'relative px-4 py-2 bg-blue-600 text-white rounded-md font-medium',
        'transition-colors duration-150',
        'hover:bg-blue-700',
        'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      {/* Loading spinner */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Spinner size="sm" />
        </motion.div>
      )}
      
      {/* Content - fades when loading */}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </motion.button>
  );
}
```

### Optimistic Toggle

```tsx
function LikeButton({ itemId, initialLiked }) {
  const [liked, setLiked] = useState(initialLiked);
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    // Optimistic update
    setLiked(!liked);
    setIsPending(true);

    try {
      await toggleLike(itemId);
    } catch (error) {
      // Revert on failure
      setLiked(liked);
      toast.error('Failed to update');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      animate={{
        scale: liked ? [1, 1.2, 1] : 1,
      }}
      transition={{ duration: 0.3 }}
      className={cn(
        'p-2 rounded-full transition-colors',
        liked ? 'text-red-500' : 'text-gray-400'
      )}
    >
      <HeartIcon filled={liked} />
    </motion.button>
  );
}
```

### Hover State Component

```tsx
function InteractiveCard({ children, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="relative bg-white rounded-lg border border-gray-200 p-4 cursor-pointer"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Hover highlight */}
      <motion.div
        className="absolute inset-0 bg-gray-50 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Arrow indicator on hover */}
      <motion.div
        className="absolute right-4 top-1/2 -translate-y-1/2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ 
          opacity: isHovered ? 1 : 0, 
          x: isHovered ? 0 : -10 
        }}
        transition={{ duration: 0.2 }}
      >
        <ArrowRightIcon className="w-4 h-4 text-gray-400" />
      </motion.div>
    </motion.div>
  );
}
```

## 5. React Patterns to Use

### Feedback Context

```tsx
const FeedbackContext = createContext<{
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  hapticFeedback: (type: 'light' | 'medium' | 'heavy') => void;
} | null>(null);

function FeedbackProvider({ children }) {
  const showSuccess = useCallback((message: string) => {
    toast.success(message);
    // Could also play a sound or trigger haptic
  }, []);

  const showError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy') => {
    if ('vibrate' in navigator) {
      const durations = { light: 10, medium: 20, heavy: 30 };
      navigator.vibrate(durations[type]);
    }
  }, []);

  return (
    <FeedbackContext.Provider value={{ showSuccess, showError, hapticFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
}

function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback must be within FeedbackProvider');
  return context;
}
```

### Compound Feedback Component

```tsx
const Clickable = ({ children, onClick, feedback = 'scale' }) => {
  const feedbackVariants = {
    scale: { whileTap: { scale: 0.98 } },
    push: { whileTap: { y: 2 } },
    glow: { whileTap: { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' } },
  };

  return (
    <motion.div
      onClick={onClick}
      className="cursor-pointer"
      {...feedbackVariants[feedback]}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

// Usage
<Clickable feedback="scale" onClick={handleClick}>
  <Card>Content</Card>
</Clickable>
```

## 6. Important Hooks

### useHover

```tsx
function useHover<T extends HTMLElement>() {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return { ref, isHovered };
}

// Usage
function Card() {
  const { ref, isHovered } = useHover<HTMLDivElement>();
  
  return (
    <div ref={ref} className={isHovered ? 'shadow-lg' : 'shadow-sm'}>
      Content
    </div>
  );
}
```

### usePress

```tsx
function usePress<T extends HTMLElement>() {
  const [isPressed, setIsPressed] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handlePointerDown = () => setIsPressed(true);
    const handlePointerUp = () => setIsPressed(false);
    const handlePointerLeave = () => setIsPressed(false);

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return { ref, isPressed };
}
```

### useOptimisticUpdate

```tsx
function useOptimisticUpdate<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue);
  const [optimisticValue, setOptimisticValue] = useState(initialValue);
  const [isPending, setIsPending] = useState(false);

  const optimisticUpdate = useCallback(
    async (
      newValue: T,
      asyncAction: () => Promise<void>
    ) => {
      const previousValue = value;
      
      // Optimistic update
      setOptimisticValue(newValue);
      setIsPending(true);

      try {
        await asyncAction();
        setValue(newValue);
      } catch (error) {
        // Revert on failure
        setOptimisticValue(previousValue);
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [value]
  );

  return {
    value: isPending ? optimisticValue : value,
    optimisticUpdate,
    isPending,
  };
}
```

## 7. Animation Considerations

### Immediate vs. Animated Feedback

```tsx
// Immediate feedback (hover) - fast transitions
<motion.button
  whileHover={{ backgroundColor: '#f3f4f6' }}
  transition={{ duration: 0.1 }} // Fast
>
  Button
</motion.button>

// Significant feedback (success) - slower, more prominent
<motion.div
  animate={{ scale: [1, 1.1, 1] }}
  transition={{ duration: 0.4, ease: 'easeOut' }} // Slower
>
  <CheckIcon />
</motion.div>
```

### Loading State Feedback

```tsx
function SubmitButton({ isLoading }) {
  return (
    <motion.button
      disabled={isLoading}
      className="relative overflow-hidden"
    >
      {/* Progress indicator */}
      <motion.div
        className="absolute inset-0 bg-blue-700"
        initial={{ x: '-100%' }}
        animate={{ x: isLoading ? '0%' : '-100%' }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <span className="relative z-10">
        {isLoading ? 'Submitting...' : 'Submit'}
      </span>
    </motion.button>
  );
}
```

### Ripple Effect

```tsx
function RippleButton({ children, onClick }) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRipples(prev => [...prev, { x, y, id: Date.now() }]);
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className="relative overflow-hidden px-4 py-2 bg-blue-600 text-white rounded"
    >
      {children}
      
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
          }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 20, opacity: 0 }}
          transition={{ duration: 0.6 }}
          onAnimationComplete={() => {
            setRipples(prev => prev.filter(r => r.id !== ripple.id));
          }}
        />
      ))}
    </button>
  );
}
```

## 8. Performance Considerations

### Use CSS for Simple Feedback

```tsx
// ❌ JS for simple hover
<motion.button whileHover={{ backgroundColor: '#f3f4f6' }}>
  Click me
</motion.button>

// ✅ CSS is more performant
<button className="hover:bg-gray-100 transition-colors duration-150">
  Click me
</button>
```

### Debounce Rapid Feedback

```tsx
function useDebouncedfeedback(delay = 100) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const trigger = useCallback((action: () => void) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(action, delay);
  }, [delay]);

  return trigger;
}
```

### Avoid Layout Shifts

```tsx
// ❌ Causes layout shift
<button className={isLoading ? 'w-48' : 'w-24'}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>

// ✅ Fixed dimensions, content changes
<button className="w-24">
  {isLoading ? <Spinner /> : 'Submit'}
</button>
```

## 9. Common Mistakes

### 1. No Hover States
**Problem:** Interactive elements don't respond to hover.
**Solution:** Every clickable element needs a hover state.

### 2. Delayed Feedback
**Problem:** Visual change happens after action completes.
**Solution:** Show immediate feedback, then update with result.

### 3. Inconsistent Feedback
**Problem:** Similar buttons have different feedback behaviors.
**Solution:** Create a feedback system and apply it consistently.

### 4. Over-The-Top Feedback
**Problem:** Every click triggers a dramatic animation.
**Solution:** Match feedback intensity to action importance.

### 5. Missing Disabled States
**Problem:** Disabled buttons still show hover effects.
**Solution:** Explicitly disable all feedback for disabled states.

## 10. Practice Exercises

### Exercise 1: Complete Button States
Build a button with all states: default, hover, active, focus, disabled, loading.

### Exercise 2: Optimistic Like Button
Create a like button with optimistic updates and failure handling.

### Exercise 3: Ripple Effect
Implement Material Design-style ripple effect on button click.

### Exercise 4: Loading Skeleton
Build a skeleton loading state that provides visual feedback during data fetching.

### Exercise 5: Form Validation Feedback
Create a form input with real-time validation feedback (success/error states).

## 11. Advanced Topics

- **Haptic Feedback** — Using Vibration API for mobile
- **Sound Design** — Audio feedback for significant actions
- **Progress Feedback** — Complex loading states and progress indicators
- **Error Recovery** — Feedback that helps users recover from errors
- **Contextual Feedback** — Different feedback based on context
- **Accessibility Feedback** — Screen reader announcements for state changes
