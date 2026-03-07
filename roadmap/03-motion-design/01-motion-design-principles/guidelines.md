# Motion Design Principles

## 1. Concept Overview

Motion design is the art of bringing interfaces to life through movement. It's not about adding animation—it's about using motion to communicate, guide, and delight.

Core principles:
- **Purpose** — Every animation should have a reason
- **Context** — Motion should reinforce the spatial model
- **Consistency** — Similar actions have similar animations
- **Timing** — Duration and easing affect perception
- **Hierarchy** — Motion draws attention to what matters

Motion design transforms static interfaces into living systems that respond naturally to user input.

## 2. Why This Matters for Design Engineers

Motion separates good interfaces from great ones:
- It communicates relationships between elements
- It provides feedback and confirms actions
- It guides attention through complex flows
- It adds personality and emotional resonance

As a Design Engineer, you must:
- Understand *why* to animate, not just *how*
- Create animations that enhance, not distract
- Build consistent motion systems
- Balance delight with performance

Linear's interface feels alive because every motion is intentional—elements flow naturally, feedback is instant, and transitions maintain spatial continuity.

## 3. Key Principles / Mental Models

### The 12 Principles of Animation (Adapted for UI)
From Disney animation, adapted for digital interfaces:

1. **Squash and Stretch** — Elements deform slightly on impact
2. **Anticipation** — Small movement before main action
3. **Staging** — Clear presentation of the animated element
4. **Follow Through** — Elements continue moving after stopping
5. **Ease In/Ease Out** — Natural acceleration and deceleration
6. **Arcs** — Natural curved motion paths
7. **Secondary Action** — Supporting movements
8. **Timing** — Speed communicates weight and urgency
9. **Exaggeration** — Subtle emphasis on key moments
10. **Solid Drawing** — 3D-aware motion
11. **Appeal** — Pleasing, character-appropriate motion
12. **Pose to Pose** — Clear start and end states

### Motion Semantics
Motion communicates meaning:
- **Scale up** = growing importance, appearing
- **Scale down** = shrinking importance, disappearing  
- **Fade in** = gradual appearance, soft entrance
- **Slide** = spatial relationship, coming from somewhere
- **Bounce** = playful, successful, attention-grabbing
- **Shake** = error, rejection, warning

### The Hierarchy of Motion
Not all elements deserve the same animation attention:
1. **Critical Path** — Transactions, confirmations (most attention)
2. **Navigation** — Page transitions, menu animations
3. **Feedback** — Hover states, button presses
4. **Ambient** — Background movement, idle states (least attention)

## 4. Implementation in React

### Purposeful Motion System

```tsx
// motion-system.ts
export const motionConfig = {
  // Entrance animations by importance
  entrance: {
    // Critical - user needs to see this
    critical: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
    // Standard - normal content appearing
    standard: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    },
    // Subtle - secondary content
    subtle: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.2 },
    },
  },
  
  // Exit animations
  exit: {
    default: {
      opacity: 0,
      transition: { duration: 0.15 },
    },
    slideOut: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 },
    },
  },
  
  // Feedback animations
  feedback: {
    tap: { scale: 0.98 },
    hover: { scale: 1.02 },
    error: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 },
    },
    success: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.3 },
    },
  },
};
```

### Component with Purposeful Motion

```tsx
import { motion, AnimatePresence } from 'framer-motion';

function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - subtle, doesn't steal focus */}
          <motion.div
            className="fixed inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          
          {/* Modal - critical, needs attention */}
          <motion.div
            className="fixed inset-x-4 top-1/2 max-w-lg mx-auto bg-white rounded-xl shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: '-45%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-45%' }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Staged Entrance Animation

```tsx
function PageSection({ children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.4, 0, 0.2, 1] 
      }}
    >
      {children}
    </motion.section>
  );
}

