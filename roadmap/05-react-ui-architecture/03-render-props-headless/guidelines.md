# Render Props & Headless UI

## 1. Concept Overview

Render props and headless UI patterns separate logic from presentation. The component handles behavior (keyboard navigation, state, accessibility) while consumers control rendering.

Key concepts:
- **Render props** — Functions that return React elements
- **Headless components** — Logic-only, no default UI
- **Children as function** — `children` prop as render function
- **Slot pattern** — Named render slots

This pattern powers libraries like Headless UI, Downshift, and React Aria.

## 2. Why This Matters for Design Engineers

Headless UI solves the styling problem:
- Pre-styled components conflict with your design system
- Override CSS is fragile and hacky
- Headless gives you behavior without opinions

As a Design Engineer, you must:
- Build components that work with any styling approach
- Handle complex interaction patterns (keyboard, focus, aria)
- Enable consumers to fully customize rendering
- Add animation capabilities without forcing specific motion libraries

This is how you build truly flexible design system components.

## 3. Key Principles / Mental Models

### Separation of Concerns
```
Headless Component: Behavior + State + Accessibility
         ↓
    Render Function
         ↓
    Your UI: Markup + Styles + Animation
```

### What Headless Components Provide
- State management (open/closed, selected, focused)
- Keyboard navigation
- ARIA attributes
- Focus management
- Event handlers

### What You Provide
- Visual design
- Markup structure
- Animation
- Custom behavior on top

### API Styles
```tsx
// Children as function
<Listbox>
  {({ open, value }) => (
    <div>{/* Your UI */}</div>
  )}
</Listbox>

// Render prop
<Listbox render={({ open, value }) => <div />} />

// Hook-based
const { open, value } = useListbox();
```

## 4. Implementation in React

### Basic Render Props Toggle

```tsx
interface ToggleRenderProps {
  on: boolean;
  toggle: () => void;
  setOn: (on: boolean) => void;
}

interface ToggleProps {
  initialOn?: boolean;
  children: (props: ToggleRenderProps) => ReactNode;
}

function Toggle({ initialOn = false, children }: ToggleProps) {
  const [on, setOn] = useState(initialOn);
  const toggle = useCallback(() => setOn(prev => !prev), []);

  return <>{children({ on, toggle, setOn })}</>;
}

// Usage
function ToggleExample() {
  return (
    <Toggle>
      {({ on, toggle }) => (
        <motion.button
          onClick={toggle}
          animate={{ backgroundColor: on ? '#10b981' : '#6b7280' }}
          className="w-12 h-6 rounded-full relative"
        >
          <motion.div
            animate={{ x: on ? 24 : 0 }}
            className="w-6 h-6 bg-white rounded-full shadow"
          />
        </motion.button>
      )}
    </Toggle>
  );
}
```

### Headless Disclosure

```tsx
interface DisclosureRenderProps {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

interface DisclosureProps {
  defaultOpen?: boolean;
  children: (props: DisclosureRenderProps) => ReactNode;
}

function Disclosure({ defaultOpen = false, children }: DisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const api: DisclosureRenderProps = {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };

  return <>{children(api)}</>;
}

// Sub-components that connect to context
const DisclosureButton = forwardRef<
  HTMLButtonElement,
  { children: ReactNode | ((props: { open: boolean }) => ReactNode) }
>(({ children }, ref) => {
  const { isOpen, toggle } = useDisclosureContext();

  return (
    <button
      ref={ref}
      onClick={toggle}
      aria-expanded={isOpen}
    >
      {typeof children === 'function' ? children({ open: isOpen }) : children}
    </button>
  );
});

const DisclosurePanel = forwardRef<
  HTMLDivElement,
  { children: ReactNode | ((props: { open: boolean }) => ReactNode) }
>(({ children }, ref) => {
  const { isOpen } = useDisclosureContext();

  if (!isOpen) return null;

  return (
    <div ref={ref}>
      {typeof children === 'function' ? children({ open: isOpen }) : children}
    </div>
  );
});
```

### Headless Listbox with Animation Support

