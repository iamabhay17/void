# Design Tokens

## 1. Concept Overview

Design tokens are the single source of truth for design values. They are named entities that store visual design attributes — colors, spacing, typography, shadows, borders, animation timing — in a platform-agnostic format.

Instead of:
```css
color: #3b82f6;
padding: 16px;
border-radius: 8px;
```

You use:
```css
color: var(--color-primary);
padding: var(--spacing-4);
border-radius: var(--radius-md);
```

Tokens create a contract between design and engineering, enabling consistent implementation and easy updates.

## 2. Why This Matters for Design Engineers

Design tokens are the bridge between Figma and code:
- Designers change a color in Figma, it updates in code automatically
- Dark mode is switching tokens, not rewriting styles
- Design consistency is enforced at the system level

As a Design Engineer, you need to:
- Structure tokens hierarchically (primitive → semantic → component)
- Implement tokens that work across platforms (CSS, JS, mobile)
- Create tooling for token synchronization
- Know which values should be tokens vs. one-offs

Linear and Vercel use sophisticated token systems. That's why their design feels cohesive even as their products grow.

## 3. Key Principles / Mental Models

### Three-Tier Token Architecture

**1. Primitive Tokens (raw values)**
```json
{
  "blue-500": "#3b82f6",
  "spacing-4": "16px",
  "font-size-base": "16px"
}
```

**2. Semantic Tokens (meaning)**
```json
{
  "color-primary": "{blue-500}",
  "color-background": "{gray-50}",
  "color-text-primary": "{gray-900}"
}
```

**3. Component Tokens (specific usage)**
```json
{
  "button-primary-bg": "{color-primary}",
  "button-primary-text": "{color-on-primary}",
  "card-padding": "{spacing-4}"
}
```

### Naming Convention
Use consistent naming patterns:
- **Category:** `color`, `spacing`, `font`, `shadow`, `radius`
- **Property:** `background`, `text`, `border`, `size`
- **Variant:** `primary`, `secondary`, `muted`
- **State:** `hover`, `active`, `disabled`

Example: `color-text-primary`, `spacing-section-gap`, `shadow-elevation-high`

### Tokens vs. Values
**Make it a token if:**
- It appears multiple times
- It carries semantic meaning
- It might change (theming)
- It should stay consistent

**Keep as a value if:**
- It's truly one-off
- It's highly context-specific
- Making it a token adds complexity without benefit

## 4. Implementation in React

### Token Definition System

```typescript
// tokens/primitives.ts
export const primitives = {
  // Colors
  colors: {
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    gray: {
      50: '#fafafa',
      100: '#f4f4f5',
      500: '#71717a',
      900: '#18181b',
    },
  },
  
  // Spacing
  spacing: {
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
  
  // Typography
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },
  
  // Radii
  radius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  
  // Shadows
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  
  // Animation
  duration: {
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;
```

### Semantic Tokens

```typescript
// tokens/semantic.ts
import { primitives } from './primitives';

export const tokens = {
  light: {
    // Text
    textPrimary: primitives.colors.gray[900],
    textSecondary: primitives.colors.gray[500],
    textMuted: primitives.colors.gray[400],
    textInverse: primitives.colors.gray[50],
    
    // Backgrounds
    bgPrimary: '#ffffff',
    bgSecondary: primitives.colors.gray[50],
    bgTertiary: primitives.colors.gray[100],
    bgInverse: primitives.colors.gray[900],
    
    // Interactive
    interactivePrimary: primitives.colors.blue[600],
    interactivePrimaryHover: primitives.colors.blue[700],
    interactiveSecondary: primitives.colors.gray[100],
    interactiveSecondaryHover: primitives.colors.gray[200],
    
    // Borders
    borderDefault: primitives.colors.gray[200],
    borderStrong: primitives.colors.gray[300],
    borderFocus: primitives.colors.blue[500],
    
    // Status
    statusSuccess: '#10b981',
    statusWarning: '#f59e0b',
    statusError: '#ef4444',
    statusInfo: '#3b82f6',
  },
  
  dark: {
    textPrimary: primitives.colors.gray[50],
    textSecondary: primitives.colors.gray[400],
    textMuted: primitives.colors.gray[500],
    textInverse: primitives.colors.gray[900],
    
    bgPrimary: primitives.colors.gray[900],
    bgSecondary: '#1a1a1a',
    bgTertiary: primitives.colors.gray[800],
    bgInverse: primitives.colors.gray[50],
    
    // ... rest of dark tokens
  },
};
```

