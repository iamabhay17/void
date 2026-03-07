# Compound Components

## 1. Concept Overview

Compound components are a React pattern where multiple components work together to form a cohesive, flexible API. Like HTML's `<select>` and `<option>`, they share implicit state and behavior while giving consumers control over structure.

Key characteristics:
- **Implicit communication** — Child components access parent state via context
- **Flexible composition** — Consumers control rendering order and structure
- **Declarative API** — State management is hidden from consumers
- **Semantic grouping** — Components belong together by design

This pattern enables building complex UI components that are both powerful and easy to use.

## 2. Why This Matters for Design Engineers

Compound components solve real UI problems:
- They enable flexible, customizable component APIs
- They hide complexity while exposing control
- They create intuitive, declarative interfaces
- They allow animation orchestration across children

As a Design Engineer, you must:
- Know when to use this pattern
- Implement proper context sharing
- Design clear component boundaries
- Enable animation coordination between parts

Products like Radix UI and Headless UI use compound components extensively because they offer the best balance of flexibility and ease of use.

## 3. Key Principles / Mental Models

### The Parent-Child Contract
Parent provides:
- Shared state
- State update functions
- Common configuration

Children receive:
- Access to shared state
- Ability to trigger state changes
- Contextual behavior

### Component Roles
- **Root** — Provides context, manages state
- **Trigger** — Initiates state changes
- **Content** — Renders based on state
- **Item** — Individual selectable/interactive elements

### Flexible vs. Rigid APIs
```tsx
// Rigid: Limited flexibility
<Dropdown options={options} onChange={onChange} />

// Compound: Full flexibility
<Dropdown.Root>
  <Dropdown.Trigger>Click me</Dropdown.Trigger>
  <Dropdown.Content>
    <Dropdown.Item>Option 1</Dropdown.Item>
    <Dropdown.Item>Option 2</Dropdown.Item>
  </Dropdown.Content>
</Dropdown.Root>
```

## 4. Implementation in React

### Basic Compound Component

```tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Context
interface AccordionContextValue {
  openItems: Set<string>;
  toggle: (id: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within Accordion.Root');
  }
  return context;
}

// Root Component
interface AccordionRootProps {
  children: ReactNode;
  type?: 'single' | 'multiple';
  defaultValue?: string[];
}

function AccordionRoot({ 
  children, 
  type = 'single',
  defaultValue = []
}: AccordionRootProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(defaultValue)
  );

  const toggle = (id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (type === 'single') {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggle, type }}>
      <div className="divide-y divide-gray-200">{children}</div>
    </AccordionContext.Provider>
  );
}

// Item Context
interface AccordionItemContextValue {
  itemId: string;
  isOpen: boolean;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

function useAccordionItem() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionItem components must be used within Accordion.Item');
  }
  return context;
}

// Item Component
interface AccordionItemProps {
  children: ReactNode;
  value: string;
}

function AccordionItem({ children, value }: AccordionItemProps) {
  const { openItems } = useAccordion();
  const isOpen = openItems.has(value);

  return (
    <AccordionItemContext.Provider value={{ itemId: value, isOpen }}>
      <div className="py-2">{children}</div>
    </AccordionItemContext.Provider>
  );
}

// Trigger Component
interface AccordionTriggerProps {
  children: ReactNode;
}

function AccordionTrigger({ children }: AccordionTriggerProps) {
  const { toggle } = useAccordion();
  const { itemId, isOpen } = useAccordionItem();

  return (
    <button
      onClick={() => toggle(itemId)}
      className="flex items-center justify-between w-full py-2 text-left"
      aria-expanded={isOpen}
    >
      <span>{children}</span>
      <motion.span
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        ▼
      </motion.span>
    </button>
  );
}

// Content Component
interface AccordionContentProps {
  children: ReactNode;
}

function AccordionContent({ children }: AccordionContentProps) {
  const { isOpen } = useAccordionItem();

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="py-2 text-gray-600">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Export as namespace
export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
};
```

### Usage

```tsx
function FAQ() {
  return (
    <Accordion.Root type="single" defaultValue={['item-1']}>
      <Accordion.Item value="item-1">
        <Accordion.Trigger>What is compound component?</Accordion.Trigger>
        <Accordion.Content>
          A pattern where components work together sharing implicit state.
        </Accordion.Content>
      </Accordion.Item>
      
      <Accordion.Item value="item-2">
        <Accordion.Trigger>Why use this pattern?</Accordion.Trigger>
        <Accordion.Content>
          It provides flexible APIs while hiding complexity.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
```

## 5. React Patterns to Use

### Tabs with Animation

```tsx
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
  tabsId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function TabsRoot({ children, defaultValue }: { children: ReactNode; defaultValue: string }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const tabsId = useId();

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, tabsId }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ children }: { children: ReactNode }) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-gray-200">
      {children}
    </div>
  );
}

function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const { activeTab, setActiveTab, tabsId } = useContext(TabsContext)!;
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`${tabsId}-panel-${value}`}
      onClick={() => setActiveTab(value)}
      className="relative px-4 py-2"
    >
      {children}
      {isActive && (
        <motion.div
          layoutId={`${tabsId}-indicator`}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );
}

function TabsContent({ value, children }: { value: string; children: ReactNode }) {
  const { activeTab, tabsId } = useContext(TabsContext)!;
  const isActive = activeTab === value;

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={value}
          id={`${tabsId}-panel-${value}`}
          role="tabpanel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
};
```

