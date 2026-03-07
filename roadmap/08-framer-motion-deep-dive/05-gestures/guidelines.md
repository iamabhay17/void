# Gestures in Framer Motion

## 1. Concept Overview

Framer Motion provides a declarative gesture system for handling hover, tap, drag, pan, and focus interactions. Gestures automatically handle pointer events, touch events, and accessibility, making it simple to create interactive animated components.

Key gesture props:
- `whileHover` — Animation while pointer hovers
- `whileTap` — Animation while pressing
- `whileFocus` — Animation while focused
- `whileDrag` — Animation while dragging
- `drag` — Enable drag gesture

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Interactive Button
</motion.button>
```

## 2. Why This Matters for Design Engineers

Gesture animations create tactile interfaces:
- Buttons feel clickable
- Cards feel interactive
- Sliders feel draggable
- Inputs feel responsive

As a Design Engineer, you must:
- Design appropriate gesture feedback
- Handle touch and mouse consistently
- Ensure keyboard accessibility
- Balance feedback with restraint

## 3. Key Principles / Mental Models

### Gesture Lifecycle
```
onHoverStart → whileHover → onHoverEnd
onTapStart → whileTap → onTap | onTapCancel
onDragStart → whileDrag → onDrag → onDragEnd
onFocus → whileFocus → onBlur
```

### Gesture Priority
When multiple gestures are active:
1. whileDrag (highest)
2. whileTap
3. whileFocus
4. whileHover (lowest)

### Physical Metaphors
```tsx
// Buttons "press" down
whileTap={{ scale: 0.98, y: 2 }}

// Cards "lift" up
whileHover={{ y: -4, boxShadow: '...' }}

