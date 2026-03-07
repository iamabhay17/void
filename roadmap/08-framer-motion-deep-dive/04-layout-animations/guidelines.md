# Layout Animations Deep Dive

## 1. Concept Overview

Layout animations in Framer Motion automatically animate elements when their layout changes. This includes position changes, size changes, and reordering. The `layout` prop enables complex animations that would otherwise require manual FLIP (First, Last, Invert, Play) calculations.

Key capabilities:
- **Position animation** — Elements smoothly move to new positions
- **Size animation** — Width/height changes animate
- **Shared layout** — Elements morph between different components
- **Reorder animation** — List items animate during reorder

```tsx
<motion.div layout>
  {/* Any layout change animates automatically */}
</motion.div>
```

## 2. Why This Matters for Design Engineers

Layout animations create:
- Fluid list reordering
- Smooth accordion expansion
- Seamless card-to-modal transitions
- Polished filter/sort animations

As a Design Engineer, you must:
- Know when layout animations help vs. hurt
- Understand the layout projection system
- Handle edge cases (text, scroll, portals)
- Optimize for performance

## 3. Key Principles / Mental Models

### Layout Projection
Framer Motion uses "layout projection" instead of actual layout animation:
1. Measure element's current bounding box
2. Let CSS layout happen instantly
3. Measure new bounding box
4. Apply inverse transform to make it appear in old position
5. Animate transform to zero (reaching new position)

### Layout Prop Options
```tsx
layout={true}        // Animate position AND size
layout="position"    // Only animate position changes
layout="size"        // Only animate size changes
layout="preserve-aspect" // Maintain aspect ratio during animation
```

### LayoutId for Shared Elements
```tsx
// Same layoutId = same element across renders
<motion.div layoutId="hero-image" />

// When one unmounts and another mounts with same layoutId,
// they animate between positions
```

## 4. Implementation in React

### Basic Layout Animation

```tsx
function ReorderList({ items }: { items: Item[] }) {
  return (
    <div className="space-y-2">
      {items.map(item => (
        <motion.div
          key={item.id}
          layout
          className="p-4 bg-white rounded-lg shadow"
        >
          {item.content}
        </motion.div>
      ))}
    </div>
  );
}
```

### Layout with Enter/Exit

```tsx
function FilterableGrid({ items, filter }: Props) {
  const filteredItems = items.filter(item => 
    filter === 'all' || item.category === filter
  );

  return (
    <motion.div layout className="grid grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {filteredItems.map(item => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              layout: { type: 'spring', stiffness: 300, damping: 25 },
              opacity: { duration: 0.2 },
            }}
          >
            <Card item={item} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
```

### Accordion with Layout

```tsx
function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          layout
          className="bg-white rounded-lg overflow-hidden"
          transition={{ layout: { duration: 0.3 } }}
        >
          <motion.button
            layout="position"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full p-4 text-left flex justify-between items-center"
          >
            <span>{item.title}</span>
            <motion.span
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▼
            </motion.span>
          </motion.button>
          
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 pt-0">{item.content}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
```

### Shared Layout Transition

```tsx
function CardGrid() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedCard = cards.find(c => c.id === selectedId);

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {cards.map(card => (
          <motion.div
            key={card.id}
            layoutId={`card-${card.id}`}
            onClick={() => setSelectedId(card.id)}
            className="p-4 bg-white rounded-lg cursor-pointer"
          >
            <motion.img
              layoutId={`image-${card.id}`}
              src={card.image}
              className="w-full aspect-video object-cover rounded"
            />
            <motion.h2 layoutId={`title-${card.id}`} className="mt-2">
              {card.title}
            </motion.h2>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedCard && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              layoutId={`card-${selectedCard.id}`}
              className="fixed inset-8 z-50 bg-white rounded-xl p-6 overflow-auto"
            >
              <motion.img
                layoutId={`image-${selectedCard.id}`}
                src={selectedCard.image}
                className="w-full aspect-video object-cover rounded-lg"
              />
              <motion.h2 
                layoutId={`title-${selectedCard.id}`}
                className="text-2xl mt-4"
              >
                {selectedCard.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {selectedCard.description}
              </motion.p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

## 5. React Patterns to Use

### LayoutGroup for Coordination

```tsx
import { LayoutGroup } from 'framer-motion';

function CoordinatedLayout() {
  return (
    <LayoutGroup>
      {/* Elements in the same LayoutGroup coordinate their animations */}
      <FilterTabs />
      <CardGrid />
    </LayoutGroup>
  );
}
```

### Layout with Drag Reorder

```tsx
import { Reorder } from 'framer-motion';

