# useMediaQuery

## 1. Concept Overview

`useMediaQuery` provides a reactive way to respond to CSS media queries in React. It enables component-level responsive behavior beyond what CSS alone can achieve.

```tsx
const isMobile = useMediaQuery('(max-width: 768px)');
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
const isRetina = useMediaQuery('(min-resolution: 2dppx)');
```

This hook bridges CSS media queries with React's component model, enabling conditional rendering and different component behaviors based on viewport or device characteristics.

## 2. Why This Matters for Design Engineers

Media queries in React unlock:
- Different component structures for mobile/desktop
- Conditional loading of heavy components
- Adaptive animation complexity
- Device-specific interactions (touch vs. mouse)

As a Design Engineer, you must:
- Know when to use CSS vs. React media queries
- Handle SSR hydration correctly
- Optimize for performance
- Build truly adaptive interfaces

## 3. Key Principles / Mental Models

### CSS vs. React Media Queries
| CSS Media Queries | React useMediaQuery |
|-------------------|---------------------|
| Styling changes | Component structure changes |
| Layout shifts | Conditional rendering |
| Always available | Requires JS |
| No hydration issues | SSR considerations |

### When to Use React Media Queries
- **Conditional rendering** — Different components for mobile/desktop
- **Different data** — Fetch fewer items on mobile
- **Different interactions** — Touch gestures vs. hover
- **Animation complexity** — Simpler animations on mobile

### When to Use CSS
- **Simple styling** — Font sizes, spacing, colors
- **Layout changes** — Grid columns, flexbox direction
- **SSR compatibility** — No hydration mismatch

## 4. Implementation in React

### Basic useMediaQuery Hook

```tsx
import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Listen for changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
```

### SSR-Safe Implementation

```tsx
function useMediaQuery(query: string): boolean {
  // For SSR, we can't know the viewport, so default to a sensible value
  const getInitialValue = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getInitialValue);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // Update on mount in case SSR value was wrong
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
```

### With Initial Value Option

```tsx
interface UseMediaQueryOptions {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
}

function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {}
): boolean {
  const { defaultValue = false, initializeWithValue = true } = options;

  const getMatches = (): boolean => {
    if (typeof window === 'undefined') return defaultValue;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(() => {
    if (initializeWithValue) {
      return getMatches();
    }
    return defaultValue;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
```

## 5. React Patterns to Use

### Predefined Breakpoint Hooks

```tsx
// breakpoints.ts
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${breakpoints.md})`);
}

export function useIsTablet() {
  return useMediaQuery(
    `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`
  );
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${breakpoints.lg})`);
}

export function useBreakpoint() {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.md})`);
  const isTablet = useMediaQuery(
    `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`
  );
  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.lg})`);

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  if (isDesktop) return 'desktop';
  return 'mobile'; // Default
}
```

### Responsive Component

```tsx
function ResponsiveNav() {
  const isMobile = useIsMobile();

  // Completely different component for mobile
  if (isMobile) {
    return <MobileNav />;
  }

  return <DesktopNav />;
}

function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>☰</button>
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl"
          >
            {/* Mobile nav content */}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

function DesktopNav() {
  return (
    <nav className="flex items-center gap-8">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  );
}
```

### Conditional Data Loading

