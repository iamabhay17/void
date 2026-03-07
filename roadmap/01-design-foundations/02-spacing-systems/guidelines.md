# Spacing Systems

## 1. Concept Overview

A spacing system is a defined set of values used to control margins, padding, gaps, and positioning throughout an interface. Instead of using arbitrary pixel values (17px, 23px, 41px), a spacing system uses a consistent scale (4px, 8px, 16px, 24px, 32px).

The most common approach is a **base-8 system** where all spacing values are multiples of 8:
- 4px (half-step for fine adjustments)
- 8px, 16px, 24px, 32px, 40px, 48px, 64px, 80px, 96px...

This creates **visual rhythm** — a predictable pattern that makes interfaces feel cohesive and intentional.

## 2. Why This Matters for Design Engineers

Spacing is often where designs break down in implementation:
- Designers use 17px, engineers use 16px — inconsistency creeps in
- Different developers choose different values — chaos ensues
- Responsive adjustments become unpredictable

A well-implemented spacing system:
- Makes implementation faster (no decision fatigue)
- Creates visual consistency automatically
- Makes responsive design systematic
- Enables design token handoffs

Linear, Stripe, and Vercel all use strict spacing systems. That's why their interfaces feel "tight" and polished.

## 3. Key Principles / Mental Models

### The 8-Point Grid
8px is the golden unit because:
- It scales cleanly (8, 16, 24, 32...)
- It works with common screen densities (2x, 3x Retina)
- It's divisible by 2 and 4 for sub-pixel adjustments

### Spatial Relationships Define Meaning
Elements that are close together are perceived as related (Gestalt Law of Proximity). Your spacing should reinforce information architecture:
- Tight spacing (8px) = closely related
- Medium spacing (16-24px) = same group
- Large spacing (32-48px) = separate sections

### Consistent Doesn't Mean Same
Don't use the same spacing everywhere. Use consistent *proportions*:
- Button padding: 12px 24px (1:2 ratio)
- Card padding: 24px (uniform)
- Section gap: 64px (large)

### Outside > Inside
Space between components should be greater than space within components:
- Card internal padding: 16px
- Gap between cards: 24px
- Section gap: 48px

## 4. Implementation in React

### Creating a Spacing System

```tsx
// spacing.ts - Define your spacing scale
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '2px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// Tailwind config
module.exports = {
  theme: {
    spacing: {
      px: '1px',
      0: '0',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      6: '24px',
      8: '32px',
      12: '48px',
      16: '64px',
    },
  },
};
```

### Using Spacing Tokens in Components

```tsx
// ❌ Bad: Arbitrary values
function Card({ children }) {
  return (
    <div className="p-[17px] mb-[23px]">
      {children}
    </div>
  );
}

// ✅ Good: System values
function Card({ children }) {
  return (
    <div className="p-4 mb-6"> {/* 16px, 24px */}
      {children}
    </div>
  );
}
```

### Spacing-Aware Stack Component

```tsx
type StackProps = {
  children: React.ReactNode;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'vertical' | 'horizontal';
};

const gapMap = {
  xs: 'gap-1',  // 4px
  sm: 'gap-2',  // 8px
  md: 'gap-4',  // 16px
  lg: 'gap-6',  // 24px
  xl: 'gap-8',  // 32px
};

function Stack({ 
  children, 
  gap = 'md', 
  direction = 'vertical' 
}: StackProps) {
  return (
    <div 
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
        gapMap[gap]
      )}
    >
      {children}
    </div>
  );
}

// Usage
<Stack gap="lg">
  <Card />
  <Card />
  <Card />
</Stack>
```

## 5. React Patterns to Use

### Compound Components with Built-in Spacing

```tsx
const Form = ({ children }) => (
  <form className="space-y-6">{children}</form>
);

Form.Section = ({ children, title }) => (
  <div className="space-y-4">
    {title && <h3 className="text-lg font-medium">{title}</h3>}
    <div className="space-y-3">{children}</div>
  </div>
);

Form.Actions = ({ children }) => (
  <div className="flex gap-3 pt-4">{children}</div>
);

// Usage - spacing is automatic
<Form>
  <Form.Section title="Personal Info">
    <Input label="Name" />
    <Input label="Email" />
  </Form.Section>
  <Form.Section title="Preferences">
    <Select label="Theme" />
  </Form.Section>
  <Form.Actions>
    <Button>Cancel</Button>
    <Button variant="primary">Save</Button>
  </Form.Actions>
</Form>
```

### Context for Spacing Density

```tsx
type Density = 'compact' | 'default' | 'comfortable';

const DensityContext = createContext<Density>('default');

const densitySpacing = {
  compact: { card: 'p-3', gap: 'gap-2' },
  default: { card: 'p-4', gap: 'gap-4' },
  comfortable: { card: 'p-6', gap: 'gap-6' },
};

function DensityProvider({ density, children }) {
  return (
    <DensityContext.Provider value={density}>
      {children}
    </DensityContext.Provider>
  );
}

function Card({ children }) {
  const density = useContext(DensityContext);
  return (
    <div className={densitySpacing[density].card}>
      {children}
    </div>
  );
}

// Usage
<DensityProvider density="compact">
  <CardList /> {/* All cards use compact spacing */}
</DensityProvider>
```

## 6. Important Hooks

### useLayoutEffect for Spacing Calculations
When you need to measure and apply spacing dynamically:

