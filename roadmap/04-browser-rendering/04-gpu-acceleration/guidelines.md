# GPU Acceleration

## 1. Concept Overview

GPU acceleration offloads rendering work from the CPU to the Graphics Processing Unit. GPUs are designed for parallel processing of graphics operations, making them ideal for smooth animations.

Key concepts:
- **Hardware acceleration** — Using GPU instead of CPU
- **Compositing layers** — GPU-managed texture layers
- **Rasterization** — Converting vectors to pixels
- **Texture upload** — Moving data to GPU memory

When properly utilized, GPU acceleration enables:
- 60fps animations even with complex UI
- Smooth scrolling on mobile devices
- Reduced main thread blocking

## 2. Why This Matters for Design Engineers

Understanding GPU acceleration is crucial because:
- It's the difference between smooth and janky
- Mobile devices have different GPU capabilities
- Memory management affects real-world performance
- Knowing limits helps you design within them

As a Design Engineer, you must:
- Know how to trigger GPU acceleration
- Understand its memory costs
- Test on actual devices (not just desktop)
- Balance visual quality with performance

## 3. Key Principles / Mental Models

### The GPU Pipeline
```
CPU → Texture Creation → GPU Upload → Composition → Display
```

### What Gets Hardware Accelerated
- `transform` animations
- `opacity` animations
- CSS `filter` (blur, brightness, etc.)
- WebGL content
- Video playback
- Canvas 2D (sometimes)

### Layer Promotion Triggers
Elements become GPU layers when:
- They have `transform: translateZ(0)` or `translate3d(0,0,0)`
- They have `will-change: transform, opacity`
- They have CSS animation on transform/opacity
- They are being animated with transform/opacity by JS
- They are `<video>`, `<canvas>`, or WebGL content

### The Memory Cost
Every GPU layer consumes VRAM:
- Layer size = width × height × 4 bytes (RGBA)
- 1000×1000 element = ~4MB per layer
- Mobile devices: 64-512MB total GPU memory

## 4. Implementation in React

### Forcing GPU Layer

```tsx
// Methods to force GPU layer creation
function GPUAccelerated({ children }) {
  return (
    <div
      style={{
        // Method 1: 3D transform (most common)
        transform: 'translateZ(0)',
        
        // Method 2: will-change (preferred, more explicit)
        // willChange: 'transform',
        
        // Method 3: backface-visibility
        // backfaceVisibility: 'hidden',
      }}
    >
      {children}
    </div>
  );
}
```

### Conditional GPU Acceleration

```tsx
function SmartAcceleration({ isAnimating, children }) {
  return (
    <div
      style={{
        // Only promote to GPU when needed
        willChange: isAnimating ? 'transform' : 'auto',
        transform: isAnimating ? 'translateZ(0)' : 'none',
      }}
    >
      {children}
    </div>
  );
}

// With Framer Motion
function MotionCard() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      style={{
        // Framer Motion handles layer promotion during animation
        willChange: isHovered ? 'transform' : 'auto',
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
    >
      Card Content
    </motion.div>
  );
}
```

### GPU-Accelerated Scroll Effects

```tsx
import { useScroll, useTransform, motion } from 'framer-motion';

function ParallaxHero() {
  const { scrollY } = useScroll();
  
  // These transforms run on GPU
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background layer - GPU accelerated */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 bg-cover bg-center"
      >
        <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover" />
      </motion.div>
      
      {/* Content layer - GPU accelerated */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex items-center justify-center h-full"
      >
        <h1 className="text-6xl font-bold text-white">Hero Title</h1>
      </motion.div>
    </div>
  );
}
```

### Canvas for Heavy Graphics

```tsx
function GPUCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get GPU-accelerated context
    const ctx = canvas.getContext('2d', {
      // Enable hardware acceleration hints
      alpha: false,           // Opaque canvas is faster
      desynchronized: true,   // Lower latency
      willReadFrequently: false, // Optimize for write
    });
    
    // Canvas operations are GPU-accelerated
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw operations...
      requestAnimationFrame(animate);
    }
    
    animate();
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{
        // Ensure canvas itself is on GPU layer
        willChange: 'transform',
      }}
    />
  );
}
```

## 5. React Patterns to Use

### GPU Layer Manager

