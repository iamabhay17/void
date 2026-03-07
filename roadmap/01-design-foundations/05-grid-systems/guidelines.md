# Grid Systems

## 1. Concept Overview

A grid system is an invisible structure that organizes content into columns and rows. It creates alignment, consistency, and visual harmony across pages and components.

Modern web grids typically use:
- **12-column grids** — Most flexible, divisible by 2, 3, 4, 6
- **Gutters** — Space between columns (16px, 24px, 32px)
- **Margins** — Space on the edges of the container
- **Breakpoints** — Points where column count changes

Grids aren't just about layout — they're about creating predictable, scannable interfaces where users intuitively understand spatial relationships.

## 2. Why This Matters for Design Engineers

Without a grid:
- Elements don't align, creating visual tension
- Layouts break unpredictably at different screen sizes
- Components look inconsistent across pages

As a Design Engineer, you need to:
- Implement responsive grids that match design intent
- Know when to break the grid intentionally
- Handle edge cases (odd numbers of items, varying heights)
- Create grid-aware components

Stripe's dashboards and Linear's interfaces feel organized because they're built on solid grid foundations.

## 3. Key Principles / Mental Models

### The 12-Column Standard
12 divides evenly by 1, 2, 3, 4, 6, and 12:
- Full width: 12 columns
- Half: 6 + 6
- Thirds: 4 + 4 + 4
- Quarters: 3 + 3 + 3 + 3
- Sidebar + Content: 3 + 9 or 4 + 8

### Content-Out vs. Grid-First
- **Grid-First:** Design fits into predetermined columns
- **Content-Out:** Content determines column widths

Modern CSS (flexbox, grid) enables content-out approaches while maintaining alignment.

### The 8px Grid
Beyond columns, use an 8px baseline grid for vertical rhythm:
- All spacing aligns to 8px increments
- Creates consistent vertical density

### Breaking the Grid
Intentional grid breaks create emphasis:
- Full-bleed images that span beyond the grid
- Pull quotes that slightly overlap columns
- Hero sections with asymmetric layouts

## 4. Implementation in React

### Basic CSS Grid Layout

```tsx
function PageLayout({ children }) {
  return (
    <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto px-4">
      {children}
    </div>
  );
}

function MainContent({ children }) {
  return (
    <main className="col-span-12 md:col-span-8 lg:col-span-9">
      {children}
    </main>
  );
}

function Sidebar({ children }) {
  return (
    <aside className="col-span-12 md:col-span-4 lg:col-span-3">
      {children}
    </aside>
  );
}

// Usage
<PageLayout>
  <MainContent>Main content here</MainContent>
  <Sidebar>Sidebar content</Sidebar>
</PageLayout>
```

### Responsive Grid Component

```tsx
type GridProps = {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
};

const gapClasses = {
  sm: 'gap-2 sm:gap-3',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
};

function Grid({ children, cols = {}, gap = 'md' }: GridProps) {
  const { 
    default: defaultCols = 1, 
    sm, 
    md, 
    lg, 
    xl 
  } = cols;
  
  return (
    <div 
      className={cn(
        'grid',
        `grid-cols-${defaultCols}`,
        sm && `sm:grid-cols-${sm}`,
        md && `md:grid-cols-${md}`,
        lg && `lg:grid-cols-${lg}`,
        xl && `xl:grid-cols-${xl}`,
        gapClasses[gap]
      )}
    >
      {children}
    </div>
  );
}

// Usage
<Grid cols={{ default: 1, sm: 2, lg: 3, xl: 4 }} gap="lg">
  <Card />
  <Card />
  <Card />
  <Card />
</Grid>
```

### Auto-Fit Grid

```tsx
// Cards that automatically fit available space
function AutoGrid({ children, minWidth = 280 }) {
  return (
    <div 
      className="grid gap-6"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}

// Usage - columns adjust automatically
<AutoGrid minWidth={300}>
  {projects.map(project => (
    <ProjectCard key={project.id} project={project} />
  ))}
</AutoGrid>
```

## 5. React Patterns to Use

### Grid Context for Nested Grids

```tsx
type GridContextType = {
  columns: number;
  gap: number;
};

const GridContext = createContext<GridContextType>({ columns: 12, gap: 24 });

function GridProvider({ columns = 12, gap = 24, children }) {
  return (
    <GridContext.Provider value={{ columns, gap }}>
      <div 
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {children}
      </div>
    </GridContext.Provider>
  );
}

function GridItem({ span = 1, children }) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
      {children}
    </div>
  );
}

// Usage
<GridProvider columns={12} gap={24}>
  <GridItem span={8}>Main content</GridItem>
  <GridItem span={4}>Sidebar</GridItem>
</GridProvider>
```

### Compound Grid Components

```tsx
const Grid = ({ children, className }) => (
  <div className={cn('grid grid-cols-12 gap-6', className)}>
    {children}
  </div>
);

Grid.Full = ({ children }) => (
  <div className="col-span-12">{children}</div>
);

Grid.Half = ({ children }) => (
  <div className="col-span-12 md:col-span-6">{children}</div>
);

Grid.Third = ({ children }) => (
  <div className="col-span-12 md:col-span-4">{children}</div>
);

Grid.TwoThirds = ({ children }) => (
  <div className="col-span-12 md:col-span-8">{children}</div>
);

// Usage
<Grid>
  <Grid.TwoThirds>
    <ArticleContent />
  </Grid.TwoThirds>
  <Grid.Third>
    <TableOfContents />
  </Grid.Third>
</Grid>
```

