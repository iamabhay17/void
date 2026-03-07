# Motion Choreography

## 1. Concept Overview

Motion choreography is the art of coordinating multiple animations to create a cohesive, meaningful sequence. Like choreographing a dance, it's about timing, rhythm, and the relationships between moving elements.

Choreography involves:
- **Sequencing** — Which elements animate first, second, third
- **Staggering** — Delays between related elements
- **Orchestration** — How animations relate to each other
- **Rhythm** — The tempo and flow of the overall motion
- **Hierarchy** — Important elements lead, others follow

Great choreography makes complex transitions feel effortless and natural.

## 2. Why This Matters for Design Engineers

Without choreography:
- Multiple elements animating together create chaos
- Users can't track what's happening
- Transitions feel jarring instead of smooth

As a Design Engineer, you must:
- Decide animation order based on importance
- Create rhythmic stagger patterns
- Coordinate enter/exit animations
- Build reusable orchestration patterns

Linear's page transitions feel smooth because elements don't all move at once—they're choreographed to guide your eye through the change.

## 3. Key Principles / Mental Models

### Lead Element Principle
Identify the most important element and animate it first. Other elements follow, supporting the lead.

### Stagger Patterns
Common stagger approaches:
- **Sequential** — One after another (0, 50ms, 100ms...)
- **Radial** — From a center point outward
- **Directional** — Following a visual direction (top to bottom)
- **Grouped** — Groups animate together, then next group

### Exit Before Enter
When transitioning between states:
1. Old content exits (faster, less important)
2. Brief pause (optional, 50-100ms)
3. New content enters (slower, more attention)

### Hierarchy Timing
- **Primary elements** — Animate first, longer duration
- **Secondary elements** — Follow primary, shorter duration
- **Tertiary elements** — Last, subtle animation

### The 60-Frame Budget
At 60fps, you have ~16ms per frame. Complex choreography shouldn't exceed 1 second total, or users feel like they're waiting.

## 4. Implementation in React

### Staggered Animation

