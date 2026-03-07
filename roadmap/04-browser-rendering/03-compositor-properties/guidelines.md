# Compositor Properties

## 1. Concept Overview

Compositor properties are CSS properties that can be animated entirely on the GPU, without triggering layout or paint. They are the holy grail of animation performance.

The compositor handles:
- **Transform** — translate, scale, rotate, skew
- **Opacity** — transparency
- **Filter** — blur, brightness, contrast (often GPU-accelerated)

When you animate only compositor properties, the browser can:
- Run animations on a separate thread
- Use GPU hardware acceleration
- Achieve consistent 60fps
- Allow the main thread to do other work

## 2. Why This Matters for Design Engineers

Compositor animations are fundamentally different:
- They don't block JavaScript execution
- They can continue during garbage collection
- They utilize dedicated GPU hardware
- They're the only way to achieve truly smooth animations

As a Design Engineer, you must:
- Default to compositor properties for all animations
- Understand what promotes elements to GPU layers
- Know when composite-only isn't possible
- Optimize non-compositor animations as fallback

## 3. Key Principles / Mental Models

### The Compositor Thread
The compositor runs on a separate thread from JavaScript:
- Main thread: JS execution, layout, paint
- Compositor thread: layer composition, GPU operations

### Transform is Your Friend
Transform can replace many layout properties:
- `left/right` → `translateX()`
- `top/bottom` → `translateY()`
- `width/height` → `scale()`

### Layer Promotion
Elements are promoted to their own compositor layer when they have:
- `transform` or `opacity` animation
- `will-change: transform` or `will-change: opacity`
- `transform: translateZ(0)` or `translate3d(0,0,0)`
- `backface-visibility: hidden`

### The Trade-Off
GPU layers use video memory:
- More layers = more VRAM
- Mobile devices have limited VRAM
- Balance performance vs. memory

## 4. Implementation in React

### Basic Compositor Animation

```tsx
import { motion } from 'framer-motion';

// All of these animate on the compositor
function CompositorAnimations() {
  return (
    <>
      {/* Transform: translate */}
      <motion.div animate={{ x: 100, y: 50 }} />
      
      {/* Transform: scale */}
      <motion.div animate={{ scale: 1.5 }} />
      
      {/* Transform: rotate */}
      <motion.div animate={{ rotate: 45 }} />
      
      {/* Opacity */}
      <motion.div animate={{ opacity: 0.5 }} />
      
      {/* Combined */}
      <motion.div
        animate={{ 
          x: 100, 
          scale: 1.2, 
          rotate: 10, 
          opacity: 0.8 
        }}
      />
    </>
  );
}
```

### Replacing Layout Properties with Transform

```tsx
// ❌ Layout-triggering animation
function BadSlideIn() {
  return (
    <motion.div
      style={{ position: 'absolute' }}
      animate={{ left: 0 }} // Triggers layout!
      initial={{ left: -300 }}
    />
  );
}

// ✅ Compositor animation
function GoodSlideIn() {
  return (
    <motion.div
      style={{ position: 'absolute', left: 0 }}
      animate={{ x: 0 }}
      initial={{ x: -300 }}
    />
  );
}

// ❌ Layout-triggering size animation
function BadExpand() {
  return (
    <motion.div
      animate={{ width: 400 }} // Triggers layout!
      initial={{ width: 200 }}
    />
  );
}

// ✅ Compositor animation (with caveats)
function GoodExpand() {
  return (
    <motion.div
      style={{ width: 200, transformOrigin: 'left' }}
      animate={{ scaleX: 2 }}
      initial={{ scaleX: 1 }}
    />
  );
}
```

### GPU-Accelerated Filters

```tsx
// Filters can be compositor-accelerated
function FilterAnimation() {
  const [isBlurred, setIsBlurred] = useState(false);
  
  return (
    <motion.div
      animate={{ 
        filter: isBlurred 
          ? 'blur(10px) brightness(0.8)' 
          : 'blur(0px) brightness(1)'
      }}
      transition={{ duration: 0.3 }}
      onClick={() => setIsBlurred(!isBlurred)}
    >
      <img src="/image.jpg" alt="Blurrable" />
    </motion.div>
  );
}
```

### Layer Promotion Control

```tsx
function ControlledLayerPromotion() {
  const [isAnimating, setIsAnimating] = useState(false);
  
  return (
    <motion.div
      style={{
        // Only promote to layer during animation
        willChange: isAnimating ? 'transform' : 'auto',
      }}
      animate={{ x: isAnimating ? 100 : 0 }}
      onAnimationStart={() => setIsAnimating(true)}
      onAnimationComplete={() => setIsAnimating(false)}
    >
      Content
    </motion.div>
  );
}
```

## 5. React Patterns to Use

### Compositor-Only Motion Component

```tsx
type CompositorProps = {
  x?: number;
  y?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: number;
  opacity?: number;
};

function CompositorMotion({
  animate,
  transition,
  children,
  ...rest
}: {
  animate: CompositorProps;
  transition?: object;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      animate={animate}
      transition={transition}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// TypeScript ensures only compositor properties
<CompositorMotion animate={{ x: 100, opacity: 0.5 }}>
  Content
</CompositorMotion>
```

### Prefixed 3D Transform for Safari

```tsx
// Safari sometimes needs 3D transforms for GPU acceleration
function SafariOptimized({ children, animate }) {
  return (
    <motion.div
      style={{
        // Force GPU layer in Safari
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
      animate={animate}
    >
      {children}
    </motion.div>
  );
}
```

### Hardware-Accelerated Scroll

