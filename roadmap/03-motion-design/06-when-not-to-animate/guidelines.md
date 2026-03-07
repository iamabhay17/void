# When Not to Animate

## 1. Concept Overview

Knowing when NOT to animate is as important as knowing how to animate. Animation has costs — performance, attention, time — and these costs aren't always worth paying.

Situations to avoid animation:
- **High-frequency actions** — Actions performed repeatedly
- **Data refreshes** — Background updates
- **Text changes** — Content that updates frequently
- **Performance-critical paths** — Low-end devices, battery-conscious apps
- **Accessibility needs** — Users with motion sensitivity
- **User impatience** — When speed is paramount

The best Design Engineers exercise restraint.

## 2. Why This Matters for Design Engineers

Animation addiction is real:
- Every transition becomes a slide
- Every button gets a bounce
- Every list staggers on every update

This creates:
- Sluggish-feeling interfaces
- User fatigue
- Performance problems
- Accessibility issues

As a Design Engineer, you must:
- Recognize animation's costs
- Make conscious choices about when to skip
- Build systems that default to minimal motion
- Respect user preferences

## 3. Key Principles / Mental Models

### The Animation Tax
Every animation costs:
- **Time** — Users wait for it to complete
- **Attention** — Users track the movement
- **Performance** — CPU/GPU cycles
- **Battery** — Power consumption
- **Development** — Engineering effort
- **Maintenance** — Future complexity

### Frequency Inversely Correlates with Animation
The more often an action occurs, the less it should animate:
- One-time welcome: **More animation**
- Daily login: **Some animation**
- Every click: **Minimal animation**
- Every keystroke: **No animation**

### Speed Perception
Sometimes instant is better than smooth:
- Typing feedback: instant
- Tab switching: instant or very fast
- Undo/redo: instant
- Search results: instant, then refine

### Cognitive Load
Users can only track so much motion:
- One focal animation: good
- Two simultaneous: manageable
- Three+: confusing

## 4. Implementation in React

### No Animation Pattern

```tsx
// Explicit no-animation component
function InstantTransition({ children }) {
  return <div>{children}</div>;
}

// vs
function AnimatedTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {children}
    </motion.div>
  );
}

// Use InstantTransition for high-frequency updates
<InstantTransition>
  <SearchResults results={results} />
</InstantTransition>
```

### Conditional Animation Based on Frequency

```tsx
function useAnimationFrequency(actionKey: string) {
  const counterRef = useRef(new Map<string, number>());
  const lastTimeRef = useRef(new Map<string, number>());
  
  const shouldAnimate = useCallback((key: string) => {
    const now = Date.now();
    const lastTime = lastTimeRef.current.get(key) || 0;
    const count = counterRef.current.get(key) || 0;
    
    // Reset count if it's been more than 5 seconds
    if (now - lastTime > 5000) {
      counterRef.current.set(key, 1);
      lastTimeRef.current.set(key, now);
      return true;
    }
    
    // Increment count
    counterRef.current.set(key, count + 1);
    lastTimeRef.current.set(key, now);
    
    // Don't animate if action repeated more than 3 times in 5 seconds
    return count < 3;
  }, []);
  
  return shouldAnimate;
}

// Usage
function ToggleButton({ onToggle }) {
  const shouldAnimate = useAnimationFrequency('toggle');
  
  const handleClick = () => {
    const animate = shouldAnimate('toggle');
    onToggle();
    
    // Only show animation if not toggling rapidly
    if (animate) {
      // Trigger animation
    }
  };
}
```

### Skip Animation on Rapid Updates

```tsx
function DebouncedAnimation({ value, children }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // If value changes rapidly, skip animation
    clearTimeout(timeoutRef.current);
    
    const timeSinceLastChange = Date.now() - (timeoutRef.current ? 0 : Date.now());
    
    if (timeSinceLastChange < 100) {
      // Rapid change - no animation
      setShouldAnimate(false);
      setDisplayValue(value);
    } else {
      // Normal change - animate
      setShouldAnimate(true);
      timeoutRef.current = setTimeout(() => {
        setDisplayValue(value);
      }, 0);
    }
  }, [value]);

  return (
    <motion.div
      key={displayValue}
      initial={shouldAnimate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
    >
      {children(displayValue)}
    </motion.div>
  );
}
```

### Instant Mode for Power Users

