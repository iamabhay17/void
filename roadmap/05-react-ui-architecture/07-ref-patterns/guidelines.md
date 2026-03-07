# Ref Patterns

## 1. Concept Overview

Refs provide a way to access DOM nodes or React component instances directly. They're the bridge between React's declarative model and imperative DOM manipulation.

Key uses:
- **DOM access** — Measure elements, manage focus, trigger animations
- **Instance values** — Store mutable values without re-renders
- **Forwarding** — Pass refs through component boundaries
- **Callbacks** — Get notified when refs attach/detach

For Design Engineers, refs are essential for measuring, animating, and integrating with DOM APIs.

## 2. Why This Matters for Design Engineers

Refs enable critical UI capabilities:
- Measuring element sizes for animations
- Managing focus for accessibility
- Integrating with animation libraries
- Implementing virtual scrolling
- Connecting to third-party libraries

As a Design Engineer, you must:
- Know when to use refs vs. state
- Forward refs through component hierarchies
- Handle ref timing correctly
- Clean up ref-based effects

## 3. Key Principles / Mental Models

### When to Use Refs
| Use State | Use Ref |
|-----------|---------|
| Value affects rendering | Value doesn't affect rendering |
| Need React to re-render | Need to avoid re-renders |
| Declarative updates | Imperative operations |
| UI state | DOM operations, timers, previous values |

### Ref Timing
Refs are set during the commit phase:
```
Render Phase → Commit Phase → Ref is set → useEffect runs
```

This means refs aren't available during render but are in effects.

### The Ref Object
```tsx
const ref = useRef<HTMLDivElement>(null);
// ref.current is mutable and persists across renders
```

## 4. Implementation in React

### Basic DOM Ref

```tsx
function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}
```

### Measuring Elements

```tsx
function MeasuredElement() {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={ref} className="resize overflow-auto border p-4">
      <p>Width: {dimensions.width}px</p>
      <p>Height: {dimensions.height}px</p>
    </div>
  );
}
```

### Forwarding Refs

```tsx
import { forwardRef, useImperativeHandle, useRef } from 'react';

interface InputProps {
  label: string;
  placeholder?: string;
}

// Forward ref to allow parent access to input
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, placeholder }, ref) => {
    return (
      <label>
        {label}
        <input ref={ref} placeholder={placeholder} className="border p-2" />
      </label>
    );
  }
);

Input.displayName = 'Input';

// Usage
function Form() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    console.log('Value:', inputRef.current?.value);
    inputRef.current?.focus();
  };

  return (
    <>
      <Input ref={inputRef} label="Name" />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}
```

### useImperativeHandle

```tsx
interface VideoPlayerRef {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ src }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Expose limited API instead of full video element
    useImperativeHandle(ref, () => ({
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      seek: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
    }), []);

    return <video ref={videoRef} src={src} />;
  }
);

// Usage
function App() {
  const playerRef = useRef<VideoPlayerRef>(null);

  return (
    <>
      <VideoPlayer ref={playerRef} src="/video.mp4" />
      <button onClick={() => playerRef.current?.play()}>Play</button>
      <button onClick={() => playerRef.current?.pause()}>Pause</button>
      <button onClick={() => playerRef.current?.seek(30)}>Skip to 30s</button>
    </>
  );
}
```

## 5. React Patterns to Use

### Callback Refs

```tsx
function CallbackRefExample() {
  const [height, setHeight] = useState(0);

  // Called when ref attaches/detaches
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);

  return (
    <div ref={measureRef}>
      <p>Content here...</p>
      <p>Measured height: {height}px</p>
    </div>
  );
}
```

### Merged Refs

```tsx
function useMergedRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return useCallback((node: T | null) => {
    refs.forEach(ref => {
      if (!ref) return;
      
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  }, refs);
}

// Usage - combine multiple refs
const MyComponent = forwardRef<HTMLDivElement, Props>((props, forwardedRef) => {
  const localRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(forwardedRef, localRef);

  useEffect(() => {
    // Can use localRef here
    console.log(localRef.current);
  }, []);

  return <div ref={mergedRef} {...props} />;
});
```

### Stable Callback Ref

```tsx
function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });
  
  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}

// Use with callback refs to avoid re-measuring
function StableCallbackRefExample() {
  const [height, setHeight] = useState(0);

  const measureRef = useStableCallback((node: HTMLDivElement | null) => {
    if (node) {
      setHeight(node.getBoundingClientRect().height);
    }
  });

  return <div ref={measureRef}>...</div>;
}
```

### Previous Value Ref

```tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

// Usage for animation direction
function AnimatedCounter({ value }: { value: number }) {
  const prevValue = usePrevious(value);
  const direction = prevValue !== undefined && value > prevValue ? 1 : -1;

  return (
    <motion.div
      key={value}
      initial={{ y: direction * 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: direction * -20, opacity: 0 }}
    >
      {value}
    </motion.div>
  );
}
```

## 6. Important Hooks

### useMeasure

```tsx
function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [bounds, setBounds] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const rect = entry.target.getBoundingClientRect();
      setBounds({
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        x: rect.x,
        y: rect.y,
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, bounds] as const;
}

// Usage
function DynamicComponent() {
  const [ref, bounds] = useMeasure<HTMLDivElement>();

  return (
    <div ref={ref} className="resize overflow-auto">
      <p>Width: {bounds.width}</p>
      <p>Height: {bounds.height}</p>
    </div>
  );
}
```

