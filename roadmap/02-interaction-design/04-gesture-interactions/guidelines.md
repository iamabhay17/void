# Gesture Interactions

## 1. Concept Overview

Gesture interactions are input methods beyond simple clicks — they include drags, swipes, pinches, and long presses. They create more natural, tactile interfaces that feel physical.

Common gesture types:
- **Tap/Click** — Basic selection
- **Double tap** — Quick action (zoom, like)
- **Long press** — Context menu, selection mode
- **Drag** — Reorder, move, resize
- **Swipe** — Delete, navigate, dismiss
- **Pinch** — Zoom in/out
- **Pan** — Scroll, explore

Gestures add a physical quality to digital interfaces, making them feel more tangible and responsive.

## 2. Why This Matters for Design Engineers

Gestures separate touch-native experiences from adapted desktop interfaces:
- Mobile-first products need gesture support
- Desktop apps increasingly use drag-and-drop
- Gestures can replace complex UI with intuitive actions

As a Design Engineer, you must:
- Implement gestures that feel natural and responsive
- Provide clear affordances for gesture availability
- Handle gesture conflicts and edge cases
- Ensure keyboard/mouse alternatives exist

Apps like Linear, Notion, and iOS demonstrate how gestures can make complex interactions feel effortless.

## 3. Key Principles / Mental Models

### Gestures Must Be Discoverable
If users can't discover a gesture, it doesn't exist. Provide:
- Visual affordances (drag handles)
- Animation hints (item "lifts" when held)
- Fallback alternatives (swipe AND button)

### Gestures Should Feel Physical
Good gestures mirror real-world physics:
- Objects have weight (momentum, inertia)
- Actions have consequences (rubber banding, snapping)
- Movement is continuous, not discrete

### Gesture Thresholds
Define clear thresholds for gesture recognition:
- Minimum drag distance to start dragging
- Velocity threshold for swipe actions
- Hold duration for long press

### Cancelability
Users should be able to cancel gestures:
- Drag back to original position
- Release before threshold to cancel
- Escape key to abandon

## 4. Implementation in React

### Draggable Item

```tsx
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

function DraggableCard({ onDragEnd }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const handleDragEnd = (event: MouseEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      onDragEnd(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate, opacity }}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
      className="p-6 bg-white rounded-xl shadow-lg cursor-grab"
    >
      <h3 className="font-semibold">Drag me left or right</h3>
    </motion.div>
  );
}
```

### Swipe to Delete

```tsx
function SwipeToDelete({ onDelete, children }) {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0],
    ['#ef4444', '#ffffff']
  );

  const handleDragEnd = (event: MouseEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete();
    }
  };

  return (
    <motion.div className="relative overflow-hidden">
      {/* Delete background */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end pr-4"
        style={{ background }}
      >
        <TrashIcon className="w-6 h-6 text-white" />
      </motion.div>
      
      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={{ left: 0.1, right: 0 }}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative bg-white"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
```

### Drag to Reorder

```tsx
import { Reorder } from 'framer-motion';

function ReorderableList({ items, onReorder }) {
  return (
    <Reorder.Group 
      axis="y" 
      values={items} 
      onReorder={onReorder}
      className="space-y-2"
    >
      {items.map((item) => (
        <Reorder.Item
          key={item.id}
          value={item}
          className="p-4 bg-white rounded-lg border cursor-grab active:cursor-grabbing"
          whileDrag={{
            scale: 1.02,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            zIndex: 1,
          }}
        >
          <div className="flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <span>{item.name}</span>
          </div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
```

### Long Press Action