```tsx
interface ListboxOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface ListboxRenderProps<T> {
  isOpen: boolean;
  selectedOption: ListboxOption<T> | null;
  highlightedIndex: number;
  getToggleProps: () => React.ButtonHTMLAttributes<HTMLButtonElement>;
  getMenuProps: () => React.HTMLAttributes<HTMLUListElement>;
  getItemProps: (option: ListboxOption<T>, index: number) => React.HTMLAttributes<HTMLLIElement>;
}

interface ListboxProps<T> {
  options: ListboxOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  children: (props: ListboxRenderProps<T>) => ReactNode;
}

function Listbox<T>({ options, value, onChange, children }: ListboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectedOption = options.find(opt => opt.value === value) || null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(i => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen) {
          const option = options[highlightedIndex];
          if (option && !option.disabled) {
            onChange?.(option.value);
            setIsOpen(false);
          }
        } else {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const getToggleProps = () => ({
    onClick: () => setIsOpen(!isOpen),
    onKeyDown: handleKeyDown,
    'aria-haspopup': 'listbox' as const,
    'aria-expanded': isOpen,
  });

  const getMenuProps = () => ({
    role: 'listbox' as const,
    'aria-activedescendant': `option-${highlightedIndex}`,
  });

  const getItemProps = (option: ListboxOption<T>, index: number) => ({
    role: 'option' as const,
    id: `option-${index}`,
    'aria-selected': option.value === value,
    'aria-disabled': option.disabled,
    onClick: () => {
      if (!option.disabled) {
        onChange?.(option.value);
        setIsOpen(false);
      }
    },
    onMouseEnter: () => setHighlightedIndex(index),
  });

  return (
    <>
      {children({
        isOpen,
        selectedOption,
        highlightedIndex,
        getToggleProps,
        getMenuProps,
        getItemProps,
      })}
    </>
  );
}

// Usage with custom animation
function AnimatedSelect() {
  const [selected, setSelected] = useState<string | null>(null);
  const options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ];

  return (
    <Listbox options={options} value={selected} onChange={setSelected}>
      {({ isOpen, selectedOption, highlightedIndex, getToggleProps, getMenuProps, getItemProps }) => (
        <div className="relative">
          <button
            {...getToggleProps()}
            className="w-48 px-4 py-2 text-left bg-white border rounded-lg shadow-sm"
          >
            {selectedOption?.label || 'Select...'}
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.ul
                {...getMenuProps()}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg overflow-hidden"
              >
                {options.map((option, index) => (
                  <motion.li
                    key={option.value}
                    {...getItemProps(option, index)}
                    animate={{
                      backgroundColor: highlightedIndex === index 
                        ? '#f3f4f6' 
                        : '#ffffff',
                    }}
                    className="px-4 py-2 cursor-pointer"
                  >
                    {option.label}
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}
    </Listbox>
  );
}
```

## 5. React Patterns to Use

### Hook-Based Headless Pattern

```tsx
interface UseMenuOptions {
  items: string[];
  onSelect?: (item: string) => void;
}

interface UseMenuReturn {
  isOpen: boolean;
  highlightedIndex: number;
  openMenu: () => void;
  closeMenu: () => void;
  highlightItem: (index: number) => void;
  selectItem: (index: number) => void;
  getMenuProps: () => React.HTMLAttributes<HTMLElement>;
  getItemProps: (index: number) => React.HTMLAttributes<HTMLElement>;
  getButtonProps: () => React.ButtonHTMLAttributes<HTMLButtonElement>;
}

function useMenu({ items, onSelect }: UseMenuOptions): UseMenuReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const openMenu = useCallback(() => {
    setIsOpen(true);
    setHighlightedIndex(0);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const selectItem = useCallback((index: number) => {
    onSelect?.(items[index]);
    closeMenu();
  }, [items, onSelect, closeMenu]);

  const getButtonProps = useCallback(() => ({
    onClick: () => (isOpen ? closeMenu() : openMenu()),
    'aria-haspopup': true as const,
    'aria-expanded': isOpen,
  }), [isOpen, openMenu, closeMenu]);

  const getMenuProps = useCallback(() => ({
    role: 'menu' as const,
    hidden: !isOpen,
  }), [isOpen]);

  const getItemProps = useCallback((index: number) => ({
    role: 'menuitem' as const,
    tabIndex: highlightedIndex === index ? 0 : -1,
    onClick: () => selectItem(index),
    onMouseEnter: () => setHighlightedIndex(index),
  }), [highlightedIndex, selectItem]);

  return {
    isOpen,
    highlightedIndex,
    openMenu,
    closeMenu,
    highlightItem: setHighlightedIndex,
    selectItem,
    getMenuProps,
    getItemProps,
    getButtonProps,
  };
}

// Usage
function MenuExample() {
  const { isOpen, highlightedIndex, getButtonProps, getMenuProps, getItemProps } = useMenu({
    items: ['Edit', 'Duplicate', 'Delete'],
    onSelect: (item) => console.log('Selected:', item),
  });

  return (
    <div className="relative">
      <button {...getButtonProps()}>Actions</button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            {...getMenuProps()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute mt-2 bg-white shadow-lg rounded-lg"
          >
            {['Edit', 'Duplicate', 'Delete'].map((item, index) => (
              <li
                key={item}
                {...getItemProps(index)}
                className={cn(
                  'px-4 py-2 cursor-pointer',
                  highlightedIndex === index && 'bg-blue-50'
                )}
              >
                {item}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Slot Pattern

```tsx
interface SlotProps {
  button?: (props: { toggle: () => void }) => ReactNode;
  content?: (props: { close: () => void }) => ReactNode;
}

