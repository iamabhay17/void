# Animation Orchestration

## 1. Concept Overview

Animation orchestration coordinates multiple animations to create cohesive, choreographed experiences. Instead of animations happening randomly, they follow intentional sequences, staggering, and timing relationships.

Key orchestration patterns:
- **Staggering** — Elements animate in sequence
- **Chaining** — Animation B starts when A completes
- **Parallel** — Multiple animations happen simultaneously
- **Conducting** — A trigger controls multiple animations
- **Phasing** — Different animation phases for enter/update/exit

Orchestration transforms a collection of animations into a unified performance.

## 2. Why This Matters for Design Engineers

Orchestration creates premium experiences:
- Interfaces feel intentional and designed
- User attention is guided appropriately
- Loading states feel progressive
- Transitions tell a story

As a Design Engineer, you must:
- Design animation sequences, not just individual animations
- Balance orchestration with performance
- Know when orchestration helps vs. overwhelms
- Create reusable orchestration patterns

## 3. Key Principles / Mental Models

### The Animation Hierarchy
```
Container (controls timing)
├── Primary Element (animates first)
├── Secondary Elements (stagger after)
└── Tertiary Elements (stagger last)
```

### Timing Relationships
```tsx
// Stagger: Each child delays by fixed amount
staggerChildren: 0.1

// Delay Children: Wait before starting children
delayChildren: 0.3

// Stagger Direction: Forward (1) or reverse (-1)
staggerDirection: -1

// When: 'beforeChildren' | 'afterChildren'
when: 'beforeChildren'
```

### The Conductor Pattern
```tsx
// Parent "conducts" children via variants
<motion.div animate="visible">
  <motion.div variants={childVariants} /> {/* Inherits animate */}
  <motion.div variants={childVariants} /> {/* Inherits animate */}
</motion.div>
```

## 4. Implementation in React

### Basic Staggered Animation

```tsx
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

function StaggeredList({ items }: { items: Item[] }) {
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

### Chained Animations

```tsx
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      when: 'beforeChildren', // Container animates first
      staggerChildren: 0.1,
    },
  },
};

const backgroundVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function ChainedCard() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      <motion.div 
        variants={backgroundVariants}
        className="absolute inset-0 bg-blue-500 rounded-xl"
      />
      <motion.div variants={contentVariants} className="relative p-6">
        <motion.h2 variants={contentVariants}>Title</motion.h2>
        <motion.p variants={contentVariants}>Description</motion.p>
        <motion.button variants={contentVariants}>Action</motion.button>
      </motion.div>
    </motion.div>
  );
}
```

### Parallel Animation Groups

```tsx
function ParallelAnimations() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <button onClick={() => setIsVisible(!isVisible)}>Toggle</button>
      
      {/* These animate simultaneously */}
      <motion.div
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="sidebar"
      />
      
      <motion.div
        animate={{ x: isVisible ? 250 : 0 }}
        transition={{ duration: 0.3 }}
        className="content"
      />
      
      <motion.div
        animate={{ scale: isVisible ? 0.95 : 1 }}
        transition={{ duration: 0.3 }}
        className="overlay"
      />
    </>
  );
}
```

### Complex Page Orchestration

```tsx
const pageVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: 'afterChildren',
    },
  },
};

const sectionVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.2 },
  },
};

function Page() {
  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.section variants={sectionVariants}>Hero</motion.section>
      <motion.section variants={sectionVariants}>Features</motion.section>
      <motion.section variants={sectionVariants}>Testimonials</motion.section>
      <motion.section variants={sectionVariants}>CTA</motion.section>
    </motion.main>
  );
}
```

## 5. React Patterns to Use

### Animation Controller Hook

```tsx
function useAnimationController() {
  const controls = useAnimationControls();
  const [phase, setPhase] = useState<'idle' | 'entering' | 'visible' | 'exiting'>('idle');

  const enter = async () => {
    setPhase('entering');
    await controls.start('visible');
    setPhase('visible');
  };

  const exit = async () => {
    setPhase('exiting');
    await controls.start('hidden');
    setPhase('idle');
  };

  return { controls, phase, enter, exit };
}

function ControlledAnimation() {
  const { controls, phase, enter, exit } = useAnimationController();

  return (
    <>
      <button onClick={enter} disabled={phase !== 'idle'}>Enter</button>
      <button onClick={exit} disabled={phase !== 'visible'}>Exit</button>
      
      <motion.div
        animate={controls}
        variants={{
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 },
        }}
        initial="hidden"
      >
        Content
      </motion.div>
    </>
  );
}
```

### Sequence Animation

```tsx
function useSequence() {
  const [step, setStep] = useState(0);

  const next = () => setStep(s => s + 1);
  const reset = () => setStep(0);
  const isAt = (s: number) => step >= s;

  return { step, next, reset, isAt };
}

