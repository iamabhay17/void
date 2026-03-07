# Color Systems

## 1. Concept Overview

A color system is a structured palette that defines every color used in an interface. It goes beyond picking "nice colors" to creating a functional, accessible, and scalable approach to color usage.

A complete color system includes:
- **Brand colors** — Primary, secondary (used sparingly for emphasis)
- **Neutral colors** — Grays for text, backgrounds, borders (most of your UI)
- **Semantic colors** — Success (green), warning (yellow), error (red), info (blue)
- **Surface colors** — Background layers, cards, overlays
- **Interactive states** — Hover, active, focus, disabled

Each color typically has a **scale** (50, 100, 200... 900) for different use cases.

## 2. Why This Matters for Design Engineers

Color is emotional. It affects:
- Perceived quality and polish
- Usability and accessibility
- Brand perception
- User trust and confidence

As a Design Engineer, you must:
- Implement colors systematically using tokens
- Ensure accessibility (contrast ratios)
- Handle dark mode elegantly
- Create consistency across components

Study Stripe's colors — they're muted and sophisticated. Linear uses color sparingly but with purpose. Both feel polished because color choices are intentional.

## 3. Key Principles / Mental Models

### The 60-30-10 Rule
- **60%** — Neutral colors (backgrounds, text)
- **30%** — Secondary colors (cards, accents)
- **10%** — Primary/brand color (CTAs, emphasis)

Most of your UI should be neutral. Color draws attention — use it sparingly.

### Semantic Over Aesthetic
Color should communicate meaning:
- Green = success, positive, go
- Red = error, destructive, stop
- Yellow/Orange = warning, caution
- Blue = information, links, neutral action

Don't use red for your primary button unless the action is destructive.

### Neutrals Are Your Foundation
You'll use neutrals more than any other color:
- Background: 50-100 (lightest)
- Secondary text: 400-500
- Primary text: 700-900 (darkest)
- Borders: 200-300

### Accessible Contrast
WCAG requires:
- **4.5:1** — Normal text (under 18px)
- **3:1** — Large text (18px+) and UI components

Test every text/background combination.

## 4. Implementation in React

### Creating a Color System

```tsx
// colors.ts
export const colors = {
  // Neutrals (most used)
  gray: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  
  // Primary brand color
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Semantic colors
  success: {
    light: '#d1fae5',
    DEFAULT: '#10b981',
    dark: '#059669',
  },
  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },
  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
};

// Semantic tokens
export const tokens = {
  // Text
  text: {
    primary: colors.gray[900],
    secondary: colors.gray[600],
    muted: colors.gray[400],
    inverted: colors.gray[50],
  },
  
  // Backgrounds
  bg: {
    primary: '#ffffff',
    secondary: colors.gray[50],
    tertiary: colors.gray[100],
    inverted: colors.gray[900],
  },
  
  // Borders
  border: {
    DEFAULT: colors.gray[200],
    strong: colors.gray[300],
    focus: colors.blue[500],
  },
  
  // Interactive
  interactive: {
    primary: colors.blue[600],
    primaryHover: colors.blue[700],
    secondary: colors.gray[100],
    secondaryHover: colors.gray[200],
  },
};
```

### Using CSS Variables for Theming

```css
/* globals.css */
:root {
  /* Text */
  --text-primary: 24 24 27;        /* gray-900 */
  --text-secondary: 82 82 91;      /* gray-600 */
  --text-muted: 161 161 170;       /* gray-400 */
  
  /* Backgrounds */
  --bg-primary: 255 255 255;       /* white */
  --bg-secondary: 250 250 250;     /* gray-50 */
  --bg-tertiary: 244 244 245;      /* gray-100 */
  
  /* Borders */
  --border-default: 228 228 231;   /* gray-200 */
  
  /* Brand */
  --color-primary: 37 99 235;      /* blue-600 */
}

.dark {
  --text-primary: 250 250 250;     /* gray-50 */
  --text-secondary: 161 161 170;   /* gray-400 */
  --text-muted: 113 113 122;       /* gray-500 */
  
  --bg-primary: 9 9 11;            /* gray-950 */
  --bg-secondary: 24 24 27;        /* gray-900 */
  --bg-tertiary: 39 39 42;         /* gray-800 */
  
  --border-default: 63 63 70;      /* gray-700 */
}
```

### React Components with Color Tokens

```tsx
function Button({ variant = 'primary', children, ...props }) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
    destructive: 'bg-red-600 hover:bg-red-700 text-white',
  };
  
  return (
    <button 
      className={cn(
        'px-4 py-2 rounded-md font-medium transition-colors',
        variants[variant]
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

## 5. React Patterns to Use

### Theme Context for Colors

```tsx
type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: 'system', setTheme: () => {} });

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<Theme>('system');
  
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark' || 
        (theme === 'system' && 
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  return useContext(ThemeContext);
}
```

### Color-Aware Components

```tsx
type StatusProps = {
  status: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
};

