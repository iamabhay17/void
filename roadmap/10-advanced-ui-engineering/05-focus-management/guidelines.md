# Focus Management

## 1. Concept Overview

Focus management is the practice of controlling where keyboard focus moves in an interface. Proper focus management ensures keyboard and screen reader users can navigate efficiently and don't get lost in complex UIs.

Key concerns:
- **Focus trapping** — Keeping focus within modals/dialogs
- **Focus restoration** — Returning focus after closing overlays
- **Focus indicators** — Visual indication of focused element
- **Focus order** — Logical tab sequence

```tsx
// When modal opens → focus moves to modal
// When modal closes → focus returns to trigger
```

## 2. Why This Matters for Design Engineers

Focus management affects:
- Accessibility (WCAG compliance)
- Keyboard navigation
- Screen reader experience
- Power user efficiency

As a Design Engineer, you must:
- Implement focus trapping in overlays
- Design visible focus indicators
- Handle focus in animations
- Test keyboard navigation

## 3. Key Principles / Mental Models

### Focus Flow
```
Normal flow: Tab moves through DOM order
Trapped flow: Tab cycles within container
Roving tabindex: Arrow keys within group
```

### Focus Scenarios
```
1. Modal opens → Focus first focusable element
2. Modal closes → Focus returns to trigger
3. Menu opens → Focus first item
4. Item deleted → Focus next/previous item
5. Route change → Focus main content or h1
```

### Focus Visibility
```
:focus → Any focus (mouse or keyboard)
:focus-visible → Keyboard focus only
```

## 4. Implementation in React

### Focus Trap Hook

```tsx
import { useRef, useEffect, useCallback } from 'react';

function useFocusTrap<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableSelector = 
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const getFocusableElements = () => 
      container.querySelectorAll<HTMLElement>(focusableSelector);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements();
      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    // Focus first element
    const focusable = getFocusableElements();
    focusable[0]?.focus();

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return containerRef;
}
```

### Modal with Focus Management

