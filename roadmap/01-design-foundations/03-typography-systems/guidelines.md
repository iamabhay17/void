# Typography Systems

## 1. Concept Overview

A typography system is a structured approach to text styling that defines:
- **Type scale** — The sizes used (12px, 14px, 16px, 20px, 24px, 32px, 48px)
- **Font families** — Primary (sans-serif), secondary (serif), mono
- **Font weights** — Regular (400), Medium (500), Semibold (600), Bold (700)
- **Line heights** — Tight (1.2), Normal (1.5), Relaxed (1.75)
- **Letter spacing** — Tracking adjustments for different sizes
- **Text colors** — Primary, secondary, muted, inverted

A good typography system creates **automatic hierarchy** and **visual consistency** across the entire product.

## 2. Why This Matters for Design Engineers

Typography is 90% of UI. Get it wrong and everything feels off:
- Poor line height makes text hard to read
- Inconsistent sizes create visual chaos
- Wrong font weights reduce hierarchy clarity

As a Design Engineer, you need to:
- Implement type scales that match design intent
- Understand responsive typography
- Handle edge cases (long titles, truncation, wrapping)
- Ensure readability across contexts

Study Linear's typography — it's minimal but perfectly tuned. Every size, weight, and spacing choice is intentional.

## 3. Key Principles / Mental Models

### The Type Scale
Use a mathematical ratio for your scale. Common ratios:
- **1.25 (Major Third)** — Subtle, good for dense UIs
- **1.333 (Perfect Fourth)** — Balanced, most common
- **1.5 (Perfect Fifth)** — Dramatic, for marketing

Example (1.25 ratio, base 16px):
```
12px → 14px → 16px → 20px → 24px → 30px → 36px → 48px
```

### Fewer Sizes, Better Design
Limit yourself to 5-7 type sizes. More creates inconsistency:
- XS: 12px (captions, labels)
- SM: 14px (secondary text, metadata)
- BASE: 16px (body text)
- LG: 20px (large body, card titles)
- XL: 24px (section headers)
- 2XL: 32px (page titles)
- 3XL: 48px (hero headlines)

### Line Height Decreases with Size
Larger text needs tighter line height:
- Body (16px): 1.5-1.6 line height
- Headings (32px+): 1.1-1.2 line height

### Weight Creates Hierarchy
Don't rely only on size. Use weight strategically:
- Regular (400): Body text
- Medium (500): Emphasized body, small labels
- Semibold (600): Subheadings, buttons
- Bold (700): Headlines, strong emphasis

## 4. Implementation in React

### Creating a Typography System

```tsx
// typography.ts
export const typography = {
  // Font Families
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  
  // Font Sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    '4xl': '2.5rem',  // 40px
    '5xl': '3rem',    // 48px
  },
  
  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.2',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
};
```

### Typography Components

```tsx
import { cn } from '@/lib/utils';

type TextProps = {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'caption';
  color?: 'default' | 'muted' | 'accent';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

const variantStyles = {
  h1: 'text-4xl font-bold tracking-tight leading-tight',
  h2: 'text-3xl font-semibold tracking-tight leading-tight',
  h3: 'text-2xl font-semibold leading-snug',
  h4: 'text-xl font-medium leading-snug',
  body: 'text-base leading-relaxed',
  small: 'text-sm leading-normal',
  caption: 'text-xs leading-normal',
};

const colorStyles = {
  default: 'text-gray-900 dark:text-gray-100',
  muted: 'text-gray-500 dark:text-gray-400',
  accent: 'text-blue-600 dark:text-blue-400',
};

const defaultElements = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  small: 'p',
  caption: 'span',
};

export function Text({ 
  children, 
  variant = 'body', 
  color = 'default',
  className,
  as,
}: TextProps) {
  const Component = as || defaultElements[variant];
  
  return (
    <Component 
      className={cn(
        variantStyles[variant],
        colorStyles[color],
        className
      )}
    >
      {children}
    </Component>
  );
}

// Usage
<Text variant="h1">Welcome to the Platform</Text>
<Text variant="body" color="muted">
  This is a description of what we do.
</Text>
```

### Prose Component for Long-Form Content

```tsx
function Prose({ children }) {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      {/* 
        Prose styles:
        - Headings: proper hierarchy with spacing
        - Paragraphs: comfortable line height
        - Lists: appropriate indentation
        - Links: styled with hover states
        - Code: monospace with background
      */}
      {children}
    </div>
  );
}
```

## 5. React Patterns to Use

### Compound Typography Components

```tsx
const Heading = ({ children, className, ...props }) => (
  <h2 className={cn('text-2xl font-semibold', className)} {...props}>
    {children}
  </h2>
);

Heading.Title = ({ children }) => (
  <span className="text-gray-900 dark:text-white">{children}</span>
);

Heading.Subtitle = ({ children }) => (
  <span className="text-lg font-normal text-gray-500 ml-2">{children}</span>
);

// Usage
<Heading>
  <Heading.Title>Settings</Heading.Title>
  <Heading.Subtitle>Manage your preferences</Heading.Subtitle>
</Heading>
```

### Polymorphic Text Component