```tsx
const GPULayerContext = createContext<{
  requestLayer: () => () => void;
  layerCount: number;
}>({ requestLayer: () => () => {}, layerCount: 0 });

function GPULayerProvider({ maxLayers = 20, children }) {
  const [layerCount, setLayerCount] = useState(0);
  
  const requestLayer = useCallback(() => {
    if (layerCount >= maxLayers) {
      console.warn('GPU layer limit reached');
      return () => {};
    }
    
    setLayerCount(c => c + 1);
    
    return () => {
      setLayerCount(c => c - 1);
    };
  }, [layerCount, maxLayers]);
  
  return (
    <GPULayerContext.Provider value={{ requestLayer, layerCount }}>
      {children}
    </GPULayerContext.Provider>
  );
}

function GPUAcceleratedElement({ children }) {
  const { requestLayer } = useContext(GPULayerContext);
  const [hasLayer, setHasLayer] = useState(false);
  
  useEffect(() => {
    const release = requestLayer();
    setHasLayer(true);
    return release;
  }, [requestLayer]);
  
  return (
    <div style={{ willChange: hasLayer ? 'transform' : 'auto' }}>
      {children}
    </div>
  );
}
```

### Adaptive Quality Based on GPU

```tsx
function useGPUCapability() {
  const [capability, setCapability] = useState<'high' | 'medium' | 'low'>('high');
  
  useEffect(() => {
    // Check for GPU capability indicators
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
      setCapability('low');
      return;
    }
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      
      // Detect integrated vs discrete GPU
      if (renderer.toLowerCase().includes('intel')) {
        setCapability('medium');
      } else if (renderer.toLowerCase().includes('nvidia') || 
                 renderer.toLowerCase().includes('amd')) {
        setCapability('high');
      }
    }
    
    // Check device memory
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
      setCapability('low');
    }
  }, []);
  
  return capability;
}

function AdaptiveAnimation() {
  const gpuCapability = useGPUCapability();
  
  const getAnimationConfig = () => {
    switch (gpuCapability) {
      case 'high':
        return {
          blur: true,
          shadows: true,
          particleCount: 100,
        };
      case 'medium':
        return {
          blur: false,
          shadows: true,
          particleCount: 50,
        };
      case 'low':
        return {
          blur: false,
          shadows: false,
          particleCount: 10,
        };
    }
  };
  
  const config = getAnimationConfig();
  
  return (
    <div style={{ filter: config.blur ? 'blur(1px)' : 'none' }}>
      {/* Adaptive content */}
    </div>
  );
}
```

## 6. Important Hooks

### useGPUTiming

```tsx
function useGPUTiming() {
  const [fps, setFps] = useState(60);
  const framesRef = useRef<number[]>([]);
  
  useEffect(() => {
    let lastTime = performance.now();
    let animationId: number;
    
    const measureFrame = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      
      framesRef.current.push(1000 / delta);
      
      // Keep last 30 frames
      if (framesRef.current.length > 30) {
        framesRef.current.shift();
      }
      
      // Calculate average FPS
      const avgFps = framesRef.current.reduce((a, b) => a + b, 0) / framesRef.current.length;
      setFps(Math.round(avgFps));
      
      animationId = requestAnimationFrame(measureFrame);
    };
    
    animationId = requestAnimationFrame(measureFrame);
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  return fps;
}
```

### useIntersectionLayer

```tsx
// Only promote to GPU layer when visible
function useIntersectionLayer<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '50px' }
    );
    
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  
  const style = {
    willChange: isVisible ? 'transform' : 'auto',
  };
  
  return { ref, style, isVisible };
}

// Usage
function LazyGPUCard() {
  const { ref, style } = useIntersectionLayer<HTMLDivElement>();
  
  return (
    <motion.div
      ref={ref}
      style={style}
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
    >
      Card content
    </motion.div>
  );
}
```

## 7. Animation Considerations

### Texture Size Optimization

```tsx
// GPU layers use memory based on rendered size
function OptimizedLayer({ scale = 1 }) {
  // ❌ Bad: Create large layer, scale down
  // Uses full memory of 2000x2000 = 16MB
  <div style={{ width: 2000, height: 2000, transform: 'scale(0.5)' }} />
  
  // ✅ Good: Create at target size
  // Uses memory of 1000x1000 = 4MB
  <div style={{ width: 1000, height: 1000 }} />
}

// For responsive scaling, use CSS transforms on smaller base
function ResponsiveGPULayer() {
  const [containerSize, setContainerSize] = useState(1);
  
  return (
    <div 
      style={{ 
        width: 200, 
        height: 200,
        transform: `scale(${containerSize})`,
        transformOrigin: 'top left',
      }}
    />
  );
}
```