```tsx
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  const focusTrapRef = useFocusTrap<HTMLDivElement>();
  const previousFocus = useRef<HTMLElement | null>(null);

  // Store previous focus
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Restore focus on close
  useEffect(() => {
    if (!isOpen && previousFocus.current) {
      previousFocus.current.focus();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            ref={focusTrapRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Roving Tabindex

```tsx
function RovingTabindex({ items }: { items: string[] }) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (index + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (index - 1 + items.length) % items.length;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    setFocusedIndex(newIndex);
    itemRefs.current[newIndex]?.focus();
  };

  return (
    <div role="listbox" aria-label="Options">
      {items.map((item, index) => (
        <button
          key={item}
          ref={(el) => (itemRefs.current[index] = el)}
          role="option"
          aria-selected={focusedIndex === index}
          tabIndex={focusedIndex === index ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={() => setFocusedIndex(index)}
          className={cn(
            'w-full p-2 text-left hover:bg-gray-100',
            focusedIndex === index && 'bg-blue-50'
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
```

### Focus After Animation

```tsx
function AnimatedReveal({ isVisible }: { isVisible: boolean }) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={contentRef}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          // Focus after enter animation completes
          onAnimationComplete={(definition) => {
            if (definition === 'animate') {
              const firstFocusable = contentRef.current?.querySelector<HTMLElement>(
                'button, [href], input'
              );
              firstFocusable?.focus();
            }
          }}
        >
          <input type="text" placeholder="This will be focused" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## 5. React Patterns to Use

### Focus Management Context

```tsx
interface FocusContextValue {
  returnFocus: () => void;
  storeFocus: () => void;
}

const FocusContext = createContext<FocusContextValue | null>(null);

function FocusProvider({ children }: { children: React.ReactNode }) {
  const focusStack = useRef<HTMLElement[]>([]);

  const storeFocus = useCallback(() => {
    focusStack.current.push(document.activeElement as HTMLElement);
  }, []);

  const returnFocus = useCallback(() => {
    const element = focusStack.current.pop();
    element?.focus();
  }, []);

  return (
    <FocusContext.Provider value={{ storeFocus, returnFocus }}>
      {children}
    </FocusContext.Provider>
  );
}
```

### Skip Link

```tsx
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-4 py-2 rounded shadow-lg z-50"
    >
      Skip to main content
    </a>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
```

### Focus on Delete

```tsx
function DeletableList({ items, onDelete }: ListProps) {
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  const handleDelete = (id: string, index: number) => {
    onDelete(id);
    
    // Focus next item, or previous if last
    requestAnimationFrame(() => {
      const remaining = items.filter(item => item.id !== id);
      const focusIndex = Math.min(index, remaining.length - 1);
      const focusItem = remaining[focusIndex];
      
      if (focusItem) {
        itemRefs.current.get(focusItem.id)?.focus();
      }
    });
  };

  return (
    <ul>
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            ref={(el) => el && itemRefs.current.set(item.id, el)}
            tabIndex={0}
            exit={{ opacity: 0, height: 0 }}
          >
            {item.content}
            <button onClick={() => handleDelete(item.id, index)}>
              Delete
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
```

## 6. Focus Indicators

### Custom Focus Styles

```css
/* Remove default, add custom */
button:focus {
  outline: none;
}

button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Or use ring utilities in Tailwind */
.focus-ring {
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2;
}
```

### Animated Focus Ring

```tsx
function AnimatedFocusButton({ children }: { children: React.ReactNode }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <button
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className="relative px-4 py-2"
    >
      {children}
      <motion.span
        className="absolute inset-0 rounded-lg border-2 border-blue-500 pointer-events-none"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: isFocused ? 1 : 0,
          scale: isFocused ? 1 : 0.95,
        }}
        transition={{ duration: 0.15 }}
      />
    </button>
  );
}
```

## 7. Animation Considerations

### Delay Focus Until Animation Complete

```tsx
function DelayedFocusModal({ isOpen, onClose }: ModalProps) {
  const firstInputRef = useRef<HTMLInputElement>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onAnimationComplete={() => {
            firstInputRef.current?.focus();
          }}
        >
          <input ref={firstInputRef} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Focus During Exit

```tsx
// Don't try to focus elements that are animating out
function SafeFocusReturn({ isOpen, onClose }: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isExiting, setIsExiting] = useState(false);

  return (
    <>
      <button ref={triggerRef}>Open</button>
      <AnimatePresence
        onExitComplete={() => {
          setIsExiting(false);
          triggerRef.current?.focus();
        }}
      >
        {isOpen && (
          <motion.div
            exit={{ opacity: 0 }}
            onExitStart={() => setIsExiting(true)}
          >
            Modal content
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

## 8. Performance Considerations

### Debounce Focus Operations

```tsx
function SearchWithFocus() {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<HTMLElement[]>([]);

  // Debounce focus to results to prevent jank
  const focusFirstResult = useDebouncedCallback(() => {
    resultRefs.current[0]?.focus();
  }, 100);

  return (
    <div>
      <input
        ref={inputRef}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusFirstResult();
          }
        }}
      />
      <Results refs={resultRefs} />
    </div>
  );
}
```

## 9. Common Mistakes

### 1. Focus Trapped Forever
**Problem:** Can't escape focus trap.
**Solution:** Always provide Escape key exit.

### 2. Focus Lost After Deletion
**Problem:** Focus jumps to body.
**Solution:** Focus next/previous item.

### 3. Focus During Animation
**Problem:** Focus on animating element.
**Solution:** Wait for animation complete.

### 4. No Focus Indicator
**Problem:** Keyboard users can't see focus.
**Solution:** Always have visible :focus-visible.

### 5. Wrong Tab Order
**Problem:** Tab skips around illogically.
**Solution:** Fix DOM order, avoid positive tabindex.

## 10. Practice Exercises

### Exercise 1: Accessible Modal
Build modal with complete focus management.

### Exercise 2: Dropdown Menu
Create keyboard-navigable dropdown.

### Exercise 3: Tab Interface
Build tabs with arrow key navigation.

### Exercise 4: Combobox
Create searchable select with focus management.

### Exercise 5: Focus Visible Showcase
Design various focus indicator styles.

## 11. Advanced Topics

- **Focus Scope** — Radix UI focus scope patterns
- **Virtual Focus** — aria-activedescendant
- **Focus Layers** — Managing nested focus traps
- **Screen Reader Focus** — DOM focus vs. virtual focus
- **Focus Restoration** — Complex navigation patterns
- **Focus Testing** — Automated accessibility testing