```tsx
function LongPressButton({ onLongPress, children }) {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const handlePressStart = () => {
    setIsPressed(true);
    
    // Animate progress
    const startTime = Date.now();
    const duration = 500; // 500ms hold
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);
      
      if (newProgress < 1) {
        timerRef.current = setTimeout(updateProgress, 16);
      } else {
        onLongPress();
        setIsPressed(false);
        setProgress(0);
      }
    };
    
    timerRef.current = setTimeout(updateProgress, 16);
  };

  const handlePressEnd = () => {
    clearTimeout(timerRef.current);
    setIsPressed(false);
    setProgress(0);
  };

  return (
    <motion.button
      onPointerDown={handlePressStart}
      onPointerUp={handlePressEnd}
      onPointerLeave={handlePressEnd}
      animate={{ scale: isPressed ? 0.95 : 1 }}
      className="relative px-6 py-3 bg-blue-600 text-white rounded-lg overflow-hidden"
    >
      {/* Progress indicator */}
      <motion.div
        className="absolute inset-0 bg-blue-700"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: progress }}
        style={{ transformOrigin: 'left' }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
```

## 5. React Patterns to Use

### Gesture Hook Factory

```tsx
function useGesture(handlers: {
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}) {
  const lastTapRef = useRef(0);
  const longPressTimerRef = useRef<NodeJS.Timeout>();

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300 && handlers.onDoubleTap) {
      handlers.onDoubleTap();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current === now && handlers.onTap) {
          handlers.onTap();
        }
      }, 300);
    }
  }, [handlers]);

  const handlePressStart = useCallback(() => {
    if (handlers.onLongPress) {
      longPressTimerRef.current = setTimeout(handlers.onLongPress, 500);
    }
  }, [handlers]);

  const handlePressEnd = useCallback(() => {
    clearTimeout(longPressTimerRef.current);
  }, []);

  return {
    onClick: handleTap,
    onPointerDown: handlePressStart,
    onPointerUp: handlePressEnd,
    onPointerLeave: handlePressEnd,
  };
}

// Usage
function GestureAwareCard() {
  const gestureProps = useGesture({
    onTap: () => console.log('tapped'),
    onDoubleTap: () => console.log('double tapped'),
    onLongPress: () => console.log('long pressed'),
  });

  return <div {...gestureProps}>Interactive Card</div>;
}
```

### Drag Handle Component

```tsx
function DragHandle({ onDrag, children }) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      onDrag={onDrag}
      className="cursor-grab active:cursor-grabbing touch-none"
    >
      {children}
    </motion.div>
  );
}

// Compound pattern
const DraggableItem = ({ children }) => (
  <div className="flex items-center gap-2">
    {children}
  </div>
);

DraggableItem.Handle = ({ onDrag }) => (
  <DragHandle onDrag={onDrag}>
    <GripVertical className="w-4 h-4 text-gray-400" />
  </DragHandle>
);

DraggableItem.Content = ({ children }) => (
  <div className="flex-1">{children}</div>
);
```

## 6. Important Hooks

### useDrag

```tsx
function useDrag({ 
  onDragStart, 
  onDrag, 
  onDragEnd,
  axis = 'both',
}: {
  onDragStart?: () => void;
  onDrag?: (offset: { x: number; y: number }) => void;
  onDragEnd?: (offset: { x: number; y: number }) => void;
  axis?: 'x' | 'y' | 'both';
}) {
  const ref = useRef<HTMLElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      startPos.current = { x: e.clientX, y: e.clientY };
      element.setPointerCapture(e.pointerId);
      onDragStart?.();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      
      const offset = {
        x: axis !== 'y' ? e.clientX - startPos.current.x : 0,
        y: axis !== 'x' ? e.clientY - startPos.current.y : 0,
      };
      
      onDrag?.(offset);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      
      const offset = {
        x: axis !== 'y' ? e.clientX - startPos.current.x : 0,
        y: axis !== 'x' ? e.clientY - startPos.current.y : 0,
      };
      
      onDragEnd?.(offset);
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
    };
  }, [axis, onDrag, onDragEnd, onDragStart]);

  return ref;
}
```

### useSwipe

```tsx
function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocityThreshold = 0.3,
}: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  velocityThreshold?: number;
}) {
  const startPos = useRef({ x: 0, y: 0, time: 0 });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    const deltaTime = Date.now() - startPos.current.time;
    const velocity = Math.sqrt(deltaX ** 2 + deltaY ** 2) / deltaTime;

    if (velocity < velocityThreshold && 
        Math.abs(deltaX) < threshold && 
        Math.abs(deltaY) < threshold) {
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > threshold) onSwipeRight?.();
      else if (deltaX < -threshold) onSwipeLeft?.();
    } else {
      // Vertical swipe
      if (deltaY > threshold) onSwipeDown?.();
      else if (deltaY < -threshold) onSwipeUp?.();
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, velocityThreshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}
```