### Avoiding Layer Explosion

```tsx
// ❌ Bad: Each item gets its own layer
function BadList({ items }) {
  return items.map(item => (
    <motion.div
      key={item.id}
      whileHover={{ scale: 1.05 }} // Creates layer per item
    >
      {item.content}
    </motion.div>
  ));
}

// ✅ Good: Single layer, CSS transforms inside
function GoodList({ items }) {
  return (
    <motion.ul layout>
      {items.map(item => (
        <li
          key={item.id}
          className="transition-transform hover:scale-105"
        >
          {item.content}
        </li>
      ))}
    </motion.ul>
  );
}
```

### Mobile GPU Considerations

```tsx
function useMobileGPU() {
  const [isMobile, setIsMobile] = useState(false);
  const [gpuLimit, setGPULimit] = useState(20);
  
  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
    
    // Mobile devices have stricter limits
    if (mobile) {
      setGPULimit(10);
    }
  }, []);
  
  return { isMobile, gpuLimit };
}
```

## 8. Performance Considerations

### Debugging GPU Layers

```tsx
// Add this to debug layer creation
function DebugLayers() {
  useEffect(() => {
    // In Chrome DevTools:
    // 1. Open More Tools → Layers
    // 2. Or enable "Show Paint Rectangles" in Rendering
    
    console.log('To debug GPU layers:');
    console.log('1. DevTools → More Tools → Layers');
    console.log('2. Or DevTools → More Tools → Rendering → Layer borders');
  }, []);
  
  return null;
}
```

### Memory Monitoring

```tsx
function useGPUMemoryWarning(threshold: number = 50) { // MB
  useEffect(() => {
    const checkMemory = () => {
      // Estimate based on layer count and sizes
      const layers = document.querySelectorAll('[style*="will-change"], [style*="transform: translateZ"]');
      
      let estimatedMemory = 0;
      layers.forEach(layer => {
        const rect = layer.getBoundingClientRect();
        // RGBA = 4 bytes per pixel
        estimatedMemory += rect.width * rect.height * 4;
      });
      
      const memoryMB = estimatedMemory / (1024 * 1024);
      
      if (memoryMB > threshold) {
        console.warn(`Estimated GPU memory usage: ${memoryMB.toFixed(1)}MB`);
      }
    };
    
    const interval = setInterval(checkMemory, 5000);
    return () => clearInterval(interval);
  }, [threshold]);
}
```

## 9. Common Mistakes

### 1. Permanent will-change
**Problem:** `will-change` on all elements always.
**Solution:** Apply only during animation, remove after.

### 2. Too Many Layers
**Problem:** Hundreds of GPU layers consuming VRAM.
**Solution:** Batch elements, promote containers not items.

### 3. Large Offscreen Layers
**Problem:** Full-page layers that extend beyond viewport.
**Solution:** Size layers to visible area, use overflow hidden.

### 4. Ignoring Mobile
**Problem:** Works on desktop, crashes on mobile.
**Solution:** Test on real devices, reduce layer count for mobile.

### 5. Force Promotion Everywhere
**Problem:** `translateZ(0)` on everything.
**Solution:** Let browser manage layers, promote selectively.

## 10. Practice Exercises

### Exercise 1: Layer Inspector
Use Chrome Layers panel to analyze layer composition of a complex page.

### Exercise 2: Memory Analysis
Measure GPU memory usage before and after optimizations.

### Exercise 3: Mobile Testing
Test GPU-heavy animations on a low-end mobile device.

### Exercise 4: Adaptive Quality
Build a system that reduces GPU usage based on device capability.

### Exercise 5: Canvas Animation
Create a GPU-accelerated canvas animation with proper cleanup.

## 11. Advanced Topics

- **WebGL Integration** — Direct GPU programming
- **OffscreenCanvas** — Worker-thread rendering
- **GPU Memory Profiling** — Advanced debugging
- **Shader Effects** — Custom GPU programs
- **Metal/Vulkan** — Native GPU APIs (via WebGPU)
- **GPU Compute** — Non-graphics GPU usage