### CSS Custom Properties Output

```typescript
// Generate CSS from tokens
function generateCSSVariables(tokens: Record<string, string>) {
  return Object.entries(tokens)
    .map(([key, value]) => `--${kebabCase(key)}: ${value};`)
    .join('\n');
}

// Output
/*
:root {
  --text-primary: #18181b;
  --text-secondary: #71717a;
  --bg-primary: #ffffff;
  --interactive-primary: #2563eb;
  // ...
}

.dark {
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --bg-primary: #18181b;
  // ...
}
*/
```

## 5. React Patterns to Use

### Token Provider

```tsx
type TokenTheme = 'light' | 'dark';

const TokenContext = createContext<{
  theme: TokenTheme;
  tokens: typeof tokens.light;
  setTheme: (theme: TokenTheme) => void;
}>(null);

function TokenProvider({ children }) {
  const [theme, setTheme] = useState<TokenTheme>('light');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  return (
    <TokenContext.Provider value={{ 
      theme, 
      tokens: tokens[theme],
      setTheme 
    }}>
      {children}
    </TokenContext.Provider>
  );
}

function useTokens() {
  const context = useContext(TokenContext);
  if (!context) throw new Error('useTokens must be within TokenProvider');
  return context;
}
```

### Token-Aware Components

```tsx
// Use CSS variables (preferred)
function Card({ children }) {
  return (
    <div className="bg-[--bg-secondary] border border-[--border-default] rounded-[--radius-md] p-[--spacing-4]">
      {children}
    </div>
  );
}

// Or use the hook for dynamic values
function DynamicCard({ children }) {
  const { tokens } = useTokens();
  
  return (
    <div 
      style={{
        backgroundColor: tokens.bgSecondary,
        borderColor: tokens.borderDefault,
      }}
    >
      {children}
    </div>
  );
}
```

### Typed Token Access

```tsx
type SpacingToken = keyof typeof primitives.spacing;
type ColorToken = keyof typeof tokens.light;

function Box({ 
  padding,
  margin,
}: { 
  padding?: SpacingToken;
  margin?: SpacingToken;
}) {
  return (
    <div 
      style={{
        padding: padding ? `var(--spacing-${padding})` : undefined,
        margin: margin ? `var(--spacing-${margin})` : undefined,
      }}
    />
  );
}

// TypeScript catches invalid tokens
<Box padding="4" />  // ✅ Valid
<Box padding="17" /> // ❌ Type error
```

## 6. Important Hooks

### useToken Hook

```tsx
function useToken<T extends keyof typeof tokens.light>(
  tokenName: T
): string {
  const { tokens: currentTokens } = useTokens();
  return currentTokens[tokenName];
}

// Usage
function StatusDot({ status }) {
  const successColor = useToken('statusSuccess');
  const errorColor = useToken('statusError');
  
  return (
    <div 
      style={{ 
        backgroundColor: status === 'success' ? successColor : errorColor 
      }} 
    />
  );
}
```

### useComputedToken Hook

```tsx
function useComputedToken(variableName: string) {
  const [value, setValue] = useState('');
  
  useEffect(() => {
    const computedValue = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${variableName}`)
      .trim();
    setValue(computedValue);
  }, [variableName]);
  
  return value;
}

