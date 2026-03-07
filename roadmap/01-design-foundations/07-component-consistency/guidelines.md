# Component Consistency

## 1. Concept Overview

Component consistency means that similar elements behave and appear the same way throughout your application. It's the principle that:
- All buttons with the same variant look identical
- Spacing within cards follows the same rules
- Interactive states (hover, focus, active) are predictable
- Motion patterns repeat across similar interactions

Consistency isn't about making everything the same—it's about making similar things recognizable and different things distinguishable.

## 2. Why This Matters for Design Engineers

Inconsistency is the #1 sign of amateur work:
- Different button heights across pages
- Shadows that vary between components
- Hover states that behave differently
- Border radii that don't match

As a Design Engineer, you must:
- Build component APIs that enforce consistency
- Create patterns that scale without degrading
- Identify and eliminate inconsistencies proactively
- Balance flexibility with guardrails

Linear's interface feels cohesive because every button, every card, every interaction follows the same rules. There's no visual noise from inconsistency.

## 3. Key Principles / Mental Models

### The Principle of Least Surprise
Users form mental models. When something looks like a button, it should behave like every other button. Surprise breaks trust.

### Variants, Not One-Offs
Every variation should be intentional and named:
- `Button variant="primary"` ✅
- `Button style={{ backgroundColor: 'blue' }}` ❌

If you need a new style, add a new variant to the system.

### Consistency Hierarchy
1. **Pattern Consistency** — Same interactions work the same way
2. **Visual Consistency** — Same components look the same
3. **Behavioral Consistency** — Same actions produce same results

### Internal vs. External Consistency
- **Internal:** Consistent within your product
- **External:** Consistent with platform conventions (web, iOS, Android)

Both matter. Don't reinvent standard patterns without good reason.

## 4. Implementation in React

### Enforcing Variants

```tsx
// ❌ Allows arbitrary styling
function Button({ style, children }) {
  return <button style={style}>{children}</button>;
}

// ✅ Enforces variant system
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  destructive: 'bg-red-600 hover:bg-red-700 text-white',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
};

function Button({ 
  variant = 'primary', 
  size = 'md', 
  children,
  ...props 
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}) {
  return (
    <button
      className={cn(
        'rounded-md font-medium transition-colors',
        variants[variant],
        sizes[size]
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Consistent Spacing

```tsx
// Card component with consistent internal spacing
function Card({ children, padding = 'md' }) {
  const paddingMap = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200',
      paddingMap[padding]
    )}>
      {children}
    </div>
  );
}

Card.Header = ({ children }) => (
  <div className="mb-4 pb-4 border-b border-gray-100">
    {children}
  </div>
);

Card.Body = ({ children }) => (
  <div className="space-y-3">
    {children}
  </div>
);

Card.Footer = ({ children }) => (
  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
    {children}
  </div>
);
```

### Consistent Interactive States

```tsx
// Base interactive styles applied everywhere
const interactiveBase = `
  transition-all duration-150 ease-out
  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
`;

function Button({ children, ...props }) {
  return (
    <button className={cn(interactiveBase, buttonVariants)} {...props}>
      {children}
    </button>
  );
}

function Link({ children, ...props }) {
  return (
    <a className={cn(interactiveBase, linkStyles)} {...props}>
      {children}
    </a>
  );
}
```

## 5. React Patterns to Use

### Component Factory for Consistency

```tsx
function createButton(defaultVariant: ButtonVariant) {
  return function Button({ 
    variant = defaultVariant, 
    children, 
    ...props 
  }) {
    return (
      <button className={cn(baseStyles, variants[variant])} {...props}>
        {children}
      </button>
    );
  };
}

// Export pre-configured buttons
export const PrimaryButton = createButton('primary');
export const SecondaryButton = createButton('secondary');
export const GhostButton = createButton('ghost');
```

### Style Dictionary Pattern

```tsx
// Centralized style definitions
const styles = {
  card: {
    base: 'rounded-lg border bg-white',
    variants: {
      elevated: 'shadow-md border-transparent',
      outlined: 'shadow-none border-gray-200',
    },
  },
  
  text: {
    heading: 'font-semibold text-gray-900',
    body: 'text-gray-600',
    muted: 'text-gray-400 text-sm',
  },
  
  interactive: {
    hover: 'hover:bg-gray-50',
    focus: 'focus-visible:ring-2 focus-visible:ring-blue-500',
    active: 'active:bg-gray-100',
  },
};

// Components use the dictionary
function Card({ variant = 'outlined', children }) {
  return (
    <div className={cn(styles.card.base, styles.card.variants[variant])}>
      {children}
    </div>
  );
}
```

### Composition Over Customization

```tsx
// ❌ Customization explosion
<Button 
  textColor="blue" 
  bgColor="white" 
  borderColor="blue"
  hoverBgColor="blue-50"
  padding="custom"
/>

