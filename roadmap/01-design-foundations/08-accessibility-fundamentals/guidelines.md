# Accessibility Fundamentals

## 1. Concept Overview

Accessibility (a11y) means designing and building interfaces that work for everyone, including people with disabilities. This includes:
- **Visual impairments** — Blindness, low vision, color blindness
- **Motor impairments** — Limited fine motor control, inability to use mouse
- **Cognitive impairments** — Dyslexia, attention disorders, memory issues
- **Auditory impairments** — Deafness, hearing loss

Accessibility isn't about edge cases. It's about building robust interfaces that work in all contexts — including when you're using one hand, in bright sunlight, or navigating with a keyboard.

## 2. Why This Matters for Design Engineers

Accessibility is both ethical and practical:
- **Legal requirement** in many jurisdictions (ADA, WCAG)
- **Business impact** — 15% of world population has a disability
- **Better for everyone** — Accessible interfaces are easier to use
- **Technical quality** — Accessible code is often cleaner code

As a Design Engineer, you must:
- Build keyboard-navigable interfaces
- Ensure sufficient color contrast
- Write semantic HTML
- Test with assistive technologies
- Handle focus management properly

The best products (Linear, Stripe, Vercel) are all highly accessible. It's not optional for quality work.

## 3. Key Principles / Mental Models

### POUR Principles
- **Perceivable** — Information must be presentable (text alternatives, captions)
- **Operable** — Interface must be navigable (keyboard, timing)
- **Understandable** — Content must be readable (predictable, error prevention)
- **Robust** — Content must work with assistive technologies

### Progressive Enhancement
Build the accessible version first. Add enhancements for capable browsers/devices.

### Focus = Visibility
If something can receive focus, it must be visually indicated. Never remove focus outlines without providing an alternative.

### Semantics Over Divs
Use the right HTML element. `<button>` is not `<div onClick>`. Semantic HTML provides accessibility for free.

### Test What You Build
Use a screen reader. Navigate with keyboard only. Simulate color blindness. Experience your interface as users with disabilities will.

## 4. Implementation in React

### Semantic HTML

```tsx
// ❌ Non-semantic
function Navigation() {
  return (
    <div className="nav">
      <div onClick={() => navigate('/')}>Home</div>
      <div onClick={() => navigate('/about')}>About</div>
    </div>
  );
}

// ✅ Semantic
function Navigation() {
  return (
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  );
}
```

### Keyboard Navigation

```tsx
function Button({ onClick, children, disabled }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={cn(
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        'focus-visible:ring-offset-2'
      )}
    >
      {children}
    </button>
  );
}
```

### Focus Management

```tsx
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      modalRef.current?.focus();
    } else {
      // Restore focus when closing
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Trap focus within modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements?.length) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
    
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 flex items-center justify-center"
    >
      {children}
    </div>
  );
}
```

### ARIA Labels

```tsx
function IconButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="p-2 rounded-md hover:bg-gray-100"
    >
      <Icon name={icon} aria-hidden="true" />
    </button>
  );
}

// Usage
<IconButton icon="trash" label="Delete item" onClick={handleDelete} />
```

## 5. React Patterns to Use

### Compound Components with a11y

```tsx
const Accordion = ({ children }) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  
  return (
    <AccordionContext.Provider value={{ openItems, setOpenItems }}>
      <div role="region">{children}</div>
    </AccordionContext.Provider>
  );
};

Accordion.Item = ({ id, children }) => {
  const { openItems, setOpenItems } = useAccordionContext();
  const isOpen = openItems.has(id);
  const headerId = `accordion-header-${id}`;
  const panelId = `accordion-panel-${id}`;

  return (
    <div>
      <h3>
        <button
          id={headerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => {
            const newOpenItems = new Set(openItems);
            if (isOpen) newOpenItems.delete(id);
            else newOpenItems.add(id);
            setOpenItems(newOpenItems);
          }}
          className="w-full text-left p-4 flex justify-between"
        >
          {children.header}
          <ChevronIcon className={isOpen ? 'rotate-180' : ''} />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        hidden={!isOpen}
        className="p-4"
      >
        {children.content}
      </div>
    </div>
  );
};
```

### Headless Components for a11y

```tsx
// Headless accessible switch
function useSwitch(initialValue = false) {
  const [checked, setChecked] = useState(initialValue);
  const id = useId();

  const getToggleProps = () => ({
    role: 'switch',
    'aria-checked': checked,
    tabIndex: 0,
    onClick: () => setChecked(!checked),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setChecked(!checked);
      }
    },
  });

  const getLabelProps = () => ({
    id,
  });

  return { checked, setChecked, getToggleProps, getLabelProps };
}

// Usage - you control the visuals
function CustomSwitch({ label }) {
  const { checked, getToggleProps, getLabelProps } = useSwitch();

  return (
    <div className="flex items-center gap-2">
      <span {...getLabelProps()}>{label}</span>
      <div
        {...getToggleProps()}
        className={cn(
          'w-10 h-6 rounded-full relative cursor-pointer',
          checked ? 'bg-blue-600' : 'bg-gray-200'
        )}
      >
        <div
          className={cn(
            'w-4 h-4 bg-white rounded-full absolute top-1 transition-transform',
            checked ? 'translate-x-5' : 'translate-x-1'
          )}
        />
      </div>
    </div>
  );
}
```