## 7. Animation Considerations

### Gesture Momentum

```tsx
function MomentumDrag() {
  return (
    <motion.div
      drag
      dragTransition={{
        power: 0.3, // Momentum power
        timeConstant: 200, // How long momentum lasts
        bounceStiffness: 300,
        bounceDamping: 20,
      }}
      dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
      dragElastic={0.1}
    >
      Drag with momentum
    </motion.div>
  );
}
```

### Rubber Band Effect

```tsx
function RubberBandScroll({ children }) {
  const y = useMotionValue(0);
  const [constraint, setConstraint] = useState({ top: 0, bottom: 0 });

  return (
    <motion.div
      drag="y"
      style={{ y }}
      dragConstraints={constraint}
      dragElastic={0.2} // Rubber band effect
      onDragEnd={() => {
        // Snap back if over-scrolled
        if (y.get() > 0) {
          y.set(0);
        }
      }}
    >
      {children}
    </motion.div>
  );
}
```

### Gesture-Driven Opacity

```tsx
function DismissableCard({ onDismiss }) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);
  const scale = useTransform(x, [-150, 0, 150], [0.8, 1, 0.8]);

  return (
    <motion.div
      drag="x"
      style={{ x, opacity, scale }}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100) {
          onDismiss();
        }
      }}
    >
      Swipe to dismiss
    </motion.div>
  );
}
```

## 8. Performance Considerations

### Use Passive Event Listeners

```tsx
useEffect(() => {
  const handleTouchMove = (e: TouchEvent) => {
    // Handle touch move
  };

  element.addEventListener('touchmove', handleTouchMove, { passive: true });
  
  return () => {
    element.removeEventListener('touchmove', handleTouchMove);
  };
}, []);
```

### Throttle Drag Updates

```tsx
const throttledOnDrag = useMemo(
  () => throttle((offset) => {
    // Update state
  }, 16), // 60fps
  []
);
```

### Use Transform Instead of Position

```tsx
// ❌ Causes layout calculations
<div style={{ left: dragX, top: dragY }} />

// ✅ GPU accelerated
<motion.div style={{ x: dragX, y: dragY }} />
```

## 9. Common Mistakes

### 1. No Gesture Affordances
**Problem:** Users don't know something is draggable.
**Solution:** Add visual hints (drag handles, shadows on hover).

### 2. Conflicts with Scroll
**Problem:** Horizontal swipe conflicts with vertical scroll.
**Solution:** Use gesture thresholds and lock axes.

### 3. No Cancel Mechanism
**Problem:** User starts drag but can't cancel.
**Solution:** Allow dragging back to origin or pressing Escape.

### 4. Missing Haptic Feedback
**Problem:** Gestures feel disconnected on mobile.
**Solution:** Add haptic feedback at key moments.

### 5. Desktop Neglect
**Problem:** Gestures only work on touch devices.
**Solution:** Support mouse drag and keyboard alternatives.

## 10. Practice Exercises

### Exercise 1: Swipe to Delete
Build a list item that reveals a delete action on swipe.

### Exercise 2: Drag to Reorder
Create a reorderable list with smooth drag animations.

### Exercise 3: Pull to Refresh
Implement a pull-to-refresh interaction with loading state.

### Exercise 4: Dismissable Modal
Build a modal that can be dismissed by swiping down.

### Exercise 5: Image Pan & Zoom
Create an image viewer with pinch-to-zoom and pan gestures.

## 11. Advanced Topics

- **Multi-Touch Gestures** — Pinch, rotate, two-finger scroll
- **Gesture Recognition ML** — Complex gesture patterns
- **Pressure Sensitivity** — 3D Touch / Force Touch support
- **Gesture Composition** — Combining gestures (drag while pinching)
- **Custom Physics** — Spring physics, gravity, friction
- **Accessibility Alternatives** — Keyboard/switch alternatives for all gestures
