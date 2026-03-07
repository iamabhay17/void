# Intentional Animation

## 1. Concept Overview

Intentional animation means every motion serves a purpose. It's the practice of asking "why animate this?" before "how to animate this?"

Purposes for animation:
- **Communicate** — Show relationships, indicate state changes
- **Guide** — Direct attention, reveal hierarchy
- **Confirm** — Acknowledge actions, show completion
- **Connect** — Maintain spatial continuity, preserve context
- **Delight** — Add personality, create emotional response (use sparingly)

The key insight: **absence of animation can be as intentional as presence**.

## 2. Why This Matters for Design Engineers

Animation without intention is noise:
- It distracts from content
- It slows down interaction
- It feels gimmicky or unprofessional

As a Design Engineer, you must:
- Question every animation's purpose
- Remove animations that don't serve users
- Match animation intensity to importance
- Know when NOT to animate

Apple's interfaces are a masterclass in intentional animation—every transition has a reason, and many interactions are deliberately instant.

## 3. Key Principles / Mental Models

### The Why Test
Before adding animation, answer:
1. What does this animation communicate?
2. Would the interface be worse without it?
3. Does it help or distract?

If you can't answer clearly, don't animate.

### Animation Intent Categories

**Functional Animation** (always appropriate):
- Loading indicators
- State change feedback
- Error/success confirmation
- Focus indicators

**Transitional Animation** (usually appropriate):
- Page transitions
- Modal enter/exit
- Content reveals
- Layout shifts

**Decorative Animation** (use sparingly):
- Brand expressions
- Celebration moments
- Idle animations
- Easter eggs

### The Cost-Benefit Analysis
Every animation has costs:
- Development time
- Runtime performance
- User attention
- Interaction delay

Benefits must outweigh costs.

### When NOT to Animate
- Repeated actions (user will perform thousands of times)
- Text content changes
- Data refresh (unless significant)
- Navigation between similar views
- Anything that blocks or delays interaction

## 4. Implementation in React

### Conditional Animation Based on Intent

```tsx
type AnimationIntent = 'feedback' | 'transition' | 'decorative' | 'none';

function useIntentionalAnimation(intent: AnimationIntent) {
  const prefersReducedMotion = useReducedMotion();
  
  // No decorative animation if reduced motion preferred
  if (prefersReducedMotion && intent === 'decorative') {
    return { shouldAnimate: false };
  }
  
  // No animation when intent is none
  if (intent === 'none') {
    return { shouldAnimate: false };
  }
  
  // Functional always animates (but simplified for reduced motion)
  if (intent === 'feedback' && prefersReducedMotion) {
    return { 
      shouldAnimate: true,
      config: { duration: 0.1 } // Faster for accessibility
    };
  }
  
  return { 
    shouldAnimate: true,
    config: getConfigForIntent(intent)
  };
}

function IntentionalButton({ intent, children, onClick }) {
  const { shouldAnimate, config } = useIntentionalAnimation(intent);
  
  if (!shouldAnimate) {
    return <button onClick={onClick}>{children}</button>;
  }
  
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={config}
    >
      {children}
    </motion.button>
  );
}
```

### Animation for Confirmation

```tsx
function SaveButton({ onSave }) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = async () => {
    setState('saving');
    await onSave();
    setState('saved');
    setTimeout(() => setState('idle'), 2000);
  };

  return (
    <motion.button
      onClick={handleSave}
      disabled={state === 'saving'}
      // Animation communicates state - intentional
      animate={{
        backgroundColor: 
          state === 'idle' ? '#3b82f6' :
          state === 'saving' ? '#60a5fa' :
          '#10b981',
      }}
      className="px-4 py-2 text-white rounded-md"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {state === 'idle' && 'Save'}
          {state === 'saving' && 'Saving...'}
          {state === 'saved' && '✓ Saved'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
```

### Animation for Spatial Continuity

```tsx
// Hero image expanding into full view - shows relationship
function ExpandableImage({ src, alt }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Thumbnail */}
      <motion.img
        src={src}
        alt={alt}
        layoutId={`image-${src}`} // Maintains visual continuity
        onClick={() => setIsExpanded(true)}
        className="w-32 h-32 object-cover rounded cursor-pointer"
      />
      
      {/* Expanded view */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.img
              src={src}
              alt={alt}
              layoutId={`image-${src}`} // Same layoutId creates continuous animation
              className="max-w-full max-h-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### Removing Unnecessary Animation

```tsx
// ❌ Animation without purpose
function BadList({ items }) {
  return (
    <ul>
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {item.name} {/* Just a simple list - why animate? */}
        </motion.li>
      ))}
    </ul>
  );
}

