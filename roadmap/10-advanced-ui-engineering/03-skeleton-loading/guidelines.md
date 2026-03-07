# Skeleton Loading States

## 1. Concept Overview

Skeleton loading (also called "skeleton screens" or "content placeholders") is a UI pattern that shows a wireframe preview of content while it loads. Instead of spinners or blank screens, skeletons provide visual structure that matches the eventual content.

```tsx
// Loading state
<SkeletonCard />

// Loaded state
<Card data={data} />
```

Benefits over spinners:
- Reduces perceived loading time
- Maintains layout stability
- Communicates content structure
- Feels more progressive

## 2. Why This Matters for Design Engineers

Skeleton loading creates:
- Smoother perceived performance
- Less layout shift (CLS)
- Better user orientation
- Professional polish

As a Design Engineer, you must:
- Match skeletons to actual content
- Animate skeletons subtly
- Transition smoothly to content
- Handle various loading states

## 3. Key Principles / Mental Models

### Structure Matching
```
Skeleton should match:
- Same height/width
- Same layout (grid, flex)
- Similar visual weight
- Key content areas

Don't match:
- Exact text lengths
- Fine details
- Icons
```

### Loading State Hierarchy
```
1. Instant: Content cached/prefetched
2. Skeleton: < 2 seconds
3. Skeleton + "Still loading...": 2-5 seconds
4. Skeleton + Cancel option: > 5 seconds
5. Error state: On failure
```

### Animation Philosophy
```
Subtle pulse/shimmer: Indicates activity
No animation: Appears frozen/broken
Too much animation: Distracting
```

## 4. Implementation in React

### Basic Skeleton Component

```tsx
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

function Skeleton({ 
  className, 
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  return (
    <motion.div
      className={cn(
        'bg-gray-200',
        variant === 'text' && 'h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-md',
        className
      )}
      style={{ width, height }}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
```

### Shimmer Skeleton

```tsx
function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-gray-200', className)}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{ x: ['0%', '200%'] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
```

### Card Skeleton

```tsx
function CardSkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-4">
      {/* Image placeholder */}
      <Skeleton variant="rectangular" className="w-full h-48" />
      
      {/* Title */}
      <Skeleton variant="text" className="w-3/4 h-6" />
      
      {/* Description lines */}
      <div className="space-y-2">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
      
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-10 h-10" />
        <Skeleton variant="text" className="w-24" />
      </div>
    </div>
  );
}
```

### List Skeleton

```tsx
function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton variant="circular" className="w-12 h-12 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-1/2 h-5" />
            <Skeleton variant="text" className="w-3/4 h-4" />
          </div>
          <Skeleton variant="rectangular" className="w-20 h-8 rounded" />
        </div>
      ))}
    </div>
  );
}
```

## 5. React Patterns to Use

### Conditional Skeleton

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  return <UserProfileContent user={user} />;
}
```

### Suspense with Skeleton

```tsx
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}
```

### Animated Transition

```tsx
function ContentWithSkeleton({ isLoading, children }: Props) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ContentSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Progressive Loading

```tsx
function ProgressiveContent({ data, isLoading }: Props) {
  return (
    <div className="space-y-4">
      {/* Header loads first */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <HeaderSkeleton key="skeleton" />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Header data={data.header} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body might still be loading */}
      <AnimatePresence mode="wait">
        {!data.body ? (
          <BodySkeleton key="skeleton" />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Body data={data.body} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Inline Skeleton

```tsx
function InlineLoading({ isLoading, value }: { isLoading: boolean; value: string }) {
  if (isLoading) {
    return <Skeleton variant="text" className="inline-block w-20 h-4" />;
  }
  return <span>{value}</span>;
}

// Usage
<p>
  Welcome back, <InlineLoading isLoading={isLoading} value={user.name} />!
</p>
```

## 6. Animation Techniques

### Pulse Animation (CSS)

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Shimmer Effect (CSS)

```css
.shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Wave Animation

```tsx
function WaveSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-gray-200 rounded"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.15, // Staggered wave effect
          }}
        />
      ))}
    </div>
  );
}
```

## 7. Best Practices

### Match Content Dimensions

```tsx
// Content component
function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="p-4 space-y-4">
      <img src={article.image} className="w-full h-48 object-cover rounded" />
      <h2 className="text-xl font-bold">{article.title}</h2>
      <p className="text-gray-600 line-clamp-3">{article.excerpt}</p>
    </div>
  );
}

// Matching skeleton
function ArticleCardSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="w-full h-48 rounded" />
      <Skeleton className="w-3/4 h-7" />
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-2/3 h-4" />
      </div>
    </div>
  );
}
```

### Avoid Layout Shift

```tsx
// Reserve space for content
function ContentArea({ isLoading, data }: Props) {
  return (
    <div className="min-h-[400px]"> {/* Fixed minimum height */}
      {isLoading ? <ContentSkeleton /> : <Content data={data} />}
    </div>
  );
}
```

## 8. Performance Considerations

### CSS vs. JavaScript Animation

```tsx
// ✅ CSS animation (better performance)
<div className="animate-pulse bg-gray-200" />

// ⚠️ JS animation (more control, but heavier)
<motion.div animate={{ opacity: [0.5, 1, 0.5] }} />
```

### Reduce Skeleton Complexity

```tsx
// ❌ Too detailed
function OverDetailedSkeleton() {
  return (
    <div>
      {/* 50 individual skeleton lines */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Skeleton key={i} style={{ width: `${Math.random() * 50 + 50}%` }} />
      ))}
    </div>
  );
}

// ✅ Simplified representation
function SimplifiedSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-full h-40" />
      <Skeleton className="w-3/4 h-6" />
      <Skeleton className="w-full h-20" />
    </div>
  );
}
```

## 9. Common Mistakes

### 1. Skeleton Doesn't Match Content
**Problem:** Layout shifts when content loads.
**Solution:** Mirror exact dimensions.

### 2. No Animation
**Problem:** Skeleton looks broken/frozen.
**Solution:** Add subtle pulse or shimmer.

### 3. Too Long Loading
**Problem:** User sees skeleton for 10+ seconds.
**Solution:** Add progress text or allow cancel.

### 4. Skeleton on Fast Connections
**Problem:** Brief flash of skeleton.
**Solution:** Add minimum display time or delay skeleton.

### 5. Inconsistent Styling
**Problem:** Different skeletons look different.
**Solution:** Use consistent skeleton component.

## 10. Practice Exercises

### Exercise 1: Social Feed
Create a skeleton for a social media feed with posts.

### Exercise 2: E-commerce Grid
Build product grid skeleton with images and prices.

### Exercise 3: Dashboard
Design dashboard skeleton with charts and stats.

### Exercise 4: Chat Interface
Create skeleton for chat messages and contacts.

### Exercise 5: Article Page
Build full article page skeleton with hero, content, sidebar.

## 11. Advanced Topics

- **Server Components** — Streaming with skeletons
- **Content-Aware Skeletons** — Generating from schema
- **Skeleton Libraries** — react-loading-skeleton, etc.
- **A/B Testing** — Skeleton vs. spinner effectiveness
- **Accessibility** — aria-busy and loading announcements
- **Dark Mode** — Skeleton color adaptation
