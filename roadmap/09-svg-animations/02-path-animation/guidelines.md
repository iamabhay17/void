# Path Animation

## 1. Concept Overview

Path animation is the technique of animating SVG paths to create drawing effects, reveals, and morphs. The most common approach uses `pathLength`, `stroke-dasharray`, and `stroke-dashoffset` to simulate a path being drawn.

Framer Motion simplifies this with the `pathLength` motion value:

```tsx
<motion.path
  d="M0,0 L100,100"
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
/>
```

## 2. Why This Matters for Design Engineers

Path animation creates:
- Line drawing effects (signatures, illustrations)
- Progress indicators
- Loading animations
- Logo reveals
- Micro-interaction feedback

As a Design Engineer, you must:
- Understand how paths are structured
- Control animation timing and easing
- Handle complex multi-path animations
- Create performant path animations

## 3. Key Principles / Mental Models

### How Path Drawing Works
```
dasharray: [100, 100] (dash length, gap length)
dashoffset: 100 → Path appears empty
dashoffset: 0 → Path appears fully drawn

pathLength normalizes this to 0-1
```

### Path Structure
```
M - Move to (pen up, move)
L - Line to (pen down, draw)
C - Cubic bezier
Q - Quadratic bezier
A - Arc
Z - Close path
```

### Animation Direction
- **0 → 1**: Drawing forward
- **1 → 0**: Erasing / reverse draw
- **0.5 → 1**: Start midway

## 4. Implementation in React

### Basic Line Drawing

```tsx
import { motion } from 'framer-motion';

function DrawLine() {
  return (
    <motion.svg viewBox="0 0 100 100" className="w-48 h-48">
      <motion.path
        d="M10,50 L90,50"
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}
```

### Checkmark Animation

```tsx
function AnimatedCheck({ isChecked }: { isChecked: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      initial={false}
    >
      {/* Background circle */}
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: isChecked ? 1 : 0,
          opacity: isChecked ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Checkmark */}
      <motion.path
        d="M6 12l4 4 8-8"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isChecked ? 1 : 0 }}
        transition={{ duration: 0.3, delay: isChecked ? 0.2 : 0 }}
      />
    </motion.svg>
  );
}
```

### Multi-Path Drawing

```tsx
function DrawLogo() {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: i * 0.2, duration: 1, ease: 'easeInOut' },
        opacity: { delay: i * 0.2, duration: 0.01 },
      },
    }),
  };

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-48 h-48"
      initial="hidden"
      animate="visible"
    >
      <motion.path
        d="M10,50 L30,10"
        variants={pathVariants}
        custom={0}
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
      />
      <motion.path
        d="M30,10 L50,50"
        variants={pathVariants}
        custom={1}
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
      />
      <motion.path
        d="M50,50 L70,10"
        variants={pathVariants}
        custom={2}
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
      />
      <motion.path
        d="M70,10 L90,50"
        variants={pathVariants}
        custom={3}
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
      />
    </motion.svg>
  );
}
```

### Circular Progress

```tsx
function CircularProgress({ progress }: { progress: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.svg viewBox="0 0 100 100" className="w-24 h-24">
      {/* Background circle */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="8"
      />
      
      {/* Progress circle */}
      <motion.circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="8"
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: progress }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      
      {/* Percentage text */}
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-lg font-semibold fill-current"
      >
        {Math.round(progress * 100)}%
      </text>
    </motion.svg>
  );
}
```

## 5. React Patterns to Use

### Draw On Scroll

```tsx
function ScrollDrawPath() {
  const ref = useRef<SVGPathElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end center'],
  });

  return (
    <svg viewBox="0 0 100 400" className="w-full h-[200vh]">
      <motion.path
        ref={ref}
        d="M50,0 L50,400"
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
        style={{ pathLength: scrollYProgress }}
      />
    </svg>
  );
}
```

### Signature Animation

```tsx
function SignatureAnimation() {
  const controls = useAnimation();

  const handleDraw = async () => {
    await controls.start('visible');
  };

  const handleErase = async () => {
    await controls.start('hidden');
  };

  const pathVariants = {
    hidden: { pathLength: 0 },
    visible: { 
      pathLength: 1,
      transition: { duration: 2, ease: 'easeInOut' },
    },
  };

  return (
    <div>
      <motion.svg viewBox="0 0 200 100" className="w-full h-24">
        <motion.path
          d="M10,70 C30,20 70,20 90,50 C110,80 130,80 150,50 C170,20 190,20 195,30"
          stroke="#1f2937"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          variants={pathVariants}
          initial="hidden"
          animate={controls}
        />
      </motion.svg>
      <div className="flex gap-2">
        <button onClick={handleDraw}>Draw</button>
        <button onClick={handleErase}>Erase</button>
      </div>
    </div>
  );
}
```

### Path with Fill Reveal

