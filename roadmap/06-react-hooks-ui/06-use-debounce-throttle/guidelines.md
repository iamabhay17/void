# useDebounce & useThrottle

## 1. Concept Overview

Debouncing and throttling control how often a function executes. They're essential for performance optimization in UI interactions.

**Debounce:** Delays execution until after a pause in calls
```
Calls:   ▮▮▮▮▮▮▮      ▮▮▮
Execute:              ▮         ▮
```

**Throttle:** Ensures execution at most once per time period
```
Calls:   ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮
Execute: ▮   ▮   ▮   ▮   ▮
```

These patterns prevent performance issues from rapid events like typing, scrolling, and resizing.

## 2. Why This Matters for Design Engineers

Rate limiting prevents UI performance issues:
- Search as you type (debounce API calls)
- Window resize handlers (throttle recalculations)
- Scroll animations (throttle updates)
- Form validation (debounce validation)

As a Design Engineer, you must:
- Choose the right pattern for each use case
- Set appropriate timing values
- Handle cleanup properly
- Consider user experience tradeoffs

## 3. Key Principles / Mental Models

### When to Use Each
| Debounce | Throttle |
|----------|----------|
| Search input | Scroll handler |
| Form validation | Resize handler |
| Save draft | Mouse move |
| Auto-complete | Game loop |

### Timing Guidelines
- **50-100ms** — Near-instant feel, light debounce
- **200-300ms** — Standard search/validation delay
- **500ms+** — Explicit pause (auto-save, heavy operations)

### Leading vs. Trailing
```tsx
// Leading: Execute immediately, then wait
// Good for: Actions that should feel instant
debounce(fn, 300, { leading: true, trailing: false });

// Trailing: Wait, then execute (default)
// Good for: Waiting for user to finish
debounce(fn, 300, { trailing: true, leading: false });

// Both: Execute immediately and after wait
debounce(fn, 300, { leading: true, trailing: true });
```

## 4. Implementation in React

### useDebounce (Value)

```tsx
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      fetchSearchResults(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### useDebouncedCallback

```tsx
import { useRef, useCallback, useEffect } from 'react';

function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T {
  const { leading = false, trailing = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);
  const leadingCalledRef = useRef(false);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      const shouldCallLeading = leading && !leadingCalledRef.current;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (shouldCallLeading) {
        callbackRef.current(...args);
        leadingCalledRef.current = true;
      }

      timeoutRef.current = setTimeout(() => {
        if (trailing && !shouldCallLeading) {
          callbackRef.current(...args);
        }
        leadingCalledRef.current = false;
      }, delay);
    }) as T,
    [delay, leading, trailing]
  );
}

// Usage
function AutoSaveForm() {
  const [content, setContent] = useState('');

  const saveContent = useDebouncedCallback(
    async (text: string) => {
      await saveDraft(text);
      console.log('Saved!');
    },
    1000
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    saveContent(text);
  };

  return <textarea value={content} onChange={handleChange} />;
}
```

### useThrottle (Value)

```tsx
function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated.current;

    if (timeSinceLastUpdate >= interval) {
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, interval - timeSinceLastUpdate);

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}
```

### useThrottledCallback

```tsx
function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  interval: number
): T {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= interval) {
        callbackRef.current(...args);
        lastRunRef.current = now;
      } else {
        // Schedule trailing call
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
          lastRunRef.current = Date.now();
        }, interval - timeSinceLastRun);
      }
    }) as T,
    [interval]
  );
}

// Usage
function ScrollTracker() {
  const throttledScroll = useThrottledCallback(
    (y: number) => {
      console.log('Scroll position:', y);
    },
    100
  );

  useEffect(() => {
    const handleScroll = () => {
      throttledScroll(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [throttledScroll]);

  return null;
}
```

## 5. React Patterns to Use

### Search with Loading State

```tsx
function SearchWithDebounce() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    fetchResults(debouncedQuery)
      .then(setResults)
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  // Show loading immediately when typing, not just when fetching
  const showLoading = query !== debouncedQuery || isLoading;

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {showLoading && <Spinner />}
      <Results items={results} />
    </div>
  );
}
```

### Animated Resize Handler

```tsx
function ResponsiveAnimation() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const throttledResize = useThrottledCallback(
    () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    },
    100 // Update at most 10 times per second
  );

  useEffect(() => {
    throttledResize(); // Initial measurement
    window.addEventListener('resize', throttledResize);
    return () => window.removeEventListener('resize', throttledResize);
  }, [throttledResize]);

  return (
    <motion.div
      animate={{ 
        x: dimensions.width * 0.1,
        y: dimensions.height * 0.1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      Window: {dimensions.width} x {dimensions.height}
    </motion.div>
  );
}
```

### Form Validation

```tsx
function ValidatedInput() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useDebouncedCallback(
    async (val: string) => {
      setIsValidating(true);
      try {
        const result = await validateAsync(val);
        setError(result.valid ? null : result.message);
      } finally {
        setIsValidating(false);
      }
    },
    500
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setIsValidating(true);
    validateField(newValue);
  };

  return (
    <div>
      <input value={value} onChange={handleChange} />
      {isValidating && <span className="text-gray-400">Validating...</span>}
      {error && <span className="text-red-500">{error}</span>}
    </div>
  );
}
```

### Mouse Position Tracking

```tsx
function useThrottledMousePosition(throttleMs = 50) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const updatePosition = useThrottledCallback(
    (x: number, y: number) => {
      setPosition({ x, y });
    },
    throttleMs
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [updatePosition]);

  return position;
}

