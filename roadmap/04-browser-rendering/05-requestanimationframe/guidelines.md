# requestAnimationFrame Mastery

## 1. Concept Overview

`requestAnimationFrame` (rAF) is the browser's API for synchronizing JavaScript animations with the display refresh rate. It's the foundation of smooth, efficient animation.

Key characteristics:
- **Synced to display** — Runs at monitor refresh rate (usually 60Hz)
- **Pauses when hidden** — Saves battery when tab is inactive
- **Single callback per frame** — Batches visual updates
- **Returns timestamp** — High-precision timing

rAF is the correct way to:
- Update animation values from JavaScript
- Coordinate multiple animated elements
- Implement physics-based animation
- Create smooth scroll effects

## 2. Why This Matters for Design Engineers

Understanding rAF is essential because:
- Animation libraries use it under the hood
- Custom animations require direct rAF usage
- Debugging animation issues requires understanding the frame loop
- Performance optimization often involves rAF management

As a Design Engineer, you must:
- Know when to use rAF directly vs. libraries
- Understand the frame timing model
- Avoid common rAF pitfalls
- Integrate rAF with React's render cycle

## 3. Key Principles / Mental Models

### The Frame Loop
```
User Input → JS → Style → Layout → Paint → Composite → Display
           ↑_______________________________|
                 Next requestAnimationFrame
```

### 16.67ms Budget
At 60fps, each frame has ~16.67ms:
- rAF callback should complete quickly
- Long callbacks cause dropped frames
- Aim for <10ms to leave room for browser work

### Frame Timing
```javascript
requestAnimationFrame(timestamp => {
  // timestamp: DOMHighResTimeStamp (milliseconds since page load)
  // Called just before browser performs next repaint
});
```

### vs. setTimeout/setInterval
| Feature | rAF | setTimeout |
|---------|-----|------------|
| Synced to display | ✅ | ❌ |
| Pauses when hidden | ✅ | ❌ |
| Consistent timing | ✅ | ❌ |
| Battery efficient | ✅ | ❌ |

## 4. Implementation in React

### Basic rAF Hook

```tsx
function useAnimationFrame(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
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
  }, [callback]);
}

// Usage
function AnimatedCounter() {
  const [count, setCount] = useState(0);

  useAnimationFrame((deltaTime) => {
    // Update roughly once per second
    setCount(prev => prev + deltaTime / 1000);
  });

  return <div>{Math.floor(count)}</div>;
}
```

### Controlled Animation Loop