### Modal with Compound Components

```tsx
interface ModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function ModalRoot({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ModalContext.Provider value={{ 
      isOpen, 
      open: () => setIsOpen(true), 
      close: () => setIsOpen(false) 
    }}>
      {children}
    </ModalContext.Provider>
  );
}

function ModalTrigger({ children, asChild }: { children: ReactNode; asChild?: boolean }) {
  const { open } = useContext(ModalContext)!;
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: open });
  }
  
  return <button onClick={open}>{children}</button>;
}

function ModalContent({ children }: { children: ReactNode }) {
  const { isOpen, close } = useContext(ModalContext)!;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            className="relative bg-white rounded-xl p-6 max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ModalClose({ children }: { children: ReactNode }) {
  const { close } = useContext(ModalContext)!;
  return <button onClick={close}>{children}</button>;
}

export const Modal = {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Content: ModalContent,
  Close: ModalClose,
};
```

## 6. Important Hooks

### useCompoundContext

```tsx
function createCompoundContext<T>(name: string) {
  const Context = createContext<T | null>(null);

  function useCompoundContext(componentName: string) {
    const context = useContext(Context);
    if (!context) {
      throw new Error(
        `${componentName} must be used within ${name}`
      );
    }
    return context;
  }

  return [Context.Provider, useCompoundContext] as const;
}

// Usage
const [MenuProvider, useMenu] = createCompoundContext<MenuContextValue>('Menu');
```

### useControllableState

```tsx
function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: {
  prop?: T;
  defaultProp?: T;
  onChange?: (value: T) => void;
}) {
  const [uncontrolledProp, setUncontrolledProp] = useState(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledProp;

  const setValue = useCallback(
    (nextValue: T | ((prev: T) => T)) => {
      if (isControlled) {
        const value = typeof nextValue === 'function'
          ? (nextValue as (prev: T) => T)(prop as T)
          : nextValue;
        onChange?.(value);
      } else {
        setUncontrolledProp(nextValue as T);
      }
    },
    [isControlled, prop, onChange]
  );

  return [value, setValue] as const;
}
```

## 7. Animation Considerations

### Coordinated Child Animations

```tsx
function DropdownContent({ children }: { children: ReactNode }) {
  const { isOpen } = useDropdown();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={{
            open: {
              opacity: 1,
              y: 0,
              transition: {
                when: 'beforeChildren',
                staggerChildren: 0.05,
              },
            },
            closed: {
              opacity: 0,
              y: -10,
              transition: {
                when: 'afterChildren',
              },
            },
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DropdownItem({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={{
        open: { opacity: 1, x: 0 },
        closed: { opacity: 0, x: -10 },
      }}
    >
      {children}
    </motion.div>
  );
}
```

### Shared Layout Animation

```tsx
function TabIndicator() {
  const { tabsId } = useContext(TabsContext)!;
  
  return (
    <motion.div
      layoutId={`${tabsId}-indicator`}
      className="absolute bottom-0 h-0.5 bg-blue-500"
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  );
}
```

## 8. Performance Considerations

### Context Splitting

```tsx
// ❌ Single context = all consumers re-render
const MenuContext = createContext({ isOpen, items, selectedItem, ... });

// ✅ Split contexts by update frequency
const MenuStateContext = createContext({ isOpen });
const MenuItemsContext = createContext({ items });
const MenuActionsContext = createContext({ open, close, select });
```

### Memoizing Context Values

```tsx
function AccordionRoot({ children, type }: AccordionRootProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Memoize context value
  const value = useMemo(
    () => ({ openItems, toggle, type }),
    [openItems, toggle, type]
  );

  return (
    <AccordionContext.Provider value={value}>
      {children}
    </AccordionContext.Provider>
  );
}
```

## 9. Common Mistakes

### 1. Missing Context Check
**Problem:** Components crash when used outside provider.
**Solution:** Throw descriptive error in hook.

### 2. Unstable Context Value
**Problem:** New object reference every render.
**Solution:** Memoize context value with useMemo.

### 3. Over-Engineering Simple Components
**Problem:** Compound pattern for simple use cases.
**Solution:** Use compound pattern only when flexibility is needed.

### 4. Missing TypeScript Support
**Problem:** Consumers don't get autocomplete.
**Solution:** Export proper TypeScript types.

### 5. Not Handling Controlled/Uncontrolled
**Problem:** Component can't be controlled externally.
**Solution:** Implement useControllableState pattern.

## 10. Practice Exercises

### Exercise 1: Build a Select
Create a fully-accessible Select compound component with animation.

### Exercise 2: Build a Popover
Create a Popover with Trigger, Content, and Arrow components.

### Exercise 3: Build a Stepper
Create a multi-step form with Step, StepTitle, StepContent components.

### Exercise 4: Animation Orchestration
Add staggered animations to a Menu compound component.

### Exercise 5: Controlled Mode
Add controlled mode support to the Accordion component.

## 11. Advanced Topics

- **Render Props Integration** — Combining patterns
- **Slot Pattern** — Advanced composition with slots
- **Collection Components** — Managing dynamic children
- **Roving Focus** — Keyboard navigation patterns
- **Portal Integration** — Rendering outside DOM hierarchy
- **SSR Considerations** — Server-side rendering support
