# Variants System

## 1. Concept Overview

Variants are named animation states that can be defined once and reused across components. They enable:
- Reusable animation presets
- Parent-child animation coordination
- Dynamic animations based on props
- Cleaner, more maintainable code

Instead of inline animation objects, variants define animations by name:

```tsx
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div variants={variants} initial="hidden" animate="visible" />
```

## 2. Why This Matters for Design Engineers

Variants provide:
- **Consistency** — Same animations across components
- **Organization** — Animation logic separate from JSX
- **Orchestration** — Parent controls child animations
- **Dynamic behavior** — Variants can be functions

As a Design Engineer, you must:
- Design variant systems for consistency
- Use variants for complex orchestration
- Create dynamic variants when needed
- Share variants across components

## 3. Key Principles / Mental Models

### Named States
```tsx
// Think of variants as CSS classes for animation states
const buttonVariants = {
  idle: { ... },
  hover: { ... },
  pressed: { ... },
  disabled: { ... },
};
```

### Variant Propagation
```tsx
// Parent variant name propagates to children
<motion.div animate="visible">
  <motion.div variants={childVariants} /> {/* Automatically animates to "visible" */}
</motion.div>
```

### Variant Functions
```tsx
// Variants can be functions for dynamic values
const variants = {
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.1 },
  }),
};

<motion.div variants={variants} custom={index} />
```

## 4. Implementation in React

### Basic Variants

```tsx
const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

function Card({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="p-6 bg-white rounded-xl shadow-lg"
    >
      {children}
    </motion.div>
  );
}
```

### Variants with Gesture States

```tsx
const buttonVariants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.05,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  tap: { scale: 0.95 },
};

function AnimatedButton({ children, onClick }: ButtonProps) {
  return (
    <motion.button
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg"
    >
      {children}
    </motion.button>
  );
}
```

### Parent-Child Orchestration

```tsx
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

function AnimatedList({ items }: { items: Item[] }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
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

### Dynamic Variants with Custom

```tsx
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.1,
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  }),
};

