# Visual Hierarchy

## 1. Concept Overview

Visual hierarchy is the arrangement and presentation of elements in a way that implies importance. It guides the user's eye through content in a deliberate order, helping them understand what matters most and what actions to take.

Visual hierarchy is achieved through the strategic manipulation of:
- **Size** — Larger elements draw attention first
- **Color & Contrast** — High contrast elements stand out
- **Typography** — Weight, size, and style create levels
- **Spacing** — White space isolates and emphasizes
- **Position** — Top-left (in LTR languages) gets seen first
- **Depth** — Shadows and layers create focus

## 2. Why This Matters for Design Engineers

Visual hierarchy is the foundation of all good interfaces. Without it:
- Users feel overwhelmed and confused
- Important actions get missed
- The interface feels "flat" and unprofessional
- Conversion rates suffer

As a Design Engineer, you must:
- Translate design hierarchy into code accurately
- Understand *why* certain elements are emphasized
- Make hierarchy decisions when designs are ambiguous
- Ensure hierarchy is preserved across responsive breakpoints

Products like Linear and Stripe excel because their hierarchy is crystal clear — you always know what to do next.

## 3. Key Principles / Mental Models

### The Squint Test
Blur your eyes or squint at the interface. The elements that still stand out are your hierarchy leaders. If nothing stands out, hierarchy is weak.

### The 3-Second Rule
A new user should understand the primary action within 3 seconds. If they can't, hierarchy has failed.

### Hierarchy Levels
Design systems typically have 3-5 hierarchy levels:
1. **Primary** — The main action or headline
2. **Secondary** — Supporting information
3. **Tertiary** — Details and metadata
4. **Quaternary** — Subtle hints and decorative elements

### Contrast Creates Hierarchy
The *difference* between elements matters more than absolute values. A small size jump (16px → 18px) creates weak hierarchy. A large jump (16px → 32px) creates strong hierarchy.

### Progressive Disclosure
Not everything needs to be visible. Hide complexity and reveal it progressively. This naturally creates hierarchy over time.

## 4. Implementation in React

```tsx
// ❌ Weak hierarchy - everything looks the same
function BadCard({ title, description, date, author }) {
  return (
    <div className="p-4 border rounded">
      <p className="text-base text-gray-700">{title}</p>
      <p className="text-base text-gray-700">{description}</p>
      <p className="text-base text-gray-700">{date}</p>
      <p className="text-base text-gray-700">{author}</p>
    </div>
  );
}

// ✅ Strong hierarchy - clear importance levels
function GoodCard({ title, description, date, author }) {
  return (
    <div className="p-6 border rounded-lg">
      {/* Level 1: Primary - Large, bold, high contrast */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      {/* Level 2: Secondary - Medium size, normal weight */}
      <p className="text-base text-gray-600 mb-4">
        {description}
      </p>
      
      {/* Level 3: Tertiary - Small, muted */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>{date}</span>
        <span>•</span>
        <span>{author}</span>
      </div>
    </div>
  );
}
```

### Creating Hierarchy Components

```tsx
// Typography hierarchy system
const Typography = {
  H1: ({ children }) => (
    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
      {children}
    </h1>
  ),
  H2: ({ children }) => (
    <h2 className="text-2xl font-semibold text-gray-800">
      {children}
    </h2>
  ),
  Body: ({ children }) => (
    <p className="text-base text-gray-600 leading-relaxed">
      {children}
    </p>
  ),
  Caption: ({ children }) => (
    <span className="text-sm text-gray-400">
      {children}
    </span>
  ),
};

// Usage
function Page() {
  return (
    <article>
      <Typography.H1>Main Headline</Typography.H1>
      <Typography.Body>Description text...</Typography.Body>
      <Typography.Caption>Metadata</Typography.Caption>
    </article>
  );
}
```

## 5. React Patterns to Use

### Compound Components for Hierarchy
Create compound components that enforce hierarchy:

```tsx
const Card = ({ children }) => (
  <div className="p-6 border rounded-lg">{children}</div>
);

Card.Title = ({ children }) => (
  <h3 className="text-xl font-semibold text-gray-900 mb-2">{children}</h3>
);

Card.Description = ({ children }) => (
  <p className="text-base text-gray-600 mb-4">{children}</p>
);

Card.Meta = ({ children }) => (
  <div className="text-sm text-gray-400">{children}</div>
);

// Usage ensures consistent hierarchy
<Card>
  <Card.Title>Title</Card.Title>
  <Card.Description>Description</Card.Description>
  <Card.Meta>Metadata</Card.Meta>
</Card>
```

