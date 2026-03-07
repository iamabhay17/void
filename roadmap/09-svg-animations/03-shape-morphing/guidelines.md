# Shape Morphing

## 1. Concept Overview

Shape morphing is the animation technique of smoothly transitioning one SVG shape into another. This involves interpolating between path data (the `d` attribute) or between different shape primitives.

Key approaches:
- **Compatible paths** — Morph between paths with same command count
- **Flubber/interpolation libraries** — Handle incompatible paths
- **CSS/Framer Motion** — Direct d attribute animation
- **Shape decomposition** — Break complex shapes into simpler ones

```tsx
<motion.path
  initial={{ d: 'M10,50 L50,10 L90,50 L50,90 Z' }}
  animate={{ d: 'M50,10 L90,50 L50,90 L10,50 Z' }}
/>
```

## 2. Why This Matters for Design Engineers

Shape morphing creates:
- State change visualizations
- Icon transformations
- Playful micro-interactions
- Data visualization transitions
- Loading states

As a Design Engineer, you must:
- Understand path compatibility requirements
- Choose appropriate morphing approaches
- Handle complex shape transitions
- Create smooth, natural-looking morphs

## 3. Key Principles / Mental Models

### Path Compatibility
```
For smooth morphing, paths need:
1. Same number of path commands
2. Same types of commands (M, L, C, etc.)
3. Same command order

Compatible:
"M0,0 L50,0 L50,50 L0,50 Z"  →  "M25,0 L75,0 L50,50 L0,50 Z"

Incompatible:
"M0,0 L50,0 L50,50 Z"  →  "M25,25 A25,25 0 1 1 25,24.9 Z"
```

### Command Interpolation
```
Start: M 0,0 L 100,0 L 100,100
End:   M 50,0 L 100,50 L 50,100

Interpolated (50%):
       M 25,0 L 100,25 L 75,100
```

### Shape-to-Shape vs Path-to-Path
```tsx
// Shape-to-shape (primitives)
<motion.rect /> → <motion.circle /> // Needs manual handling

// Path-to-path (recommended)
<motion.path d={squarePath} /> → <motion.path d={circlePath} />
```

## 4. Implementation in React

### Basic Compatible Path Morph

```tsx
import { motion } from 'framer-motion';

function ShapeMorph() {
  const [isSquare, setIsSquare] = useState(true);

  // Both paths have 4 points + close
  const squarePath = 'M10,10 L90,10 L90,90 L10,90 Z';
  const diamondPath = 'M50,10 L90,50 L50,90 L10,50 Z';

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-48 h-48 cursor-pointer"
      onClick={() => setIsSquare(!isSquare)}
    >
      <motion.path
        d={isSquare ? squarePath : diamondPath}
        fill="#3b82f6"
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}
```

### Icon State Morph

```tsx
function PlayPauseMorph({ isPlaying }: { isPlaying: boolean }) {
  // Play icon: triangle (3 points + extra for compatibility)
  const playPath = 'M8,5 L8,19 L19,12 L19,12 Z';
  
  // Pause icon: two rectangles as single path
  const pausePath = 'M6,5 L6,19 L10,19 L10,5 Z M14,5 L14,19 L18,19 L18,5 Z';
  
  // Alternative: matched point count
  const playPathMatched = 'M8,5 L8,12 L8,19 L19,12 Z';
  const pausePathMatched = 'M6,5 L10,5 L10,19 L6,19 Z';

  return (
    <motion.svg viewBox="0 0 24 24" className="w-12 h-12">
      <motion.path
        d={isPlaying ? pausePathMatched : playPathMatched}
        fill="currentColor"
        transition={{ duration: 0.3 }}
      />
    </motion.svg>
  );
}
```

### Menu/Close Icon Morph

```tsx
function HamburgerMorph({ isOpen }: { isOpen: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="w-6 h-6 cursor-pointer"
      initial={false}
    >
      {/* Top line → diagonal */}
      <motion.line
        x1="4"
        x2="20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{
          y1: isOpen ? 12 : 6,
          y2: isOpen ? 12 : 6,
          rotate: isOpen ? 45 : 0,
        }}
        style={{ transformOrigin: 'center' }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Middle line → fade out */}
      <motion.line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ opacity: isOpen ? 0 : 1, scaleX: isOpen ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Bottom line → diagonal */}
      <motion.line
        x1="4"
        x2="20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{
          y1: isOpen ? 12 : 18,
          y2: isOpen ? 12 : 18,
          rotate: isOpen ? -45 : 0,
        }}
        style={{ transformOrigin: 'center' }}
        transition={{ duration: 0.3 }}
      />
    </motion.svg>
  );
}
```