function DynamicStagger({ items }: { items: Item[] }) {
  return (
    <motion.div initial="hidden" animate="visible">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          variants={itemVariants}
          custom={index}
        >
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

## 5. React Patterns to Use

### Variant Composition

```tsx
// Base variants
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const slideVariants = {
  hidden: { y: 20 },
  visible: { y: 0 },
};

// Composed variants
const fadeSlideVariants = {
  hidden: { ...fadeVariants.hidden, ...slideVariants.hidden },
  visible: { ...fadeVariants.visible, ...slideVariants.visible },
};

// Or compose dynamically
function useComposedVariants(...variantSets: Variants[]) {
  return useMemo(() => {
    const composed: Variants = {};
    
    variantSets.forEach(variants => {
      Object.keys(variants).forEach(key => {
        composed[key] = { ...composed[key], ...variants[key] };
      });
    });
    
    return composed;
  }, [variantSets]);
}
```

### Variant Factory

```tsx
function createSlideVariants(direction: 'up' | 'down' | 'left' | 'right') {
  const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
  const value = direction === 'up' || direction === 'left' ? -20 : 20;

  return {
    hidden: { opacity: 0, [axis]: value },
    visible: { 
      opacity: 1, 
      [axis]: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
    exit: { 
      opacity: 0, 
      [axis]: -value,
      transition: { duration: 0.2 },
    },
  };
}

// Usage
const slideUpVariants = createSlideVariants('up');
const slideLeftVariants = createSlideVariants('left');
```

### Conditional Variants

```tsx
function ConditionalAnimation({ isImportant }: { isImportant: boolean }) {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: isImportant
      ? { 
          opacity: 1, 
          y: 0, 
          scale: [1, 1.05, 1],
          transition: { 
            scale: { repeat: 2, duration: 0.3 },
          },
        }
      : { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {isImportant ? '⚠️ Important!' : 'Regular content'}
    </motion.div>
  );
}
```

### Inherit vs. Override

```tsx
const parentVariants = {
  hover: { scale: 1.05 },
};

const childVariants = {
  hover: { rotate: 5 }, // Adds to parent's hover state
};

function HoverCard() {
  return (
    <motion.div
      variants={parentVariants}
      whileHover="hover"
    >
      <motion.div variants={childVariants}>
        Child rotates AND parent scales on hover
      </motion.div>
    </motion.div>
  );
}

// To prevent inheritance:
<motion.div
  initial="initial" // Explicitly set state instead of inheriting
  animate="animate"
/>
```

## 6. Important Hooks

### useVariants Hook

```tsx
function useVariants<T extends Variants>(
  variants: T,
  state: keyof T
): MotionProps {
  return useMemo(() => ({
    variants,
    animate: state as string,
    initial: false,
  }), [variants, state]);
}

// Usage
function Component({ isActive }: { isActive: boolean }) {
  const motionProps = useVariants(cardVariants, isActive ? 'active' : 'idle');
  
  return <motion.div {...motionProps}>Content</motion.div>;
}
```

### useAnimation with Variants

```tsx
function ControlledVariants() {
  const controls = useAnimation();

  const sequence = async () => {
    await controls.start('visible');
    await controls.start('highlight');
    await controls.start('visible');
  };

  const variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    highlight: { 
      scale: 1.1, 
      backgroundColor: '#fef08a',
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      <button onClick={sequence}>Animate</button>
      <motion.div
        variants={variants}
        initial="hidden"
        animate={controls}
      >
        Content
      </motion.div>
    </>
  );
}
```

## 7. Animation Considerations

### Transition in Variants vs. Component

```tsx
// Option 1: Transitions in variants (preferred for state-specific)
const variants = {
  hidden: { 
    opacity: 0,
    transition: { duration: 0.2 },
  },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

// Option 2: Transition on component (same for all states)
<motion.div
  variants={variants}
  transition={{ type: 'spring', stiffness: 300 }}
/>

// Option 3: Both (component overrides variant)
```

### Exit Variants

```tsx
const variants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { 
    opacity: 0, 
    y: -50,
    transition: { duration: 0.2 },
  },
};

function ExitAnimation({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          Content
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Nested Variant Timing

```tsx
const parentVariants = {
  hidden: {},
  visible: {
    transition: {
      when: 'beforeChildren', // Parent animates first
      staggerChildren: 0.1,
    },
  },
  exit: {
    transition: {
      when: 'afterChildren', // Children exit first
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};
```

## 8. Performance Considerations

### Memoize Variant Objects

```tsx
// ❌ New object every render
function Component() {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }}
    />
  );
}

// ✅ Stable reference
const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

function Component() {
  return <motion.div variants={variants} />;
}

// ✅ For dynamic variants
function Component({ scale }: { scale: number }) {
  const variants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale },
  }), [scale]);

  return <motion.div variants={variants} />;
}
```

### Avoid Deep Nesting with Variants

```tsx
// ❌ Too many nested variants
<motion.div variants={containerVariants}>
  <motion.div variants={sectionVariants}>
    <motion.div variants={rowVariants}>
      <motion.div variants={cellVariants}>
        {/* Deep nesting causes performance issues */}
      </motion.div>
    </motion.div>
  </motion.div>
</motion.div>

// ✅ Flatten where possible
<motion.div variants={containerVariants}>
  {cells.map(cell => (
    <motion.div key={cell.id} variants={cellVariants}>
      {cell.content}
    </motion.div>
  ))}
</motion.div>
```

## 9. Common Mistakes

### 1. Forgetting Variant Name String
**Problem:** `animate={variants.visible}` instead of `animate="visible"`
**Solution:** Variants are referenced by name string.

### 2. Not Setting Initial
**Problem:** Animation doesn't play or plays from wrong state.
**Solution:** Always set `initial` to starting variant name.

### 3. Conflicting Variant Names
**Problem:** Parent and child use different variant names.
**Solution:** Use consistent naming or explicit animate props.

### 4. Custom Prop Wrong Type
**Problem:** `custom` receives wrong data type.
**Solution:** Ensure variant function expects correct type.

### 5. Exit Without AnimatePresence
**Problem:** Exit variant never triggers.
**Solution:** Wrap in AnimatePresence for exit animations.

## 10. Practice Exercises

### Exercise 1: Theme Switcher
Create a component that animates between light/dark variants.

### Exercise 2: Multi-State Button
Build a button with idle, hover, active, loading, success, error variants.

### Exercise 3: Staggered Grid
Create a grid that staggers in with custom delays based on position.

### Exercise 4: Accordion
Build an accordion with open/closed variants for smooth height animation.

### Exercise 5: Notification System
Create notifications with enter, idle, exit variants and stagger support.

## 11. Advanced Topics

- **Variant Inheritance** — Understanding propagation depth
- **Dynamic Stagger** — Position-based stagger delays
- **Variant Composition** — Merging multiple variant sets
- **State Machine Integration** — Variants with XState
- **Testing Variants** — Unit testing animation states
- **Variant Type Safety** — TypeScript for variants
