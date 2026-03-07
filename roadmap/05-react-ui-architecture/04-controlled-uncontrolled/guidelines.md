# Controlled vs Uncontrolled Components

## 1. Concept Overview

React components can manage their state internally (uncontrolled) or have their state managed by a parent (controlled). Understanding this distinction is fundamental to building flexible UI components.

**Uncontrolled:** Component manages its own state
```tsx
<Input defaultValue="hello" />
// Component internally tracks value
```

**Controlled:** Parent manages state, component reflects it
```tsx
<Input value={value} onChange={setValue} />
// Parent owns the value, component just displays
```

The best components support both modes, allowing consumers to choose.

## 2. Why This Matters for Design Engineers

This pattern affects component flexibility:
- Form libraries need controlled components
- Simple use cases prefer uncontrolled for less boilerplate
- Animation timing often depends on state ownership
- Validation and synchronization require controlled mode

As a Design Engineer, you must:
- Build components that support both modes
- Handle the transition between controlled/uncontrolled
- Document when to use each mode
- Ensure animations work correctly in both modes

## 3. Key Principles / Mental Models

### Source of Truth
- **Uncontrolled:** Truth lives inside the component
- **Controlled:** Truth lives outside the component

### When to Use Each
**Uncontrolled:**
- Simple forms with no validation
- UI state that parent doesn't need
- Progressive enhancement
- Third-party integrations via refs

**Controlled:**
- Form validation
- Conditional field visibility
- Multi-field synchronization
- Undo/redo functionality
- Animation coordination

### The Semi-Controlled Anti-Pattern
```tsx
// ❌ Don't switch between modes
<Input value={someCondition ? value : undefined} />
// This causes React warnings and bugs
```

## 4. Implementation in React

### Supporting Both Modes

```tsx
import { useState, useCallback, useEffect, useRef } from 'react';

interface InputProps {
  // Controlled mode
  value?: string;
  onChange?: (value: string) => void;
  // Uncontrolled mode
  defaultValue?: string;
  // Common props
  placeholder?: string;
}

function Input({ 
  value: controlledValue, 
  onChange: controlledOnChange,
  defaultValue,
  ...props 
}: InputProps) {
  // Determine if controlled
  const isControlled = controlledValue !== undefined;
  
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  
  // Use controlled or internal value
  const value = isControlled ? controlledValue : internalValue;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (isControlled) {
      controlledOnChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <input
      value={value}
      onChange={handleChange}
      {...props}
    />
  );
}

// Uncontrolled usage
<Input defaultValue="hello" />

// Controlled usage
const [value, setValue] = useState('hello');
<Input value={value} onChange={setValue} />
```

### useControllableState Hook

```tsx
function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: {
  prop?: T;
  defaultProp?: T;
  onChange?: (value: T) => void;
}): [T | undefined, (value: T | ((prev: T | undefined) => T)) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledValue;
  
  const setValue = useCallback(
    (nextValue: T | ((prev: T | undefined) => T)) => {
      const value = typeof nextValue === 'function' 
        ? (nextValue as (prev: T | undefined) => T)(prop ?? uncontrolledValue)
        : nextValue;
        
      if (!isControlled) {
        setUncontrolledValue(value);
      }
      onChange?.(value);
    },
    [isControlled, prop, uncontrolledValue, onChange]
  );
  
  return [value, setValue];
}

// Usage in component
function Toggle({ on, defaultOn, onChange, ...props }: ToggleProps) {
  const [isOn, setIsOn] = useControllableState({
    prop: on,
    defaultProp: defaultOn ?? false,
    onChange,
  });
  
  return (
    <motion.button
      onClick={() => setIsOn(!isOn)}
      animate={{ backgroundColor: isOn ? '#10b981' : '#6b7280' }}
      {...props}
    >
      <motion.div
        animate={{ x: isOn ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}
```

### Accordion with Both Modes

```tsx
interface AccordionProps {
  // Controlled
  value?: string[];
  onValueChange?: (value: string[]) => void;
  // Uncontrolled
  defaultValue?: string[];
  // Behavior
  type?: 'single' | 'multiple';
  children: ReactNode;
}

function Accordion({ 
  value: controlledValue,
  onValueChange,
  defaultValue = [],
  type = 'single',
  children 
}: AccordionProps) {
  const [openItems, setOpenItems] = useControllableState({
    prop: controlledValue,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  const toggle = useCallback((itemValue: string) => {
    setOpenItems((prev = []) => {
      const isOpen = prev.includes(itemValue);
      
      if (type === 'single') {
        return isOpen ? [] : [itemValue];
      }
      
      return isOpen 
        ? prev.filter(v => v !== itemValue)
        : [...prev, itemValue];
    });
  }, [type, setOpenItems]);

  return (
    <AccordionContext.Provider value={{ openItems: openItems ?? [], toggle }}>
      <div className="divide-y">{children}</div>
    </AccordionContext.Provider>
  );
}
```

## 5. React Patterns to Use

### Warning for Mode Switching

```tsx
function useControlledSwitchWarning(
  isControlled: boolean,
  componentName: string
) {
  const wasControlled = useRef(isControlled);
  
  useEffect(() => {
    if (wasControlled.current !== isControlled) {
      console.warn(
        `${componentName} is changing from ${
          wasControlled.current ? 'controlled' : 'uncontrolled'
        } to ${
          isControlled ? 'controlled' : 'uncontrolled'
        }. ` +
        'Components should not switch from controlled to uncontrolled (or vice versa). ' +
        'Decide between using a controlled or uncontrolled component for the lifetime of the component.'
      );
    }
    wasControlled.current = isControlled;
  }, [isControlled, componentName]);
}

function Input({ value, defaultValue, ...props }: InputProps) {
  const isControlled = value !== undefined;
  
  useControlledSwitchWarning(isControlled, 'Input');
  
  // ... rest of implementation
}
```

