# Gesture Animations

## 1. Concept Overview

Gesture animations respond to user input—hover, tap, drag, focus—creating interactive, responsive interfaces. They provide immediate feedback that makes interfaces feel alive and responsive to touch.

Key gesture types:
- **Hover** — Mouse enters/leaves element
- **Tap/Press** — Click or touch
- **Drag** — Click and move
- **Pan** — Continuous position tracking
- **Focus** — Keyboard focus state

Framer Motion provides declarative gesture props that handle the complexity of tracking gestures across devices.

## 2. Why This Matters for Design Engineers

Gesture animations create tactile experiences:
- Buttons feel "pressable"
- Cards feel "liftable"
- Sliders feel "draggable"
- Navigation feels "touchable"

As a Design Engineer, you must:
- Design consistent gesture feedback
- Handle touch vs. mouse differences
- Ensure gestures work with keyboard
- Balance responsiveness with restraint

## 3. Key Principles / Mental Models

### The Feedback Loop
1. **Recognition** — User perceives affordance
2. **Initiation** — User begins gesture
3. **Feedback** — Element responds visually
4. **Completion** — Action confirmed or cancelled

### Gesture Intensity
Scale the response to the gesture intensity:
- Hover: Subtle (slight lift, glow)
- Press: Medium (depression, shadow change)
- Drag: Significant (follows finger, shows destination)

### Physical Metaphors
```tsx
// Button "presses" down
whileTap={{ scale: 0.97, y: 2 }}

// Card "lifts" up
whileHover={{ y: -4, boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}

// Draggable item follows touch with "weight"
drag
dragElastic={0.1}
```

## 4. Implementation in React

### Basic Gesture Props

```tsx
import { motion } from 'framer-motion';

function InteractiveButton({ children, onClick }: ButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg"
    >
      {children}
    </motion.button>
  );
}
```

### Card with Hover Effects

```tsx
function HoverCard({ title, description }: CardProps) {
  return (
    <motion.div
      whileHover={{ 
        y: -8,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="p-6 bg-white rounded-xl shadow-lg cursor-pointer"
    >
      <motion.h3
        initial={{ color: '#1f2937' }}
        whileHover={{ color: '#3b82f6' }}
      >
        {title}
      </motion.h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}
```

### Drag Gesture

```tsx
function DraggableCard() {
  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
      dragElastic={0.1}
      whileDrag={{ 
        scale: 1.05, 
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        cursor: 'grabbing',
      }}
      className="w-32 h-32 bg-blue-500 rounded-lg cursor-grab"
    />
  );
}
```

### Focus States

```tsx
function FocusableInput() {
  return (
    <motion.input
      whileFocus={{ 
        scale: 1.02,
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
      }}
      transition={{ duration: 0.2 }}
      className="px-4 py-2 border rounded-lg outline-none"
      placeholder="Focus me..."
    />
  );
}
```

## 5. React Patterns to Use

### Hover with Child Animation

```tsx
function CardWithHoverChild() {
  return (
    <motion.div
      className="p-6 bg-white rounded-xl overflow-hidden"
      whileHover="hover"
      initial="initial"
    >
      <h3>Card Title</h3>
      <p>Card content goes here</p>
      
      <motion.div
        variants={{
          initial: { opacity: 0, y: 10 },
          hover: { opacity: 1, y: 0 },
        }}
        className="mt-4"
      >
        <button className="text-blue-500">Learn More →</button>
      </motion.div>
    </motion.div>
  );
}
```

### Drag with Snap Points

```tsx
function DragWithSnap() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const snapPoints = [0, 100, 200, 300];

  const x = useMotionValue(0);
  const nearestSnap = useTransform(x, (latest) => {
    return snapPoints.reduce((prev, curr) =>
      Math.abs(curr - latest) < Math.abs(prev - latest) ? curr : prev
    );
  });

  return (
    <div ref={constraintsRef} className="w-full h-20 bg-gray-100 relative">
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          const closest = snapPoints.reduce((prev, curr) =>
            Math.abs(curr - info.point.x) < Math.abs(prev - info.point.x) 
              ? curr 
              : prev
          );
          animate(x, closest, { type: 'spring', stiffness: 500, damping: 30 });
        }}
        style={{ x }}
        className="w-16 h-16 bg-blue-500 rounded-lg cursor-grab"
      />
    </div>
  );
}
```

### Swipe to Delete

```tsx
function SwipeToDelete({ id, onDelete, children }: SwipeProps) {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0],
    ['rgb(239, 68, 68)', 'rgb(255, 255, 255)']
  );
  const opacity = useTransform(x, [-100, -50], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete(id);
    }
  };

  return (
    <motion.div style={{ background }} className="relative rounded-lg">
      {/* Delete indicator */}
      <motion.div 
        style={{ opacity }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
      >
        Delete
      </motion.div>
      
      {/* Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="bg-white rounded-lg"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
```

### Press and Hold