function DraggableList() {
  const [items, setItems] = useState(initialItems);

  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={setItems}
      className="space-y-2"
    >
      {items.map(item => (
        <Reorder.Item
          key={item.id}
          value={item}
          className="p-4 bg-white rounded-lg cursor-grab active:cursor-grabbing"
          whileDrag={{
            scale: 1.02,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}
        >
          {item.content}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
```

### Conditional Layout ID

```tsx
function ConditionalSharedLayout({ isModal }: { isModal: boolean }) {
  const layoutId = isModal ? 'modal-card' : undefined;

  return (
    <motion.div
      // Only participate in shared layout when in modal mode
      layoutId={layoutId}
      layout={!isModal}
    >
      Content
    </motion.div>
  );
}
```

### Layout Transition Configuration

```tsx
const layoutTransition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
  mass: 1,
};

function ConfiguredLayout() {
  return (
    <motion.div
      layout
      transition={{
        layout: layoutTransition,
        // Different transition for other properties
        opacity: { duration: 0.2 },
      }}
    >
      Content
    </motion.div>
  );
}
```

## 6. Important Hooks

### useLayoutEffect for Measurement

```tsx
function MeasureAndAnimate() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');

  useLayoutEffect(() => {
    if (ref.current) {
      setHeight(ref.current.scrollHeight);
    }
  }, [children]);

  return (
    <motion.div
      animate={{ height }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div ref={ref}>{children}</div>
    </motion.div>
  );
}
```

### layoutDependency

```tsx
function DependentLayout({ data }: { data: Data[] }) {
  // Only recalculate layout when data.length changes
  return (
    <motion.div
      layout
      layoutDependency={data.length}
    >
      {/* Content */}
    </motion.div>
  );
}
```

## 7. Animation Considerations

### Text and Layout

```tsx
// ❌ Text can distort during layout animation
<motion.p layout>
  This text might stretch weirdly
</motion.p>

// ✅ Use layout="position" for text
<motion.p layout="position">
  This text moves smoothly
</motion.p>

// ✅ Or wrap text separately
<motion.div layout>
  <span>Static text inside animating container</span>
</motion.div>
```

### Border Radius Correction

```tsx
function RoundedLayoutCard() {
  return (
    <motion.div
      layout
      // Framer Motion automatically corrects border-radius
      // during scale-based layout animations
      className="rounded-xl"
      style={{ borderRadius: 16 }} // Inline for animation accuracy
    >
      Content
    </motion.div>
  );
}
```

### Layout with Scroll

```tsx
function ScrollAwareLayout() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={containerRef}
      layout
      layoutScroll // Enable scroll-aware layout
      className="h-96 overflow-y-auto"
    >
      {items.map(item => (
        <motion.div key={item.id} layout>
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

## 8. Performance Considerations

### Use layout="position" When Possible

```tsx
// ❌ Animates position AND size
<motion.div layout>

// ✅ Only animates position (cheaper)
<motion.div layout="position">
```

### Avoid Layout on Deeply Nested Elements

```tsx
// ❌ Every element participates in layout
<motion.div layout>
  <motion.div layout>
    <motion.div layout>
      <motion.div layout>...</motion.div>
    </motion.div>
  </motion.div>
</motion.div>

// ✅ Only key elements animate
<motion.div layout>
  <div>
    <div>
      <motion.div layout>Key animated element</motion.div>
    </div>
  </div>
</motion.div>
```

### LayoutId Uniqueness

```tsx
// ❌ Duplicate layoutIds cause issues
{items.map(item => (
  <motion.div layoutId="card">...</motion.div>
))}

// ✅ Unique layoutIds
{items.map(item => (
  <motion.div layoutId={`card-${item.id}`}>...</motion.div>
))}
```

## 9. Common Mistakes

### 1. Forgetting Layout on Parent
**Problem:** Child layout animation looks broken.
**Solution:** Parent containers often need layout too.

### 2. Layout on Fragments
**Problem:** Layout doesn't work on React fragments.
**Solution:** Use actual DOM element or wrapper.

### 3. Portal Layout Issues
**Problem:** Elements in portals don't animate with siblings.
**Solution:** Keep related elements in same DOM tree or use layoutId.

### 4. Infinite Layout Loops
**Problem:** Layout triggers measure triggers layout...
**Solution:** Use layoutDependency or restructure.

### 5. Flash of Unstyled Content
**Problem:** Layout snaps before animation.
**Solution:** Ensure initial state is set correctly.

## 10. Practice Exercises

### Exercise 1: Masonry Grid
Build a masonry layout that animates when items are added/removed.

### Exercise 2: Kanban Board
Create a drag-and-drop kanban with smooth cross-column transitions.

### Exercise 3: Image Gallery
Build a gallery with lightbox using layoutId shared elements.

### Exercise 4: Tab Navigation
Create tabs with content that animates between tab switches.

### Exercise 5: Expandable Cards
Build cards that expand to show more content with smooth layout.

## 11. Advanced Topics

- **Layout Projection Internals** — How Framer Motion calculates transforms
- **Cross-Component Layout** — Sharing layout between distant elements
- **Layout and Scroll Restoration** — Preventing scroll jumps
- **Custom Layout Animations** — Manual FLIP implementation
- **Performance Profiling** — Measuring layout animation cost
- **Layout with Virtual Lists** — Combining with virtualization