// Toggles "slide"
drag="x"
```

## 4. Implementation in React

### Hover Animation

```tsx
function HoverCard({ children }: { children: ReactNode }) {
  return (
    <motion.div
      whileHover={{ 
        y: -8,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="p-6 bg-white rounded-xl shadow-lg cursor-pointer"
    >
      {children}
    </motion.div>
  );
}
```

### Tap Animation

```tsx
function TapButton({ children, onClick }: ButtonProps) {
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

### Focus Animation

```tsx
function FocusInput({ ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <motion.input
      whileFocus={{ 
        scale: 1.02,
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.4)',
      }}
      transition={{ duration: 0.2 }}
      className="px-4 py-2 border rounded-lg outline-none"
      {...props}
    />
  );
}
```

### Basic Drag

```tsx
function DraggableBox() {
  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
      dragElastic={0.1}
      whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
      className="w-24 h-24 bg-blue-500 rounded-lg cursor-grab"
    />
  );
}
```

### Drag with Ref Constraints

```tsx
function DragInContainer() {
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={constraintsRef} 
      className="w-full h-96 bg-gray-100 rounded-xl"
    >
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        whileDrag={{ 
          scale: 1.1,
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}
        className="w-20 h-20 bg-blue-500 rounded-lg cursor-grab"
      />
    </div>
  );
}
```

## 5. React Patterns to Use

### Swipe to Delete

```tsx
function SwipeableItem({ onDelete, children }: SwipeProps) {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0, 100],
    ['#ef4444', '#ffffff', '#22c55e']
  );
  const leftIconOpacity = useTransform(x, [0, 50], [0, 1]);
  const rightIconOpacity = useTransform(x, [-50, 0], [1, 0]);

  const handleDragEnd = (_, info: PanInfo) => {
    if (info.offset.x > 100) {
      // Swiped right - archive
    } else if (info.offset.x < -100) {
      // Swiped left - delete
      onDelete();
    }
  };

  return (
    <motion.div style={{ background }} className="relative rounded-lg">
      <motion.span 
        style={{ opacity: leftIconOpacity }}
        className="absolute left-4 top-1/2 -translate-y-1/2"
      >
        ✓
      </motion.span>
      <motion.span 
        style={{ opacity: rightIconOpacity }}
        className="absolute right-4 top-1/2 -translate-y-1/2"
      >
        🗑
      </motion.span>
      
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="bg-white p-4 rounded-lg"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
```

### Drag Handle

```tsx
import { useDragControls } from 'framer-motion';

function DraggableWithHandle({ children }: { children: ReactNode }) {
  const controls = useDragControls();

  return (
    <motion.div
      drag
      dragControls={controls}
      dragListener={false}
      className="p-4 bg-white rounded-lg shadow-lg"
    >
      <motion.div
        onPointerDown={(e) => controls.start(e)}
        className="h-8 bg-gray-200 rounded mb-4 cursor-grab active:cursor-grabbing flex items-center justify-center"
      >
        ⋮⋮ Drag here
      </motion.div>
      {children}
    </motion.div>
  );
}
```

### Slider

```tsx
function Slider({ value, onChange, min = 0, max = 100 }: SliderProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (constraintsRef.current) {
      setContainerWidth(constraintsRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const percentage = (value - min) / (max - min);
    x.set(percentage * containerWidth);
  }, [value, min, max, containerWidth, x]);

  const handleDrag = () => {
    const percentage = x.get() / containerWidth;
    const newValue = min + percentage * (max - min);
    onChange(Math.round(newValue));
  };

  return (
    <div 
      ref={constraintsRef} 
      className="relative h-2 bg-gray-200 rounded-full"
    >
      <motion.div
        className="absolute left-0 h-full bg-blue-500 rounded-full"
        style={{ width: useTransform(x, v => v) }}
      />
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        onDrag={handleDrag}
        whileDrag={{ scale: 1.2 }}
        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-500 rounded-full cursor-grab"
      />
    </div>
  );
}
```

### Gesture Events

```tsx
function GestureLogger() {
  return (
    <motion.div
      whileHover={{ backgroundColor: '#f3f4f6' }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => console.log('Hover started')}
      onHoverEnd={() => console.log('Hover ended')}
      onTapStart={() => console.log('Tap started')}
      onTap={() => console.log('Tap completed')}
      onTapCancel={() => console.log('Tap cancelled')}
      className="p-8 border rounded-lg cursor-pointer"
    >
      Interact with me
    </motion.div>
  );
}
```

## 6. Important Hooks

### useDragControls

```tsx
import { useDragControls, motion } from 'framer-motion';

function ControlledDrag() {
  const controls = useDragControls();

  const startDrag = (event: React.PointerEvent) => {
    controls.start(event, { snapToCursor: true });
  };

  return (
    <>
      <div onPointerDown={startDrag} className="p-4 bg-gray-200">
        Start dragging from here
      </div>
      <motion.div
        drag
        dragControls={controls}
        dragListener={false}
        className="w-20 h-20 bg-blue-500 rounded"
      />
    </>
  );
}
```

### useMotionValue with Gestures

```tsx
function GestureWithMotionValue() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(
    [x, y],
    ([latestX, latestY]: number[]) => {
      const distance = Math.sqrt(latestX ** 2 + latestY ** 2);
      return Math.max(0, 1 - distance / 300);
    }
  );

  return (
    <motion.div
      drag
      dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
      style={{ x, y, rotate, opacity }}
      className="w-32 h-32 bg-blue-500 rounded-lg cursor-grab"
    />
  );
}
```

## 7. Animation Considerations

### Gesture Transition Configuration

```tsx
const gestureTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 17,
};

function ConfiguredGestures() {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={gestureTransition}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg"
    >
      Fast, snappy response
    </motion.button>
  );
}
```

### Drag Momentum and Elastic

```tsx
<motion.div
  drag
  // Momentum after release
  dragMomentum={true} // default
  
  // Elasticity when hitting constraints
  dragElastic={0.5} // 0 = hard stop, 1 = very elastic
  
  // Snap to points after drag
  dragSnapToOrigin={true}
  
  // Lock to one axis
  dragDirectionLock={true}
/>
```

### Complex Hover Effects

```tsx
function HoverWithChildren() {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      className="p-6 bg-white rounded-xl overflow-hidden"
    >
      <motion.h2
        variants={{
          rest: { y: 0 },
          hover: { y: -5 },
        }}
      >
        Hover Card
      </motion.h2>
      
      <motion.p
        variants={{
          rest: { opacity: 0.7 },
          hover: { opacity: 1 },
        }}
      >
        Description text
      </motion.p>
      
      <motion.div
        variants={{
          rest: { opacity: 0, y: 10 },
          hover: { opacity: 1, y: 0 },
        }}
      >
        <button>Learn More →</button>
      </motion.div>
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

### Avoid Heavy Calculations in Drag

```tsx
// ❌ Expensive calculation on every drag frame
onDrag={(e, info) => {
  const result = expensiveCalculation(info.point);
  setState(result);
}}

// ✅ Throttle or use motion values
const x = useMotionValue(0);
const derivedValue = useTransform(x, v => v * 0.5);
```

### Disable Gestures When Not Needed

```tsx
function ConditionalGestures({ isInteractive }: { isInteractive: boolean }) {
  return (
    <motion.div
      whileHover={isInteractive ? { scale: 1.05 } : undefined}
      whileTap={isInteractive ? { scale: 0.95 } : undefined}
    >
      Content
    </motion.div>
  );
}
```

## 9. Common Mistakes

### 1. Hover on Touch Devices
**Problem:** Hover states stick on touch.
**Solution:** Use @media (hover: hover) or check hasHover capability.

### 2. Missing Focus States
**Problem:** Keyboard users have no feedback.
**Solution:** Add whileFocus matching whileHover.

### 3. Drag Interfering with Scroll
**Problem:** Dragging prevents page scroll.
**Solution:** Use drag="x" or drag="y", not both.

### 4. Too Much Movement
**Problem:** Large scale changes feel chaotic.
**Solution:** Keep gestures subtle (2-5% scale, 2-8px translate).

### 5. Missing Cancel Handling
**Problem:** Element stuck in tap state.
**Solution:** Gesture system handles this, but verify.

## 10. Practice Exercises

### Exercise 1: Card Stack
Build a Tinder-style swipeable card stack.

### Exercise 2: Custom Slider
Create a range slider with two handles.

### Exercise 3: Press and Hold
Build a button that requires holding for 2 seconds.

### Exercise 4: Sortable List
Create a drag-to-reorder list with smooth animations.

### Exercise 5: Gesture Visualizer
Build a component that shows current gesture state.

## 11. Advanced Topics

- **Multi-Touch Gestures** — Pinch, rotate, multi-finger
- **Gesture Velocity** — Using velocity for fling effects
- **Custom Gesture Recognizers** — Detecting patterns
- **Haptic Feedback** — Vibration with gestures
- **Pointer Capture** — Maintaining gesture across boundaries
- **Accessibility** — Screen reader gesture alternatives