```tsx
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      when: 'afterChildren',
      staggerChildren: 0.05,
      staggerDirection: -1, // Reverse order on exit
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 }
  },
};

function ChoreographedList({ items }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
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

### Multi-Element Choreography

```tsx
function PageTransition({ children, pageKey }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial="enter"
        animate="center"
        exit="exit"
        variants={{
          enter: { opacity: 0 },
          center: {
            opacity: 1,
            transition: {
              when: 'beforeChildren',
              staggerChildren: 0.1,
            },
          },
          exit: {
            opacity: 0,
            transition: {
              when: 'afterChildren',
              staggerChildren: 0.05,
              staggerDirection: -1,
            },
          },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Child components use variants
function PageHeader({ title }) {
  return (
    <motion.header
      variants={{
        enter: { opacity: 0, y: -20 },
        center: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
      }}
    >
      <h1>{title}</h1>
    </motion.header>
  );
}

function PageContent({ children }) {
  return (
    <motion.main
      variants={{
        enter: { opacity: 0, y: 20 },
        center: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 10 },
      }}
    >
      {children}
    </motion.main>
  );
}
```

### Coordinated Modal Animation

```tsx
function ChoreographedModal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          initial="closed"
          animate="open"
          exit="closed"
        >
          {/* 1. Backdrop appears first */}
          <motion.div
            className="absolute inset-0 bg-black"
            variants={{
              closed: { opacity: 0 },
              open: { 
                opacity: 0.5,
                transition: { duration: 0.2 }
              },
            }}
            onClick={onClose}
          />
          
          {/* 2. Modal container scales in */}
          <motion.div
            className="absolute inset-4 max-w-lg mx-auto my-auto h-fit bg-white rounded-xl p-6"
            variants={{
              closed: { opacity: 0, scale: 0.95, y: 20 },
              open: { 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: { 
                  delay: 0.1, // After backdrop
                  duration: 0.25,
                  ease: [0.4, 0, 0.2, 1]
                }
              },
            }}
          >
            {/* 3. Title appears */}
            <motion.h2
              className="text-xl font-semibold mb-4"
              variants={{
                closed: { opacity: 0, y: 10 },
                open: { 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.2 }
                },
              }}
            >
              {title}
            </motion.h2>
            
            {/* 4. Content fades in last */}
            <motion.div
              variants={{
                closed: { opacity: 0 },
                open: { 
                  opacity: 1,
                  transition: { delay: 0.25 }
                },
              }}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## 5. React Patterns to Use

### Timeline Pattern

```tsx
type TimelineStep = {
  id: string;
  delay: number;
  duration: number;
  animate: any;
};

function useTimeline(steps: TimelineStep[]) {
  const [activeSteps, setActiveSteps] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(() => {
    setActiveSteps(new Set());
    setIsPlaying(true);

    steps.forEach(step => {
      setTimeout(() => {
        setActiveSteps(prev => new Set([...prev, step.id]));
      }, step.delay);
    });

    const totalDuration = Math.max(...steps.map(s => s.delay + s.duration));
    setTimeout(() => setIsPlaying(false), totalDuration);
  }, [steps]);

  return { activeSteps, isPlaying, play };
}

// Usage
function TimelineAnimation() {
  const { activeSteps, play } = useTimeline([
    { id: 'header', delay: 0, duration: 300, animate: { opacity: 1, y: 0 } },
    { id: 'card1', delay: 100, duration: 300, animate: { opacity: 1, y: 0 } },
    { id: 'card2', delay: 200, duration: 300, animate: { opacity: 1, y: 0 } },
    { id: 'card3', delay: 300, duration: 300, animate: { opacity: 1, y: 0 } },
  ]);

  return (
    <div>
      <button onClick={play}>Play Timeline</button>
      
      <motion.header
        animate={activeSteps.has('header') ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      >
        Header
      </motion.header>
      
      {/* Cards */}
    </div>
  );
}
```

### Choreography Context

```tsx
type ChoreographyConfig = {
  staggerDelay: number;
  enterDuration: number;
  exitDuration: number;
  direction: 'forward' | 'reverse';
};

const ChoreographyContext = createContext<ChoreographyConfig>({
  staggerDelay: 50,
  enterDuration: 300,
  exitDuration: 200,
  direction: 'forward',
});

function ChoreographyProvider({ 
  config,
  children 
}: { 
  config: Partial<ChoreographyConfig>;
  children: React.ReactNode;
}) {
  const value = {
    staggerDelay: 50,
    enterDuration: 300,
    exitDuration: 200,
    direction: 'forward' as const,
    ...config,
  };

  return (
    <ChoreographyContext.Provider value={value}>
      {children}
    </ChoreographyContext.Provider>
  );
}

function useChoreography(index: number) {
  const config = useContext(ChoreographyContext);
  
  return {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: (config.direction === 'forward' ? index : -index) * (config.staggerDelay / 1000),
        duration: config.enterDuration / 1000,
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        delay: (config.direction === 'forward' ? -index : index) * (config.staggerDelay / 1000),
        duration: config.exitDuration / 1000,
      }
    },
  };
}

// Usage
function AnimatedListItem({ index, children }) {
  const animation = useChoreography(index);
  
  return (
    <motion.div {...animation}>
      {children}
    </motion.div>
  );
}
```

### Radial Stagger Pattern

```tsx
function useRadialStagger(
  itemCount: number,
  centerIndex: number,
  delayPerDistance: number = 50
) {
  return useMemo(() => {
    return Array.from({ length: itemCount }, (_, i) => {
      const distance = Math.abs(i - centerIndex);
      return distance * delayPerDistance;
    });
  }, [itemCount, centerIndex, delayPerDistance]);
}

function RadialGrid({ items, focusIndex }) {
  const delays = useRadialStagger(items.length, focusIndex);

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            transition: { delay: delays[index] / 1000 }
          }}
        >
          {item.content}
        </motion.div>
      ))}
    </div>
  );
}
```

## 6. Important Hooks

### useStaggeredAnimation

```tsx
function useStaggeredAnimation<T>(
  items: T[],
  baseDelay: number = 0,
  staggerDelay: number = 50
) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    items.forEach((_, index) => {
      const delay = baseDelay + (index * staggerDelay);
      
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
      }, delay);
    });

    return () => setVisibleItems(new Set());
  }, [items, baseDelay, staggerDelay]);

  return visibleItems;
}

// Usage
function StaggeredCards({ cards }) {
  const visibleIndices = useStaggeredAnimation(cards, 100, 75);

  return (
    <div className="space-y-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, x: -20 }}
          animate={visibleIndices.has(index) 
            ? { opacity: 1, x: 0 } 
            : { opacity: 0, x: -20 }
          }
        >
          <Card {...card} />
        </motion.div>
      ))}
    </div>
  );
}
```

### useOrchestration

```tsx
type OrchestrationPhase = 'idle' | 'exiting' | 'waiting' | 'entering' | 'complete';

function useOrchestration(deps: any[]) {
  const [phase, setPhase] = useState<OrchestrationPhase>('complete');
  const prevDeps = usePrevious(deps);

  useEffect(() => {
    if (JSON.stringify(deps) !== JSON.stringify(prevDeps)) {
      // Start exit phase
      setPhase('exiting');
      
      // After exit, brief pause
      setTimeout(() => setPhase('waiting'), 200);
      
      // After pause, start enter
      setTimeout(() => setPhase('entering'), 250);
      
      // Complete
      setTimeout(() => setPhase('complete'), 550);
    }
  }, [deps, prevDeps]);

  return phase;
}

// Usage
function OrchestrationContainer({ currentView }) {
  const phase = useOrchestration([currentView]);

  return (
    <motion.div
      animate={{
        opacity: phase === 'exiting' || phase === 'waiting' ? 0 : 1,
        y: phase === 'exiting' ? -20 : phase === 'entering' ? 20 : 0,
      }}
    >
      {currentView}
    </motion.div>
  );
}
```

## 7. Animation Considerations

### Hierarchy-Based Choreography

```tsx
const choreographyLevels = {
  // Level 1: Most important, animates first
  primary: {
    delay: 0,
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  },
  // Level 2: Secondary, follows primary
  secondary: {
    delay: 0.1,
    duration: 0.25,
    ease: [0.4, 0, 0.2, 1],
  },
  // Level 3: Tertiary, last to animate
  tertiary: {
    delay: 0.2,
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1],
  },
};

function DashboardPage() {
  return (
    <motion.div initial="hidden" animate="visible">
      {/* Primary: Main heading */}
      <motion.h1
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: choreographyLevels.primary
          },
        }}
      >
        Dashboard
      </motion.h1>
      
      {/* Secondary: Main stats */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: choreographyLevels.secondary
          },
        }}
      >
        <StatsRow />
      </motion.div>
      
      {/* Tertiary: Supporting content */}
      <motion.aside
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: choreographyLevels.tertiary
          },
        }}
      >
        <ActivityFeed />
      </motion.aside>
    </motion.div>
  );
}
```

### Exit/Enter Coordination

```tsx
function ViewTransition({ view }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial="enter"
        animate="center"  
        exit="exit"
        variants={{
          enter: { 
            opacity: 0, 
            x: 50,
            transition: { duration: 0.3 }
          },
          center: { 
            opacity: 1, 
            x: 0,
            transition: { 
              duration: 0.3,
              when: 'beforeChildren',
              staggerChildren: 0.1,
            }
          },
          exit: { 
            opacity: 0, 
            x: -50,
            transition: { 
              duration: 0.2,
              when: 'afterChildren',
            }
          },
        }}
      >
        {/* View content with child variants */}
      </motion.div>
    </AnimatePresence>
  );
}
```

## 8. Performance Considerations

### Limit Simultaneous Animations

```tsx
// ❌ Too many simultaneous animations
{items.map((item, i) => (
  <motion.div
    key={item.id}
    animate={{ x: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
    transition={{ repeat: Infinity, duration: 2 }}
  />
))}

// ✅ Stagger reduces concurrent animations
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: i * 0.05 }} // Spread out over time
  />
))}
```

### Cap Total Animation Duration

```tsx
function calculateStaggerDelay(index: number, totalItems: number): number {
  const maxTotalDuration = 500; // Max 500ms for entire sequence
  const maxStaggerDelay = 100; // Max 100ms between items
  
  // Calculate ideal stagger
  const idealDelay = maxTotalDuration / totalItems;
  
  // Cap individual delay
  const cappedDelay = Math.min(idealDelay, maxStaggerDelay);
  
  return index * cappedDelay;
}
```

### Use Layout Animations Sparingly

```tsx
// ❌ Layout animations on many elements during choreography
<motion.div layout>
  {items.map(item => (
    <motion.div key={item.id} layout>
      {item.content}
    </motion.div>
  ))}
</motion.div>

// ✅ Layout animation only on container
<motion.div layout>
  {items.map(item => (
    <div key={item.id}>
      {item.content}
    </div>
  ))}
</motion.div>
```

## 9. Common Mistakes

### 1. Everything Animates at Once
**Problem:** All elements start animating simultaneously.
**Solution:** Use stagger delays to create sequence.

### 2. Too Long Total Duration
**Problem:** Choreography takes 2+ seconds.
**Solution:** Keep total choreography under 600ms.

### 3. No Visual Hierarchy
**Problem:** All elements have the same animation importance.
**Solution:** Important elements animate first/longer.

### 4. Unrelated Stagger Direction
**Problem:** Stagger direction doesn't match content flow.
**Solution:** Match stagger to reading direction or visual flow.

### 5. Exit Neglected
**Problem:** Great entrance, abrupt exit.
**Solution:** Choreograph exits with reversed stagger.

## 10. Practice Exercises

### Exercise 1: List Stagger
Create a list that staggers in from top to bottom on enter, bottom to top on exit.

### Exercise 2: Modal Choreography
Build a modal with sequenced: backdrop → container → title → content → buttons.

### Exercise 3: Page Transition
Create a page transition where header exits up, content fades, new content enters.

### Exercise 4: Dashboard Reveal
Build a dashboard where stats animate first, then charts, then activity feed.

### Exercise 5: Hero Section
Choreograph a hero section: background → headline → subheadline → CTA.

## 11. Advanced Topics

- **GSAP Timeline** — Advanced timeline-based choreography
- **Motion Curves** — Non-linear stagger progressions
- **Orchestration Libraries** — Tools for complex sequences
- **Interruptible Choreography** — Handling user actions mid-sequence
- **Sound Sync** — Timing animations to audio
- **Scroll-Based Choreography** — Triggering sequences on scroll