```tsx
function useInstantMode() {
  const [isInstant, setIsInstant] = useState(false);
  
  // Detect rapid navigation
  const navigationCount = useRef(0);
  const lastNavigation = useRef(Date.now());
  
  const recordNavigation = useCallback(() => {
    const now = Date.now();
    if (now - lastNavigation.current < 1000) {
      navigationCount.current++;
      
      // If 3+ navigations in 1 second, enable instant mode
      if (navigationCount.current >= 3) {
        setIsInstant(true);
      }
    } else {
      navigationCount.current = 1;
      setIsInstant(false);
    }
    lastNavigation.current = now;
  }, []);
  
  return { isInstant, recordNavigation };
}

// Usage
function PageTransition({ children }) {
  const { isInstant, recordNavigation } = useInstantMode();
  
  useEffect(() => {
    recordNavigation();
  }, [children]);
  
  if (isInstant) {
    return <div>{children}</div>;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}
```

## 5. React Patterns to Use

### Animation Off Switch

```tsx
const AnimationContext = createContext<{
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}>({ enabled: true, setEnabled: () => {} });

function AnimationProvider({ children }) {
  const prefersReducedMotion = useReducedMotion();
  const [userPreference, setUserPreference] = useState<boolean | null>(null);
  
  const enabled = userPreference ?? !prefersReducedMotion;
  
  return (
    <AnimationContext.Provider value={{ enabled, setEnabled: setUserPreference }}>
      {children}
    </AnimationContext.Provider>
  );
}

function useAnimation() {
  const { enabled } = useContext(AnimationContext);
  
  return {
    enabled,
    // Helper to conditionally apply animation props
    animate: <T extends object>(props: T): T | {} => {
      return enabled ? props : {};
    },
  };
}

// Usage
function Card({ children }) {
  const { animate } = useAnimation();
  
  return (
    <motion.div
      {...animate({
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      })}
    >
      {children}
    </motion.div>
  );
}
```

### Instant Update Component

```tsx
function InstantUpdate<T>({ 
  value, 
  render 
}: { 
  value: T; 
  render: (value: T) => React.ReactNode;
}) {
  // No animation, instant update
  return <>{render(value)}</>;
}

function AnimatedUpdate<T>({ 
  value, 
  render 
}: { 
  value: T; 
  render: (value: T) => React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={JSON.stringify(value)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {render(value)}
      </motion.div>
    </AnimatePresence>
  );
}

// Use InstantUpdate for high-frequency changes
<InstantUpdate 
  value={searchResults} 
  render={results => <ResultsList results={results} />} 
/>

// Use AnimatedUpdate for significant changes
<AnimatedUpdate
  value={selectedCategory}
  render={category => <CategoryHeader category={category} />}
/>
```

## 6. Important Hooks

### useReducedMotion

```tsx
import { useReducedMotion } from 'framer-motion';

function AccessibleComponent({ children }) {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) {
    return <div>{children}</div>;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}
```

### useShouldAnimate

```tsx
function useShouldAnimate(options: {
  checkReducedMotion?: boolean;
  checkBatteryLevel?: boolean;
  checkDeviceCapability?: boolean;
  maxConcurrent?: number;
} = {}) {
  const prefersReducedMotion = useReducedMotion();
  const [batteryLevel, setBatteryLevel] = useState(1);
  const [isLowEnd, setIsLowEnd] = useState(false);
  
  useEffect(() => {
    // Check battery
    if (options.checkBatteryLevel && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(battery.level);
      });
    }
    
    // Check device capability
    if (options.checkDeviceCapability) {
      setIsLowEnd(navigator.hardwareConcurrency <= 4);
    }
  }, [options]);
  
  return useMemo(() => {
    if (options.checkReducedMotion && prefersReducedMotion) return false;
    if (options.checkBatteryLevel && batteryLevel < 0.2) return false;
    if (options.checkDeviceCapability && isLowEnd) return false;
    
    return true;
  }, [prefersReducedMotion, batteryLevel, isLowEnd, options]);
}

// Usage
function HeavyAnimation() {
  const shouldAnimate = useShouldAnimate({
    checkReducedMotion: true,
    checkBatteryLevel: true,
    checkDeviceCapability: true,
  });
  
  if (!shouldAnimate) {
    return <StaticVersion />;
  }
  
  return <AnimatedVersion />;
}
```

