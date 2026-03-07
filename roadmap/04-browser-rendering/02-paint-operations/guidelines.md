# Paint Operations

## 1. Concept Overview

Paint is the browser's process of filling in pixels—converting layout geometry into actual visual pixels on screen. It's the second-most expensive rendering operation after layout.

Paint involves:
- **Rasterization** — Converting vectors to pixels
- **Fill operations** — Colors, gradients, images
- **Text rendering** — Drawing glyphs
- **Effects** — Shadows, borders, filters

Paint operations are triggered by changing visual properties that don't affect layout.

## 2. Why This Matters for Design Engineers

Paint can be a major performance bottleneck:
- Complex shadows and gradients are expensive
- Large paint areas block rendering
- Frequent paints cause jank in animations

As a Design Engineer, you must:
- Know which properties trigger paint
- Understand paint complexity
- Use compositor-friendly properties when possible
- Promote elements to their own layers to isolate paint

## 3. Key Principles / Mental Models

### Properties That Trigger Paint
- `color`, `background-color`
- `background-image`
- `border-color`, `border-style`
- `box-shadow`
- `text-shadow`
- `outline`
- `visibility`
- `border-radius` (sometimes)

### Properties That Skip Paint
- `transform` (compositor only)
- `opacity` (compositor only)
- `filter` (can be compositor with GPU)
- `will-change` (promotes to layer)

### Paint Complexity Factors
Not all paints are equal:
- **Large areas** are more expensive
- **Gradients** are more expensive than solid colors
- **Shadows** are very expensive
- **Text** is moderately expensive
- **Images** depend on size and format

### Layer Promotion
When an element has its own compositing layer, paint for that element doesn't affect other layers.

## 4. Implementation in React

### Avoiding Expensive Paints in Animation

```tsx
// ❌ Animating shadow - expensive paint every frame
<motion.div
  animate={{
    boxShadow: isHovered 
      ? '0 20px 40px rgba(0,0,0,0.3)' 
      : '0 2px 8px rgba(0,0,0,0.1)',
  }}
  transition={{ duration: 0.3 }}
/>

// ✅ Animate opacity of a pseudo-element shadow
function OptimizedShadow({ isHovered }) {
  return (
    <div className="relative">
      {/* Base shadow (always painted) */}
      <div 
        className="absolute inset-0 rounded-lg bg-transparent"
        style={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: -1 
        }} 
      />
      {/* Hover shadow (opacity animated) */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-transparent"
        style={{ 
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          zIndex: -1 
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      {/* Content */}
      <div className="relative z-10 p-4">Content</div>
    </div>
  );
}
```

### Color Animation Without Paint

```tsx
// ❌ Animating background-color triggers paint
<motion.button
  animate={{ backgroundColor: isActive ? '#3b82f6' : '#6b7280' }}
/>

// ✅ Use opacity between two elements
function OptimizedColorTransition({ isActive }) {
  return (
    <div className="relative">
      {/* Inactive state (always rendered) */}
      <div className="absolute inset-0 bg-gray-500 rounded" />
      
      {/* Active state (opacity animated) */}
      <motion.div
        className="absolute inset-0 bg-blue-500 rounded"
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      
      <span className="relative z-10 px-4 py-2 text-white">
        Button
      </span>
    </div>
  );
}
```

### Layer Promotion for Isolation

```tsx
// Promote element to its own layer to isolate paint
function PromotedLayer({ children }) {
  return (
    <div
      style={{
        // Forces GPU layer promotion
        willChange: 'transform',
        // or: transform: 'translateZ(0)',
        // or: backfaceVisibility: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

// Use sparingly - too many layers has memory cost
function AnimatedCard({ children }) {
  return (
    <motion.div
      // Framer Motion automatically promotes animated elements
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      // This element gets its own compositing layer during animation
    >
      {children}
    </motion.div>
  );
}
```

### Efficient Shadow Animation