function LandingPage() {
  return (
    <main>
      <PageSection delay={0}>
        <HeroSection />
      </PageSection>
      <PageSection delay={0.1}>
        <FeaturesSection />
      </PageSection>
      <PageSection delay={0.2}>
        <TestimonialsSection />
      </PageSection>
    </main>
  );
}
```

### Motion as Communication

```tsx
function FormSubmitButton({ onSubmit }) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const handleSubmit = async () => {
    setState('loading');
    try {
      await onSubmit();
      setState('success');
    } catch {
      setState('error');
    }
  };

  const getAnimation = () => {
    switch (state) {
      case 'loading':
        return { scale: 1 }; // Static during loading
      case 'success':
        return { scale: [1, 1.1, 1] }; // Celebratory bounce
      case 'error':
        return { x: [0, -10, 10, -10, 10, 0] }; // Shake for error
      default:
        return { scale: 1 };
    }
  };

  return (
    <motion.button
      onClick={handleSubmit}
      animate={getAnimation()}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'px-6 py-2 rounded-md font-medium transition-colors',
        state === 'idle' && 'bg-blue-600 text-white',
        state === 'loading' && 'bg-blue-500 text-white',
        state === 'success' && 'bg-green-600 text-white',
        state === 'error' && 'bg-red-600 text-white',
      )}
    >
      {state === 'idle' && 'Submit'}
      {state === 'loading' && <Spinner />}
      {state === 'success' && 'Success!'}
      {state === 'error' && 'Try Again'}
    </motion.button>
  );
}
```

## 5. React Patterns to Use

### Motion Variants for Consistency

```tsx
const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    transition: { duration: 0.2 }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  hover: {
    y: -4,
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

function Card({ children }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      className="p-6 bg-white rounded-lg border"
    >
      {children}
    </motion.div>
  );
}
```

### Container/Child Orchestration

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function StaggeredList({ items }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map(item => (
        <motion.li key={item.id} variants={itemVariants}>
          {item.content}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

## 6. Important Hooks

### useReducedMotion

```tsx
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent({ children }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

### useMotionValue for Reactive Animation

```tsx
import { useMotionValue, useTransform, motion } from 'framer-motion';

function ParallaxCard() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="p-8 bg-white rounded-xl shadow-lg"
    >
      Card Content
    </motion.div>
  );
}
```

## 7. Animation Considerations

### Motion Hierarchy Example

```tsx
function Dashboard() {
  return (
    <div>
      {/* Level 1: Page container - no animation, instant */}
      <div className="min-h-screen bg-gray-50">
        
        {/* Level 2: Major sections - subtle fade */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Navigation />
        </motion.header>
        
        {/* Level 3: Content cards - staged entrance */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Level 4: Interactive elements - micro-interactions */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Action
          </motion.button>
        </motion.main>
      </div>
    </div>
  );
}
```

### When NOT to Animate

```tsx
// ❌ Don't animate text typing in real-time
<motion.span animate={{ opacity: 1 }}>{typingText}</motion.span>

// ❌ Don't animate every data update
<motion.span key={count} animate={{ scale: [1, 1.2, 1] }}>{count}</motion.span>

// ❌ Don't animate layout during scroll
<motion.div layout>{scrollingContent}</motion.div>

// ✅ Animate meaningful state changes
<AnimatePresence mode="wait">
  {view === 'list' ? (
    <motion.div key="list" {...enterAnimation}>
      <ListView />
    </motion.div>
  ) : (
    <motion.div key="grid" {...enterAnimation}>
      <GridView />
    </motion.div>
  )}
</AnimatePresence>
```

## 8. Performance Considerations

### Animate Transform Properties Only

```tsx
// ✅ GPU-accelerated (fast)
<motion.div animate={{ x: 100, scale: 1.1, rotate: 45, opacity: 0.5 }} />

// ❌ Triggers layout (slow)
<motion.div animate={{ width: 200, height: 100, top: 50, left: 50 }} />
```

### Use layout Animation Sparingly

```tsx
// ❌ Layout animation on many elements
{items.map(item => (
  <motion.div key={item.id} layout>
    {item.content}
  </motion.div>
))}

// ✅ Layout animation only where needed
<motion.div layout>
  {/* Only animate the container */}
  {items.map(item => (
    <div key={item.id}>{item.content}</div>
  ))}
</motion.div>
```

### Reduce Animation Complexity on Low-End Devices

```tsx
function useAnimationComplexity() {
  const [complexity, setComplexity] = useState<'full' | 'reduced'>('full');

  useEffect(() => {
    // Check for low-end device indicators
    const isLowEnd = navigator.hardwareConcurrency <= 4 ||
                     navigator.deviceMemory <= 4;
    
    if (isLowEnd) {
      setComplexity('reduced');
    }
  }, []);

  return complexity;
}
```

## 9. Common Mistakes

### 1. Animation for Animation's Sake
**Problem:** Everything bounces and slides.
**Solution:** Each animation needs a purpose. If you can't explain why, remove it.

### 2. Too Slow
**Problem:** 1-second transitions feel sluggish.
**Solution:** Most UI animations should be 150-400ms.

### 3. Linear Easing
**Problem:** Animations feel robotic.
**Solution:** Use natural easing curves. Linear is almost never right for UI.

### 4. Inconsistent Motion Language
**Problem:** Different animations for similar actions.
**Solution:** Define a motion system and apply it consistently.

### 5. Ignoring Reduced Motion
**Problem:** Animations cause issues for some users.
**Solution:** Always check `prefers-reduced-motion` and simplify.

## 10. Practice Exercises

### Exercise 1: Motion Audit
Take an existing interface and identify every animation. Classify each as purposeful or unnecessary.

### Exercise 2: Motion System
Define a complete motion system: entrance, exit, feedback, and transition animations.

### Exercise 3: Purposeful Feedback
Create a form submission flow with animations that communicate loading, success, and error states.

### Exercise 4: Choreographed Entrance
Build a page with staggered, hierarchical entrance animations.

### Exercise 5: Reduced Motion Version
Take an animated component and create an equally functional reduced-motion version.

## 11. Advanced Topics

- **Spring Physics** — Natural motion with configurable stiffness and damping
- **Gesture-Driven Animation** — Direct manipulation physics
- **Motion Path Animation** — Movement along SVG paths
- **3D Transforms** — Perspective and depth in UI
- **Motion Design Systems** — Scaling motion language across products
- **Performance Profiling** — Measuring and optimizing animation performance