### useLatest

```tsx
function useLatest<T>(value: T): React.RefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

// Avoid stale closure issues
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useLatest(callback);

  useEffect(() => {
    if (delay === null) return;

    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]); // Don't need callback in deps
}
```

### useResizeObserver

```tsx
function useResizeObserver<T extends HTMLElement>(
  callback: (entry: ResizeObserverEntry) => void
) {
  const ref = useRef<T>(null);
  const callbackRef = useLatest(callback);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(entries => {
      callbackRef.current(entries[0]);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return ref;
}

// Usage
function ResponsiveComponent() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  
  const ref = useResizeObserver<HTMLDivElement>(entry => {
    const width = entry.contentRect.width;
    if (width < 400) setSize('sm');
    else if (width < 800) setSize('md');
    else setSize('lg');
  });

  return (
    <div ref={ref} className="border p-4">
      Current size: {size}
    </div>
  );
}
```

## 7. Animation Considerations

### Refs for Animation Libraries

```tsx
import { useRef, useEffect } from 'react';
import { animate } from 'framer-motion';

function AnimatedProgress({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const prevValue = usePrevious(value);

  useEffect(() => {
    if (!ref.current) return;
    
    animate(prevValue ?? 0, value, {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: latest => {
        if (ref.current) {
          ref.current.style.width = `${latest}%`;
        }
      },
    });
  }, [value, prevValue]);

  return (
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div ref={ref} className="h-full bg-blue-500" />
    </div>
  );
}
```

### FLIP Animation with Refs

```tsx
function FlipAnimation({ items }: { items: Item[] }) {
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevPositions = useRef<Map<string, DOMRect>>(new Map());

  useLayoutEffect(() => {
    // After render, animate from old to new positions
    itemRefs.current.forEach((element, id) => {
      const prevRect = prevPositions.current.get(id);
      if (!prevRect) return;

      const newRect = element.getBoundingClientRect();
      const deltaX = prevRect.left - newRect.left;
      const deltaY = prevRect.top - newRect.top;

      if (deltaX === 0 && deltaY === 0) return;

      element.animate([
        { transform: `translate(${deltaX}px, ${deltaY}px)` },
        { transform: 'translate(0, 0)' }
      ], {
        duration: 300,
        easing: 'ease-out',
      });
    });
  }, [items]);

  // Before render, store current positions
  useLayoutEffect(() => {
    return () => {
      itemRefs.current.forEach((element, id) => {
        prevPositions.current.set(id, element.getBoundingClientRect());
      });
    };
  });

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <div
          key={item.id}
          ref={el => {
            if (el) itemRefs.current.set(item.id, el);
            else itemRefs.current.delete(item.id);
          }}
          className="p-4 bg-blue-500 text-white rounded"
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

### Motion Values from Refs

```tsx
import { useMotionValue, useTransform, motion } from 'framer-motion';

function ScrollProgress() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollY = useMotionValue(0);
  const progress = useTransform(scrollY, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollProgress = scrollTop / (scrollHeight - clientHeight);
      scrollY.set(scrollProgress);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollY]);

  return (
    <div ref={containerRef} className="h-screen overflow-auto">
      <motion.div
        className="fixed top-0 left-0 h-1 bg-blue-500"
        style={{ width: progress }}
      />
      {/* Scrollable content */}
    </div>
  );
}
```

## 8. Performance Considerations

### Avoiding Unnecessary Effect Runs

```tsx
// ❌ Effect runs on every render
function Bad() {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // This runs every render because no deps
    console.log(ref.current);
  });
}

// ✅ Effect runs once
function Good() {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    console.log(ref.current);
  }, []); // Empty deps
}
```

### Ref Cleanup

```tsx
function useAnimationFrame(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const callbackRef = useLatest(callback);

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
}
```

## 9. Common Mistakes

### 1. Reading Refs During Render
**Problem:** Refs aren't populated during render.
**Solution:** Read refs in effects or event handlers.

### 2. Missing Null Checks
**Problem:** `ref.current` can be null.
**Solution:** Always check `if (ref.current)`.

### 3. Forgetting forwardRef
**Problem:** Can't pass ref to custom components.
**Solution:** Wrap component with forwardRef.

### 4. Callback Ref Re-creation
**Problem:** Callback ref runs on every render.
**Solution:** Wrap in useCallback.

### 5. Not Cleaning Up
**Problem:** Event listeners or observers leak.
**Solution:** Return cleanup function from useEffect.

## 10. Practice Exercises

### Exercise 1: Focus Management
Build a focus ring that follows the currently focused element.

### Exercise 2: Element Dimensions
Create a hook that tracks element width/height and position.

### Exercise 3: Previous Value Animation
Animate between previous and current values using refs.

### Exercise 4: Imperative Form
Build a form with imperative validation and focus management.

### Exercise 5: Scroll Spy
Create a navigation that highlights based on scroll position.

## 11. Advanced Topics

- **Concurrent Mode** — Refs in concurrent React
- **Server Components** — Refs aren't available on server
- **Web Components** — Refs to custom elements
- **iframes** — Cross-frame ref access
- **Memory Management** — WeakRef for DOM elements
- **Animation Orchestration** — Coordinating multiple refs