### Ref Access for Uncontrolled

```tsx
interface UncontrolledInputProps {
  defaultValue?: string;
  onSubmit?: (value: string) => void;
}

function UncontrolledForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value;
    console.log('Submitted:', value);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        ref={inputRef} 
        defaultValue="initial" 
        className="border p-2"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Animation in Controlled Mode

```tsx
function AnimatedCheckbox({ 
  checked, 
  defaultChecked,
  onChange,
}: CheckboxProps) {
  const [isChecked, setIsChecked] = useControllableState({
    prop: checked,
    defaultProp: defaultChecked ?? false,
    onChange,
  });

  return (
    <motion.button
      role="checkbox"
      aria-checked={isChecked}
      onClick={() => setIsChecked(!isChecked)}
      className="w-6 h-6 border-2 rounded flex items-center justify-center"
      animate={{
        borderColor: isChecked ? '#3b82f6' : '#d1d5db',
        backgroundColor: isChecked ? '#3b82f6' : 'transparent',
      }}
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="w-4 h-4 text-white"
        initial={false}
        animate={{
          pathLength: isChecked ? 1 : 0,
          opacity: isChecked ? 1 : 0,
        }}
      >
        <motion.path
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          d="M5 12l5 5L20 7"
        />
      </motion.svg>
    </motion.button>
  );
}
```

## 6. Important Hooks

### useUncontrolledState

```tsx
function useUncontrolledState<T>(
  defaultValue: T,
  onChange?: (value: T) => void
): [T, (value: T) => void, () => T] {
  const [value, setValue] = useState(defaultValue);
  const valueRef = useRef(value);
  
  valueRef.current = value;
  
  const handleChange = useCallback((newValue: T) => {
    setValue(newValue);
    onChange?.(newValue);
  }, [onChange]);
  
  const getValue = useCallback(() => valueRef.current, []);
  
  return [value, handleChange, getValue];
}
```

### useSyncedState

```tsx
// Sync external state with internal state
function useSyncedState<T>(externalValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [internalValue, setInternalValue] = useState(externalValue);
  
  useEffect(() => {
    setInternalValue(externalValue);
  }, [externalValue]);
  
  return [internalValue, setInternalValue];
}
```

## 7. Animation Considerations

### Controlled Animation Timing

```tsx
function Modal({ 
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  children 
}: ModalProps) {
  const [isOpen, setIsOpen] = useControllableState({
    prop: controlledOpen,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
  });

  // In controlled mode, parent controls timing
  // In uncontrolled mode, we control timing via animation
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Don't update parent state until exit animation completes
          onAnimationComplete={(definition) => {
            if (definition === 'exit') {
              // Animation done, safe to update
            }
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Animation State Coordination

```tsx
function Collapsible({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useControllableState({
    prop: open,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isAnimating}
      >
        Toggle
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onAnimationStart={() => setIsAnimating(true)}
            onAnimationComplete={() => setIsAnimating(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## 8. Performance Considerations

### Avoiding Unnecessary Updates

```tsx
function OptimizedInput({ value, onChange, ...props }: InputProps) {
  const [localValue, setLocalValue] = useState(value);
  
  // Only update parent on blur (debounced controlled)
  const handleBlur = () => {
    if (localValue !== value) {
      onChange?.(localValue);
    }
  };
  
  // Sync with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  return (
    <input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      {...props}
    />
  );
}
```

### Debounced onChange

```tsx
function DebouncedInput({
  value,
  onChange,
  debounceMs = 300,
  ...props
}: DebouncedInputProps) {
  const [localValue, setLocalValue] = useState(value ?? '');
  const debouncedOnChange = useMemo(
    () => debounce((v: string) => onChange?.(v), debounceMs),
    [onChange, debounceMs]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    debouncedOnChange(e.target.value);
  };

  // Sync controlled value
  useEffect(() => {
    if (value !== undefined && value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  return <input value={localValue} onChange={handleChange} {...props} />;
}
```

## 9. Common Mistakes

### 1. Switching Modes
**Problem:** Changing from controlled to uncontrolled.
**Solution:** Choose one mode and stick with it.

### 2. Not Handling Both Modes
**Problem:** Component only works controlled or uncontrolled.
**Solution:** Use `useControllableState` pattern.

### 3. Forgetting defaultValue
**Problem:** Uncontrolled component has no initial state.
**Solution:** Always provide sensible defaults.

### 4. Not Syncing External Changes
**Problem:** Controlled value changes but component doesn't update.
**Solution:** Track `isControlled` properly.

### 5. Animation During Mode Change
**Problem:** Animation breaks when switching controlled/uncontrolled.
**Solution:** Animation should work identically in both modes.

## 10. Practice Exercises

### Exercise 1: Controllable Toggle
Build a toggle switch that supports both controlled and uncontrolled modes.

### Exercise 2: Accordion
Create an accordion supporting single/multiple selection in both modes.

### Exercise 3: Date Picker
Build a date picker with controlled and uncontrolled variants.

### Exercise 4: Form Integration
Make your components work with React Hook Form.

### Exercise 5: Animation Sync
Ensure animations complete properly in controlled mode.

## 11. Advanced Topics

- **Form Libraries Integration** — React Hook Form, Formik
- **State Machines** — XState for complex form logic
- **Optimistic Updates** — Updating UI before confirmation
- **Undo/Redo** — History management with controlled state
- **Collaborative Editing** — Real-time sync with controlled state
- **Testing Both Modes** — Comprehensive testing strategies
