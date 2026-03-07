# Progressive Disclosure

## 1. Concept Overview

Progressive disclosure is the practice of revealing information and options gradually, showing only what's relevant at each stage. It reduces cognitive load by hiding complexity until it's needed.

Levels of progressive disclosure:
- **Primary** — Essential content visible immediately
- **Secondary** — Available on interaction (hover, click)
- **Tertiary** — Accessible through navigation (separate page, modal)
- **Hidden** — Only shown in specific contexts

Examples:
- "Show more" buttons
- Expandable FAQs
- Advanced settings behind toggles
- Hover-revealed actions
- Multi-step forms

## 2. Why This Matters for Design Engineers

Progressive disclosure directly impacts:
- **First impressions** — Clean interfaces feel more approachable
- **Task completion** — Users focus on what matters
- **Learning curve** — New users aren't overwhelmed
- **Expert efficiency** — Power features remain accessible

As a Design Engineer, you must:
- Determine what to show immediately vs. hide
- Create smooth reveal animations
- Maintain context during reveals
- Handle complex nested disclosures

Linear's interface is a masterclass in progressive disclosure — powerful features exist but only appear when contextually relevant.

## 3. Key Principles / Mental Models

### Show the Tip, Hide the Iceberg
Display 20% of options that handle 80% of use cases. Keep the other 80% accessible but hidden.

### Context-Triggered Revelation
Reveal options when context makes them relevant:
- Hover a row → show row actions
- Select items → show bulk actions
- Start typing → show autocomplete

### Graceful Escalation
Information hierarchy from immediate to buried:
1. Visible (always shown)
2. Discoverable (revealed on interaction)
3. Navigable (requires navigation)
4. Searchable (requires search)

### Maintain Context
When revealing content, don't disorient the user:
- Animate in place when possible
- Keep triggering element visible
- Allow easy return to previous state

## 4. Implementation in React

### Expandable Section