### Complex Shape with Interpolation Library

```tsx
import { interpolate } from 'flubber';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

function FlubberMorph() {
  const [shapeIndex, setShapeIndex] = useState(0);
  const progress = useMotionValue(0);

  const shapes = [
    'M50,10 L90,90 L10,90 Z', // Triangle
    'M50,10 A40,40 0 1 1 50,9.99 Z', // Circle (approximated)
    'M10,10 L90,10 L90,90 L10,90 Z', // Square
  ];

  const interpolators = shapes.map((shape, i) => {
    const nextShape = shapes[(i + 1) % shapes.length];
    return interpolate(shape, nextShape, { maxSegmentLength: 2 });
  });

  const path = useTransform(progress, (p) => {
    const flooredP = Math.floor(p);
    const interpolator = interpolators[flooredP % shapes.length];
    return interpolator(p - flooredP);
  });

  useEffect(() => {
    const controls = animate(progress, shapeIndex + 1, {
      duration: 0.8,
      ease: 'easeInOut',
    });
    return controls.stop;
  }, [shapeIndex, progress]);

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-48 h-48 cursor-pointer"
      onClick={() => setShapeIndex((i) => (i + 1) % shapes.length)}
    >
      <motion.path d={path} fill="#3b82f6" />
    </motion.svg>
  );
}
```

## 5. React Patterns to Use

### Variants for Morphing States

```tsx
const iconVariants = {
  search: {
    d: 'M15,15 L20,20 M10,10 A5,5 0 1 1 10,9.99',
  },
  close: {
    d: 'M5,5 L19,19 M19,5 L5,19',
  },
};

function SearchToClose({ mode }: { mode: 'search' | 'close' }) {
  return (
    <motion.svg viewBox="0 0 24 24">
      <motion.path
        variants={iconVariants}
        animate={mode}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        transition={{ duration: 0.3 }}
      />
    </motion.svg>
  );
}
```

### Conditional Path Selection

```tsx
function AdaptiveMorph({ state }: { state: 'idle' | 'loading' | 'success' | 'error' }) {
  const paths = {
    idle: 'M12,12 m-8,0 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0',
    loading: 'M12,4 a8,8 0 0,1 8,8',
    success: 'M5,12 L10,17 L19,8',
    error: 'M6,6 L18,18 M18,6 L6,18',
  };

  return (
    <motion.svg viewBox="0 0 24 24" className="w-8 h-8">
      <motion.path
        d={paths[state]}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ d: paths[state] }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}
```

### Layered Morphing

```tsx
function LayeredMorph({ isActive }: { isActive: boolean }) {
  return (
    <motion.svg viewBox="0 0 100 100" className="w-24 h-24">
      {/* Background shape */}
      <motion.path
        animate={{
          d: isActive
            ? 'M50,5 L95,50 L50,95 L5,50 Z'
            : 'M10,10 L90,10 L90,90 L10,90 Z',
        }}
        fill="#e5e7eb"
        transition={{ duration: 0.4 }}
      />
      
      {/* Foreground shape */}
      <motion.path
        animate={{
          d: isActive
            ? 'M50,20 L80,50 L50,80 L20,50 Z'
            : 'M25,25 L75,25 L75,75 L25,75 Z',
        }}
        fill="#3b82f6"
        transition={{ duration: 0.4, delay: 0.1 }}
      />
      
      {/* Icon shape */}
      <motion.path
        animate={{
          d: isActive
            ? 'M40,50 L50,40 L60,50 L50,60 Z'
            : 'M40,40 L60,40 L60,60 L40,60 Z',
        }}
        fill="white"
        transition={{ duration: 0.4, delay: 0.2 }}
      />
    </motion.svg>
  );
}
```

## 6. Important Techniques

### Creating Compatible Paths

```tsx
// Tool: Convert shapes to paths with same point count

// Circle as 4-point bezier (approximation)
const circlePath = `
  M 50,10
  C 72,10 90,28 90,50
  C 90,72 72,90 50,90
  C 28,90 10,72 10,50
  C 10,28 28,10 50,10
  Z
`;

// Square with matching bezier commands
const squarePath = `
  M 10,10
  C 10,10 90,10 90,10
  C 90,10 90,90 90,90
  C 90,90 10,90 10,90
  C 10,90 10,10 10,10
  Z
`;
```

### Point Interpolation Manual