```tsx
// The optimal shadow animation pattern
function EfficientShadowCard() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="relative bg-white rounded-xl p-6"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      // Animate transform and opacity only
      animate={{
        y: isHovered ? -4 : 0,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Pre-painted shadows with opacity animation */}
      <motion.div
        className="absolute inset-0 rounded-xl -z-10"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      <div
        className="absolute inset-0 rounded-xl -z-10"
        style={{
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          opacity: isHovered ? 0 : 1,
        }}
      />
      
      <h3>Card Title</h3>
      <p>Card content goes here</p>
    </motion.div>
  );
}
```

## 5. React Patterns to Use

### Paint-Efficient Color Switcher

```tsx
interface ColorState {
  from: string;
  to: string;
  progress: number;
}

function PaintEfficientBackground({ colors, activeIndex }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {colors.map((color, index) => (
        <motion.div
          key={color}
          className="absolute inset-0"
          style={{ backgroundColor: color }}
          animate={{ opacity: index === activeIndex ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}
```

### Gradient Animation Alternative

```tsx
// ❌ Expensive: Animating gradient
<div
  style={{
    background: `linear-gradient(${angle}deg, #3b82f6, #8b5cf6)`,
  }}
/>

// ✅ Better: Rotate a fixed gradient
function RotatingGradient() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <motion.div
        className="absolute"
        style={{
          // Oversized to cover during rotation
          width: '200%',
          height: '200%',
          left: '-50%',
          top: '-50%',
          background: 'linear-gradient(0deg, #3b82f6, #8b5cf6)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// ✅ Even better: Crossfade between gradient states
function CrossfadeGradient({ angle }) {
  return (
    <div className="relative w-full h-full">
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(0deg, #3b82f6, #8b5cf6)',
        }}
        animate={{ opacity: angle === 0 ? 1 : 0 }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
        }}
        animate={{ opacity: angle === 45 ? 1 : 0 }}
      />
    </div>
  );
}
```

## 6. Important Hooks

### usePaintTiming

```tsx
function usePaintTiming() {
  const [paintTime, setPaintTime] = useState<number | null>(null);

  useEffect(() => {
    // Observe paint timing via PerformanceObserver
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          setPaintTime(entry.startTime);
        }
      }
    });

    observer.observe({ entryTypes: ['paint'] });
    return () => observer.disconnect();
  }, []);

  return paintTime;
}
```

### useWillChange

```tsx
function useWillChange<T extends HTMLElement>(properties: string[]) {
  const ref = useRef<T>(null);

  const enable = useCallback(() => {
    if (ref.current) {
      ref.current.style.willChange = properties.join(', ');
    }
  }, [properties]);

  const disable = useCallback(() => {
    if (ref.current) {
      ref.current.style.willChange = 'auto';
    }
  }, []);

  return { ref, enable, disable };
}

// Usage: Only promote layer during interaction
function OptimizedCard() {
  const { ref, enable, disable } = useWillChange<HTMLDivElement>(['transform']);

  return (
    <div
      ref={ref}
      onMouseEnter={enable}
      onMouseLeave={disable}
    >
      Card content
    </div>
  );
}
```

## 7. Animation Considerations

### Shadow Complexity

```tsx
// Shadow complexity ranking (most to least expensive):
// 1. Multiple shadows - very expensive
const expensive = 'box-shadow: 0 10px 20px rgba(0,0,0,0.2), 0 6px 6px rgba(0,0,0,0.2), 0 0 40px rgba(0,0,0,0.1)';

// 2. Large spread radius - expensive
const largeSpread = 'box-shadow: 0 0 100px rgba(0,0,0,0.3)';

// 3. Large blur radius - moderately expensive
const largeBlur = 'box-shadow: 0 25px 50px rgba(0,0,0,0.3)';

// 4. Simple shadow - relatively cheap
const simple = 'box-shadow: 0 4px 8px rgba(0,0,0,0.1)';