## 6. Important Hooks

### useGridColumns Hook

```tsx
function useGridColumns(containerRef: RefObject<HTMLElement>) {
  const [columns, setColumns] = useState(1);
  
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateColumns = () => {
      const width = container.offsetWidth;
      const minItemWidth = 280;
      const gap = 24;
      
      // Calculate how many columns fit
      const cols = Math.floor((width + gap) / (minItemWidth + gap));
      setColumns(Math.max(1, cols));
    };
    
    updateColumns();
    
    const observer = new ResizeObserver(updateColumns);
    observer.observe(container);
    
    return () => observer.disconnect();
  }, [containerRef]);
  
  return columns;
}

// Usage
function ResponsiveGrid({ children }) {
  const ref = useRef<HTMLDivElement>(null);
  const columns = useGridColumns(ref);
  
  return (
    <div 
      ref={ref}
      style={{ 
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '24px',
      }}
    >
      {children}
    </div>
  );
}
```

### useMasonry Hook

```tsx
function useMasonry(items: any[], columns: number) {
  return useMemo(() => {
    const columnHeights = Array(columns).fill(0);
    const columnItems: any[][] = Array.from({ length: columns }, () => []);
    
    items.forEach(item => {
      // Find shortest column
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Add item to shortest column
      columnItems[shortestColumn].push(item);
      columnHeights[shortestColumn] += item.height || 200;
    });
    
    return columnItems;
  }, [items, columns]);
}
```

## 7. Animation Considerations

### Grid Layout Animations

```tsx
import { motion, LayoutGroup } from 'framer-motion';

function AnimatedGrid({ items }) {
  return (
    <LayoutGroup>
      <motion.div 
        className="grid grid-cols-3 gap-4"
        layout
      >
        {items.map(item => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              layout: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <Card item={item} />
          </motion.div>
        ))}
      </motion.div>
    </LayoutGroup>
  );
}
```

### Staggered Grid Reveal

```tsx
function StaggeredGrid({ items }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };
  
  return (
    <motion.div
      className="grid grid-cols-3 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {items.map(i => (
        <motion.div key={i.id} variants={item}>
          <Card {...i} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Responsive Grid Transitions

```tsx
function ResponsiveAnimatedGrid({ items }) {
  return (
    <motion.div
      className="grid gap-4"
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      }}
      layout
    >
      {items.map(item => (
        <motion.div
          key={item.id}
          layout // Smooth reflow when columns change
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        >
          <Card item={item} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

## 8. Performance Considerations

### Avoid Grid Layout Thrashing

```tsx
// ❌ Forces multiple layout calculations
items.forEach(item => {
  const element = document.getElementById(item.id);
  element.style.gridColumn = `span ${item.span}`;
});

// ✅ Batch updates or use CSS classes
<div className={getSpanClass(item.span)}>
  {item.content}
</div>
```

### Use CSS Grid Over JS Calculations

```tsx
// ❌ JS-calculated grid
function Grid({ items, columnWidth }) {
  const columns = Math.floor(containerWidth / columnWidth);
  return items.map((item, i) => (
    <div style={{ 
      position: 'absolute',
      left: (i % columns) * columnWidth,
      top: Math.floor(i / columns) * rowHeight,
    }}>
      {item}
    </div>
  ));
}

// ✅ CSS Grid
function Grid({ items }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    }}>
      {items.map(item => <Card key={item.id} {...item} />)}
    </div>
  );
}
```

### Virtualize Large Grids

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedGrid({ items, columns }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(items.length / columns),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300, // Estimated row height
    overscan: 2,
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            className="grid grid-cols-3 gap-4 absolute w-full"
            style={{
              top: virtualRow.start,
              height: virtualRow.size,
            }}
          >
            {/* Render items for this row */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 9. Common Mistakes

### 1. Fixed Column Counts
**Problem:** Grid always has exactly 3 columns.
**Solution:** Use responsive breakpoints or auto-fit.

### 2. Inconsistent Gutters
**Problem:** Gap changes randomly between sections.
**Solution:** Use consistent gap values from your spacing system.

### 3. Breaking Grid Unintentionally
**Problem:** Content overflows and misaligns.
**Solution:** Handle overflow properly (truncate, scroll, or wrap).

### 4. Forgetting Mobile
**Problem:** 4-column grid on 320px screen.
**Solution:** Always start mobile-first, then add columns.

### 5. Orphan Items
**Problem:** Single item on last row looks awkward.
**Solution:** Consider hiding, centering, or spanning orphans.

## 10. Practice Exercises

### Exercise 1: 12-Column Grid
Build a responsive 12-column grid system from scratch using CSS Grid.

### Exercise 2: Auto-Fit Card Grid
Create a card grid that automatically adjusts columns based on container width.

### Exercise 3: Holy Grail Layout
Implement header, footer, main content, and two sidebars using Grid.

### Exercise 4: Masonry Grid
Build a masonry layout where items of varying heights are positioned optimally.

### Exercise 5: Animated Grid Reorder
Create a grid where items animate smoothly when filtered or reordered.

## 11. Advanced Topics

- **Subgrid** — Nested grids that inherit parent grid tracks
- **CSS Grid Areas** — Named grid areas for complex layouts
- **Intrinsic Sizing** — `min-content`, `max-content`, `fit-content`
- **Container Queries** — Grid adaptation based on container, not viewport
- **Grid + Scroll Snap** — Creating carousel-like grid experiences
- **Masonry in CSS** — Native masonry layout (experimental)