```tsx
function DynamicGap({ children }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gap, setGap] = useState(16);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Adjust gap based on container width
    const width = container.offsetWidth;
    if (width < 400) setGap(8);
    else if (width < 800) setGap(16);
    else setGap(24);
  }, []);

  return (
    <div ref={containerRef} style={{ gap: `${gap}px` }} className="flex">
      {children}
    </div>
  );
}
```

### Custom Hook for Responsive Spacing

```tsx
function useResponsiveSpacing() {
  const [spacing, setSpacing] = useState({
    section: 64,
    card: 16,
    element: 8,
  });

  useEffect(() => {
    const updateSpacing = () => {
      const width = window.innerWidth;
      
      if (width < 640) {
        setSpacing({ section: 32, card: 12, element: 4 });
      } else if (width < 1024) {
        setSpacing({ section: 48, card: 16, element: 8 });
      } else {
        setSpacing({ section: 64, card: 24, element: 8 });
      }
    };

    updateSpacing();
    window.addEventListener('resize', updateSpacing);
    return () => window.removeEventListener('resize', updateSpacing);
  }, []);

  return spacing;
}
```

## 7. Animation Considerations

### Animating Spacing Changes
When spacing changes, animate it smoothly:

```tsx
import { motion } from 'framer-motion';

function ExpandableSection({ isExpanded, children }) {
  return (
    <motion.div
      animate={{
        padding: isExpanded ? 24 : 16,
        gap: isExpanded ? 16 : 8,
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-col"
    >
      {children}
    </motion.div>
  );
}
```

### Stagger Animations with Spacing Rhythm
Use spacing values to inform animation timing:

```tsx
function StaggeredList({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: index * 0.05, // Stagger matches visual rhythm
            duration: 0.3 
          }}
        >
          {item.content}
        </motion.div>
      ))}
    </div>
  );
}
```

### Layout Animations Respect Spacing
When elements resize or reorder, maintain spacing:

```tsx
function ReorderableList({ items }) {
  return (
    <div className="space-y-2">
      {items.map(item => (
        <motion.div
          key={item.id}
          layout // Smooth transition including spacing
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <Card>{item.content}</Card>
        </motion.div>
      ))}
    </div>
  );
}
```

## 8. Performance Considerations

### Use CSS Gap Over Margin
```tsx
// ❌ Margin creates more layout calculations
<div>
  {items.map(item => (
    <div className="mb-4" key={item.id}>{item}</div>
  ))}
</div>

// ✅ Gap is more efficient
<div className="flex flex-col gap-4">
  {items.map(item => (
    <div key={item.id}>{item}</div>
  ))}
</div>
```

### Avoid Dynamic Spacing Calculations
```tsx
// ❌ Recalculates on every render
function Card() {
  const padding = isCompact ? 12 : 16;
  return <div style={{ padding }}>{children}</div>;
}

// ✅ Use CSS classes
function Card({ compact }) {
  return (
    <div className={compact ? 'p-3' : 'p-4'}>
      {children}
    </div>
  );
}
```

### CSS Variables for Dynamic Spacing
```css
:root {
  --spacing-unit: 8px;
  --spacing-1: calc(var(--spacing-unit) * 0.5);
  --spacing-2: var(--spacing-unit);
  --spacing-4: calc(var(--spacing-unit) * 2);
}

@media (min-width: 768px) {
  :root {
    --spacing-unit: 10px; /* Slightly larger on desktop */
  }
}
```

## 9. Common Mistakes

### 1. Arbitrary "Magic Numbers"
**Problem:** Using 13px, 17px, 23px without reason.
**Solution:** Stick to your spacing scale. If 16px feels too big and 8px too small, use 12px (not 11px).

### 2. Inconsistent Inner vs Outer Spacing
**Problem:** Card has 16px padding but 16px margin — looks cramped.
**Solution:** Outer spacing should be larger than inner spacing.

### 3. Not Accounting for Line Height
**Problem:** Text spacing looks off even with correct margins.
**Solution:** Consider line-height when calculating vertical spacing.

### 4. Pixel-Perfect on Wrong Scale
**Problem:** Obsessing over 1px differences.
**Solution:** Focus on relative proportions, not absolute pixels.

### 5. Forgetting Touch Targets
**Problem:** Buttons meet minimum tap size but feel cramped.
**Solution:** Add spacing around interactive elements (at least 8px).

## 10. Practice Exercises

### Exercise 1: Audit Your Spacing
Take an existing component and list all spacing values used. Normalize them to an 8-point scale.

### Exercise 2: Build a Spacing Scale
Create a complete spacing scale (10 values) and document when to use each.

### Exercise 3: Stack Component
Build a Stack component that handles vertical and horizontal spacing with configurable gaps.

### Exercise 4: Responsive Spacing
Create a card that adjusts its padding at 3 breakpoints while maintaining proportions.

### Exercise 5: Spacing Tokens
Implement a complete spacing token system using CSS variables. Use it throughout a small page.

## 11. Advanced Topics

- **Fluid Spacing** — Spacing that scales smoothly with viewport (clamp())
- **Optical Spacing** — Adjusting spacing based on visual weight of elements
- **Spacing in Motion** — How spacing should change during animations
- **Density Modes** — Supporting compact/comfortable/spacious modes
- **Spacing & Accessibility** — Minimum spacing for touch targets and readability
- **Container Queries & Spacing** — Adapting spacing based on container size
