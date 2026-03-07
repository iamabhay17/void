# Virtualization & Infinite Scroll

## 1. Concept Overview

Virtualization (windowing) is the technique of only rendering visible items in a list, dramatically improving performance for large datasets. Instead of rendering 10,000 items, render only the 10-20 visible ones.

Key concepts:
- **Virtual list** — Only visible items exist in DOM
- **Overscan** — Extra items above/below for smooth scrolling
- **Scroll container** — Fixed height with calculated spacers
- **Item recycling** — Reusing DOM nodes as user scrolls

```tsx
// 10,000 items, but only ~20 in DOM
<VirtualList items={items} itemHeight={50}>
  {(item) => <ListItem {...item} />}
</VirtualList>
```

## 2. Why This Matters for Design Engineers

Virtualization enables:
- Smooth scrolling through huge lists
- Reduced memory usage
- Faster initial render
- Better mobile performance

As a Design Engineer, you must:
- Know when to virtualize (>100 items)
- Handle variable height items
- Maintain scroll position
- Combine with animations carefully

## 3. Key Principles / Mental Models

### The DOM Problem
```
10,000 items × 10 DOM nodes each = 100,000 nodes
100,000 nodes = slow, memory-hungry, janky

With virtualization:
20 visible × 10 DOM nodes = 200 nodes
200 nodes = fast, smooth, efficient
```

### Virtual Window
```
[Spacer: items 0-99 height]
[Visible: items 100-119]  ← Actually rendered
[Spacer: items 120-9999 height]

As user scrolls, visible window shifts:
[Spacer: items 0-109 height]
[Visible: items 110-129]  ← Re-rendered range
[Spacer: items 130-9999 height]
```

### Fixed vs. Variable Height
```
Fixed: All items same height → Easy math
Variable: Items have different heights → Need measurement
```

## 4. Implementation in React