const statusColors = {
  success: {
    bg: 'bg-green-50 dark:bg-green-950',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
};

function StatusBadge({ status, children }: StatusProps) {
  const colors = statusColors[status];
  
  return (
    <span className={cn(
      'px-2 py-1 rounded-md text-sm font-medium border',
      colors.bg,
      colors.text,
      colors.border
    )}>
      {children}
    </span>
  );
}
```

## 6. Important Hooks

### useTheme Hook
```tsx
function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    // Check initial preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(prefersDark.matches ? 'dark' : 'light');
    
    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    
    prefersDark.addEventListener('change', handler);
    return () => prefersDark.removeEventListener('change', handler);
  }, []);
  
  return theme;
}
```

### useContrastColor Hook
```tsx
function useContrastColor(backgroundColor: string) {
  return useMemo(() => {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black or white based on luminance
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }, [backgroundColor]);
}

// Usage
function DynamicBadge({ color, label }) {
  const textColor = useContrastColor(color);
  
  return (
    <span style={{ backgroundColor: color, color: textColor }}>
      {label}
    </span>
  );
}
```

## 7. Animation Considerations

### Color Transitions
Always transition colors smoothly:

```tsx
// CSS
.button {
  transition: background-color 150ms ease, color 150ms ease;
}

// Framer Motion
<motion.button
  animate={{
    backgroundColor: isHovered ? '#2563eb' : '#3b82f6',
  }}
  transition={{ duration: 0.15 }}
>
  Click me
</motion.button>
```

### Theme Transitions
Smooth dark/light mode transitions:

```css
/* Transition all color properties */
:root {
  transition: background-color 200ms ease, color 200ms ease;
}

/* Or use a full-page transition */
body {
  transition: background-color 300ms ease;
}
```

### Avoid Color Flash
```tsx
// ❌ Flash of wrong theme
function App() {
  const [theme, setTheme] = useState('light'); // Default to light
  
  useEffect(() => {
    setTheme(localStorage.getItem('theme') || 'light');
  }, []);
  
  return <div className={theme}>...</div>;
}

// ✅ Prevent flash with inline script
// In _document.tsx or index.html
<script>
  {`
    (function() {
      const theme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.add(theme);
    })();
  `}
</script>
```

## 8. Performance Considerations

### Use CSS Variables
CSS variables are more performant than JavaScript-computed colors:

```tsx
// ❌ JS color computation
<div style={{ backgroundColor: getColor(theme, 'background') }}>

// ✅ CSS variable
<div className="bg-[--bg-primary]">
```

### Minimize Repaints
Color changes trigger repaints. Batch them:

```tsx
// ❌ Multiple color changes
element.style.color = newColor;
element.style.backgroundColor = newBg;
element.style.borderColor = newBorder;

// ✅ Single class change
element.classList.toggle('dark');
```

### Prefers-Reduced-Motion
Disable color transitions for users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
```

## 9. Common Mistakes

### 1. Too Many Custom Colors
**Problem:** Every component has unique colors.
**Solution:** Use color tokens consistently.

### 2. Ignoring Dark Mode
**Problem:** Dark mode is an afterthought.
**Solution:** Design for both modes from the start.

### 3. Poor Contrast
**Problem:** Gray text on gray background.
**Solution:** Always check contrast ratios (use tools like WebAIM).

### 4. Semantic Color Misuse
**Problem:** Using red for a non-destructive action.
**Solution:** Reserve semantic colors for their intended meanings.

### 5. Hard-Coded Colors
**Problem:** Colors scattered throughout codebase.
**Solution:** Centralize all colors in a token system.

## 10. Practice Exercises

### Exercise 1: Build a Color Scale
Create a complete gray scale (11 shades) and use it throughout a component library.

### Exercise 2: Theme Toggle
Implement a theme toggle that smoothly transitions between light and dark modes.

### Exercise 3: Accessible Palette
Audit an existing palette and fix all contrast issues.

### Exercise 4: Semantic Colors
Build a complete set of semantic color components (Alert, Badge, Status).

### Exercise 5: Dynamic Theming
Create a system that allows users to choose a custom accent color.

## 11. Advanced Topics

- **Color Spaces** — HSL vs RGB vs OKLCH for better interpolation
- **Perceptual Color** — Using OKLCH for perceptually uniform scales
- **Dynamic Color** — Generating colors from user content
- **Color Contrast APIs** — Using CSS `color-contrast()` function
- **Brand Color Accessibility** — Making brand colors work in both themes
- **Color Animation Curves** — Smooth color transitions through color spaces