```tsx
function SmoothScroller({ children }) {
  const { scrollY } = useScroll();
  const y = useSpring(scrollY, { stiffness: 100, damping: 30 });
  
  return (
    <motion.div
      style={{
        // GPU-accelerated transform
        y: useTransform(y, v => -v),
        // Prevent layer promotion issues
        willChange: 'transform',
      }}
    >
      {children}
    </motion.div>
  );
}
```

## 6. Important Hooks

### useMotionValue for Compositor Animation

```tsx
import { useMotionValue, useTransform, motion } from 'framer-motion';

function CompositorDrag() {
  // Motion values update on compositor thread
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Derived values also update on compositor
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const scale = useTransform(x, [-200, 0, 200], [0.8, 1, 0.8]);
  
  return (
    <motion.div
      drag
      style={{ x, y, rotate, scale }}
      dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
      className="w-32 h-32 bg-blue-500 rounded-lg cursor-grab"
    />
  );
}
```

### useSpring for Smooth Compositor Animation

```tsx
import { useSpring, useMotionValue } from 'framer-motion';

function SpringCompositor() {
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 25 });
  
  return (
    <div
      onMouseMove={(e) => {
        // Update motion value directly (no React re-render)
        x.set(e.clientX - window.innerWidth / 2);
      }}
    >
      <motion.div
        style={{ x: springX }}
        className="w-20 h-20 bg-purple-500 rounded-full"
      />
    </div>
  );
}
```

### useAnimation for Controlled Compositor

```tsx
import { useAnimation, motion } from 'framer-motion';

function ControlledCompositor() {
  const controls = useAnimation();
  
  const handleClick = async () => {
    // All these run on compositor
    await controls.start({ x: 100, transition: { duration: 0.3 } });
    await controls.start({ rotate: 180, transition: { duration: 0.3 } });
    await controls.start({ scale: 1.5, opacity: 0.5, transition: { duration: 0.3 } });
  };
  
  return (
    <motion.div
      animate={controls}
      onClick={handleClick}
      className="w-20 h-20 bg-green-500 rounded cursor-pointer"
    />
  );
}
```

## 7. Animation Considerations

### When Compositor Isn't Enough

```tsx
// Sometimes you need layout animation
// Framer Motion's layout prop helps

function LayoutRequired() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      layout // Uses FLIP - reads layout, animates with transform
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        width: isExpanded ? 400 : 200,
        height: isExpanded ? 200 : 100,
      }}
    >
      {/* Text reflow needs layout animation */}
      <motion.p layout="position">
        This text reflows when container changes
      </motion.p>
    </motion.div>
  );
}
```

### Stacking Compositor Transforms

```tsx
// Multiple transforms combine efficiently
function ComplexTransform() {
  return (
    <motion.div
      animate={{
        x: 100,
        y: 50,
        scale: 1.2,
        rotate: 15,
        // All combine into single transform matrix
        // GPU handles in one operation
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    />
  );
}
```

### 3D Transforms

```tsx
// 3D transforms are also compositor properties
function Card3D() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  
  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className="w-64 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl"
    >
      <motion.div style={{ translateZ: 50 }}>
        Floating content
      </motion.div>
    </motion.div>
  );
}
```

## 8. Performance Considerations

### Checking Compositor Status in DevTools

```
1. Open DevTools → More Tools → Layers
2. Select an animated element
3. Check "Compositing Reasons"
4. Look for "Has active transform animation"
```

### Memory Management

```tsx
// ❌ Too many layers
function TooManyLayers() {
  return (
    <>
      {thousandItems.map(item => (
        <motion.div
          key={item.id}
          style={{ willChange: 'transform' }} // Each gets GPU layer!
        >
          {item.content}
        </motion.div>
      ))}
    </>
  );
}

// ✅ Promote container only
function EfficientLayers() {
  return (
    <motion.div style={{ willChange: 'transform' }}>
      {thousandItems.map(item => (
        <div key={item.id}>{item.content}</div>
      ))}
    </motion.div>
  );
}
```

### will-change Best Practices

```tsx
// ❌ Always-on will-change
<div style={{ willChange: 'transform' }}>
  {/* Permanently uses GPU memory */}
</div>

// ✅ Dynamic will-change
function OptimizedElement() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      style={{ willChange: isHovered ? 'transform' : 'auto' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.1 }}
    />
  );
}
```

## 9. Common Mistakes

### 1. Not Using Transform
**Problem:** Using `left/top` instead of `x/y`.
**Solution:** Always use transform properties for position.

### 2. Permanent will-change
**Problem:** `will-change: transform` on all elements.
**Solution:** Apply dynamically only during animation.

### 3. Ignoring Filter Costs
**Problem:** Complex filters aren't always compositor-accelerated.
**Solution:** Test on target devices, simplify filters if needed.

### 4. Over-Layering
**Problem:** Hundreds of compositor layers.
**Solution:** Use layers strategically, promote containers not items.

### 5. Missing transform-origin
**Problem:** Scale animations pivot from wrong point.
**Solution:** Set `transformOrigin` to control pivot point.

## 10. Practice Exercises

### Exercise 1: Compositor Audit
Use DevTools Layers panel to verify your animations use compositor.

### Exercise 2: Transform Migration
Convert a position-based animation to transform-based.

### Exercise 3: 3D Card
Build a 3D card flip using only compositor properties.

### Exercise 4: Performance Comparison
Compare FPS of layout vs compositor animation in DevTools.

### Exercise 5: Layer Optimization
Reduce layer count in a complex animated UI while maintaining smoothness.

## 11. Advanced Topics

- **Off-Main-Thread Animation** — CSS animations vs JS
- **requestAnimationFrame** — Syncing with compositor
- **Main Thread Blocking** — How JS affects compositor
- **GPU Texture Memory** — Understanding VRAM limits
- **Transform Matrices** — Understanding combined transforms
- **Paint Worklets** — Custom compositor operations
