# Layout Animations

## 1. Concept Overview

Layout animations automatically animate changes in an element's position and size caused by layout shifts. Instead of elements "jumping" to new positions, they smoothly transition.

Key use cases:
- Reordering lists
- Filtering/sorting content
- Accordion expansion
- Adding/removing items
- Responsive layout changes

Framer Motion's `layout` prop handles the complex math of FLIP animations automatically.

## 2. Why This Matters for Design Engineers

Layout animations create fluid, understandable interfaces:
- Users can track where items moved
- Changes feel intentional, not glitchy
- Spatial relationships remain clear
- The interface feels alive

As a Design Engineer, you must:
- Understand when layout animations help vs. hurt
- Configure layout animations for performance
- Handle edge cases (portals, scroll position)
- Combine with enter/exit animations

## 3. Key Principles / Mental Models

### The FLIP Technique
**F**irst — Record initial position
**L**ast — Move element to final position
**I**nvert — Calculate and apply inverse transform
**P**lay — Animate the transform to zero

Framer Motion handles all of this automatically:
```tsx
<motion.div layout>
  {/* Position changes are animated */}
</motion.div>
```

### Layout Animation Scope
```tsx
layout={true}      // Animate position AND size
layout="position"  // Only animate position changes
layout="size"      // Only animate size changes
layoutId="unique"  // Shared layout animation across components
```

### Layout Groups
Elements should be grouped when their layouts depend on each other:
```tsx
<LayoutGroup>
  <motion.div layout />
  <motion.div layout />
</LayoutGroup>
```

## 4. Implementation in React

### Basic Layout Animation

```tsx
import { motion } from 'framer-motion';

function ReorderableList({ items }: { items: Item[] }) {
  return (
    <div className="space-y-2">
      {items.map(item => (
        <motion.div
          key={item.id}
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="p-4 bg-white rounded-lg shadow"
        >
          {item.content}
        </motion.div>
      ))}
    </div>
  );
}
```

### Filtering with Layout Animation

```tsx
function FilterableGrid({ items, filter }: FilterProps) {
  const filteredItems = items.filter(item => 
    filter === 'all' || item.category === filter
  );

  return (
    <motion.div 
      layout 
      className="grid grid-cols-3 gap-4"
    >
      <AnimatePresence>
        {filteredItems.map(item => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="aspect-square bg-blue-100 rounded-lg"
          >
            {item.content}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
```

### Accordion with Auto-Height

```tsx
function Accordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {items.map(item => (
        <motion.div
          key={item.id}
          layout
          className="bg-white rounded-lg overflow-hidden"
        >
          <motion.button
            layout="position"
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            className="w-full p-4 text-left flex justify-between"
          >
            {item.title}
            <motion.span
              animate={{ rotate: openId === item.id ? 180 : 0 }}
            >
              ▼
            </motion.span>
          </motion.button>
          
          <AnimatePresence>
            {openId === item.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
```

## 5. React Patterns to Use

### Shared Layout Animations (layoutId)

```tsx
function TabsWithIndicator({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex gap-4 relative">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="relative px-4 py-2"
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
```

### Card to Modal Expansion

```tsx
function ExpandableCard({ card }: { card: Card }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {!isExpanded && (
        <motion.div
          layoutId={`card-${card.id}`}
          onClick={() => setIsExpanded(true)}
          className="cursor-pointer p-4 bg-white rounded-lg shadow"
        >
          <motion.h2 layoutId={`title-${card.id}`}>
            {card.title}
          </motion.h2>
          <motion.p layoutId={`preview-${card.id}`}>
            {card.preview}
          </motion.p>
        </motion.div>
      )}

      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              layoutId={`card-${card.id}`}
              className="fixed inset-4 z-50 bg-white rounded-xl p-6 overflow-auto"
            >
              <motion.h2 layoutId={`title-${card.id}`} className="text-2xl">
                {card.title}
              </motion.h2>
              <motion.p layoutId={`preview-${card.id}`}>
                {card.preview}
              </motion.p>
              <p className="mt-4">{card.fullContent}</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

### Layout Group for Related Elements

```tsx
import { LayoutGroup } from 'framer-motion';

function RelatedLayouts() {
  const [selected, setSelected] = useState(0);

  return (
    <LayoutGroup>
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <motion.button
            key={i}
            layout
            onClick={() => setSelected(i)}
            className="relative px-4 py-2 rounded-lg"
            style={{ 
              backgroundColor: selected === i ? 'transparent' : '#f3f4f6' 
            }}
          >
            {selected === i && (
              <motion.div
                layoutId="selected-bg"
                className="absolute inset-0 bg-blue-500 rounded-lg"
                style={{ zIndex: -1 }}
              />
            )}
            <span className={selected === i ? 'text-white' : ''}>
              Option {i + 1}
            </span>
          </motion.button>
        ))}
      </div>
    </LayoutGroup>
  );
}
```

### Drag to Reorder

```tsx
import { Reorder } from 'framer-motion';