```tsx
function ProductGrid() {
  const isMobile = useIsMobile();
  const itemsPerPage = isMobile ? 10 : 24;
  
  const { data } = useQuery({
    queryKey: ['products', itemsPerPage],
    queryFn: () => fetchProducts({ limit: itemsPerPage }),
  });

  return (
    <div className={cn(
      'grid gap-4',
      isMobile ? 'grid-cols-2' : 'grid-cols-4'
    )}>
      {data?.products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Device Capability Detection

```tsx
function useDeviceCapabilities() {
  const hasHover = useMediaQuery('(hover: hover)');
  const hasTouch = useMediaQuery('(pointer: coarse)');
  const hasFinePointer = useMediaQuery('(pointer: fine)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersHighContrast = useMediaQuery('(prefers-contrast: high)');

  return {
    hasHover,
    hasTouch,
    hasFinePointer,
    prefersReducedMotion,
    prefersDarkMode,
    prefersHighContrast,
  };
}

function InteractiveCard() {
  const { hasHover, hasTouch } = useDeviceCapabilities();

  return (
    <motion.div
      // Only apply hover effect on hover-capable devices
      whileHover={hasHover ? { y: -4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' } : undefined}
      // Touch devices get tap feedback
      whileTap={hasTouch ? { scale: 0.98 } : undefined}
      className="p-6 bg-white rounded-xl"
    >
      Card content
    </motion.div>
  );
}
```

## 6. Important Hooks

### useBreakpointValue

```tsx
function useBreakpointValue<T>(values: {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}): T | undefined {
  const isSm = useMediaQuery(`(min-width: ${breakpoints.sm})`);
  const isMd = useMediaQuery(`(min-width: ${breakpoints.md})`);
  const isLg = useMediaQuery(`(min-width: ${breakpoints.lg})`);
  const isXl = useMediaQuery(`(min-width: ${breakpoints.xl})`);
  const is2Xl = useMediaQuery(`(min-width: ${breakpoints['2xl']})`);

  // Return the value for the largest matching breakpoint
  if (is2Xl && values['2xl'] !== undefined) return values['2xl'];
  if (isXl && values.xl !== undefined) return values.xl;
  if (isLg && values.lg !== undefined) return values.lg;
  if (isMd && values.md !== undefined) return values.md;
  if (isSm && values.sm !== undefined) return values.sm;
  return values.base;
}

// Usage
function ResponsiveGrid({ children }) {
  const columns = useBreakpointValue({
    base: 1,
    sm: 2,
    md: 3,
    lg: 4,
  });

  return (
    <div 
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {children}
    </div>
  );
}
```

### useOrientation

```tsx
function useOrientation(): 'portrait' | 'landscape' {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  return isPortrait ? 'portrait' : 'landscape';
}

function VideoPlayer() {
  const orientation = useOrientation();

  return (
    <div className={cn(
      'relative',
      orientation === 'landscape' ? 'w-full h-screen' : 'w-full aspect-video'
    )}>
      <video className="w-full h-full object-cover" />
    </div>
  );
}
```

### useViewportSize

```tsx
function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
```

## 7. Animation Considerations

### Adaptive Animation Complexity

```tsx
function AnimatedHero() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Simpler animations on mobile
  const variants = {
    hidden: {
      opacity: 0,
      y: isMobile ? 10 : 30,
      scale: isMobile ? 1 : 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  const transition = {
    duration: prefersReducedMotion ? 0.1 : isMobile ? 0.3 : 0.5,
    ease: [0.4, 0, 0.2, 1],
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={transition}
    >
      Hero content
    </motion.div>
  );
}
```

### Responsive Stagger

```tsx
function AnimatedList({ items }: { items: Item[] }) {
  const isMobile = useIsMobile();
  
  // Less stagger delay on mobile for faster perceived performance
  const staggerDelay = isMobile ? 0.03 : 0.08;
  // Fewer items animate on mobile
  const animatedItemCount = isMobile ? 5 : items.length;

  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {items.map((item, index) => (
        <motion.li
          key={item.id}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: {
                // Items beyond limit animate instantly
                duration: index < animatedItemCount ? 0.3 : 0,
              },
            },
          }}
        >
          {item.name}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

## 8. Performance Considerations

### Memoizing Query String

```tsx
// ❌ Creates new query string each render
function Bad() {
  const isMobile = useMediaQuery(`(max-width: ${768}px)`);
}

// ✅ Stable query string
const MOBILE_QUERY = '(max-width: 768px)';

function Good() {
  const isMobile = useMediaQuery(MOBILE_QUERY);
}
```

### Debouncing Resize-Heavy Operations

```tsx
function useViewportSizeDebounced(delay = 100) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, delay);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [delay]);

  return size;
}
```

### Avoiding Flash of Wrong Content

```tsx
function useMediaQueryWithSSR(query: string, serverValue: boolean): boolean {
  const [value, setValue] = useState(serverValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia(query);
    setValue(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setValue(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  // Return server value until mounted to avoid hydration mismatch
  if (!mounted) return serverValue;
  return value;
}
```

## 9. Common Mistakes

### 1. Hydration Mismatch
**Problem:** Server renders desktop, client shows mobile.
**Solution:** Use consistent initial value or delay render.

### 2. Too Many Media Query Hooks
**Problem:** Multiple hooks cause multiple listeners.
**Solution:** Create single breakpoint hook that returns object.

### 3. Query String Instability
**Problem:** New string each render causes effect to re-run.
**Solution:** Memoize or use constants.

### 4. Not Cleaning Up Listeners
**Problem:** Memory leaks from old listeners.
**Solution:** Return cleanup function from useEffect.

### 5. CSS Duplication
**Problem:** Same breakpoint in CSS and JS.
**Solution:** Share breakpoint constants.

## 10. Practice Exercises

### Exercise 1: Responsive Table
Build a table that becomes cards on mobile.

### Exercise 2: Adaptive Image
Load different image sizes based on viewport and device pixel ratio.

### Exercise 3: Touch vs. Hover
Create a tooltip that works differently on touch vs. hover devices.

### Exercise 4: Responsive Animation
Build an animation that simplifies on mobile.

### Exercise 5: Dark Mode + System Preference
Implement theme toggle with system preference as default.

## 11. Advanced Topics

- **Container Queries** — Element-based responsive design
- **Aspect Ratio Queries** — Responsive to container shape
- **Feature Queries** — Detecting CSS support
- **Print Queries** — Print-specific layouts
- **Server Hints** — Using headers for initial value
- **React 18 useSyncExternalStore** — Better SSR handling
