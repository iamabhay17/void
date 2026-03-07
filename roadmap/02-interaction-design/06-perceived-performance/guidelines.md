# Perceived Performance

## 1. Concept Overview

Perceived performance is how fast an interface *feels*, regardless of actual load times. Two apps with identical performance metrics can feel completely different based on how they communicate progress and responsiveness.

Key techniques:
- **Instant feedback** — Acknowledge actions immediately
- **Skeleton screens** — Show structure before content
- **Optimistic updates** — Show expected result before confirmation
- **Progressive loading** — Show content as it loads
- **Animation as distraction** — Engaging animations during waits
- **Preloading** — Load content before it's needed

Perceived performance is often more important than actual performance for user satisfaction.

## 2. Why This Matters for Design Engineers

Users don't measure milliseconds — they feel responsiveness:
- A 3-second load with a progress bar feels shorter than 2 seconds with a spinner
- Instant visual feedback makes 500ms feel instant
- Skeleton screens make pages feel faster even if actual load time is unchanged

As a Design Engineer, you must:
- Respond to user input within 100ms
- Use appropriate loading states
- Implement optimistic UI where possible
- Create engaging loading experiences

Stripe's checkout feels instant because every click produces immediate feedback, even when network requests are in flight.

## 3. Key Principles / Mental Models

### The 100ms Rule
Any response under 100ms feels instant. Between 100ms-1000ms feels connected. Over 1000ms feels slow.

### Progressive Skeleton Loading
Show the page structure immediately, then fill in content:
1. Skeleton appears instantly
2. Critical content loads first
3. Secondary content follows
4. Images and media load last

### Optimistic UI
Assume success and show it immediately:
1. User takes action
2. UI updates as if it succeeded
3. Server processes in background
4. If fails, revert and show error

### Progress Indication Hierarchy
- **Indeterminate** — Unknown duration (spinner)
- **Determinate** — Known duration (progress bar)
- **Stepped** — Discrete steps (1 of 4 uploading)

Use determinate whenever possible — it feels faster.

## 4. Implementation in React

### Skeleton Loader

```tsx
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

function CardList({ isLoading, cards }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cards.map(card => (
        <Card key={card.id} {...card} />
      ))}
    </div>
  );
}
```

### Optimistic Update

```tsx
function TodoItem({ todo, onToggle }) {
  const [optimisticComplete, setOptimisticComplete] = useState(todo.complete);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    const newValue = !optimisticComplete;
    
    // Optimistic update
    setOptimisticComplete(newValue);
    setIsPending(true);

    try {
      await onToggle(todo.id, newValue);
    } catch (error) {
      // Revert on failure
      setOptimisticComplete(!newValue);
      toast.error('Failed to update');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.div
      animate={{ opacity: isPending ? 0.7 : 1 }}
      className="flex items-center gap-3 p-3"
    >
      <motion.button
        onClick={handleToggle}
        animate={{ scale: optimisticComplete ? 1 : 0.9 }}
        transition={{ type: 'spring', stiffness: 500 }}
      >
        <CheckCircle 
          className={optimisticComplete ? 'text-green-500' : 'text-gray-300'} 
        />
      </motion.button>
      <span className={optimisticComplete ? 'line-through text-gray-400' : ''}>
        {todo.text}
      </span>
    </motion.div>
  );
}
```

### Progressive Image Loading

```tsx
function ProgressiveImage({ src, placeholder, alt }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div className="relative overflow-hidden">
      <motion.img
        src={currentSrc}
        alt={alt}
        animate={{ 
          filter: isLoaded ? 'blur(0px)' : 'blur(20px)',
          scale: isLoaded ? 1 : 1.1,
        }}
        transition={{ duration: 0.3 }}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
```

### Button with Instant Feedback

```tsx
function SubmitButton({ onClick, children }) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleClick = async () => {
    setState('loading');
    
    try {
      await onClick();
      setState('success');
      setTimeout(() => setState('idle'), 1500);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 1500);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={state === 'loading'}
      className={cn(
        'relative px-6 py-2 rounded-md font-medium overflow-hidden',
        'transition-colors duration-150',
        state === 'idle' && 'bg-blue-600 hover:bg-blue-700 text-white',
        state === 'loading' && 'bg-blue-600 text-white cursor-wait',
        state === 'success' && 'bg-green-600 text-white',
        state === 'error' && 'bg-red-600 text-white',
      )}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-center gap-2"
        >
          {state === 'idle' && children}
          {state === 'loading' && (
            <>
              <Spinner className="w-4 h-4" />
              <span>Processing...</span>
            </>
          )}
          {state === 'success' && (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>Done!</span>
            </>
          )}
          {state === 'error' && (
            <>
              <XIcon className="w-4 h-4" />
              <span>Failed</span>
            </>
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
```

## 5. React Patterns to Use

### Suspense for Loading States

```tsx
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

// With nested suspense boundaries
function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Suspense fallback={<WidgetSkeleton />}>
        <StatsWidget />
      </Suspense>
      <Suspense fallback={<WidgetSkeleton />}>
        <ChartWidget />
      </Suspense>
      <Suspense fallback={<WidgetSkeleton />}>
        <ActivityWidget />
      </Suspense>
    </div>
  );
}
```

### useTransition for Non-Blocking Updates

```tsx
import { useTransition } from 'react';

function SearchResults({ query }) {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);

  const handleSearch = (newQuery) => {
    // Mark as non-urgent - won't block input
    startTransition(() => {
      const filtered = expensiveFilter(allItems, newQuery);
      setResults(filtered);
    });
  };

  return (
    <div>
      <input onChange={e => handleSearch(e.target.value)} />
      
      <div className={isPending ? 'opacity-60' : ''}>
        {results.map(result => (
          <ResultItem key={result.id} {...result} />
        ))}
      </div>
    </div>
  );
}
```

