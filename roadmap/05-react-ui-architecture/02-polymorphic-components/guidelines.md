# Polymorphic Components

## 1. Concept Overview

Polymorphic components can render as different HTML elements or other React components while maintaining type safety. They use an `as` prop to change the underlying element.

Key benefits:
- **Semantic flexibility** — Render as button, link, or div as needed
- **Style reuse** — Same visual component, different behavior
- **Type safety** — Props adapt to the rendered element
- **Composition** — Wrap other components transparently

This pattern is essential for design systems where the same visual component might need to be a `<button>`, `<a>`, `<Link>`, or custom component.

## 2. Why This Matters for Design Engineers

Polymorphic components solve semantic HTML challenges:
- A card might link somewhere (should be `<a>`)
- Or trigger an action (should be `<button>`)
- Or just display content (should be `<article>`)

As a Design Engineer, you must:
- Build components that adapt to context
- Maintain accessibility with correct elements
- Ensure type safety for different element props
- Keep animation behavior consistent across variants

Components from Radix UI, Chakra, and Headless UI are polymorphic because real UIs need this flexibility.

## 3. Key Principles / Mental Models

### The `as` Prop
```tsx
// Renders as button (default)
<Button>Click me</Button>

// Renders as anchor
<Button as="a" href="/page">Go to page</Button>

// Renders as Next.js Link
<Button as={Link} href="/page">Navigate</Button>
```

### Props Forwarding
When `as="a"`, the component should accept `href`.
When `as="button"`, it should accept `type`, `disabled`.
TypeScript should enforce this.

### Ref Forwarding
The component must forward refs to the underlying element:
- `ref` on `<Button>` → `button` element
- `ref` on `<Button as="a">` → `a` element

## 4. Implementation in React

### Basic Polymorphic Component

```tsx
import { ComponentPropsWithoutRef, ElementType, forwardRef, ReactNode } from 'react';

// Props type helper
type PolymorphicProps<E extends ElementType, P = {}> = P & {
  as?: E;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<E>, keyof P | 'as' | 'children'>;

// Ref type helper
type PolymorphicRef<E extends ElementType> = ComponentPropsWithoutRef<E>['ref'];

// Component type helper
type PolymorphicComponent<DefaultElement extends ElementType, Props = {}> = 
  <E extends ElementType = DefaultElement>(
    props: PolymorphicProps<E, Props> & { ref?: PolymorphicRef<E> }
  ) => ReactNode;

// Button implementation
interface ButtonBaseProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button: PolymorphicComponent<'button', ButtonBaseProps> = forwardRef(
  function Button<E extends ElementType = 'button'>(
    { as, variant = 'primary', size = 'md', className, children, ...props }: PolymorphicProps<E, ButtonBaseProps>,
    ref: PolymorphicRef<E>
  ) {
    const Component = as || 'button';
    
    const classes = cn(
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
      {
        'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
        'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
        'bg-transparent hover:bg-gray-100': variant === 'ghost',
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-base': size === 'md',
        'px-6 py-3 text-lg': size === 'lg',
      },
      className
    );

    return (
      <Component ref={ref} className={classes} {...props}>
        {children}
      </Component>
    );
  }
);

// Usage examples
function Example() {
  return (
    <>
      {/* As button (default) */}
      <Button onClick={() => console.log('clicked')}>Click me</Button>
      
      {/* As anchor */}
      <Button as="a" href="https://example.com" target="_blank">
        Visit site
      </Button>
      
      {/* As Next.js Link */}
      <Button as={Link} href="/dashboard">
        Go to dashboard
      </Button>
      
      {/* TypeScript enforces correct props */}
      <Button as="a" href="/page">Link</Button> {/* ✅ href allowed */}
      {/* <Button href="/page">Link</Button> */} {/* ❌ href not allowed on button */}
    </>
  );
}
```

### With Framer Motion

```tsx
import { motion, MotionProps } from 'framer-motion';

type PolymorphicMotionProps<E extends ElementType, P = {}> = P & {
  as?: E;
  children?: ReactNode;
} & MotionProps & Omit<ComponentPropsWithoutRef<E>, keyof P | keyof MotionProps | 'as' | 'children'>;

interface CardBaseProps {
  variant?: 'elevated' | 'outlined';
}

function Card<E extends ElementType = 'div'>({
  as,
  variant = 'elevated',
  children,
  ...props
}: PolymorphicMotionProps<E, CardBaseProps>) {
  const Component = as ? motion(as) : motion.div;
  
  return (
    <Component
      className={cn(
        'rounded-xl p-6',
        {
          'bg-white shadow-lg': variant === 'elevated',
          'bg-transparent border border-gray-200': variant === 'outlined',
        }
      )}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      {...props}
    >
      {children}
    </Component>
  );
}

// Usage
function Examples() {
  return (
    <>
      {/* As div (default) */}
      <Card>Content</Card>
      
      {/* As article */}
      <Card as="article">Blog post</Card>
      
      {/* As clickable link */}
      <Card as="a" href="/detail">Click to view</Card>
      
      {/* As button */}
      <Card as="button" onClick={() => {}}>Click me</Card>
    </>
  );
}
```

## 5. React Patterns to Use

### Simpler Type-Safe Approach

```tsx
import { forwardRef } from 'react';

// Simplified approach using function overloads
type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: 'primary' | 'secondary';
} & ComponentPropsWithoutRef<T>;

function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  ...props
}: ButtonProps<T>) {
  const Component = as || 'button';
  return <Component data-variant={variant} {...props} />;
}

// Even simpler: Use discriminated unions
type ButtonAsButton = {
  as?: 'button';
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonAsAnchor = {
  as: 'a';
  href: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

type ButtonAsLink = {
  as: typeof Link;
  href: string;
};

type SimpleButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsLink;

function SimpleButton(props: SimpleButtonProps) {
  if (props.as === 'a') {
    return <a {...props} />;
  }
  if (props.as === Link) {
    return <Link {...props} />;
  }
  return <button {...props} />;
}
```