### useDebounce for Rapid Changes

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage: Don't animate rapid filter changes
function FilteredList({ filter, items }) {
  const debouncedFilter = useDebounce(filter, 150);
  const filteredItems = items.filter(i => i.matches(debouncedFilter));
  
  // Only animate when debounced value changes
  return (
    <AnimatePresence>
      {filteredItems.map(item => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {item.content}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
```

## 7. Animation Considerations

### Scenarios to Skip Animation

```tsx
// 1. Text input - never animate character by character
function TextInput({ value, onChange }) {
  return (
    <input 
      value={value} 
      onChange={onChange}
      // No animation on value change
    />
  );
}

// 2. Search results - too frequent
function SearchResults({ results }) {
  return (
    <div>
      {results.map(result => (
        <div key={result.id}>{result.title}</div> // No animation
      ))}
    </div>
  );
}

// 3. Tab switching - speed is key
function Tabs({ activeTab, tabs }) {
  return tabs.map(tab => (
    <div 
      key={tab.id}
      className={activeTab === tab.id ? 'active' : ''}
    >
      {tab.content} {/* Instant switch, no fade */}
    </div>
  ));
}

// 4. Data table updates - frequent and numerous
function DataTable({ data }) {
  return (
    <table>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            <td>{row.value}</td> {/* No animation */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 5. Undo/Redo - user expects instant
function Editor({ content, onUndo }) {
  return (
    <div>
      <div>{content}</div> {/* Instant update on undo */}
      <button onClick={onUndo}>Undo</button>
    </div>
  );
}
```

### Progressive Enhancement Approach

```tsx
function List({ items, isFirstLoad }) {
  // Only animate on first load
  if (isFirstLoad) {
    return (
      <motion.ul
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.05 } },
        }}
      >
        {items.map(item => (
          <motion.li
            key={item.id}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            {item.content}
          </motion.li>
        ))}
      </motion.ul>
    );
  }
  
  // Subsequent updates: no animation
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.content}</li>
      ))}
    </ul>
  );
}
```

## 8. Performance Considerations

### Animation Performance Budget

```tsx
const PERFORMANCE_BUDGET = {
  maxAnimationsPerSecond: 60,
  maxConcurrentAnimations: 10,
  maxAnimationDuration: 500,
  skipIfFPSBelow: 30,
};

function usePerformanceAwareAnimation() {
  const [fps, setFps] = useState(60);
  const activeAnimations = useRef(0);
  
  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;
    
    const measureFPS = () => {
      frames++;
      const now = performance.now();
      
      if (now - lastTime >= 1000) {
        setFps(frames);
        frames = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }, []);
  
  const shouldAnimate = useCallback(() => {
    if (fps < PERFORMANCE_BUDGET.skipIfFPSBelow) return false;
    if (activeAnimations.current >= PERFORMANCE_BUDGET.maxConcurrentAnimations) return false;
    return true;
  }, [fps]);
  
  return { shouldAnimate, fps };
}
```

### Battery-Aware Animation

```tsx
function useBatteryAwareAnimation() {
  const [shouldAnimate, setShouldAnimate] = useState(true);
  
  useEffect(() => {
    if (!('getBattery' in navigator)) return;
    
    (navigator as any).getBattery().then((battery: any) => {
      const handleChange = () => {
        // Disable animations below 20% battery or when charging
        setShouldAnimate(battery.level > 0.2 || battery.charging);
      };
      
      battery.addEventListener('levelchange', handleChange);
      battery.addEventListener('chargingchange', handleChange);
      handleChange();
      
      return () => {
        battery.removeEventListener('levelchange', handleChange);
        battery.removeEventListener('chargingchange', handleChange);
      };
    });
  }, []);
  
  return shouldAnimate;
}
```

## 9. Common Mistakes

### 1. Animating Everything by Default
**Problem:** Animation is the default, requiring opt-out.
**Solution:** Make no-animation the default, require opt-in.

### 2. Animating Background Data
**Problem:** WebSocket updates trigger animations.
**Solution:** Only animate user-initiated changes.

### 3. Not Respecting Reduced Motion
**Problem:** Ignoring `prefers-reduced-motion`.
**Solution:** Always check and respect this preference.

### 4. Animation on Re-render
**Problem:** Component animates on every parent re-render.
**Solution:** Use stable keys and `initial={false}` after first render.

### 5. Animating Form Validation
**Problem:** Every character triggers validation animation.
**Solution:** Debounce validation, don't animate on every keystroke.

## 10. Practice Exercises

### Exercise 1: Identify Over-Animation
Review an app and list 10 animations that should be removed.

### Exercise 2: Frequency Analysis
Track how often each animated element changes. Remove animation from high-frequency ones.

### Exercise 3: Instant Mode
Build a "power user" mode that disables all non-essential animations.

### Exercise 4: Battery Mode
Create components that reduce animation on low battery.

### Exercise 5: A/B Test
Create two versions of a feature (with/without animation) and compare usability.

## 11. Advanced Topics

- **Animation Metrics** — Measuring animation impact on performance
- **User Research** — Testing animation necessity with users
- **Adaptive Animation** — Dynamic animation based on device capability
- **Animation Quotas** — Limiting total animation per session
- **Prefers-Reduced-Data** — Considering bandwidth constraints
- **Power Consumption** — Measuring animation's battery impact
