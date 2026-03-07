# Line Drawing Effects

## 1. Concept Overview

Line drawing effects create the illusion of paths being drawn in real-time, like watching someone sketch. This technique uses `stroke-dasharray` and `stroke-dashoffset` (or Framer Motion's `pathLength`) to progressively reveal strokes.

The core principle:
1. Set dash array to path length (one dash covers entire path)
2. Offset dash by full length (path hidden)
3. Animate offset to 0 (path revealed)

```tsx
<motion.path
  initial={{ pathLength: 0, opacity: 0 }}
  animate={{ pathLength: 1, opacity: 1 }}
  transition={{ duration: 2 }}
/>
```

## 2. Why This Matters for Design Engineers

Line drawing effects create:
- Logo reveals
- Signature animations
- Loading indicators
- Tutorial highlighting
- Illustration storytelling

As a Design Engineer, you must:
- Create smooth, natural drawing animations
- Handle multi-path sequencing
- Control drawing direction and speed
- Combine with fill and other effects

## 3. Key Principles / Mental Models

### The Dash Trick
```
stroke-dasharray: 100   → | dash 100 | gap 100 | dash 100 |...
stroke-dashoffset: 100  → Offset pushes dash out of view
stroke-dashoffset: 0    → Dash slides into view = "drawing"
```

### pathLength Normalization
```tsx
// Without pathLength, must calculate actual path length
const length = pathRef.current.getTotalLength();

// With pathLength={1}, always animates 0 → 1
<path pathLength={1} />
```

### Drawing Direction
```
Standard: draws from path start to end
Reverse: initial={{ pathLength: 1 }} animate={{ pathLength: 0 }}
Middle-out: combine two paths or use clip
```

## 4. Implementation in React

### Basic Line Draw

```tsx
function DrawLine() {
  return (
    <motion.svg viewBox="0 0 200 100" className="w-full h-24">
      <motion.path
        d="M10,50 Q50,10 100,50 T190,50"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}
```

### Sequential Multi-Path Drawing

```tsx
function SequentialDraw() {
  const paths = [
    'M10,10 L50,10',
    'M50,10 L50,50',
    'M50,50 L90,50',
    'M90,50 L90,90',
  ];

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          delay: i * 0.5,
          duration: 0.5,
          ease: 'easeInOut',
        },
        opacity: { delay: i * 0.5, duration: 0.01 },
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
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          variants={pathVariants}
          custom={i}
        />
      ))}
    </motion.svg>
  );
}
```

### Handwriting Effect

```tsx
function HandwritingEffect({ text }: { text: string }) {
  // In practice, convert text to path using a tool or font
  const textPath = `
    M20,60 C25,30 35,30 40,50 C45,70 55,70 60,50
    M70,30 L70,70
    M90,40 C80,40 80,60 90,60 C100,60 100,40 90,40
  `;

  return (
    <motion.svg viewBox="0 0 200 100" className="w-full h-24">
      <motion.path
        d={textPath}
        fill="none"
        stroke="#1f2937"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, ease: [0.4, 0, 0.2, 1] }}
      />
    </motion.svg>
  );
}
```

### Draw with Trailing Dot

```tsx
function DrawWithDot() {
  const pathLength = useMotionValue(0);
  const dotX = useTransform(pathLength, [0, 1], [10, 190]);
  const dotY = useTransform(pathLength, [0, 0.5, 1], [50, 10, 50]);

  useEffect(() => {
    const controls = animate(pathLength, 1, {
      duration: 2,
      ease: 'easeInOut',
    });
    return controls.stop;
  }, [pathLength]);

  return (
    <motion.svg viewBox="0 0 200 100" className="w-full h-24">
      {/* The line */}
      <motion.path
        d="M10,50 Q100,10 190,50"
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <motion.path
        d="M10,50 Q100,10 190,50"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ pathLength }}
      />
      
      {/* Trailing dot */}
      <motion.circle
        r="6"
        fill="#3b82f6"
        style={{ cx: dotX, cy: dotY }}
      />
    </motion.svg>
  );
}
```

## 5. React Patterns to Use

### Scroll-Triggered Drawing

```tsx
function ScrollDraw() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.3'],
  });

  return (
    <div ref={ref} className="h-[50vh]">
      <svg viewBox="0 0 100 100" className="w-full h-full sticky top-0">
        <motion.path
          d="M10,90 L50,10 L90,90"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: scrollYProgress }}
        />
      </svg>
    </div>
  );
}
```

### Draw on Hover

```tsx
function DrawOnHover() {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-24 h-24 cursor-pointer"
      initial="hidden"
      whileHover="visible"
    >
      <motion.path
        d="M20,50 L40,30 L60,50 L80,30"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0 },
          visible: { 
            pathLength: 1,
            transition: { duration: 0.5, ease: 'easeOut' },
          },
        }}
      />
    </motion.svg>
  );
}
```

### Draw and Fill

```tsx
function DrawAndFill() {
  const [isDrawn, setIsDrawn] = useState(false);

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-48 h-48"
      initial="hidden"
      animate="visible"
    >
      {/* Draw stroke */}
      <motion.path
        d="M50,10 L90,90 L10,90 Z"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        onAnimationComplete={() => setIsDrawn(true)}
      />
      
      {/* Fill after draw completes */}
      <motion.path
        d="M50,10 L90,90 L10,90 Z"
        fill="#3b82f6"
        stroke="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isDrawn ? 0.2 : 0 }}
        transition={{ duration: 0.5 }}
      />
    </motion.svg>
  );
}
```

### Erase Effect

```tsx
function DrawAndErase() {
  const [phase, setPhase] = useState<'draw' | 'hold' | 'erase'>('draw');
  const controls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      await controls.start({ pathLength: 1, transition: { duration: 1 } });
      setPhase('hold');
      await new Promise(r => setTimeout(r, 500));
      setPhase('erase');
      await controls.start({ pathLength: 0, transition: { duration: 0.5 } });
      setPhase('draw');
      sequence();
    };
    sequence();
  }, [controls]);

  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24">
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={controls}
      />
    </svg>
  );
}
```

## 6. Important Techniques

### Drawing Speed Variation

```tsx
function VariableSpeedDraw() {
  return (
    <motion.svg viewBox="0 0 200 100">
      <motion.path
        d="M10,50 L50,10 L90,50 L130,10 L170,50 L190,30"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 2,
          // Slow start, fast middle, slow end
          ease: [0.7, 0, 0.3, 1],
        }}
      />
    </motion.svg>
  );
}
```

### Partial Draw

```tsx
function PartialDraw({ progress }: { progress: number }) {
  return (
    <svg viewBox="0 0 100 100">
      <motion.path
        d="M50,10 A40,40 0 1 1 49.99,10"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{ pathLength: progress }}
        transition={{ duration: 0.3 }}
      />
    </svg>
  );
}
```

### Simultaneous Multi-Path

```tsx
function SimultaneousDraw() {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      initial="hidden"
      animate="visible"
    >
      {/* All paths draw at once */}
      {[
        'M10,30 L90,30',
        'M10,50 L90,50',
        'M10,70 L90,70',
      ].map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0 },
            visible: { pathLength: 1 },
          }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      ))}
    </motion.svg>
  );
}
```

## 7. Animation Considerations

### Natural Drawing Feel

```tsx
// Signature-like feel
transition={{
  duration: 2,
  ease: [0.4, 0, 0.2, 1],
}}

// Mechanical/technical feel
transition={{
  duration: 1,
  ease: 'linear',
}}

// Expressive/artistic feel
transition={{
  duration: 3,
  ease: [0.16, 1, 0.3, 1],
}}
```

### Stroke Properties for Better Drawing

```tsx
<motion.path
  strokeLinecap="round"    // Rounded ends
  strokeLinejoin="round"   // Rounded corners
  strokeWidth="2"
  // Slight variation makes it feel more organic
/>
```

### Pen Pressure Simulation

```tsx
function PressureSimulation() {
  const pathLength = useMotionValue(0);
  const strokeWidth = useTransform(pathLength, [0, 0.5, 1], [1, 3, 1]);

  useEffect(() => {
    animate(pathLength, 1, { duration: 2 });
  }, [pathLength]);

  return (
    <svg viewBox="0 0 200 100">
      <motion.path
        d="M10,50 Q100,10 190,50"
        fill="none"
        stroke="#1f2937"
        style={{ pathLength, strokeWidth }}
        strokeLinecap="round"
      />
    </svg>
  );
}
```

## 8. Performance Considerations

### GPU Acceleration

```tsx
// pathLength animations use stroke-dashoffset
// which is GPU-accelerated
<motion.path
  style={{ pathLength }}
  // No will-change needed, handled automatically
/>
```

### Reduce Path Complexity

```tsx
// Simpler paths animate more smoothly
// Use path simplification tools (SVGO, etc.)

// Complex (slow)
const complex = 'M10.123456,20.789012 C30.456789...'; // 500 points

// Simplified (fast)
const simple = 'M10,20 C30,40...'; // 50 points
```

### Avoid Concurrent Heavy Animations

```tsx
// ❌ Too many simultaneous path animations
{hundredPaths.map(path => (
  <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
))}

// ✅ Stagger and limit
{paths.slice(0, 10).map((path, i) => (
  <motion.path
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ delay: i * 0.1 }}
  />
))}
```

## 9. Common Mistakes

### 1. Forgetting fill="none"
**Problem:** Path appears filled, hiding stroke animation.
**Solution:** Always set fill="none" for stroke animations.

### 2. Missing strokeLinecap
**Problem:** Line ends look cut off or squared.
**Solution:** Add strokeLinecap="round".

### 3. Path Starts Mid-Shape
**Problem:** Drawing starts from unexpected point.
**Solution:** Restructure path to start where desired.

### 4. Animation Too Fast
**Problem:** Drawing effect not noticeable.
**Solution:** Use 1-3 second duration for visibility.

### 5. Not Adding pathLength
**Problem:** Inconsistent animation speeds.
**Solution:** Add pathLength={1} to path element.

## 10. Practice Exercises

### Exercise 1: Loading Spinner
Create a circular loading indicator that draws and erases.

### Exercise 2: Logo Reveal
Animate a logo drawing in sequence.

### Exercise 3: Interactive Signature
Build a signature that draws when clicked.

### Exercise 4: Scroll Timeline
Create a vertical timeline that draws as you scroll.

### Exercise 5: Animated Illustration
Make an illustration that draws itself on page load.

## 11. Advanced Topics

- **SVG Filters + Drawing** — Glow effects during draw
- **Variable Stroke Width** — Calligraphy effects
- **Path Along Path** — Objects following draw line
- **Reverse Drawing** — Erase effects
- **Stroke Animation Combinations** — Dash + draw + color
- **Canvas Fallback** — For complex animations