### Slot Pattern for Flexible Hierarchy
```tsx
function Section({ 
  headline, 
  subheadline, 
  content, 
  actions 
}) {
  return (
    <section className="py-12">
      {headline && (
        <div className="text-3xl font-bold mb-2">{headline}</div>
      )}
      {subheadline && (
        <div className="text-lg text-gray-600 mb-8">{subheadline}</div>
      )}
      {content && (
        <div className="mb-8">{content}</div>
      )}
      {actions && (
        <div className="flex gap-4">{actions}</div>
      )}
    </section>
  );
}
```

## 6. Important Hooks

### useEffect for Dynamic Hierarchy
Adjust hierarchy based on content or viewport:

```tsx
function AdaptiveHeadline({ text }) {
  const [size, setSize] = useState('text-4xl');
  
  useEffect(() => {
    // Reduce size for very long headlines
    if (text.length > 50) {
      setSize('text-2xl');
    } else if (text.length > 30) {
      setSize('text-3xl');
    }
  }, [text]);

  return <h1 className={`font-bold ${size}`}>{text}</h1>;
}
```

### useRef for Measuring Hierarchy Elements
```tsx
function FocusIndicator({ children }) {
  const ref = useRef(null);
  const [bounds, setBounds] = useState(null);

  useLayoutEffect(() => {
    if (ref.current) {
      setBounds(ref.current.getBoundingClientRect());
    }
  }, []);

  return (
    <div ref={ref} className="relative">
      {children}
      {/* Visual indicator sized to element */}
      {bounds && (
        <div 
          className="absolute -inset-2 border-2 border-blue-500 rounded"
          style={{ width: bounds.width + 16 }}
        />
      )}
    </div>
  );
}
```

## 7. Animation Considerations

### Animate Hierarchy Emergence
Primary elements should appear first:

```tsx
import { motion } from 'framer-motion';

function AnimatedCard({ title, description, meta }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Primary appears first */}
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
        className="text-xl font-semibold"
      >
        {title}
      </motion.h3>
      
      {/* Secondary appears second */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-gray-600"
      >
        {description}
      </motion.p>
      
      {/* Tertiary appears last */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-gray-400"
      >
        {meta}
      </motion.div>
    </motion.div>
  );
}
```

### Hierarchy in Transitions
When transitioning between states, maintain hierarchy awareness:
- Primary elements should transition first or most prominently
- Secondary elements follow
- Metadata can fade quietly

## 8. Performance Considerations

### Avoid Hierarchy Through JS When CSS Works
```tsx
// ❌ Don't compute hierarchy in JS
const getFontSize = (level) => {
  switch(level) {
    case 1: return 32;
    case 2: return 24;
    default: return 16;
  }
};

// ✅ Use CSS classes or CSS variables
<h1 className="text-heading-1">...</h1>
<h2 className="text-heading-2">...</h2>
```

### Use CSS Variables for Hierarchy Scales
```css
:root {
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
}
```

## 9. Common Mistakes

### 1. Too Many Hierarchy Levels
**Problem:** Using 7+ different text sizes creates confusion.
**Solution:** Limit to 4-5 distinct levels maximum.

### 2. Weak Contrast Between Levels
**Problem:** 14px and 16px text look the same.
**Solution:** Create meaningful jumps (16px → 24px → 32px).

### 3. Fighting Hierarchy
**Problem:** Making everything "pop" means nothing stands out.
**Solution:** Accept that most things should be quiet.

### 4. Ignoring Responsive Hierarchy
**Problem:** Desktop hierarchy breaks on mobile.
**Solution:** Test hierarchy at all breakpoints.

### 5. Color as Only Differentiator
**Problem:** Relying solely on color fails for colorblind users.
**Solution:** Combine size, weight, and color for hierarchy.

## 10. Practice Exercises

### Exercise 1: Hierarchy Audit
Take a screenshot of an interface you use daily. Annotate each element with its hierarchy level (1-5). Identify inconsistencies.

### Exercise 2: Squint Test
Design a card component. Apply the squint test. Adjust until the title is clearly the focus.

### Exercise 3: Responsive Hierarchy
Build a hero section that maintains hierarchy from mobile to desktop. Test at 5 breakpoints.

### Exercise 4: Typography Scale
Create a complete typography scale with 5 levels. Use it to build a blog post layout.

### Exercise 5: Hierarchy-First Design
Design a settings page without using color. Rely only on size, weight, and spacing.

## 11. Advanced Topics

- **Kinetic Typography** — Animating text to create dynamic hierarchy
- **Scroll-Based Hierarchy** — Changing hierarchy as users scroll
- **Focus Management** — Programmatic hierarchy for accessibility
- **Hierarchy in Dense UIs** — Managing hierarchy in data-heavy interfaces
- **Fluid Typography** — Hierarchy that scales smoothly with viewport
- **Dark Mode Hierarchy** — Maintaining hierarchy across color schemes
