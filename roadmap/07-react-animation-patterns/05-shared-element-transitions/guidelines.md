# Shared Element Transitions

## 1. Concept Overview

Shared element transitions create visual continuity by animating a single element across different states or views. The element appears to persist and transform rather than disappear and reappear.

Key examples:
- List item expanding to detail view
- Thumbnail morphing into full image
- Tab indicator sliding between tabs
- Card content transitioning to modal

Framer Motion's `layoutId` prop enables this pattern by connecting elements across renders.

## 2. Why This Matters for Design Engineers

Shared transitions create spatial understanding:
- Users understand where content came from
- Navigation feels like moving through space
- State changes feel connected and intentional
- Interfaces feel more "real"

As a Design Engineer, you must:
- Identify elements that should persist across states
- Design smooth transitions between different layouts
- Handle edge cases (different aspect ratios, content)
- Ensure transitions work with AnimatePresence

## 3. Key Principles / Mental Models

### The Persistence Illusion
Users perceive one element transforming:
```
List View: [Card A] [Card B] [Card C]
                     ↓
                 [Card B Detail]

Card B "moves" from list to detail view
```

### LayoutId Matching
```tsx
// Same layoutId = same element across views
<motion.div layoutId="card-1">...</motion.div>

// When state changes, element animates between positions
{isExpanded ? (
  <motion.div layoutId="card-1" className="full-screen">...</motion.div>
) : (
  <motion.div layoutId="card-1" className="small-card">...</motion.div>
)}
```

### What Can Be Shared
- Container shapes
- Images
- Text elements
- Backgrounds
- Icons

## 4. Implementation in React

### Basic Shared Element