## 6. Important Hooks

### useFocusReturn

```tsx
function useFocusReturn() {
  const returnRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    returnRef.current = document.activeElement as HTMLElement;
  }, []);

  const returnFocus = useCallback(() => {
    returnRef.current?.focus();
  }, []);

  return { saveFocus, returnFocus };
}

// Usage in modal
function Modal({ isOpen, onClose }) {
  const { saveFocus, returnFocus } = useFocusReturn();

  useEffect(() => {
    if (isOpen) {
      saveFocus();
    } else {
      returnFocus();
    }
  }, [isOpen, saveFocus, returnFocus]);
}
```

### useFocusTrap

```tsx
function useFocusTrap(containerRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableSelector = 
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = container.querySelectorAll(focusableSelector);
      const first = focusableElements[0] as HTMLElement;
      const last = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef]);
}
```

### useReducedMotion

```tsx
function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// Usage
function AnimatedComponent() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      Content
    </motion.div>
  );
}
```

## 7. Animation Considerations

### Respecting Reduced Motion

```tsx
import { motion, useReducedMotion } from 'framer-motion';

function FadeInSection({ children }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4 }}
    >
      {children}
    </motion.section>
  );
}
```

### Focus Indicators with Animation

```css
/* Animated focus ring */
.focus-ring {
  transition: box-shadow 150ms ease-out;
}

.focus-ring:focus-visible {
  box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--color-primary);
}

/* Respects reduced motion */
@media (prefers-reduced-motion: reduce) {
  .focus-ring {
    transition: none;
  }
}
```

### Skip Link Animation

```tsx
function SkipLink() {
  return (
    <a
      href="#main-content"
      className={cn(
        'fixed top-4 left-4 px-4 py-2 bg-blue-600 text-white rounded',
        'transform -translate-y-full focus:translate-y-0',
        'transition-transform duration-200',
        'z-50'
      )}
    >
      Skip to main content
    </a>
  );
}
```

## 8. Performance Considerations

### Don't Over-ARIA

```tsx
// ❌ Redundant ARIA
<button role="button" aria-label="Submit form" type="submit">
  Submit form
</button>

// ✅ Semantic HTML is enough
<button type="submit">Submit form</button>
```

### Efficient Focus Management

```tsx
// ❌ Querying DOM on every render
function FocusTrap({ children }) {
  const focusables = document.querySelectorAll('button, a, input');
  // ...
}

// ✅ Query only when needed
function FocusTrap({ children }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const getFocusables = useCallback(() => {
    return containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea'
    );
  }, []);
}
```

### Lazy Live Regions

```tsx
// Only render live region when needed
function Announcement({ message }) {
  if (!message) return null;
  
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
```

## 9. Common Mistakes

### 1. Removing Focus Outlines
**Problem:** `outline: none` with no replacement.
**Solution:** Use `focus-visible` with custom focus styles.

### 2. Click-Only Interactions
**Problem:** `onClick` without keyboard support.
**Solution:** Use `<button>` or add keyboard handlers.

### 3. Missing Alt Text
**Problem:** Images without `alt` attributes.
**Solution:** Provide descriptive alt text or `alt=""` for decorative images.

### 4. Color-Only Information
**Problem:** Relying solely on color to convey meaning.
**Solution:** Add icons, text, or patterns alongside color.

### 5. Auto-Playing Media
**Problem:** Videos or audio that play automatically.
**Solution:** Let users control media. Provide captions.

## 10. Practice Exercises

### Exercise 1: Keyboard Navigation
Navigate your entire app using only keyboard. Document all places where keyboard navigation fails.

### Exercise 2: Screen Reader Testing
Use VoiceOver (Mac) or NVDA (Windows) to navigate a form. Fix all issues.

### Exercise 3: Focus Management
Build a modal that properly traps focus and restores focus on close.

### Exercise 4: Color Contrast Audit
Run a contrast checker on your app. Fix all failing elements.

### Exercise 5: Skip Links
Implement skip links that allow keyboard users to bypass navigation.

## 11. Advanced Topics

- **ARIA Live Regions** — Announcing dynamic content changes
- **Complex Widget Patterns** — Accessible trees, grids, and comboboxes
- **Touch Accessibility** — Minimum touch targets, gestures
- **Cognitive Accessibility** — Clear language, consistent navigation
- **Testing Automation** — axe-core, Pa11y, Lighthouse
- **WCAG 2.2** — Latest accessibility guidelines and new success criteria