// Useful for animations or canvas drawing
function AnimatedElement() {
  const primaryColor = useComputedToken('interactive-primary');
  
  // Use computed value in animation
}
```

## 7. Animation Considerations

### Animation Tokens

```typescript
export const animationTokens = {
  // Durations
  durationInstant: '50ms',
  durationFast: '100ms',
  durationNormal: '200ms',
  durationSlow: '300ms',
  durationSlowest: '500ms',
  
  // Easings
  easeDefault: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeSpring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // Spring configs (for Framer Motion)
  springDefault: { stiffness: 400, damping: 30 },
  springBouncy: { stiffness: 300, damping: 20 },
  springGentle: { stiffness: 200, damping: 25 },
};
```

### Using Animation Tokens in Framer Motion

```tsx
import { motion } from 'framer-motion';
import { animationTokens } from './tokens';

function AnimatedCard({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        ...animationTokens.springDefault,
      }}
    >
      {children}
    </motion.div>
  );
}
```

### Token-Based CSS Transitions

```css
.button {
  transition: 
    background-color var(--duration-fast) var(--ease-default),
    transform var(--duration-fast) var(--ease-out);
}

.button:hover {
  background-color: var(--interactive-primary-hover);
}

.button:active {
  transform: scale(0.98);
}
```

## 8. Performance Considerations

### CSS Variables Over JS

```tsx
// ❌ Avoid runtime token lookups
function Card() {
  const { tokens } = useTokens();
  return <div style={{ background: tokens.bgSecondary }} />;
}

// ✅ Use CSS variables
function Card() {
  return <div className="bg-[--bg-secondary]" />;
}
```

### Minimize CSS Variable Updates

```tsx
// ❌ Updating many variables individually
themes.forEach(([key, value]) => {
  document.documentElement.style.setProperty(`--${key}`, value);
});

// ✅ Switch class/attribute instead
document.documentElement.setAttribute('data-theme', newTheme);
```

### Precompute Static Tokens

```tsx
// tokens.css is generated at build time, not computed at runtime
import './tokens.css';
```

## 9. Common Mistakes

### 1. Too Many Tokens
**Problem:** Every value becomes a token, creating token soup.
**Solution:** Only tokenize values that repeat or have semantic meaning.

### 2. Flat Token Structure
**Problem:** Hundreds of tokens at one level.
**Solution:** Use hierarchical organization (primitives → semantic → component).

### 3. Hard-Coded Values in Components
**Problem:** Mixing tokens with hard-coded values.
**Solution:** Audit components regularly. If it's not a token, question why.

### 4. Ignoring Token Inheritance
**Problem:** Component tokens don't reference semantic tokens.
**Solution:** `button-bg` should reference `interactive-primary`, not `blue-600`.

### 5. Platform-Specific Tokens
**Problem:** CSS-only token format.
**Solution:** Store in JSON, transform to CSS/JS/iOS/Android as needed.

## 10. Practice Exercises

### Exercise 1: Token Audit
Take an existing component and identify every unique value. Organize them into primitive, semantic, and component tokens.

### Exercise 2: Theme System
Create a complete token system that supports light and dark themes with CSS variables.

### Exercise 3: Token Pipeline
Build a simple token transformation pipeline: JSON → CSS variables + TypeScript constants.

### Exercise 4: Animation Tokens
Create a comprehensive set of animation tokens (durations, easings, spring configs) and use them consistently.

### Exercise 5: Figma Sync
Explore tools like Style Dictionary or Tokens Studio. Set up a workflow to sync Figma tokens to code.

## 11. Advanced Topics

- **Token Transformations** — Using Style Dictionary for multi-platform output
- **Token Versioning** — Managing breaking changes in token systems
- **Dynamic Tokens** — User-customizable themes with token overrides
- **Token Composition** — Building complex tokens from simple ones
- **Token Documentation** — Generating visual documentation from tokens
- **Token Validation** — Ensuring accessibility constraints in token values