```tsx
import { motion, AnimatePresence } from 'framer-motion';

function ExpandableSection({ 
  title, 
  children, 
  defaultExpanded = false 
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left"
        aria-expanded={isExpanded}
      >
        <span className="font-medium">{title}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-5 h-5" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Hover-Reveal Actions

```tsx
function ListItem({ item, onEdit, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="flex items-center justify-between p-4 border-b"
    >
      <div>
        <h4 className="font-medium">{item.name}</h4>
        <p className="text-sm text-gray-500">{item.description}</p>
      </div>
      
      {/* Actions revealed on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="flex gap-2"
          >
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <EditIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

### Show More / Less

```tsx
function TruncatedList({ 
  items, 
  initialCount = 3, 
  renderItem 
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? items : items.slice(0, initialCount);
  const hasMore = items.length > initialCount;

  return (
    <div>
      <AnimatePresence mode="popLayout">
        {visibleItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.05 }}
          >
            {renderItem(item)}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {hasMore && (
        <motion.button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-blue-600 hover:text-blue-700"
          whileHover={{ x: 4 }}
        >
          {showAll 
            ? 'Show less' 
            : `Show ${items.length - initialCount} more`
          }
        </motion.button>
      )}
    </div>
  );
}
```

### Multi-Step Form

```tsx
function MultiStepForm({ steps, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div>
      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      
      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">
            {steps[currentStep].title}
          </h2>
          
          <CurrentStepComponent
            data={formData}
            onUpdate={(data) => setFormData({ ...formData, ...data })}
            onNext={() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
              } else {
                onComplete(formData);
              }
            }}
            onBack={() => setCurrentStep(Math.max(0, currentStep - 1))}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

## 5. React Patterns to Use

### Disclosure Context

```tsx
const DisclosureContext = createContext<{
  openItems: Set<string>;
  toggle: (id: string) => void;
  allowMultiple: boolean;
} | null>(null);

function DisclosureGroup({ 
  allowMultiple = false, 
  children 
}) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setOpenItems(prev => {
      const next = new Set(allowMultiple ? prev : []);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, [allowMultiple]);

  return (
    <DisclosureContext.Provider value={{ openItems, toggle, allowMultiple }}>
      <div className="space-y-2">{children}</div>
    </DisclosureContext.Provider>
  );
}

function DisclosureItem({ id, title, children }) {
  const { openItems, toggle } = useContext(DisclosureContext)!;
  const isOpen = openItems.has(id);

  return (
    <div>
      <button onClick={() => toggle(id)}>{title}</button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Usage
<DisclosureGroup allowMultiple>
  <DisclosureItem id="faq-1" title="Question 1">
    Answer 1
  </DisclosureItem>
  <DisclosureItem id="faq-2" title="Question 2">
    Answer 2
  </DisclosureItem>
</DisclosureGroup>
```

### Lazy Loaded Disclosure

```tsx
function LazyDisclosure({ 
  title, 
  loadContent 
}: {
  title: string;
  loadContent: () => Promise<React.ReactNode>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<React.ReactNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = async () => {
    setIsOpen(true);
    
    if (!content) {
      setIsLoading(true);
      const loaded = await loadContent();
      setContent(loaded);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleOpen}>{title}</button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
          >
            {isLoading ? <Spinner /> : content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## 6. Important Hooks

### useDisclosure

```tsx
function useDisclosure(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}

// Usage
function FAQ({ question, answer }) {
  const { isOpen, toggle } = useDisclosure();

  return (
    <div>
      <button onClick={toggle}>{question}</button>
      {isOpen && <p>{answer}</p>}
    </div>
  );
}
```

### useMeasure for Smooth Height Animations

```tsx
import { useMeasure } from '@react-hookz/web';

function SmoothExpand({ isOpen, children }) {
  const [ref, { height }] = useMeasure<HTMLDivElement>();

  return (
    <motion.div
      animate={{ height: isOpen ? height : 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div ref={ref}>{children}</div>
    </motion.div>
  );
}
```

### useStepForm

```tsx
function useStepForm<T extends Record<string, any>>(
  initialData: T,
  steps: number
) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState(initialData);

  const next = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, steps - 1));
  }, [steps]);

  const back = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goTo = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, steps - 1)));
  }, [steps]);

  const updateData = useCallback((newData: Partial<T>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  return {
    currentStep,
    data,
    next,
    back,
    goTo,
    updateData,
    isFirst: currentStep === 0,
    isLast: currentStep === steps - 1,
    progress: (currentStep + 1) / steps,
  };
}
```

## 7. Animation Considerations

### Height Auto Animation

```tsx
// Framer Motion handles height: auto
<motion.div
  initial={{ height: 0 }}
  animate={{ height: 'auto' }}
  exit={{ height: 0 }}
  transition={{ duration: 0.2 }}
>
  {content}
</motion.div>
```

### Staggered Reveals

```tsx
function RevealList({ items, isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={{
            visible: {
              transition: { staggerChildren: 0.05 },
            },
          }}
        >
          {items.map(item => (
            <motion.div
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              {item.content}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Inline Expand Animation

```tsx
function InlineDetails({ summary, details }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="inline">
      <span>{summary}</span>
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-1 text-blue-600"
        whileHover={{ x: 2 }}
      >
        {isExpanded ? 'less' : 'more'}
      </motion.button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="inline-block overflow-hidden"
          >
            {' '}{details}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## 8. Performance Considerations

### Lazy Load Hidden Content

```tsx
function LazySection({ isOpen, loadComponent }) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (isOpen && !Component) {
      loadComponent().then(setComponent);
    }
  }, [isOpen, Component, loadComponent]);

  if (!isOpen) return null;
  if (!Component) return <Spinner />;
  
  return <Component />;
}

// Usage
<LazySection 
  isOpen={showAdvanced} 
  loadComponent={() => import('./AdvancedSettings').then(m => m.default)}
/>
```

### Virtualize Large Revealed Lists

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedExpandedList({ items, isExpanded }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          ref={parentRef}
          initial={{ height: 0 }}
          animate={{ height: 300 }}
          exit={{ height: 0 }}
          className="overflow-auto"
        >
          <div style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map(virtualItem => (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: virtualItem.start,
                  height: virtualItem.size,
                }}
              >
                {items[virtualItem.index].content}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## 9. Common Mistakes

### 1. Hiding Too Much
**Problem:** Essential information is hidden behind clicks.
**Solution:** Show primary info immediately. Hide only secondary details.

### 2. No Loading States
**Problem:** "Show more" clicks with no feedback.
**Solution:** Show loading state during content fetch.

### 3. Lost Scroll Position
**Problem:** Expanding content jumps user's viewport.
**Solution:** Scroll into view smoothly or maintain position.

### 4. Inconsistent Triggers
**Problem:** Some expand on click, others on hover.
**Solution:** Use consistent interaction patterns.

### 5. No Way Back
**Problem:** Content expands but can't be collapsed.
**Solution:** Always provide collapse option.

## 10. Practice Exercises

### Exercise 1: FAQ Accordion
Build an FAQ section with single-open accordion behavior.

### Exercise 2: Read More
Create a text component that truncates and reveals full content.

### Exercise 3: Multi-Step Wizard
Build a form wizard with animated step transitions.

### Exercise 4: Hover Menu
Create a navigation with hover-revealed dropdowns.

### Exercise 5: Nested Disclosure
Build a file tree with nested expand/collapse.

## 11. Advanced Topics

- **Search-Based Disclosure** — Revealing content matching search
- **Context-Aware Disclosure** — Smart defaults based on user behavior
- **Disclosure Analytics** — Tracking what users expand
- **Keyboard Navigation** — Arrow keys for accordion navigation
- **Mobile Disclosure Patterns** — Touch-optimized reveals
- **Animation Physics** — Spring-based disclosure animations