```tsx
function usePathInterpolation(pathA: string, pathB: string, progress: number) {
  const parsePoints = (path: string) => {
    // Simplified: extract numeric pairs
    const nums = path.match(/-?\d+\.?\d*/g)?.map(Number) || [];
    const points = [];
    for (let i = 0; i < nums.length; i += 2) {
      points.push({ x: nums[i], y: nums[i + 1] });
    }
    return points;
  };

  const pointsA = parsePoints(pathA);
  const pointsB = parsePoints(pathB);

  if (pointsA.length !== pointsB.length) {
    console.warn('Paths have different point counts');
    return progress < 0.5 ? pathA : pathB;
  }

  const interpolated = pointsA.map((pA, i) => ({
    x: pA.x + (pointsB[i].x - pA.x) * progress,
    y: pA.y + (pointsB[i].y - pA.y) * progress,
  }));

  return `M${interpolated.map(p => `${p.x},${p.y}`).join(' L')} Z`;
}
```

### Morph with Reveal Effect

```tsx
function MorphWithReveal({ shape }: { shape: 'a' | 'b' }) {
  return (
    <motion.svg viewBox="0 0 100 100">
      {/* Old shape fading out */}
      <motion.path
        d={shape === 'a' ? shapeA : shapeB}
        fill="#3b82f6"
        animate={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        key={shape}
      />
      
      {/* New shape morphing in */}
      <motion.path
        d={shape === 'a' ? shapeA : shapeB}
        fill="#3b82f6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        key={`new-${shape}`}
      />
    </motion.svg>
  );
}
```

## 7. Animation Considerations

### Easing for Natural Motion

```tsx
// Morphing benefits from custom easing
transition={{
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1], // Material ease
  // ease: [0.87, 0, 0.13, 1], // Dramatic
  // ease: 'anticipate', // Slight overshoot
}}
```

### Duration Guidelines
- Simple morphs: 0.2-0.4s
- Complex morphs: 0.4-0.8s
- Dramatic reveals: 0.6-1.0s

### Staging Multiple Elements

```tsx
function StagedMorph({ isActive }: { isActive: boolean }) {
  return (
    <motion.svg
      initial="inactive"
      animate={isActive ? 'active' : 'inactive'}
    >
      {shapes.map((shape, i) => (
        <motion.path
          key={i}
          variants={{
            inactive: { d: shape.from },
            active: {
              d: shape.to,
              transition: { delay: i * 0.1, duration: 0.4 },
            },
          }}
        />
      ))}
    </motion.svg>
  );
}
```

## 8. Performance Considerations

### Reduce Path Complexity

```tsx
// Simpler paths morph more smoothly
// Use SVGO to optimize paths before morphing

// Too complex
const complex = 'M10.123,20.456 C30.789,40.012...'; // 100+ points

// Simplified
const simple = 'M10,20 C30,40...'; // 10-20 points
```

### Cache Path Calculations

```tsx
const MorphIcon = memo(function MorphIcon({ state }: { state: string }) {
  const path = useMemo(() => paths[state], [state]);
  
  return (
    <motion.svg>
      <motion.path animate={{ d: path }} />
    </motion.svg>
  );
});
```

## 9. Common Mistakes

### 1. Incompatible Paths
**Problem:** Paths have different command counts.
**Solution:** Use flubber or redesign paths to match.

### 2. Jerky Transitions
**Problem:** Points jump unexpectedly.
**Solution:** Ensure points correspond logically between shapes.

### 3. Too Fast
**Problem:** Morph is hard to follow.
**Solution:** Use 0.4-0.6s for complex morphs.

### 4. Ignoring Transform Origin
**Problem:** Shape morphs from corner.
**Solution:** Center the shape or set transformOrigin.

### 5. Path Precision Issues
**Problem:** Small gaps or overlaps.
**Solution:** Use consistent coordinate precision.

## 10. Practice Exercises

### Exercise 1: Hamburger to X
Create a smooth hamburger menu to X icon morph.

### Exercise 2: Shape Carousel
Build a rotating carousel of morphing shapes.

### Exercise 3: Data Visualization
Morph between different chart types (bar to pie).

### Exercise 4: Logo Animation
Create a logo that morphs through multiple states.

### Exercise 5: Interactive Morph
Build a morph that responds to cursor position.

## 11. Advanced Topics

- **Flubber Library** — Handling incompatible paths
- **Path Normalization** — Making any paths compatible
- **3D Morphing** — Combining morph with perspective
- **Physics-based Morphing** — Spring dynamics in morphs
- **Morph + Fill Animation** — Combining effects
- **SVG Filters + Morph** — Adding blur/glow during morph