// ✅ Animation with purpose - only for first load
function GoodList({ items, isFirstLoad }) {
  return (
    <ul>
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          initial={isFirstLoad ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={isFirstLoad ? { delay: i * 0.05 } : undefined}
        >
          {item.name}
        </motion.li>
      ))}
    </ul>
  );
}
```

## 5. React Patterns to Use

### Animation Intent System

```tsx
const AnimationIntentContext = createContext<{
  shouldAnimate: (intent: string) => boolean;
}>({
  shouldAnimate: () => true,
});

type AnimationPolicy = 'all' | 'essential' | 'minimal' | 'none';

function AnimationPolicyProvider({ 
  policy = 'all',
  children 
}: { 
  policy?: AnimationPolicy;
  children: React.ReactNode;
}) {
  const shouldAnimate = useCallback((intent: string) => {
    switch (policy) {
      case 'none':
        return false;
      case 'minimal':
        return intent === 'feedback';
      case 'essential':
        return intent === 'feedback' || intent === 'transition';
      case 'all':
      default:
        return true;
    }
  }, [policy]);

  return (
    <AnimationIntentContext.Provider value={{ shouldAnimate }}>
      {children}
    </AnimationIntentContext.Provider>
  );
}

// Usage in components
function Modal({ children, isOpen }) {
  const { shouldAnimate } = useContext(AnimationIntentContext);
  
  if (!shouldAnimate('transition')) {
    return isOpen ? <div className="modal">{children}</div> : null;
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Purposeful Motion Component

```tsx
type MotionPurpose = 
  | 'communicate-state'
  | 'guide-attention'
  | 'confirm-action'
  | 'connect-context'
  | 'express-brand';

function PurposefulMotion({
  purpose,
  children,
  ...motionProps
}: {
  purpose: MotionPurpose;
  children: React.ReactNode;
} & MotionProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // Document the purpose for future maintainers
  const dataAttributes = {
    'data-motion-purpose': purpose,
  };
  
  // Disable brand expression in reduced motion
  if (prefersReducedMotion && purpose === 'express-brand') {
    return <div {...dataAttributes}>{children}</div>;
  }
  
  return (
    <motion.div {...dataAttributes} {...motionProps}>
      {children}
    </motion.div>
  );
}

// Usage
<PurposefulMotion
  purpose="communicate-state"
  animate={{ backgroundColor: isActive ? 'green' : 'gray' }}
>
  Status indicator
</PurposefulMotion>
```

## 6. Important Hooks

### useFirstMount

```tsx
function useFirstMount() {
  const isFirst = useRef(true);
  
  useEffect(() => {
    isFirst.current = false;
  }, []);
  
  return isFirst.current;
}

// Usage: Only animate on first mount
function ListItem({ children }) {
  const isFirstMount = useFirstMount();
  
  return (
    <motion.li
      initial={isFirstMount ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.li>
  );
}
```

### useAnimationDecision

```tsx
function useAnimationDecision(factors: {
  isSignificantChange?: boolean;
  hasUserJustActed?: boolean;
  isFirstRender?: boolean;
  itemCount?: number;
}): boolean {
  const prefersReducedMotion = useReducedMotion();
  
  // Never animate if user prefers reduced motion for non-essential
  if (prefersReducedMotion && !factors.hasUserJustActed) {
    return false;
  }
  
  // Don't animate large lists (performance)
  if (factors.itemCount && factors.itemCount > 20) {
    return false;
  }
  
  // Only animate first render or significant changes
  return factors.isFirstRender || factors.isSignificantChange || false;
}

// Usage
function ContentSection({ content, isNew }) {
  const shouldAnimate = useAnimationDecision({
    isSignificantChange: isNew,
    isFirstRender: true,
  });
  
  return (
    <motion.section
      initial={shouldAnimate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
    >
      {content}
    </motion.section>
  );
}
```

## 7. Animation Considerations

### Animation Budget

```tsx
// Define a "budget" for animation on a page
const ANIMATION_BUDGET = {
  maxSimultaneous: 5, // Max elements animating at once
  maxStagger: 500, // Max total stagger duration
  maxComplexity: 3, // Max complex animations per page
};

function useAnimationBudget() {
  const [budget, setBudget] = useState(ANIMATION_BUDGET);
  
  const requestAnimation = useCallback((complexity: number) => {
    if (budget.maxComplexity - complexity < 0) {
      return false; // Deny - over budget
    }
    
    setBudget(prev => ({
      ...prev,
      maxComplexity: prev.maxComplexity - complexity,
    }));
    
    return true;
  }, [budget]);
  
  return { budget, requestAnimation };
}
```

### When to Skip Animation

```tsx
function SmartList({ items, refreshTrigger }) {
  const isFirstRender = useRef(true);
  const prevItemCount = usePrevious(items.length);
  
  // Determine if we should animate
  const shouldAnimate = useMemo(() => {
    // First render: animate
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return true;
    }
    
    // Refresh with same items: don't animate
    if (prevItemCount === items.length) {
      return false;
    }
    
    // Major content change: animate
    if (Math.abs((prevItemCount || 0) - items.length) > 5) {
      return true;
    }
    
    // Small change: don't animate (avoid noise)
    return false;
  }, [items.length, prevItemCount]);
  
  return (
    <ul>
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          initial={shouldAnimate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={shouldAnimate ? { delay: i * 0.02 } : undefined}
        >
          {item.content}
        </motion.li>
      ))}
    </ul>
  );
}
```

## 8. Performance Considerations

### Avoid Animation in Lists

```tsx
// ❌ Animating every item in a long list
function BadLongList({ items }) {
  return items.map((item, i) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
    >
      {item.content}
    </motion.div>
  ));
}

// ✅ Only animate visible portion
function GoodLongList({ items }) {
  return (
    <VirtualList
      items={items}
      renderItem={(item, index, isFirstVisible) => (
        <motion.div
          key={item.id}
          initial={isFirstVisible ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
        >
          {item.content}
        </motion.div>
      )}
    />
  );
}
```

### Skip Animation on Data Refresh

```tsx
function DataTable({ data, isRefreshing }) {
  // Don't animate during automatic refresh
  const shouldAnimateRows = !isRefreshing;
  
  return (
    <table>
      <tbody>
        {data.map((row, i) => (
          <motion.tr
            key={row.id}
            // Skip animation during refresh
            initial={shouldAnimateRows ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
          >
            {/* Row content */}
          </motion.tr>
        ))}
      </tbody>
    </table>
  );
}
```

## 9. Common Mistakes

### 1. Animating for the Sake of It
**Problem:** Adding animation because you can.
**Solution:** Every animation needs a stated purpose.

### 2. Animating Repeated Actions
**Problem:** Bounce on every button click.
**Solution:** Subtle feedback for repeated actions, save drama for significant moments.

### 3. Animating Data Updates
**Problem:** Chart values animate on every data point.
**Solution:** Only animate significant changes or user-initiated updates.

### 4. Too Much Delight
**Problem:** Confetti everywhere.
**Solution:** Save decorative animation for true milestones.

### 5. Not Documenting Intent
**Problem:** Future developers don't know why animation exists.
**Solution:** Comment or name animations by purpose.

## 10. Practice Exercises

### Exercise 1: Animation Audit
Review 10 animations in your app. Remove 5 that don't pass the "why" test.

### Exercise 2: Essential Only
Build a form with only essential animations (loading, success, error).

### Exercise 3: First vs. Subsequent
Create a component that animates on first render but not on updates.

### Exercise 4: Reduced Motion
Build a component that provides full value without any animation.

### Exercise 5: Document Intent
Add purpose comments to all animations in a file. "This animation communicates..."

## 11. Advanced Topics

- **Animation Ethics** — Respecting user attention and time
- **A/B Testing Animation** — Measuring animation impact on UX
- **Animation Budgets** — Limiting animation per page/session
- **Intent-Based Design Systems** — Codifying animation purpose
- **Accessibility Beyond Reduced Motion** — Vestibular considerations
- **Animation Debt** — Managing accumulated unnecessary animation