```tsx
function FillReveal() {
  return (
    <motion.svg viewBox="0 0 100 100" className="w-48 h-48">
      {/* Stroke first */}
      <motion.path
        d="M50,10 L90,90 L10,90 Z"
        stroke="#3b82f6"
        strokeWidth="2"
        fill="transparent"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
      
      {/* Then fill */}
      <motion.path
        d="M50,10 L90,90 L10,90 Z"
        stroke="none"
        fill="#3b82f6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      />
    </motion.svg>
  );
}
```

### Interactive Path

```tsx
function InteractivePath() {
  const [isDrawn, setIsDrawn] = useState(false);
  const pathLength = useMotionValue(0);

  const handlePointerMove = (e: React.PointerEvent<SVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    pathLength.set(x);
  };

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-full h-32 cursor-crosshair"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => pathLength.set(isDrawn ? 1 : 0)}
      onClick={() => setIsDrawn(!isDrawn)}
    >
      <motion.path
        d="M10,50 Q30,10 50,50 Q70,90 90,50"
        stroke="#3b82f6"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        style={{ pathLength }}
      />
    </motion.svg>
  );
}
```

## 6. Important Techniques

### Path Direction Control

```tsx
// Forward draw
initial={{ pathLength: 0 }}
animate={{ pathLength: 1 }}

// Reverse draw (erase effect)
initial={{ pathLength: 1 }}
animate={{ pathLength: 0 }}

// Draw from middle
initial={{ pathLength: 0, pathOffset: 0.5 }}
animate={{ pathLength: 1 }}

// Draw and hold
animate={{ 
  pathLength: [0, 1, 1, 0],
  transition: { 
    times: [0, 0.4, 0.6, 1],
    duration: 2,
    repeat: Infinity,
  },
}}
```

### Multiple Paths Orchestration

```tsx
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const pathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1, ease: 'easeInOut' },
  },
};

function OrchestrtedPaths() {
  return (
    <motion.svg
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {paths.map((path, i) => (
        <motion.path
          key={i}
          d={path.d}
          variants={pathVariants}
          stroke="#3b82f6"
          strokeWidth="2"
          fill="none"
        />
      ))}
    </motion.svg>
  );
}
```

## 7. Animation Considerations

### Path Length Accuracy

```tsx
// pathLength attribute normalizes total length to 1
<motion.path
  d="..."
  pathLength={1} // Add this for accurate pathLength animation
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
/>
```

### Easing for Natural Feel

```tsx
// Different easings for different effects
transition={{ 
  duration: 2,
  // Signature-like
  ease: [0.16, 1, 0.3, 1],
  // Technical/precise
  ease: 'linear',
  // Dramatic reveal
  ease: [0.87, 0, 0.13, 1],
}}
```

### Stroke Properties

```tsx
<motion.path
  strokeLinecap="round"    // rounded ends
  strokeLinejoin="round"   // rounded corners
  strokeWidth="2"
  // Variable stroke width (not widely supported)
  // strokeWidth={useTransform(pathLength, [0, 1], [1, 3])}
/>
```

## 8. Performance Considerations

### GPU Acceleration

```tsx
// Paths animate with transform internally
// pathLength updates are efficient
<motion.path
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  // This is GPU-accelerated
/>
```

### Complex Path Simplification

```tsx
// Reduce path complexity for performance
// Before: Complex path from design tool
// After: Simplified using SVGO or manual editing

// For very complex paths, consider:
// 1. Breaking into multiple simpler paths
// 2. Using lower precision coordinates
// 3. Reducing number of curve control points
```

### Lazy Animation

```tsx
function LazyPathDraw() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <svg ref={ref}>
      <motion.path
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : {}}
        transition={{ duration: 2 }}
      />
    </svg>
  );
}
```

## 9. Common Mistakes

### 1. Missing fill="none"
**Problem:** Path appears filled, not drawn.
**Solution:** Add fill="none" for stroke animation.

### 2. Forgetting pathLength Attribute
**Problem:** Animation timing is off.
**Solution:** Add pathLength={1} to path element.

### 3. Wrong Stroke Properties
**Problem:** Jagged or incorrect line ends.
**Solution:** Use strokeLinecap="round".

### 4. Animation Too Fast
**Problem:** Drawing effect not visible.
**Solution:** Use longer duration (1-3 seconds).

### 5. Path Order Wrong
**Problem:** Multi-path animation looks random.
**Solution:** Organize paths in draw order.

## 10. Practice Exercises

### Exercise 1: Loading Spinner
Create a circular loading spinner with path animation.

### Exercise 2: Handwriting Effect
Animate text as if being handwritten.

### Exercise 3: Icon Reveal
Create an icon that draws itself on hover.

### Exercise 4: Progress Timeline
Build a vertical timeline that draws as you scroll.

### Exercise 5: Logo Animation
Take an existing logo and create a draw-on animation.

## 11. Advanced Topics

- **Animated Dashes** — Moving dash patterns
- **Path Offset** — Starting point control
- **Bezier Editing** — Interactive path control
- **Path Length Calculation** — getTotalLength()
- **Motion Along Path** — Objects following paths
- **Path Trimming** — Animating path segments
