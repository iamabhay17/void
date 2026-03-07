# Keyboard Navigation

## 1. Concept Overview

Keyboard navigation enables users to interact with interfaces using only a keyboard. This is essential for accessibility (users who can't use a mouse) and power users who prefer keyboard shortcuts.

Key patterns:
- **Tab navigation** — Moving between interactive elements
- **Arrow navigation** — Moving within components (menus, grids)
- **Keyboard shortcuts** — Direct actions (Ctrl+S, Cmd+K)
- **Focus management** — Where focus goes after actions

```tsx
Tab → Next focusable element
Shift+Tab → Previous focusable element
Enter/Space → Activate current element
Escape → Close/cancel current context
Arrow keys → Navigate within component
```

## 2. Why This Matters for Design Engineers

Keyboard navigation affects:
- Accessibility compliance (WCAG)
- Power user productivity
- Consistency across interfaces
- Professional quality

As a Design Engineer, you must:
- Design for keyboard-first
- Implement standard patterns
- Add useful shortcuts
- Test without a mouse

## 3. Key Principles / Mental Models

### Navigation Patterns
```
Global: Shortcuts that work anywhere
Component: Navigation within a component
Contextual: Actions for current context

Examples:
Global: Cmd+K for command palette
Component: Arrow keys in dropdown
Contextual: Delete key when item selected
```

### Standard Keys
```
Tab/Shift+Tab: Move focus
Enter: Activate button, submit form
Space: Toggle, activate button
Escape: Close, cancel
Arrow keys: Navigate lists, sliders
Home/End: First/last item
Page Up/Down: Scroll large amounts
```

### Focus Order
```
DOM order by default
Avoid positive tabindex (1, 2, 3)
Use tabindex="0" for custom elements
Use tabindex="-1" for programmatic focus
```

## 4. Implementation in React

### Global Keyboard Shortcuts

```tsx
import { useEffect, useCallback } from 'react';

function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Build shortcut string
      const parts = [];
      if (e.metaKey || e.ctrlKey) parts.push('mod');
      if (e.shiftKey) parts.push('shift');
      if (e.altKey) parts.push('alt');
      parts.push(e.key.toLowerCase());
      
      const shortcut = parts.join('+');
      
      if (shortcuts[shortcut]) {
        e.preventDefault();
        shortcuts[shortcut]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Usage
function App() {
  useKeyboardShortcuts({
    'mod+k': () => openCommandPalette(),
    'mod+s': () => save(),
    'mod+shift+p': () => openSettings(),
    'escape': () => closeModal(),
  });

  return <div>...</div>;
}
```

### Arrow Key Navigation

```tsx
function ArrowNavigableList({ items, onSelect }: ListProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(i => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        onSelect(items[focusedIndex]);
        break;
    }
  }, [items, focusedIndex, onSelect]);

  // Scroll focused item into view
  useEffect(() => {
    const list = listRef.current;
    const focused = list?.children[focusedIndex] as HTMLElement;
    focused?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex]);

  return (
    <ul
      ref={listRef}
      role="listbox"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="focus:outline-none"
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          role="option"
          aria-selected={focusedIndex === index}
          className={cn(
            'p-2 cursor-pointer',
            focusedIndex === index && 'bg-blue-50'
          )}
          onClick={() => onSelect(item)}
          onMouseEnter={() => setFocusedIndex(index)}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

### Grid Navigation

```tsx
function KeyboardGrid({ items, columns }: GridProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const rows = Math.ceil(items.length / columns);
    const currentRow = Math.floor(focusedIndex / columns);
    const currentCol = focusedIndex % columns;

    let newIndex = focusedIndex;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (currentCol < columns - 1 && focusedIndex < items.length - 1) {
          newIndex = focusedIndex + 1;
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (currentCol > 0) {
          newIndex = focusedIndex - 1;
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (currentRow < rows - 1) {
          newIndex = Math.min(focusedIndex + columns, items.length - 1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentRow > 0) {
          newIndex = focusedIndex - columns;
        }
        break;
    }

    setFocusedIndex(newIndex);
  }, [focusedIndex, items.length, columns]);

  return (
    <div
      ref={gridRef}
      role="grid"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="grid focus:outline-none"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          role="gridcell"
          tabIndex={-1}
          className={cn(
            'p-4 border',
            focusedIndex === index && 'ring-2 ring-blue-500'
          )}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
```

### Command Palette

```tsx
function CommandPalette({ 
  isOpen, 
  onClose, 
  commands 
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch('');
      setFocusedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(i => 
          Math.min(i + 1, filteredCommands.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[focusedIndex]) {
          filteredCommands[focusedIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  // Reset focus when filter changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-start justify-center pt-32 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          <div className="p-4 border-b">
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              className="w-full outline-none text-lg"
            />
          </div>
          
          <ul className="max-h-80 overflow-auto py-2">
            {filteredCommands.map((cmd, index) => (
              <li
                key={cmd.id}
                className={cn(
                  'px-4 py-2 flex items-center justify-between cursor-pointer',
                  focusedIndex === index && 'bg-blue-50'
                )}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <span>{cmd.label}</span>
                {cmd.shortcut && (
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {cmd.shortcut}
                  </kbd>
                )}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

## 5. React Patterns to Use

### Type-ahead Search

```tsx
function TypeaheadList({ items }: { items: string[] }) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const typeaheadBuffer = useRef('');
  const typeaheadTimeout = useRef<NodeJS.Timeout>();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Check if it's a printable character
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      
      // Add to buffer
      typeaheadBuffer.current += e.key.toLowerCase();
      
      // Clear buffer after delay
      clearTimeout(typeaheadTimeout.current);
      typeaheadTimeout.current = setTimeout(() => {
        typeaheadBuffer.current = '';
      }, 500);

      // Find matching item
      const matchIndex = items.findIndex(item =>
        item.toLowerCase().startsWith(typeaheadBuffer.current)
      );
      
      if (matchIndex !== -1) {
        setFocusedIndex(matchIndex);
      }
    }
  };

  return (
    <ul onKeyDown={handleKeyDown} tabIndex={0}>
      {items.map((item, index) => (
        <li 
          key={item}
          className={cn(focusedIndex === index && 'bg-blue-50')}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

### Shortcut Display Component

```tsx
function KeyboardShortcut({ keys }: { keys: string[] }) {
  const isMac = navigator.platform.includes('Mac');

  const formatKey = (key: string) => {
    const keyMap: Record<string, string> = {
      mod: isMac ? '⌘' : 'Ctrl',
      shift: isMac ? '⇧' : 'Shift',
      alt: isMac ? '⌥' : 'Alt',
      enter: '↵',
      escape: 'Esc',
      arrowup: '↑',
      arrowdown: '↓',
      arrowleft: '←',
      arrowright: '→',
    };
    return keyMap[key.toLowerCase()] || key.toUpperCase();
  };

  return (
    <span className="inline-flex gap-1">
      {keys.map((key, i) => (
        <kbd
          key={i}
          className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs font-mono"
        >
          {formatKey(key)}
        </kbd>
      ))}
    </span>
  );
}
```

### Context-Aware Shortcuts

```tsx
function useContextualShortcuts() {
  const [context, setContext] = useState<'list' | 'detail' | 'edit'>('list');

  useEffect(() => {
    const shortcuts: Record<string, Record<string, () => void>> = {
      list: {
        'n': () => createNew(),
        'Enter': () => openSelected(),
        'Delete': () => deleteSelected(),
      },
      detail: {
        'e': () => startEditing(),
        'Escape': () => goBack(),
      },
      edit: {
        'mod+s': () => save(),
        'Escape': () => cancelEdit(),
      },
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.metaKey || e.ctrlKey ? `mod+${e.key}` : e.key;
      const action = shortcuts[context][key];
      
      if (action) {
        e.preventDefault();
        action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [context]);

  return setContext;
}
```

## 6. Animation Considerations

### Animated Selection

```tsx
function AnimatedListNavigation({ items }: { items: Item[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <ul>
      {items.map((item, index) => (
        <li key={item.id} className="relative">
          {selectedIndex === index && (
            <motion.div
              layoutId="selection"
              className="absolute inset-0 bg-blue-100 rounded"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
```

### Keyboard-triggered Animations

```tsx
function KeyboardAnimations() {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setDirection('down');
    } else if (e.key === 'ArrowUp') {
      setDirection('up');
    }
  };

  return (
    <motion.div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      animate={{ 
        y: direction === 'down' ? 10 : direction === 'up' ? -10 : 0,
      }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      Use arrow keys
    </motion.div>
  );
}
```

## 7. Accessibility Patterns

### ARIA for Keyboard Navigation

```tsx
function AccessibleMenu({ items }: { items: MenuItem[] }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        Menu
      </button>
      
      {isOpen && (
        <ul
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((item, index) => (
            <li
              key={item.id}
              role="menuitem"
              tabIndex={activeIndex === index ? 0 : -1}
              aria-disabled={item.disabled}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 8. Performance Considerations

### Debounce Rapid Key Presses

```tsx
function DebouncedNavigation({ items }: { items: Item[] }) {
  const [index, setIndex] = useState(0);
  
  const handleKeyDown = useDebouncedCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setIndex(i => Math.min(i + 1, items.length - 1));
    }
  }, 50); // Small debounce for rapid pressing

  return <ul onKeyDown={handleKeyDown}>...</ul>;
}
```

## 9. Common Mistakes

### 1. No Visual Focus
**Problem:** Can't see which item is focused.
**Solution:** Always show focus indicator.

### 2. Breaking Tab Order
**Problem:** Focus jumps unexpectedly.
**Solution:** Follow DOM order, avoid positive tabindex.

### 3. No Escape Route
**Problem:** Can't exit component with keyboard.
**Solution:** Always support Escape key.

### 4. Conflicting Shortcuts
**Problem:** App shortcut conflicts with browser.
**Solution:** Test standard shortcuts, use modifiers.

### 5. Missing Arrow Support
**Problem:** Tab through every item in list.
**Solution:** Use arrow keys within components.

## 10. Practice Exercises

### Exercise 1: Tree View
Build keyboard-navigable tree with expand/collapse.

### Exercise 2: Data Table
Create table with row/cell navigation.

### Exercise 3: Date Picker
Build date picker with arrow key navigation.

### Exercise 4: App with Shortcuts
Create app with comprehensive keyboard shortcuts.

### Exercise 5: Vim-style Navigation
Build text editor with vim-like navigation.

## 11. Advanced Topics

- **Vim Mode** — Modal keyboard interfaces
- **Shortcut Discovery** — Showing available shortcuts
- **Keyboard Macros** — Recording/playback
- **Chord Shortcuts** — Multi-key sequences
- **Focus Zones** — Grouping related shortcuts
- **Cross-Platform** — Mac vs. Windows shortcuts