### Basic Virtual List

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Estimated item height
    overscan: 5, // Render 5 extra items above/below
  });

  return (
    <div
      ref={parentRef}
      className="h-96 overflow-auto"
    >
      <div
        style={{ height: `${virtualizer.getTotalSize()}px` }}
        className="relative"
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            className="absolute top-0 left-0 w-full"
            style={{
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].content}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Variable Height Items

```tsx
function VariableHeightList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Best guess
    measureElement: (element) => {
      // Measure actual element height
      return element.getBoundingClientRect().height;
    },
  });

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div
        style={{ height: `${virtualizer.getTotalSize()}px` }}
        className="relative"
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            className="absolute top-0 left-0 w-full"
            style={{
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <Card item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Infinite Scroll

```tsx
function InfiniteList() {
  const [items, setItems] = useState<Item[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: hasMore ? items.length + 1 : items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!lastItem) return;

    // If we're near the end, load more
    if (
      lastItem.index >= items.length - 1 &&
      hasMore &&
      !isLoading
    ) {
      loadMore();
    }
  }, [lastItem, hasMore, isLoading, items.length]);

  const loadMore = async () => {
    setIsLoading(true);
    const newItems = await fetchMoreItems(items.length);
    setItems((prev) => [...prev, ...newItems]);
    setHasMore(newItems.length > 0);
    setIsLoading(false);
  };

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{ height: `${virtualizer.getTotalSize()}px` }}
        className="relative"
      >
        {virtualItems.map((virtualItem) => {
          const isLoaderRow = virtualItem.index >= items.length;

          return (
            <div
              key={virtualItem.key}
              className="absolute top-0 left-0 w-full"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {isLoaderRow ? (
                <LoadingSpinner />
              ) : (
                <ItemCard item={items[virtualItem.index]} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## 5. React Patterns to Use

### Scroll to Index

```tsx
function ScrollToItem({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  const scrollToItem = (index: number) => {
    virtualizer.scrollToIndex(index, {
      align: 'center', // 'start', 'center', 'end', 'auto'
      behavior: 'smooth',
    });
  };

  return (
    <div>
      <input
        type="number"
        placeholder="Go to item..."
        onChange={(e) => scrollToItem(Number(e.target.value))}
      />
      <div ref={parentRef} className="h-96 overflow-auto">
        {/* Virtual list content */}
      </div>
    </div>
  );
}
```

### Virtual Grid

```tsx
function VirtualGrid({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const columns = 3;
  const rowCount = Math.ceil(items.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Row height
    overscan: 2,
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{ height: `${virtualizer.getTotalSize()}px` }}
        className="relative"
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowItems = items.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              className="absolute top-0 left-0 w-full grid grid-cols-3 gap-4 p-4"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rowItems.map((item) => (
                <GridCard key={item.id} item={item} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### With Animation (Careful!)

```tsx
function AnimatedVirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
  });

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div
        style={{ height: `${virtualizer.getTotalSize()}px` }}
        className="relative"
      >
        <AnimatePresence initial={false}>
          {virtualizer.getVirtualItems().map((virtualItem) => (
            <motion.div
              key={items[virtualItem.index].id}
              layout={false} // Disable layout animation for virtual lists
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute top-0 left-0 w-full"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {items[virtualItem.index].content}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

## 6. Important Hooks

### useInfiniteQuery with Virtualization

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

function InfiniteQueryList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['items'],
    queryFn: ({ pageParam = 0 }) => fetchItems(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: hasNextPage ? allItems.length + 1 : allItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
  });

  // Trigger next page when reaching end
  useEffect(() => {
    const lastItem = virtualizer.getVirtualItems().at(-1);
    if (
      lastItem &&
      lastItem.index >= allItems.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [virtualizer.getVirtualItems(), hasNextPage, isFetchingNextPage]);

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      {/* Virtual list content */}
    </div>
  );
}
```

## 7. Animation Considerations

### Avoid Heavy Animations in Lists

```tsx
// ❌ Layout animations break virtualization
<motion.div layout>{item.content}</motion.div>

// ✅ Simple opacity/transform only
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.1 }}
>
  {item.content}
</motion.div>
```

### Defer Animations Until Scroll Stops

```tsx
function DeferredAnimationList({ items }: { items: Item[] }) {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  const handleScroll = () => {
    setIsScrolling(true);
    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  return (
    <div onScroll={handleScroll}>
      {virtualItems.map((item) => (
        <motion.div
          animate={isScrolling ? {} : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {item.content}
        </motion.div>
      ))}
    </div>
  );
}
```

## 8. Performance Considerations

### Key Points
- Use `key` that's stable (item ID, not index)
- Memoize item components
- Avoid inline styles/functions
- Use CSS transforms for positioning

### Memoize List Items

```tsx
const VirtualItem = memo(function VirtualItem({ 
  item, 
  style 
}: { 
  item: Item; 
  style: CSSProperties;
}) {
  return (
    <div style={style}>
      <ItemCard item={item} />
    </div>
  );
});
```

## 9. Common Mistakes

### 1. Using Index as Key
**Problem:** Items shuffle incorrectly.
**Solution:** Use stable item IDs.

### 2. Not Setting Container Height
**Problem:** List doesn't virtualize.
**Solution:** Parent must have fixed height.

### 3. Layout Animations
**Problem:** Breaks position calculations.
**Solution:** Disable layout prop in virtual lists.

### 4. Too Low Overscan
**Problem:** White flashing during fast scroll.
**Solution:** Increase overscan (5-10 items).

### 5. Measuring Before Render
**Problem:** Heights are wrong.
**Solution:** Use measureElement callback.

## 10. Practice Exercises

### Exercise 1: Chat Application
Build a virtualized chat with infinite scroll loading history.

### Exercise 2: Photo Gallery
Create a virtual grid gallery with lazy-loaded images.

### Exercise 3: Data Table
Build a large data table with virtual rows.

### Exercise 4: Timeline
Create a virtual timeline with variable height entries.

### Exercise 5: Search Results
Build infinite search results with highlighting.

## 11. Advanced Topics

- **Bidirectional Infinite Scroll** — Load in both directions
- **Sticky Headers** — Groups with sticky section headers
- **Horizontal Virtualization** — Virtual columns
- **Virtualized Masonry** — Variable height grid
- **Window Scrolling** — Document-level virtualization
- **Scroll Restoration** — Maintaining position on navigation
