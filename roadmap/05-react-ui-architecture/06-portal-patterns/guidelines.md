# Portal Patterns

## 1. Concept Overview

Portals render children into a DOM node outside the parent component's DOM hierarchy. They're essential for UI elements that need to "break out" of their container: modals, tooltips, dropdowns, and toasts.

```tsx
import { createPortal } from 'react-dom';

createPortal(children, domNode);
```

Key behaviors:
- **DOM placement** — Renders outside React tree
- **Event bubbling** — Events still bubble through React tree
- **Context access** — Still receives React context
- **Stacking context** — Avoids z-index wars

## 2. Why This Matters for Design Engineers

Portals solve critical UI challenges:
- Tooltips clipped by `overflow: hidden` containers
- Modals fighting with page z-index
- Dropdowns escaping scroll containers
- Toast notifications in a consistent location

As a Design Engineer, you must:
- Implement proper stacking order
- Handle focus management
- Coordinate animations across portal boundaries
- Ensure accessibility isn't broken

## 3. Key Principles / Mental Models

### DOM Tree vs. React Tree
```
React Tree:
<App>
  <Page>
    <Modal />  ← Renders here logically

DOM Tree:
<body>
  <div id="root">...</div>
  <div id="modal-root">
    <div class="modal">...  ← Appears here in DOM
```

### Stacking Context Hierarchy
```
body
├── #root (z-index: auto)
│   └── Page content
├── #tooltip-root (z-index: 100)
├── #dropdown-root (z-index: 200)
├── #modal-root (z-index: 300)
└── #toast-root (z-index: 400)
```

### Event Bubbling Through Portals
Events bubble through the React component tree, not the DOM tree:
```tsx
<div onClick={() => console.log('Catches portal clicks!')}>
  {createPortal(<button>Click me</button>, document.body)}
</div>
```

## 4. Implementation in React

### Basic Portal Component

```tsx
import { createPortal } from 'react-dom';
import { useEffect, useState, ReactNode } from 'react';

interface PortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
}

function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const target = container ?? document.body;
  return createPortal(children, target);
}
```

### Portal with Dynamic Container

```tsx
function usePortalContainer(id: string) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element = document.getElementById(id);
    
    if (!element) {
      element = document.createElement('div');
      element.id = id;
      document.body.appendChild(element);
    }
    
    setContainer(element);
    
    return () => {
      // Only remove if we created it and it's empty
      if (element?.childNodes.length === 0) {
        element.remove();
      }
    };
  }, [id]);

  return container;
}

function ModalPortal({ children }: { children: ReactNode }) {
  const container = usePortalContainer('modal-root');
  
  if (!container) return null;
  
  return createPortal(children, container);
}
```

### Animated Modal with Portal

```tsx
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={onClose}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 z-50 max-w-md w-full mx-4"
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
}
```

### Tooltip with Portal

```tsx
import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isVisible || !triggerRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    
    const positions = {
      top: { x: trigger.left + trigger.width / 2, y: trigger.top - 8 },
      bottom: { x: trigger.left + trigger.width / 2, y: trigger.bottom + 8 },
      left: { x: trigger.left - 8, y: trigger.top + trigger.height / 2 },
      right: { x: trigger.right + 8, y: trigger.top + trigger.height / 2 },
    };

    setPosition(positions[placement]);
  }, [isVisible, placement]);

  const transforms = {
    top: { x: '-50%', y: '-100%' },
    bottom: { x: '-50%', y: '0%' },
    left: { x: '-100%', y: '-50%' },
    right: { x: '0%', y: '-50%' },
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>

      <Portal>
        <AnimatePresence>
          {isVisible && (
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                transform: `translate(${transforms[placement].x}, ${transforms[placement].y})`,
                zIndex: 9999,
              }}
              className="px-2 py-1 bg-gray-900 text-white text-sm rounded pointer-events-none"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
```

## 5. React Patterns to Use

### Portal Context for Stacking

```tsx
interface PortalContextValue {
  zIndex: number;
  container: HTMLElement | null;
}

const PortalContext = createContext<PortalContextValue>({
  zIndex: 0,
  container: null,
});

function PortalProvider({ children }: { children: ReactNode }) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'portal-root';
    document.body.appendChild(el);
    setContainer(el);
    return () => el.remove();
  }, []);

  return (
    <PortalContext.Provider value={{ zIndex: 0, container }}>
      {children}
    </PortalContext.Provider>
  );
}

// Nested portals get incrementing z-index
function NestedPortal({ children, zIndexOffset = 10 }: { children: ReactNode; zIndexOffset?: number }) {
  const parent = useContext(PortalContext);
  const newZIndex = parent.zIndex + zIndexOffset;

  return (
    <Portal>
      <PortalContext.Provider value={{ zIndex: newZIndex, container: parent.container }}>
        <div style={{ zIndex: newZIndex, position: 'relative' }}>
          {children}
        </div>
      </PortalContext.Provider>
    </Portal>
  );
}
```

### Floating UI Integration