```tsx
type TextOwnProps<E extends React.ElementType> = {
  as?: E;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
};

type TextProps<E extends React.ElementType> = TextOwnProps<E> &
  Omit<React.ComponentProps<E>, keyof TextOwnProps<E>>;

function Text<E extends React.ElementType = 'span'>({
  as,
  size = 'md',
  weight = 'normal',
  className,
  ...props
}: TextProps<E>) {
  const Component = as || 'span';
  
  return (
    <Component
      className={cn(
        sizeMap[size],
        weightMap[weight],
        className
      )}
      {...props}
    />
  );
}

// Usage
<Text as="h1" size="xl" weight="bold">Title</Text>
<Text as="p" size="md">Paragraph</Text>
<Text as="label" size="sm" weight="medium">Label</Text>
```

## 6. Important Hooks

### useFontLoading
Handle font loading states to prevent FOUT:

```tsx
function useFontLoading(fontFamily: string) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      const fontLoaded = document.fonts.check(`16px ${fontFamily}`);
      setLoaded(fontLoaded);
    });
  }, [fontFamily]);

  return loaded;
}

// Usage
function App() {
  const fontLoaded = useFontLoading('Inter');
  
  return (
    <div className={fontLoaded ? 'opacity-100' : 'opacity-0'}>
      {/* Content renders after font loads */}
    </div>
  );
}
```

### useTextTruncation
Detect when text is truncated:

```tsx
function useTextTruncation(ref: RefObject<HTMLElement>) {
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const checkTruncation = () => {
      setIsTruncated(element.scrollWidth > element.clientWidth);
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [ref]);

  return isTruncated;
}

// Usage - show tooltip only when truncated
function TruncatedText({ children }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isTruncated = useTextTruncation(ref);

  return (
    <Tooltip content={children} disabled={!isTruncated}>
      <span ref={ref} className="truncate block">
        {children}
      </span>
    </Tooltip>
  );
}
```

## 7. Animation Considerations

### Animating Text Reveals

```tsx
import { motion } from 'framer-motion';

function AnimatedHeadline({ text }) {
  const words = text.split(' ');
  
  return (
    <h1 className="text-4xl font-bold">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}
```

### Number Animations

```tsx
import { useSpring, animated } from '@react-spring/web';

function AnimatedNumber({ value }) {
  const { number } = useSpring({
    from: { number: 0 },
    to: { number: value },
    config: { mass: 1, tension: 20, friction: 10 },
  });

  return (
    <animated.span className="text-4xl font-bold tabular-nums">
      {number.to(n => Math.floor(n).toLocaleString())}
    </animated.span>
  );
}
```

### Text Color Transitions

```tsx
function StatusText({ status }) {
  return (
    <motion.span
      animate={{
        color: status === 'success' ? '#10b981' : 
               status === 'error' ? '#ef4444' : '#6b7280',
      }}
      transition={{ duration: 0.2 }}
      className="text-sm font-medium"
    >
      {status}
    </motion.span>
  );
}
```

## 8. Performance Considerations

### Font Loading Strategy
```html
<!-- Preload critical fonts -->
<link 
  rel="preload" 
  href="/fonts/inter-var.woff2" 
  as="font" 
  type="font/woff2" 
  crossorigin 
/>

<!-- Use font-display: swap for non-blocking -->
<style>
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter-var.woff2') format('woff2');
    font-display: swap;
  }
</style>
```

### Variable Fonts
Use variable fonts to reduce file size:
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2');
  font-weight: 100 900; /* Single file for all weights */
}
```

### Avoid Layout Shifts
```tsx
// ❌ Font change causes layout shift
function Card() {
  const [fontLoaded, setFontLoaded] = useState(false);
  // ...
  return <div className={fontLoaded ? 'font-inter' : 'font-system'} />;
}

// ✅ Reserve space with fallback
function Card() {
  return (
    <div 
      className="font-inter"
      style={{ 
        fontSynthesis: 'none',
        // Fallback with similar metrics
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif' 
      }}
    />
  );
}
```

## 9. Common Mistakes

### 1. Too Many Font Sizes
**Problem:** Using 12 different sizes creates inconsistency.
**Solution:** Limit to 6-8 sizes maximum.

### 2. Ignoring Line Height
**Problem:** Using default browser line height (often 1.2).
**Solution:** Set explicit line heights (1.5 for body, 1.2 for headings).

### 3. Letter Spacing on Body Text
**Problem:** Adding letter-spacing to body text hurts readability.
**Solution:** Only use letter-spacing on headings and all-caps text.

### 4. Fixed Font Sizes
**Problem:** Using px everywhere breaks accessibility.
**Solution:** Use rem units so text scales with user preferences.

### 5. Poor Contrast
**Problem:** Light gray text on white background.
**Solution:** Ensure 4.5:1 contrast ratio minimum for body text.

## 10. Practice Exercises

### Exercise 1: Type Scale
Create a type scale using the Perfect Fourth ratio (1.333). Implement it in CSS variables.

### Exercise 2: Typography Component
Build a polymorphic Text component that handles all typography needs.

### Exercise 3: Responsive Typography
Implement fluid typography that scales smoothly from mobile to desktop using clamp().

### Exercise 4: Font Loading
Implement proper font loading with preload and font-display: swap.

### Exercise 5: Long Text Handling
Build a component that handles truncation, shows a tooltip when truncated, and animates expansion.

## 11. Advanced Topics

- **Fluid Typography** — Using clamp() for smooth scaling
- **Variable Font Animations** — Animating font-weight and font-width
- **Responsive Modular Scales** — Different scales for different breakpoints
- **OpenType Features** — Ligatures, tabular numbers, small caps
- **Vertical Rhythm** — Aligning text to a baseline grid
- **Internationalization** — Typography for RTL languages and CJK characters