```tsx
function PressAndHold({ onLongPress }: { onLongPress: () => void }) {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();

  const handleStart = () => {
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 100));
    }, 20);
    
    timerRef.current = setTimeout(() => {
      onLongPress();
      clearInterval(intervalRef.current);
      setProgress(0);
    }, 1000);
  };

  const handleEnd = () => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
    setProgress(0);
  };

  return (
    <motion.button
      onTapStart={handleStart}
      onTap={handleEnd}
      onTapCancel={handleEnd}
      whileTap={{ scale: 0.95 }}
      className="relative w-20 h-20 rounded-full bg-blue-500 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-blue-700"
        style={{ scaleY: progress / 100, originY: 1 }}
      />
      <span className="relative z-10 text-white">Hold</span>
    </motion.button>
  );
}
```

## 6. Important Hooks

### useGesture with Framer Motion

```tsx
import { useMotionValue, useSpring, motion } from 'framer-motion';

function FollowCursor() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - 50);
    y.set(e.clientY - rect.top - 50);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative w-full h-64 bg-gray-100 overflow-hidden"
    >
      <motion.div
        style={{ x: springX, y: springY }}
        className="w-24 h-24 bg-blue-500 rounded-full"
      />
    </div>
  );
}
```

### useDragControls

```tsx
import { useDragControls, motion } from 'framer-motion';

function DragFromHandle() {
  const controls = useDragControls();

  return (
    <motion.div
      drag
      dragControls={controls}
      dragListener={false} // Only drag from handle
      className="p-4 bg-white rounded-lg shadow-lg"
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="w-full h-8 bg-gray-200 rounded cursor-grab mb-4"
      >
        ⋮⋮ Drag Handle
      </div>
      <p>This can only be dragged from the handle above.</p>
    </motion.div>
  );
}
```

### useHover Hook

```tsx
function useHover<T extends HTMLElement>(): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleEnter = () => setIsHovered(true);
    const handleLeave = () => setIsHovered(false);

    element.addEventListener('mouseenter', handleEnter);
    element.addEventListener('mouseleave', handleLeave);

    return () => {
      element.removeEventListener('mouseenter', handleEnter);
      element.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return [ref, isHovered];
}
```

## 7. Animation Considerations

### Gesture Priority

```tsx
// Hover takes priority over tap when both active
<motion.button
  whileHover={{ scale: 1.05, backgroundColor: '#3b82f6' }}
  whileTap={{ scale: 0.95 }}
  // Tap overrides hover scale, but hover color remains
>
  Click Me
</motion.button>
```

### Gesture Transitions

```tsx
const gestureTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 17,
};

function QuickFeedback() {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      // Fast, snappy feedback
      transition={gestureTransition}
    />
  );
}
```

### Multi-Stage Gestures

```tsx
function MultiStageGesture() {
  const [stage, setStage] = useState<'idle' | 'hover' | 'pressing'>('idle');

  return (
    <motion.div
      onHoverStart={() => setStage('hover')}
      onHoverEnd={() => setStage('idle')}
      onTapStart={() => setStage('pressing')}
      onTap={() => setStage('hover')}
      onTapCancel={() => setStage('hover')}
      animate={stage}
      variants={{
        idle: { scale: 1, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
        hover: { scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' },
        pressing: { scale: 0.98, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
      }}
    >
      Interactive
    </motion.div>
  );
}
```

## 8. Performance Considerations

### Use Transform Properties

```tsx
// ✅ GPU-accelerated
whileHover={{ scale: 1.05, y: -4 }}

// ❌ Triggers layout
whileHover={{ width: '110%', marginTop: -4 }}
```

### Disable Gesture Animations When Not Needed

```tsx
function OptimizedList({ items }: { items: Item[] }) {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div onMouseEnter={() => setHasInteracted(true)}>
      {items.map(item => (
        <motion.div
          key={item.id}
          // Only enable hover after first interaction
          whileHover={hasInteracted ? { scale: 1.02 } : undefined}
        >
          {item.content}
        </motion.div>
      ))}
    </div>
  );
}
```

## 9. Common Mistakes

### 1. Too Much Movement
**Problem:** Over-animated hover states feel chaotic.
**Solution:** Keep movements subtle (1-5% scale, 2-8px translate).

### 2. Ignoring Touch Devices
**Problem:** Hover effects don't work on touch.
**Solution:** Use tap states for touch, consider @media (hover: hover).

### 3. No Keyboard Support
**Problem:** Focus states don't match hover.
**Solution:** Apply similar styles to whileFocus.

### 4. Competing Gestures
**Problem:** Drag interferes with scroll.
**Solution:** Use drag constraints and dragDirectionLock.

### 5. Missing Cancel States
**Problem:** Element stays in pressed state after drag away.
**Solution:** Handle onTapCancel and onDragEnd.

## 10. Practice Exercises

### Exercise 1: Like Button
Build a heart like button with press animation and particle burst.

### Exercise 2: Slider
Create a custom slider with drag gesture and value snap.

### Exercise 3: Card Stack
Build a Tinder-style card swipe interface.

### Exercise 4: Context Menu
Create a press-and-hold context menu with radial options.

### Exercise 5: Zoom Image
Build an image with pinch-to-zoom and pan gestures.

## 11. Advanced Topics

- **Multi-Touch Gestures** — Pinch, rotate, multi-finger
- **Gesture Recognition** — Pattern matching for custom gestures
- **Haptic Feedback** — Vibration with gesture events
- **Gesture Delegation** — Forwarding gestures to parent
- **Pointer Capture** — Maintaining gesture during drag out
- **Velocity-Based Actions** — Fling, swipe detection