### With asChild Pattern (Radix Style)

```tsx
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, variant = 'primary', className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        ref={ref}
        className={cn(
          'px-4 py-2 rounded-lg font-medium',
          variant === 'primary' && 'bg-blue-600 text-white',
          variant === 'secondary' && 'bg-gray-200 text-gray-900',
          className
        )}
        {...props}
      />
    );
  }
);

// Usage with asChild
function Example() {
  return (
    <>
      {/* Normal button */}
      <Button>Click me</Button>
      
      {/* Button styles on anchor */}
      <Button asChild>
        <a href="/page">Link styled as button</a>
      </Button>
      
      {/* Button styles on Next.js Link */}
      <Button asChild>
        <Link href="/dashboard">Navigate</Link>
      </Button>
    </>
  );
}
```

### Implementing Slot Component

```tsx
import { Children, cloneElement, isValidElement, ReactNode } from 'react';

interface SlotProps {
  children?: ReactNode;
  [key: string]: any;
}

function Slot({ children, ...props }: SlotProps) {
  if (isValidElement(children)) {
    return cloneElement(children, {
      ...props,
      ...children.props,
      className: cn(props.className, children.props.className),
      style: { ...props.style, ...children.props.style },
    });
  }
  
  return <>{children}</>;
}
```

## 6. Important Hooks

### usePolymorphicComponent

```tsx
function usePolymorphicComponent<E extends ElementType>(
  defaultElement: E,
  as?: ElementType
): ElementType {
  return as || defaultElement;
}

// Usage
function Box<E extends ElementType = 'div'>({ as, ...props }: PolymorphicProps<E>) {
  const Component = usePolymorphicComponent('div', as);
  return <Component {...props} />;
}
```

### useForwardedRef

```tsx
function useForwardedRef<T>(ref: ForwardedRef<T>) {
  const innerRef = useRef<T>(null);

  useEffect(() => {
    if (!ref) return;
    
    if (typeof ref === 'function') {
      ref(innerRef.current);
    } else {
      ref.current = innerRef.current;
    }
  });

  return innerRef;
}
```

## 7. Animation Considerations

### Consistent Animation Across Elements

```tsx
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' },
  tap: { scale: 0.98 },
};

function AnimatedCard<E extends ElementType = 'div'>({
  as,
  children,
  ...props
}: PolymorphicProps<E>) {
  const Component = as ? motion(as) : motion.div;
  
  return (
    <Component
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      {...props}
    >
      {children}
    </Component>
  );
}
```

### Element-Specific Animation

```tsx
function InteractiveElement<E extends ElementType = 'button'>({
  as,
  children,
  ...props
}: PolymorphicProps<E>) {
  const Component = as || 'button';
  const isLink = Component === 'a' || Component === Link;
  
  // Links get different hover animation than buttons
  const hoverAnimation = isLink
    ? { x: 4 } // Slide right for links
    : { scale: 1.02 }; // Scale for buttons
  
  return (
    <motion.div
      whileHover={hoverAnimation}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Component {...props}>{children}</Component>
    </motion.div>
  );
}
```

## 8. Performance Considerations

### Memoization

```tsx
const MemoizedButton = memo(function Button<E extends ElementType = 'button'>(
  props: PolymorphicProps<E, ButtonBaseProps>
) {
  // Component implementation
}) as PolymorphicComponent<'button', ButtonBaseProps>;
```

### Avoiding Unnecessary Wrapper Elements

```tsx
// ❌ Creates extra wrapper
function BadPolymorphic({ as: Component = 'button', ...props }) {
  return (
    <div className="wrapper">
      <Component {...props} />
    </div>
  );
}

// ✅ No extra wrapper
function GoodPolymorphic({ as: Component = 'button', className, ...props }) {
  return <Component className={cn('base-styles', className)} {...props} />;
}
```

## 9. Common Mistakes

### 1. Losing Type Safety
**Problem:** Props don't adapt to element type.
**Solution:** Use proper TypeScript generics.

### 2. Not Forwarding Refs
**Problem:** Parent can't access underlying element.
**Solution:** Use forwardRef with proper typing.

### 3. Breaking Accessibility
**Problem:** Using wrong element for interaction type.
**Solution:** Document which elements are appropriate.

### 4. Style Conflicts
**Problem:** Element-specific styles clash.
**Solution:** Reset element styles or use className merging.

### 5. Event Handler Types
**Problem:** onClick type doesn't match element.
**Solution:** Let TypeScript infer from the `as` prop.

## 10. Practice Exercises

### Exercise 1: Polymorphic Text
Create a Text component that can be h1-h6, p, span, or label.

### Exercise 2: Interactive Card
Build a Card that can be article, button, or link with appropriate behavior.

### Exercise 3: Icon Button
Create an IconButton that works as button, link, or label for form inputs.

### Exercise 4: Motion Polymorphic
Build a polymorphic component with Framer Motion animations.

### Exercise 5: asChild Pattern
Implement the Radix asChild pattern from scratch.

## 11. Advanced Topics

- **Render Props + Polymorphism** — Combining patterns
- **Compound + Polymorphic** — Flexible compound components
- **Generic Constraints** — Limiting which elements are allowed
- **Motion Integration** — Type-safe animated polymorphic components
- **CSS-in-JS Integration** — Styled polymorphic components
- **Testing Polymorphic Components** — Ensuring all variants work