// ✅ For animation, use the simple shadow approach
function OptimalShadow() {
  return (
    <div style={{
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      // Plus filter for additional softness (GPU accelerated)
      filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))',
    }}>
      Content
    </div>
  );
}
```

### Text Rendering Considerations

```tsx
// Text is expensive to paint
// Avoid animating elements with lots of text

// ❌ Animating a paragraph's color
<motion.p
  animate={{ color: isActive ? '#000' : '#666' }}
>
  Long paragraph of text...
</motion.p>

// ✅ Animate container opacity instead
function TextColorTransition({ isActive, children }) {
  return (
    <div className="relative">
      <p style={{ color: '#666' }}>{children}</p>
      <motion.p
        className="absolute inset-0"
        style={{ color: '#000' }}
        animate={{ opacity: isActive ? 1 : 0 }}
      >
        {children}
      </motion.p>
    </div>
  );
}
```

## 8. Performance Considerations

### Paint Flashing in DevTools

```tsx
// Enable "Paint flashing" in DevTools to visualize paint
// Green flashes = paint operations

// Tips to reduce paint:
// 1. Promote animated elements to their own layer
// 2. Use transform/opacity instead of paint-triggering properties
// 3. Reduce shadow complexity
// 4. Avoid animating large areas
```

### Layer Management

```tsx
// ❌ Too many layers wastes memory
function BadLayers() {
  return (
    <>
      {items.map(item => (
        <div 
          key={item.id}
          style={{ willChange: 'transform' }} // Each gets a layer!
        >
          {item.content}
        </div>
      ))}
    </>
  );
}

// ✅ Promote strategically
function GoodLayers() {
  return (
    <div style={{ willChange: 'transform' }}> {/* One layer for container */}
      {items.map(item => (
        <div key={item.id}>
          {item.content}
        </div>
      ))}
    </div>
  );
}
```

### Reducing Paint Area

```tsx
// Smaller paint areas are faster
function SmallPaintArea({ isActive }) {
  return (
    <div className="relative p-4">
      {/* Only this small element paints, not the whole card */}
      <motion.div
        className="absolute w-3 h-3 rounded-full bg-green-500"
        animate={{ 
          opacity: isActive ? 1 : 0,
          scale: isActive ? 1 : 0.5,
        }}
      />
      <span className="ml-5">Status indicator</span>
    </div>
  );
}
```

## 9. Common Mistakes

### 1. Animating Box-Shadow
**Problem:** Box-shadow triggers expensive paint on every frame.
**Solution:** Animate opacity of pre-rendered shadow elements.

### 2. Animating Background Color
**Problem:** `background-color` changes trigger paint.
**Solution:** Stack elements and animate opacity between them.

### 3. Large Paint Areas
**Problem:** Animating full-width elements is slow.
**Solution:** Break into smaller elements, promote to layers.

### 4. Over-Promoting Layers
**Problem:** `will-change: transform` on everything.
**Solution:** Only promote elements that actually animate.

### 5. Ignoring Paint Complexity
**Problem:** Complex shadows and gradients animate poorly.
**Solution:** Simplify visual effects for animated elements.

## 10. Practice Exercises

### Exercise 1: Paint Profiling
Use DevTools to profile paint operations in your animations.

### Exercise 2: Shadow Optimization
Convert a box-shadow animation to an opacity-based approach.

### Exercise 3: Layer Analysis
Use the Layers panel in DevTools to visualize compositing layers.

### Exercise 4: Color Transition
Build a smooth color transition without paint triggers.

### Exercise 5: Paint Area Reduction
Optimize a large animated element by reducing its paint area.

## 11. Advanced Topics

- **CSS Containment** — Using `contain: paint` for isolation
- **Off-Main-Thread Paint** — CSS Paint Worklets
- **Layer Compositing Strategies** — Advanced GPU utilization
- **Paint Worklets** — Custom painting with Houdini
- **Subpixel Rendering** — Anti-aliasing considerations
- **Display Lists** — How browsers batch paint operations