```tsx
function useControlledAnimation() {
  const requestRef = useRef<number>();
  const [isRunning, setIsRunning] = useState(false);
  const callbackRef = useRef<(time: number) => void>();

  const start = useCallback((callback: (time: number) => void) => {
    callbackRef.current = callback;
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const animate = (time: number) => {
      callbackRef.current?.(time);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning]);

  return { start, stop, isRunning };
}

// Usage
function PlayableAnimation() {
  const { start, stop, isRunning } = useControlledAnimation();
  const positionRef = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    start((time) => {
      // Update position
      positionRef.current.x = Math.sin(time / 500) * 100;
      positionRef.current.y = Math.cos(time / 500) * 100;
      
      // Apply directly to DOM (bypass React render)
      if (elementRef.current) {
        elementRef.current.style.transform = 
          `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;
      }
    });
  };

  return (
    <div>
      <div ref={elementRef} className="w-10 h-10 bg-blue-500 rounded-full" />
      <button onClick={isRunning ? stop : handleStart}>
        {isRunning ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}
```

### Spring Animation with rAF

```tsx
function useSpringAnimation(target: number, config = { stiffness: 300, damping: 25 }) {
  const [value, setValue] = useState(target);
  const velocity = useRef(0);
  const requestRef = useRef<number>();

  useEffect(() => {
    let currentValue = value;
    
    const animate = () => {
      // Spring physics
      const displacement = target - currentValue;
      const springForce = config.stiffness * displacement;
      const dampingForce = config.damping * velocity.current;
      const acceleration = springForce - dampingForce;
      
      velocity.current += acceleration * 0.001; // dt = 1ms approx
      currentValue += velocity.current * 0.001;
      
      setValue(currentValue);
      
      // Stop when settled
      const isSettled = 
        Math.abs(displacement) < 0.01 && 
        Math.abs(velocity.current) < 0.01;
      
      if (!isSettled) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [target, config.stiffness, config.damping]);

  return value;
}

// Usage
function SpringElement({ targetX }) {
  const x = useSpringAnimation(targetX);
  
  return (
    <div 
      style={{ transform: `translateX(${x}px)` }}
      className="w-20 h-20 bg-purple-500 rounded"
    />
  );
}
```

### Frame-Based Progress Animation

```tsx
function useProgressAnimation(
  duration: number,
  easing: (t: number) => number = t => t
) {
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number>();

  const start = useCallback(() => {
    startTimeRef.current = null;
    
    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(rawProgress);
      
      setProgress(easedProgress);
      
      if (rawProgress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    
    requestRef.current = requestAnimationFrame(animate);
  }, [duration, easing]);

  const reset = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    setProgress(0);
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return { progress, start, reset };
}
```

## 5. React Patterns to Use

### Frame-Accurate Motion Values

```tsx
import { useMotionValue, useTransform } from 'framer-motion';

function useRAFMotionValue(calculate: (time: number) => number) {
  const motionValue = useMotionValue(0);
  const requestRef = useRef<number>();

  useEffect(() => {
    const animate = (time: number) => {
      motionValue.set(calculate(time));
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [calculate, motionValue]);

  return motionValue;
}

// Usage: Smooth sine wave
function WaveAnimation() {
  const x = useRAFMotionValue((time) => Math.sin(time / 500) * 100);
  
  return (
    <motion.div
      style={{ x }}
      className="w-10 h-10 bg-blue-500 rounded-full"
    />
  );
}
```

### Batched rAF Updates

```tsx
class RAFScheduler {
  private callbacks: Set<() => void> = new Set();
  private isScheduled = false;

  schedule(callback: () => void) {
    this.callbacks.add(callback);
    
    if (!this.isScheduled) {
      this.isScheduled = true;
      requestAnimationFrame(() => {
        this.callbacks.forEach(cb => cb());
        this.callbacks.clear();
        this.isScheduled = false;
      });
    }
  }

  cancel(callback: () => void) {
    this.callbacks.delete(callback);
  }
}

const scheduler = new RAFScheduler();

function useBatchedRAF() {
  const schedule = useCallback((callback: () => void) => {
    scheduler.schedule(callback);
    return () => scheduler.cancel(callback);
  }, []);

  return schedule;
}
```

## 6. Important Hooks

### useFrameTime

```tsx
function useFrameTime() {
  const [frameTime, setFrameTime] = useState({ delta: 0, fps: 60 });
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const measureFrame = (time: number) => {
      const delta = time - lastTimeRef.current;
      const fps = Math.round(1000 / delta);
      
      setFrameTime({ delta, fps });
      lastTimeRef.current = time;
      
      animationId = requestAnimationFrame(measureFrame);
    };

    animationId = requestAnimationFrame(measureFrame);
    
    return () => cancelAnimationFrame(animationId);
  }, []);

  return frameTime;
}

// Usage
function FPSCounter() {
  const { fps, delta } = useFrameTime();
  
  return (
    <div className="fixed top-4 right-4 text-sm font-mono">
      {fps} FPS ({delta.toFixed(1)}ms)
    </div>
  );
}
```

### useThrottle with rAF

```tsx
function useRAFThrottle<T extends (...args: any[]) => void>(callback: T): T {
  const requestRef = useRef<number | null>(null);
  const argsRef = useRef<any[]>();

  const throttled = useCallback((...args: any[]) => {
    argsRef.current = args;
    
    if (requestRef.current === null) {
      requestRef.current = requestAnimationFrame(() => {
        callback(...argsRef.current!);
        requestRef.current = null;
      });
    }
  }, [callback]);

  useEffect(() => {
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return throttled as T;
}

// Usage: Smooth scroll tracking
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  
  const handleScroll = useRAFThrottle(() => {
    setScrollY(window.scrollY);
  });

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return <div>Scroll: {scrollY}px</div>;
}
```

## 7. Animation Considerations

### Delta Time for Consistent Speed

```tsx
// Without delta time: speed varies with frame rate
function badAnimation(time: number) {
  position += 5; // Moves 5px per frame (300px at 60fps, 150px at 30fps)
}

// With delta time: consistent speed regardless of frame rate
function goodAnimation(time: number, lastTime: number) {
  const delta = time - lastTime;
  const speed = 300; // 300px per second
  position += speed * (delta / 1000);
}
```

### Fixed Timestep for Physics

```tsx
function useFixedTimestep(
  update: (dt: number) => void,
  timestep: number = 1000 / 60 // 60 updates per second
) {
  const accumulatorRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const loop = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      accumulatorRef.current += deltaTime;
      
      // Run fixed timestep updates
      while (accumulatorRef.current >= timestep) {
        update(timestep);
        accumulatorRef.current -= timestep;
      }
      
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    
    return () => cancelAnimationFrame(animationId);
  }, [update, timestep]);
}
```

### Interpolation for Smooth Rendering

```tsx
function useSmoothAnimation() {
  const [displayState, setDisplayState] = useState({ x: 0, y: 0 });
  const currentState = useRef({ x: 0, y: 0 });
  const previousState = useRef({ x: 0, y: 0 });
  const accumulatorRef = useRef(0);
  const timestep = 1000 / 60;

  useEffect(() => {
    let lastTime = performance.now();
    let animationId: number;

    const loop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      accumulatorRef.current += deltaTime;
      
      // Fixed timestep physics
      while (accumulatorRef.current >= timestep) {
        previousState.current = { ...currentState.current };
        // Update physics here
        currentState.current.x += 1;
        accumulatorRef.current -= timestep;
      }
      
      // Interpolate for display
      const alpha = accumulatorRef.current / timestep;
      setDisplayState({
        x: previousState.current.x + (currentState.current.x - previousState.current.x) * alpha,
        y: previousState.current.y + (currentState.current.y - previousState.current.y) * alpha,
      });
      
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    
    return () => cancelAnimationFrame(animationId);
  }, []);

  return displayState;
}
```

## 8. Performance Considerations

### Avoid React Re-renders in Animation Loop

```tsx
// ❌ Bad: Causes React re-render every frame
function BadAnimation() {
  const [x, setX] = useState(0);
  
  useAnimationFrame((delta) => {
    setX(prev => prev + delta * 0.1); // Re-render every frame!
  });
  
  return <div style={{ transform: `translateX(${x}px)` }} />;
}

// ✅ Good: Direct DOM manipulation
function GoodAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  
  useAnimationFrame((delta) => {
    xRef.current += delta * 0.1;
    if (ref.current) {
      ref.current.style.transform = `translateX(${xRef.current}px)`;
    }
  });
  
  return <div ref={ref} />;
}

// ✅ Also good: Use motion values (Framer Motion)
function BestAnimation() {
  const x = useMotionValue(0);
  
  useAnimationFrame((delta) => {
    x.set(x.get() + delta * 0.1); // No React re-render
  });
  
  return <motion.div style={{ x }} />;
}
```

### Cleanup on Unmount

```tsx
function useAnimation() {
  const requestRef = useRef<number>();
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    const animate = () => {
      if (isUnmountedRef.current) return;
      
      // Animation logic...
      
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      isUnmountedRef.current = true;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
}
```

## 9. Common Mistakes

### 1. Not Using Delta Time
**Problem:** Animation speed varies with frame rate.
**Solution:** Scale all changes by delta time.

### 2. setState in Animation Loop
**Problem:** Re-rendering React every frame.
**Solution:** Use refs, motion values, or direct DOM manipulation.

### 3. Missing cancelAnimationFrame
**Problem:** Animation continues after unmount.
**Solution:** Always cancel in cleanup function.

### 4. Multiple Overlapping Loops
**Problem:** Multiple rAF loops for same purpose.
**Solution:** Use a single loop with multiple callbacks.

### 5. Heavy Calculations per Frame
**Problem:** Complex math every frame drops FPS.
**Solution:** Pre-calculate, cache, use lookup tables.

## 10. Practice Exercises

### Exercise 1: Custom Spring
Implement a spring animation from scratch using rAF.

### Exercise 2: Particle System
Create a particle system with 100+ particles using rAF.

### Exercise 3: Frame Timing
Build an FPS monitor that tracks frame time variability.

### Exercise 4: Scroll Animation
Implement smooth parallax scrolling with rAF throttling.

### Exercise 5: Game Loop
Create a simple game loop with fixed timestep physics.

## 11. Advanced Topics

- **Web Workers with OffscreenCanvas** — Animation off main thread
- **Temporal Anti-Aliasing** — Smooth motion blur
- **Variable Refresh Rate** — Handling 120Hz+ displays
- **Frame Pacing** — Consistent frame delivery
- **Animation Scheduling** — Priority-based animation
- **FLIP Animation** — Layout animation with rAF