function DraggableList() {
  const [items, setItems] = useState([
    { id: '1', text: 'Item 1' },
    { id: '2', text: 'Item 2' },
    { id: '3', text: 'Item 3' },
  ]);

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
          className="p-4 bg-white rounded-lg shadow cursor-grab active:cursor-grabbing"
          whileDrag={{ 
            scale: 1.02, 
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)' 
          }}
        >
          {item.text}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
```

## 6. Important Hooks

### useLayoutGroup

```tsx
import { useLayoutGroup } from 'framer-motion';

function CustomLayoutGroup({ children }: { children: ReactNode }) {
  const { id } = useLayoutGroup();
  
  // Children with the same layoutId will animate together
  return <div data-layout-group={id}>{children}</div>;
}
```

### useMeasuredHeight for Layout

```tsx
function AnimatedHeight({ children, isOpen }: Props) {
  const [ref, { height }] = useMeasure<HTMLDivElement>();

  return (
    <motion.div
      animate={{ height: isOpen ? height : 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="overflow-hidden"
    >
      <div ref={ref}>{children}</div>
    </motion.div>
  );
}
```

## 7. Animation Considerations

### Transition Configuration

```tsx
// Good spring for layout animations
const layoutTransition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
  mass: 1,
};

// For smoother, less bouncy animations
const smoothLayoutTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 35,
};

// Quick layout shifts
const snappyLayoutTransition = {
  type: 'spring',
  stiffness: 700,
  damping: 35,
};
```

### Layout with Enter/Exit

```tsx
function LayoutWithExits({ items }: { items: Item[] }) {
  return (
    <AnimatePresence mode="popLayout">
      {items.map(item => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            layout: { type: 'spring', stiffness: 400, damping: 25 },
            opacity: { duration: 0.2 },
          }}
        >
          {item.content}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
```

### Preventing Layout Animation on Certain Properties

```tsx
<motion.div
  layout
  style={{ 
    // These won't animate, only position/size will
    borderRadius: 8,
    backgroundColor: 'white',
  }}
>
  Content
</motion.div>
```

## 8. Performance Considerations

### Use layout="position" When Possible

```tsx
// ❌ Animates both position AND size (more expensive)
<motion.div layout>...</motion.div>

// ✅ Only animates position (cheaper)
<motion.div layout="position">...</motion.div>
```

### Avoid Layout Animation on Many Items

```tsx
// ❌ All 100 items animate
{items.map(item => (
  <motion.div layout>...</motion.div>
))}

// ✅ Only visible items animate
{visibleItems.map(item => (
  <motion.div layout>...</motion.div>
))}
```

### layoutDependency for Controlled Updates

```tsx
// Only recalculate layout when dependency changes
<motion.div layout layoutDependency={selectedId}>
  ...
</motion.div>
```

## 9. Common Mistakes

### 1. Missing layout on Parent
**Problem:** Child layout animations look wrong.
**Solution:** Add layout to parent containers too.

### 2. Conflicting layoutId
**Problem:** Two visible elements have same layoutId.
**Solution:** Ensure layoutId is unique or use AnimatePresence.

### 3. Not Using mode="popLayout"
**Problem:** Exiting items cause layout jumps.
**Solution:** Use mode="popLayout" with AnimatePresence.

### 4. Layout Animation During Scroll
**Problem:** Page jumps during layout animation.
**Solution:** Use layoutScroll or disable layout during scroll.

### 5. Text Layout Issues
**Problem:** Text reflows during layout animation.
**Solution:** Use layout="position" or fixed widths.

## 10. Practice Exercises

### Exercise 1: Photo Gallery
Build a masonry gallery with filtered categories that animate layout.

### Exercise 2: Kanban Board
Create a drag-and-drop kanban with cross-list reordering.

### Exercise 3: Expanding Cards
Build cards that expand to full-screen with shared layout.

### Exercise 4: Animated Menu
Create a navigation with indicator that slides between items.

### Exercise 5: Collapsible Tree
Build a tree view with animated expand/collapse.

## 11. Advanced Topics

- **Layout Projections** — How Framer Motion calculates transforms
- **Cross-Component Layout** — Animating between disconnected elements
- **Portal Layout** — Layout animations with portaled content
- **Scroll Correction** — Preventing scroll jumps during layout
- **Layout Groups** — Coordinating multiple layout animations
- **Custom Layout Animations** — Manual FLIP implementation