```tsx
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';

function Popover({ trigger, content }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  return (
    <>
      <div ref={refs.setReference} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      <Portal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={refs.setFloating}
              style={floatingStyles}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="bg-white shadow-lg rounded-lg p-4"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
```

### Toast Container

```tsx
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const ToastContext = createContext<{
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
} | null>(null);

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...toast, id }]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Portal>
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          <AnimatePresence mode="popLayout">
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={cn(
                  'p-4 rounded-lg shadow-lg min-w-[300px]',
                  toast.type === 'success' && 'bg-green-500 text-white',
                  toast.type === 'error' && 'bg-red-500 text-white',
                  toast.type === 'info' && 'bg-blue-500 text-white'
                )}
              >
                {toast.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Portal>
    </ToastContext.Provider>
  );
}
```

## 6. Important Hooks

### useFocusTrap

```tsx
function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store currently focused element
    previousActiveElement.current = document.activeElement;

    // Focus first focusable element
    const focusable = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) {
      (focusable[0] as HTMLElement).focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = Array.from(focusable) as HTMLElement[];
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

// Usage
function Modal({ isOpen, children }: ModalProps) {
  const trapRef = useFocusTrap(isOpen);

  return (
    <Portal>
      {isOpen && <div ref={trapRef}>{children}</div>}
    </Portal>
  );
}
```

### useEscapeKey

```tsx
function useEscapeKey(callback: () => void, isActive = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback, isActive]);
}
```

### useClickOutside

```tsx
function useClickOutside(
  ref: RefObject<HTMLElement>,
  callback: () => void,
  isActive = true
) {
  useEffect(() => {
    if (!isActive) return;

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };

    // Use mousedown for better UX
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback, isActive]);
}
```

## 7. Animation Considerations

### Exit Animation Before Unmount

```tsx
function AnimatedPortal({ isOpen, onExitComplete, children }: AnimatedPortalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);

  const handleExitComplete = () => {
    if (!isOpen) {
      setShouldRender(false);
      onExitComplete?.();
    }
  };

  if (!shouldRender) return null;

  return (
    <Portal>
      <AnimatePresence onExitComplete={handleExitComplete}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
```

### Shared Layout Across Portals

```tsx
import { LayoutGroup, motion } from 'framer-motion';

function SharedLayoutPortal() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <LayoutGroup>
      <motion.div
        layoutId="shared-card"
        onClick={() => setIsExpanded(true)}
        className="w-48 h-32 bg-blue-500 rounded-lg cursor-pointer"
      />

      <Portal>
        <AnimatePresence>
          {isExpanded && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50"
                onClick={() => setIsExpanded(false)}
              />
              <motion.div
                layoutId="shared-card"
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-64 bg-blue-500 rounded-xl"
              />
            </>
          )}
        </AnimatePresence>
      </Portal>
    </LayoutGroup>
  );
}
```

## 8. Performance Considerations

### Lazy Portal Container

```tsx
function LazyPortal({ children, containerId }: LazyPortalProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [, forceUpdate] = useState({});

  if (!containerRef.current) {
    // Only create container when needed
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }
    containerRef.current = container;
    forceUpdate({});
  }

  if (!containerRef.current) return null;
  return createPortal(children, containerRef.current);
}
```

### Avoiding Unnecessary Re-renders

```tsx
// Memoize portal content to prevent re-renders
const MemoizedModalContent = memo(function ModalContent({ children }: { children: ReactNode }) {
  return <div className="modal-content">{children}</div>;
});

function Modal({ isOpen, children }: ModalProps) {
  return (
    <Portal>
      <AnimatePresence>
        {isOpen && <MemoizedModalContent>{children}</MemoizedModalContent>}
      </AnimatePresence>
    </Portal>
  );
}
```

## 9. Common Mistakes

### 1. SSR Hydration Mismatch
**Problem:** Portal renders on client but not server.
**Solution:** Use mounted state check or dynamic imports.

### 2. Z-Index Wars
**Problem:** Overlapping portals fight for visibility.
**Solution:** Use systematic z-index layers.

### 3. Missing Focus Management
**Problem:** Focus lost when opening portal.
**Solution:** Implement focus trapping.

### 4. Memory Leaks
**Problem:** Container elements not cleaned up.
**Solution:** Remove containers when empty.

### 5. Animation Not Running on Exit
**Problem:** Portal unmounts before exit animation.
**Solution:** Use AnimatePresence properly.

## 10. Practice Exercises

### Exercise 1: Drawer Component
Build an animated drawer that slides from the side using portals.

### Exercise 2: Context Menu
Create a right-click context menu that positions correctly.

### Exercise 3: Nested Modals
Implement modals that can open other modals with proper stacking.

### Exercise 4: Toast System
Build a complete toast notification system with enter/exit animations.

### Exercise 5: Tooltip with Arrow
Create a tooltip that includes a pointing arrow positioned correctly.

## 11. Advanced Topics

- **Floating UI** — Advanced positioning library
- **Portal Composition** — Portals containing portals
- **SSR Strategies** — Handling portals with Next.js
- **React Native Portals** — Similar patterns in mobile
- **Shadow DOM** — Portals with web components
- **Iframe Communication** — Portals across frames