function Dialog({ button, content }: SlotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  return (
    <>
      {button?.({ toggle })}
      <AnimatePresence>
        {isOpen && content?.({ close })}
      </AnimatePresence>
    </>
  );
}

// Usage
function SlotExample() {
  return (
    <Dialog
      button={({ toggle }) => (
        <button onClick={toggle}>Open Dialog</button>
      )}
      content={({ close }) => (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50"
        >
          <motion.div className="bg-white p-6 rounded-xl">
            <h2>Dialog Content</h2>
            <button onClick={close}>Close</button>
          </motion.div>
        </motion.div>
      )}
    />
  );
}
```

## 6. Important Hooks

### useDisclosure

```tsx
interface UseDisclosureReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  getButtonProps: () => React.ButtonHTMLAttributes<HTMLButtonElement>;
  getPanelProps: () => React.HTMLAttributes<HTMLElement>;
}

function useDisclosure(defaultOpen = false): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();
  const buttonId = useId();

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
    getButtonProps: () => ({
      id: buttonId,
      'aria-expanded': isOpen,
      'aria-controls': panelId,
      onClick: () => setIsOpen(!isOpen),
    }),
    getPanelProps: () => ({
      id: panelId,
      'aria-labelledby': buttonId,
      hidden: !isOpen,
    }),
  };
}
```

### useRovingFocus

```tsx
function useRovingFocus(itemCount: number) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex(i => (i + 1) % itemCount);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex(i => (i - 1 + itemCount) % itemCount);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(itemCount - 1);
        break;
    }
  }, [itemCount]);

  const getItemProps = useCallback((index: number) => ({
    tabIndex: focusedIndex === index ? 0 : -1,
    onFocus: () => setFocusedIndex(index),
  }), [focusedIndex]);

  return { focusedIndex, handleKeyDown, getItemProps };
}
```

## 7. Animation Considerations

### Exposing Animation Hooks

```tsx
interface TooltipRenderProps {
  isVisible: boolean;
  position: { x: number; y: number };
  arrowPosition: { x: number };
  // Animation helpers
  getAnimationProps: () => MotionProps;
}

function Tooltip({ children }: { children: (props: TooltipRenderProps) => ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const getAnimationProps = (): MotionProps => ({
    initial: { opacity: 0, y: 5, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 5, scale: 0.95 },
    transition: { duration: 0.15 },
  });

  return children({
    isVisible,
    position,
    arrowPosition: { x: position.x },
    getAnimationProps,
  });
}
```

## 8. Performance Considerations

### Memoizing Render Props

```tsx
function OptimizedRenderProps({ render }: { render: (value: number) => ReactNode }) {
  const [value, setValue] = useState(0);

  // Memoize the callback to prevent unnecessary re-renders
  const memoizedRender = useMemo(() => render(value), [render, value]);

  return <div>{memoizedRender}</div>;
}
```

### Avoiding Inline Functions

```tsx
// ❌ New function every render
<Menu>
  {({ isOpen }) => <div>{isOpen ? 'Open' : 'Closed'}</div>}
</Menu>

// ✅ Stable function reference
const renderMenu = useCallback(({ isOpen }) => (
  <div>{isOpen ? 'Open' : 'Closed'}</div>
), []);

<Menu>{renderMenu}</Menu>
```

## 9. Common Mistakes

### 1. Not Providing Accessibility
**Problem:** Headless component missing ARIA attributes.
**Solution:** Include comprehensive `get*Props` functions.

### 2. Missing Keyboard Support
**Problem:** Only works with mouse.
**Solution:** Implement full keyboard navigation.

### 3. Exposing Implementation Details
**Problem:** Render props return internal state structure.
**Solution:** Return stable, documented API shape.

### 4. Not Handling Edge Cases
**Problem:** Breaks with zero items or rapid toggling.
**Solution:** Defensive programming, comprehensive testing.

## 10. Practice Exercises

### Exercise 1: Headless Tabs
Build a headless Tabs component with render props and full keyboard support.

### Exercise 2: Autocomplete
Create an autocomplete/combobox with filtering, highlighting, and selection.

### Exercise 3: Modal with Focus Trap
Build a modal that traps focus and handles escape key.

### Exercise 4: Sortable List
Create a keyboard-accessible sortable list with animation.

### Exercise 5: Hook-Based Carousel
Build a useCarousel hook with prev/next/goto functions.

## 11. Advanced Topics

- **State Machines** — XState for complex interaction patterns
- **Focus Management** — Comprehensive focus trapping
- **Portals** — Rendering outside React tree
- **Virtual Lists** — Combining headless with virtualization
- **React Aria** — Adobe's approach to headless
- **Testing Headless** — Unit testing interaction patterns