function CursorFollower() {
  const { x, y } = useThrottledMousePosition(16); // ~60fps

  return (
    <motion.div
      className="fixed w-8 h-8 bg-blue-500 rounded-full pointer-events-none"
      animate={{ x: x - 16, y: y - 16 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  );
}
```

## 6. Important Hooks

### useDebounceWithFlush

```tsx
function useDebounceWithFlush<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): { debouncedCallback: T; flush: () => void; cancel: () => void } {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);
  const argsRef = useRef<Parameters<T>>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      argsRef.current = args;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );

  const flush = useCallback(() => {
    if (timeoutRef.current && argsRef.current) {
      clearTimeout(timeoutRef.current);
      callbackRef.current(...argsRef.current);
    }
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return cancel;
  }, [cancel]);

  return { debouncedCallback, flush, cancel };
}

// Usage - flush on unmount
function AutoSaveEditor() {
  const [content, setContent] = useState('');
  
  const { debouncedCallback: save, flush } = useDebounceWithFlush(
    async (text: string) => {
      await saveToServer(text);
    },
    1000
  );

  useEffect(() => {
    // Save any pending changes when navigating away
    return () => flush();
  }, [flush]);

  return (
    <textarea
      value={content}
      onChange={(e) => {
        setContent(e.target.value);
        save(e.target.value);
      }}
    />
  );
}
```

### useDebounceEffect

```tsx
function useDebounceEffect(
  effect: () => void | (() => void),
  deps: DependencyList,
  delay: number
) {
  useEffect(() => {
    const timer = setTimeout(() => {
      effect();
    }, delay);

    return () => clearTimeout(timer);
  }, [...deps, delay]);
}

// Usage
function Component({ query }: { query: string }) {
  useDebounceEffect(
    () => {
      console.log('Effect runs after debounce');
      fetchData(query);
    },
    [query],
    300
  );

  return null;
}
```

## 7. Animation Considerations

### Smooth Value Transitions

```tsx
function useDebouncedMotion<T extends number>(
  value: T,
  delay: number
): MotionValue<T> {
  const motionValue = useMotionValue(value);
  const debouncedValue = useDebounce(value, delay);

  useEffect(() => {
    animate(motionValue, debouncedValue, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    });
  }, [debouncedValue, motionValue]);

  return motionValue;
}

function SmoothCounter({ value }: { value: number }) {
  const animatedValue = useDebouncedMotion(value, 200);

  return (
    <motion.span>
      {useTransform(animatedValue, Math.round)}
    </motion.span>
  );
}
```

### RAF-Based Throttle

```tsx
function useRAFThrottle<T extends (...args: any[]) => any>(callback: T): T {
  const requestRef = useRef<number>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      requestRef.current = requestAnimationFrame(() => {
        callbackRef.current(...args);
      });
    }) as T,
    []
  );
}
```

## 8. Performance Considerations

### Avoiding Stale Closures

```tsx
// ❌ Stale closure
function BadDebounce({ onSearch }: { onSearch: (q: string) => void }) {
  const debouncedSearch = useMemo(
    () => debounce((q: string) => onSearch(q), 300),
    [] // onSearch is captured here and never updates
  );
}

// ✅ Use ref to avoid stale closure
function GoodDebounce({ onSearch }: { onSearch: (q: string) => void }) {
  const debouncedSearch = useDebouncedCallback(onSearch, 300);
  // Hook internally uses ref to track latest callback
}
```

### Cleanup on Unmount

```tsx
// ❌ Missing cleanup
function BadComponent() {
  const [value, setValue] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      // Might run after unmount
      expensiveOperation(value);
    }, 1000);
    // Missing cleanup!
  }, [value]);
}

// ✅ Proper cleanup
function GoodComponent() {
  const [value, setValue] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      expensiveOperation(value);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [value]);
}
```

## 9. Common Mistakes

### 1. Wrong Timing Values
**Problem:** Too fast = no benefit, too slow = laggy UX.
**Solution:** Test with real users, start with 200-300ms.

### 2. Not Canceling on Unmount
**Problem:** Callback runs after component unmounts.
**Solution:** Clear timeout/cancel RAF in cleanup.

### 3. Choosing Wrong Pattern
**Problem:** Using debounce when throttle is appropriate.
**Solution:** Understand use case requirements.

### 4. Stale Closure References
**Problem:** Callback captures old values.
**Solution:** Use refs for latest callback.

### 5. Not Flushing on Submit
**Problem:** User submits before debounce fires.
**Solution:** Provide flush function for critical actions.

## 10. Practice Exercises

### Exercise 1: Autocomplete
Build an autocomplete with debounced API calls and loading state.

### Exercise 2: Window Resize
Create a responsive layout with throttled resize handling.

### Exercise 3: Infinite Scroll
Implement infinite scroll with throttled scroll position checking.

### Exercise 4: Real-Time Validation
Build form validation that validates after typing stops.

### Exercise 5: Drawing Canvas
Create a drawing canvas with throttled point capture for smooth lines.

## 11. Advanced Topics

- **Leading/Trailing Combinations** — Different behaviors for start and end
- **Maximum Wait** — Guarantee execution after max time
- **Cancel Tokens** — Abort pending operations
- **Queue Management** — Handle multiple pending calls
- **Web Worker Debounce** — Offload heavy work
- **SSR Considerations** — Timer compatibility