### Streaming Data Pattern

```tsx
function StreamingList({ fetchItems }) {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stream = fetchItems();
    
    stream.on('data', (item) => {
      setItems(prev => [...prev, item]);
    });
    
    stream.on('end', () => {
      setIsLoading(false);
    });

    return () => stream.cancel();
  }, [fetchItems]);

  return (
    <div>
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.05, 0.5) }}
        >
          <ItemCard {...item} />
        </motion.div>
      ))}
      
      {isLoading && <LoadingMore />}
    </div>
  );
}
```

## 6. Important Hooks

### useOptimistic (React 19+)

```tsx
import { useOptimistic } from 'react';

function Messages({ messages, sendMessage }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, { ...newMessage, pending: true }]
  );

  const handleSend = async (text) => {
    const message = { id: Date.now(), text, pending: true };
    addOptimisticMessage(message);
    await sendMessage(text);
  };

  return (
    <div>
      {optimisticMessages.map(message => (
        <div 
          key={message.id}
          className={message.pending ? 'opacity-50' : ''}
        >
          {message.text}
        </div>
      ))}
    </div>
  );
}
```

### useProgressiveLoad

```tsx
function useProgressiveLoad<T>(
  items: T[],
  batchSize: number = 10,
  delay: number = 100
) {
  const [visibleCount, setVisibleCount] = useState(batchSize);

  useEffect(() => {
    if (visibleCount < items.length) {
      const timer = setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + batchSize, items.length));
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [visibleCount, items.length, batchSize, delay]);

  return {
    visibleItems: items.slice(0, visibleCount),
    isComplete: visibleCount >= items.length,
    progress: visibleCount / items.length,
  };
}

// Usage
function ItemList({ items }) {
  const { visibleItems, isComplete, progress } = useProgressiveLoad(items);

  return (
    <div>
      {visibleItems.map(item => (
        <Item key={item.id} {...item} />
      ))}
      {!isComplete && <ProgressBar value={progress} />}
    </div>
  );
}
```

### useDeferredValue

```tsx
import { useDeferredValue } from 'react';

function SearchResults({ query }) {
  // Deferred value can lag behind actual value during updates
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  const results = useMemo(
    () => expensiveSearch(deferredQuery),
    [deferredQuery]
  );

  return (
    <div className={isStale ? 'opacity-60' : ''}>
      {results.map(result => (
        <Result key={result.id} {...result} />
      ))}
    </div>
  );
}
```

## 7. Animation Considerations

### Skeleton Shimmer Effect

```css
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.skeleton {
  position: relative;
  overflow: hidden;
  background: #e5e7eb;
}

.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 1.5s infinite;
}
```

### Content Fade In

```tsx
function FadeInContent({ isLoaded, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

### Progress Ring

```tsx
function ProgressRing({ progress, size = 40 }) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress * circumference);

  return (
    <svg width={size} height={size}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={4}
      />
      
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          transformOrigin: 'center',
          transform: 'rotate(-90deg)',
        }}
      />
    </svg>
  );
}
```

## 8. Performance Considerations

### Preload on Hover

```tsx
function PreloadLink({ href, children }) {
  const prefetch = useCallback(() => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }, [href]);

  return (
    <Link 
      href={href}
      onMouseEnter={prefetch}
      onFocus={prefetch}
    >
      {children}
    </Link>
  );
}
```

### Intersection Observer for Lazy Loading

```tsx
function LazyImage({ src, alt }) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load 200px before visible
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isInView ? (
        <img src={src} alt={alt} />
      ) : (
        <Skeleton className="w-full h-48" />
      )}
    </div>
  );
}
```

### Priority Loading

```tsx
function PriorityContent({ priority, children }) {
  const [shouldRender, setShouldRender] = useState(priority === 'high');

  useEffect(() => {
    if (priority === 'low') {
      // Load low priority content after high priority is done
      requestIdleCallback(() => setShouldRender(true));
    } else if (priority === 'medium') {
      // Load medium priority after a short delay
      setTimeout(() => setShouldRender(true), 100);
    }
  }, [priority]);

  return shouldRender ? children : <Skeleton />;
}
```

## 9. Common Mistakes

### 1. Spinner for Everything
**Problem:** Using spinner for all loading states.
**Solution:** Use skeletons for content, spinners for actions.

### 2. No Optimistic Updates
**Problem:** Waiting for server before updating UI.
**Solution:** Update optimistically, revert on error.

### 3. Blocking the Main Thread
**Problem:** Expensive operations freeze UI.
**Solution:** Use Web Workers, chunking, or requestIdleCallback.

### 4. No Loading Prioritization
**Problem:** Everything loads at once.
**Solution:** Load above-the-fold content first.

### 5. Jarring Loading Transitions
**Problem:** Content pops in abruptly.
**Solution:** Fade and animate content appearance.

## 10. Practice Exercises

### Exercise 1: Skeleton System
Build a complete skeleton system matching your component library.

### Exercise 2: Optimistic Todo
Create a todo list with optimistic add, toggle, and delete.

### Exercise 3: Progressive Image Gallery
Build an image gallery with progressive loading and blur-up effect.

### Exercise 4: Streaming Chat
Implement a chat interface that shows messages as they arrive.

### Exercise 5: Form with Inline Validation
Build a form with instant validation feedback and optimistic submit.

## 11. Advanced Topics

- **Streaming SSR** — React server-side streaming
- **Partial Hydration** — Islands architecture for faster interactivity
- **Service Workers** — Offline-first and instant loading
- **Predictive Prefetching** — ML-based content preloading
- **Resource Hints** — Preload, prefetch, preconnect
- **Core Web Vitals** — LCP, FID, CLS optimization