// ✅ Compose consistent primitives
<Button variant="outline">
  <Icon name="plus" />
  <span>Add Item</span>
</Button>
```

## 6. Important Hooks

### useConsistentId
Consistent ID generation for a11y:

```tsx
let idCounter = 0;

function useConsistentId(prefix: string = 'id') {
  const idRef = useRef<string | null>(null);
  
  if (idRef.current === null) {
    idRef.current = `${prefix}-${++idCounter}`;
  }
  
  return idRef.current;
}

// Usage
function FormField({ label, children }) {
  const id = useConsistentId('field');
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {React.cloneElement(children, { id })}
    </div>
  );
}
```

### useConsistentAnimation

```tsx
// Ensure consistent animation config across components
function useConsistentAnimation(type: 'enter' | 'exit' | 'layout') {
  return useMemo(() => {
    const configs = {
      enter: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.2, ease: 'easeOut' },
      },
      exit: {
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.15, ease: 'easeIn' },
      },
      layout: {
        layout: true,
        transition: { type: 'spring', stiffness: 500, damping: 30 },
      },
    };
    
    return configs[type];
  }, [type]);
}

// Usage ensures consistent animations
function Modal({ children }) {
  const animation = useConsistentAnimation('enter');
  return <motion.div {...animation}>{children}</motion.div>;
}
```

## 7. Animation Considerations

### Consistent Animation Library

```tsx
// animation-library.ts
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 },
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  
  spring: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  },
};

// All modals use the same animation
function Modal({ children }) {
  return (
    <motion.div {...animations.scaleIn}>
      {children}
    </motion.div>
  );
}

// All dropdowns use the same animation
function Dropdown({ children }) {
  return (
    <motion.div {...animations.slideUp}>
      {children}
    </motion.div>
  );
}
```

### Consistent Interaction Feedback

```tsx
// All interactive elements use this
const tapAnimation = {
  whileTap: { scale: 0.98 },
  transition: { duration: 0.1 },
};

const hoverAnimation = {
  whileHover: { scale: 1.02 },
  transition: { duration: 0.15 },
};

function InteractiveCard({ children, onClick }) {
  return (
    <motion.div
      {...tapAnimation}
      {...hoverAnimation}
      onClick={onClick}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
}
```

## 8. Performance Considerations

### Memoize Consistent Values

```tsx
// ❌ Recreated on every render
function Card({ variant }) {
  const styles = getVariantStyles(variant); // Computed each time
  return <div style={styles}>{children}</div>;
}

// ✅ Memoized
function Card({ variant }) {
  const styles = useMemo(() => getVariantStyles(variant), [variant]);
  return <div style={styles}>{children}</div>;
}
```

### Use CSS Where Possible

```tsx
// ❌ JS-computed consistent styles
function Button({ disabled }) {
  return (
    <button style={{ opacity: disabled ? 0.5 : 1 }}>
      Click
    </button>
  );
}

// ✅ CSS classes
function Button({ disabled }) {
  return (
    <button className="disabled:opacity-50" disabled={disabled}>
      Click
    </button>
  );
}
```

## 9. Common Mistakes

### 1. Escape Hatches That Break Consistency
**Problem:** Adding `className` or `style` props that allow overrides.
**Solution:** Limit what can be customized. Add new variants instead.

### 2. Copy-Paste Components
**Problem:** Duplicating component code with slight modifications.
**Solution:** Extract shared logic into base components or hooks.

### 3. Inconsistent Prop Names
**Problem:** `isOpen` in Modal, `open` in Dropdown, `visible` in Tooltip.
**Solution:** Establish naming conventions and enforce them.

### 4. Platform Inconsistency
**Problem:** Custom checkboxes that don't match platform behavior.
**Solution:** Respect platform conventions unless you have strong reasons.

### 5. Growing Variant Lists
**Problem:** 15 button variants that are all slightly different.
**Solution:** Audit regularly. Merge similar variants. Question new ones.

## 10. Practice Exercises

### Exercise 1: Component Audit
Take 3 similar components in your codebase. List inconsistencies in spacing, colors, and behavior. Fix them.

### Exercise 2: Variant System
Design a complete button variant system (5-6 variants, 3 sizes). Implement with strict typing.

### Exercise 3: Animation Consistency
Create an animation library with 5 reusable animations. Apply them consistently across 3 different components.

### Exercise 4: Style Dictionary
Build a centralized style dictionary for a component (Card). Use it to create 3 card variants.

### Exercise 5: Consistency Review
Review a design mockup. Identify where consistency rules should be extracted. Document them.

## 11. Advanced Topics

- **Design System Governance** — Processes for maintaining consistency as teams grow
- **Component Linting** — Custom ESLint rules to enforce patterns
- **Visual Regression Testing** — Catching consistency breaks automatically
- **API Design Patterns** — Consistent component APIs across a library
- **Consistency in Motion** — Building a motion design system
- **Cross-Platform Consistency** — Web, iOS, Android shared patterns