function SequencedIntro() {
  const { isAt, next, reset } = useSequence();

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: isAt(0) ? 1 : 0 }}
        onAnimationComplete={() => isAt(0) && next()}
      >
        Welcome
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isAt(1) ? 1 : 0,
          y: isAt(1) ? 0 : 20,
        }}
        onAnimationComplete={() => isAt(1) && next()}
      >
        to our platform
      </motion.p>
      
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: isAt(2) ? 1 : 0,
          scale: isAt(2) ? 1 : 0.9,
        }}
      >
        Get Started
      </motion.button>
    </div>
  );
}
```

### Grid Item Orchestration

```tsx
function OrchestatedGrid({ items }: { items: Item[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={containerRef}
      className="grid grid-cols-3 gap-4"
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          variants={{
            hidden: { opacity: 0, scale: 0.8, y: 20 },
            visible: { 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 24,
              },
            },
          }}
        >
          <GridItem item={item} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Multi-Phase Animation

```tsx
type Phase = 'initial' | 'loading' | 'loaded' | 'error';

function MultiPhaseComponent() {
  const [phase, setPhase] = useState<Phase>('initial');

  const variants = {
    initial: { opacity: 0, y: 20 },
    loading: { opacity: 1, y: 0 },
    loaded: { opacity: 1, y: 0, scale: 1 },
    error: { opacity: 1, y: 0, backgroundColor: '#fee2e2' },
  };

  return (
    <motion.div
      variants={variants}
      animate={phase}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {phase === 'loading' && <Spinner />}
      {phase === 'loaded' && <Content />}
      {phase === 'error' && <Error />}
    </motion.div>
  );
}
```

## 6. Important Hooks

### useStagger

```tsx
function useStagger(count: number, delayPerItem = 0.1) {
  const getDelay = useCallback(
    (index: number) => index * delayPerItem,
    [delayPerItem]
  );

  const getTransition = useCallback(
    (index: number, baseTransition: Transition = {}) => ({
      ...baseTransition,
      delay: (baseTransition.delay || 0) + getDelay(index),
    }),
    [getDelay]
  );

  return { getDelay, getTransition };
}

function StaggeredItems({ items }: { items: Item[] }) {
  const { getTransition } = useStagger(items.length, 0.08);

  return (
    <div>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={getTransition(index, { 
            type: 'spring', 
            stiffness: 300,
            damping: 24,
          })}
        >
          {item.content}
        </motion.div>
      ))}
    </div>
  );
}
```

### useAnimationSequence

```tsx
function useAnimationSequence(steps: (() => Promise<void>)[]) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);

  const start = async () => {
    setIsRunning(true);
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await steps[i]();
    }
    
    setCurrentStep(-1);
    setIsRunning(false);
  };

  return { start, currentStep, isRunning };
}
```

## 7. Animation Considerations

### Enter/Exit Orchestration Asymmetry

```tsx
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      // Slower, more dramatic enter
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
  exit: {
    transition: {
      // Quick, unobtrusive exit
      staggerChildren: 0.05,
      staggerDirection: -1, // Reverse order
    },
  },
};
```

### Coordinating with Layout Animations

```tsx
function LayoutWithStagger({ items }: { items: Item[] }) {
  return (
    <motion.div layout>
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: { delay: i * 0.05 },
            }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {item.content}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
```

### Responsive Orchestration

```tsx
function ResponsiveOrchestration({ items }: { items: Item[] }) {
  const isMobile = useIsMobile();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        // Less stagger on mobile for faster perceived load
        staggerChildren: isMobile ? 0.03 : 0.1,
        delayChildren: isMobile ? 0 : 0.2,
      },
    },
  };

  return (
    <motion.div variants={containerVariants}>
      {/* ... */}
    </motion.div>
  );
}
```

## 8. Performance Considerations

### Limit Stagger Count

```tsx
function OptimizedStagger({ items }: { items: Item[] }) {
  // Only stagger first N items
  const STAGGER_LIMIT = 10;

  return (
    <motion.div
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: {
                // Items after limit animate instantly
                delay: i < STAGGER_LIMIT ? undefined : 0,
                duration: i < STAGGER_LIMIT ? 0.3 : 0,
              },
            },
          }}
        >
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Lazy Orchestration

```tsx
function LazyOrchestration({ items }: { items: Item[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  // Only orchestrate when visible
  return (
    <div ref={ref}>
      {isInView ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {items.map(item => (
            <motion.div key={item.id} variants={itemVariants}>
              {item.content}
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="min-h-[200px]" />
      )}
    </div>
  );
}
```

## 9. Common Mistakes

### 1. Too Much Stagger Delay
**Problem:** Animation takes too long to complete.
**Solution:** Keep total orchestration under 1 second for UI.

### 2. Forgetting Exit Orchestration
**Problem:** Items disappear at once instead of sequenced.
**Solution:** Add exit variants with staggerDirection: -1.

### 3. Inconsistent Easing
**Problem:** Elements feel disconnected.
**Solution:** Use same easing across orchestrated elements.

### 4. Over-Orchestration
**Problem:** Everything animates, feels overwhelming.
**Solution:** Orchestrate key elements, let others be static.

### 5. No Loading State
**Problem:** Content pops in before animation starts.
**Solution:** Show skeleton or loading state until ready.

## 10. Practice Exercises

### Exercise 1: Dashboard Load
Orchestrate a dashboard with cards loading in sequence.

### Exercise 2: Form Wizard
Create multi-step form with staged animations between steps.

### Exercise 3: Navigation Menu
Build a menu where items stagger in on open.

### Exercise 4: Feature Section
Design a features section where icons, titles, and descriptions animate in phases.

### Exercise 5: Search Results
Orchestrate search results appearing with stagger based on relevance.

## 11. Advanced Topics

- **Timeline-Based Animation** — Precise timing control
- **Music/Sound Sync** — Animation to audio
- **Scroll-Driven Orchestration** — Stagger based on scroll
- **State Machine Orchestration** — XState for complex sequences
- **Cross-Component Coordination** — Orchestrating across tree
- **Animation Presets** — Reusable orchestration patterns