```tsx
import { motion, AnimatePresence } from 'framer-motion';

function SharedElementDemo() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {items.map(item => (
          <motion.div
            key={item.id}
            layoutId={`card-${item.id}`}
            onClick={() => setSelectedId(item.id)}
            className="p-4 bg-white rounded-lg cursor-pointer"
          >
            <motion.h2 layoutId={`title-${item.id}`}>
              {item.title}
            </motion.h2>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && (
          <motion.div
            layoutId={`card-${selectedId}`}
            className="fixed inset-4 bg-white rounded-xl p-8 z-50"
          >
            <motion.h2 layoutId={`title-${selectedId}`} className="text-3xl">
              {items.find(i => i.id === selectedId)?.title}
            </motion.h2>
            <button onClick={() => setSelectedId(null)}>Close</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### Image Gallery with Shared Transition

```tsx
function ImageGallery({ images }: { images: Image[] }) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {images.map(image => (
          <motion.div
            key={image.id}
            layoutId={`image-${image.id}`}
            onClick={() => setSelectedImage(image)}
            className="aspect-square cursor-pointer overflow-hidden rounded-lg"
          >
            <motion.img
              layoutId={`img-${image.id}`}
              src={image.thumbnail}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-40"
              onClick={() => setSelectedImage(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
              <motion.div
                layoutId={`image-${selectedImage.id}`}
                className="max-w-4xl max-h-full rounded-xl overflow-hidden"
              >
                <motion.img
                  layoutId={`img-${selectedImage.id}`}
                  src={selectedImage.full}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

### Tab Indicator

```tsx
function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex border-b">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="relative px-6 py-3"
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
            />
          )}
        </button>
      ))}
    </div>
  );
}
```

## 5. React Patterns to Use

### Multiple Shared Elements

```tsx
function ProductCard({ product, isExpanded, onToggle }: ProductCardProps) {
  return (
    <motion.div
      layout
      onClick={onToggle}
      className={isExpanded ? 'fixed inset-8 z-50' : 'relative'}
    >
      <motion.div
        layoutId={`card-bg-${product.id}`}
        className="absolute inset-0 bg-white rounded-xl shadow-lg"
      />
      
      <div className="relative z-10 p-6">
        <motion.img
          layoutId={`card-image-${product.id}`}
          src={product.image}
          className={isExpanded ? 'w-1/2' : 'w-full aspect-square object-cover'}
        />
        
        <motion.h2
          layoutId={`card-title-${product.id}`}
          className={isExpanded ? 'text-3xl mt-4' : 'text-lg mt-2'}
        >
          {product.name}
        </motion.h2>
        
        <motion.p
          layoutId={`card-price-${product.id}`}
          className="text-gray-600"
        >
          ${product.price}
        </motion.p>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4"
            >
              <p>{product.description}</p>
              <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded">
                Add to Cart
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
```

### Shared Element with Route Change

```tsx
// List page
function ProductList() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <Link key={product.id} to={`/product/${product.id}`}>
          <motion.div layoutId={`product-${product.id}`}>
            <motion.img
              layoutId={`product-image-${product.id}`}
              src={product.image}
            />
            <motion.h2 layoutId={`product-title-${product.id}`}>
              {product.name}
            </motion.h2>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}

// Detail page
function ProductDetail({ id }: { id: string }) {
  const product = useProduct(id);

  return (
    <motion.div layoutId={`product-${id}`} className="p-8">
      <motion.img
        layoutId={`product-image-${id}`}
        src={product.image}
        className="w-full aspect-video object-cover"
      />
      <motion.h2 layoutId={`product-title-${id}`} className="text-4xl mt-4">
        {product.name}
      </motion.h2>
      <p className="mt-4">{product.description}</p>
    </motion.div>
  );
}

// Layout wrapper with AnimatePresence
function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </AnimatePresence>
  );
}
```

### Morphing Button to Modal

```tsx
function MorphingModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <motion.button
          layoutId="modal"
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-blue-500 text-white rounded-full"
        >
          <motion.span layoutId="modal-text">Open</motion.span>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              layoutId="modal"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                         w-96 bg-white rounded-xl p-6 z-50"
            >
              <motion.h2 layoutId="modal-text" className="text-xl mb-4">
                Modal Title
              </motion.h2>
              <p>Modal content goes here...</p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-4 px-4 py-2 bg-gray-100 rounded"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

## 6. Important Hooks

### useLayoutIdScope

```tsx
import { LayoutGroup } from 'framer-motion';

function ScopedSharedElements({ groupId }: { groupId: string }) {
  // Prevents layoutId collision across instances
  return (
    <LayoutGroup id={groupId}>
      <motion.div layoutId="shared">
        This won't animate to other groups
      </motion.div>
    </LayoutGroup>
  );
}

function MultipleInstances() {
  return (
    <>
      <ScopedSharedElements groupId="group-1" />
      <ScopedSharedElements groupId="group-2" />
    </>
  );
}
```

### Preserving Scroll Position

```tsx
function SharedElementWithScroll() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollPosition = useRef(0);

  const handleSelect = (id: string) => {
    scrollPosition.current = window.scrollY;
    setSelectedId(id);
    // Prevent scroll while modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleClose = () => {
    setSelectedId(null);
    document.body.style.overflow = '';
    window.scrollTo(0, scrollPosition.current);
  };

  return (/* ... */);
}
```

## 7. Animation Considerations

### Transition Configuration

```tsx
const sharedTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 25,
  mass: 1,
};

function SharedElement() {
  return (
    <motion.div
      layoutId="shared"
      transition={sharedTransition}
    >
      Content
    </motion.div>
  );
}
```

### Handling Different Aspect Ratios

```tsx
function AdaptiveImage({ src, isExpanded }: Props) {
  return (
    <motion.div
      layoutId="image-container"
      className={isExpanded ? 'aspect-video' : 'aspect-square'}
    >
      <motion.img
        layoutId="image"
        src={src}
        className="w-full h-full"
        style={{ 
          objectFit: isExpanded ? 'contain' : 'cover',
          objectPosition: 'center',
        }}
      />
    </motion.div>
  );
}
```

### Adding Supplementary Animations

```tsx
function EnhancedSharedElement({ isExpanded }: { isExpanded: boolean }) {
  return (
    <motion.div layoutId="card">
      <motion.img layoutId="card-image" src="..." />
      
      {/* Content that fades in/out separately */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
          >
            Additional content that appears after transition
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

## 8. Performance Considerations

### Avoid Animating Too Many Elements

```tsx
// ❌ Too many shared elements
{items.map(item => (
  <motion.div layoutId={`card-${item.id}`}>
    <motion.img layoutId={`img-${item.id}`} />
    <motion.h2 layoutId={`title-${item.id}`} />
    <motion.p layoutId={`desc-${item.id}`} />
    <motion.span layoutId={`price-${item.id}`} />
  </motion.div>
))}

// ✅ Only key elements
{items.map(item => (
  <motion.div layoutId={`card-${item.id}`}>
    <motion.img layoutId={`img-${item.id}`} />
    <h2>{item.title}</h2>
    <p>{item.desc}</p>
  </motion.div>
))}
```

### Layout Projection vs. CSS Transitions

```tsx
// Framer Motion uses layout projection (transform-based)
// This is more performant than animating width/height

// The element's actual size changes instantly
// Visual appearance animates via transform + scale
```

## 9. Common Mistakes

### 1. Duplicate layoutId
**Problem:** Two visible elements have same layoutId.
**Solution:** Only one element with each layoutId should be mounted.

### 2. Missing AnimatePresence
**Problem:** Exit animation doesn't play.
**Solution:** Wrap conditional renders in AnimatePresence.

### 3. Mismatched Content
**Problem:** Elements have very different content sizes.
**Solution:** Use consistent base sizing or animate opacity during transition.

### 4. Z-Index Issues
**Problem:** Expanding element goes behind other content.
**Solution:** Increase z-index during transition.

### 5. Scroll Position Lost
**Problem:** Page scrolls when element expands.
**Solution:** Lock scroll, maintain position, use portals.

## 10. Practice Exercises

### Exercise 1: Gallery Lightbox
Build an image gallery with shared element zoom to lightbox.

### Exercise 2: Card to Page
Create cards that expand to full detail pages with multiple shared elements.

### Exercise 3: Navigation Indicator
Build navigation with sliding active indicator.

### Exercise 4: Avatar Expansion
Create an avatar that expands to a profile card on click.

### Exercise 5: Multi-Select
Build a selection interface where items animate to a selected area.

## 11. Advanced Topics

- **Cross-Route Transitions** — Persisting elements across pages
- **Portal Shared Elements** — Animating into/out of portals
- **Nested Shared Elements** — Parent and child layoutIds
- **Shared Element Choreography** — Coordinating multiple transitions
- **Fallback Transitions** — When shared element isn't available
- **Gesture-Driven Transitions** — Drag to trigger shared element
