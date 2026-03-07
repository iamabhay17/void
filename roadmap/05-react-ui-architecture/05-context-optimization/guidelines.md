# Context Optimization

## 1. Concept Overview

React Context is powerful for state sharing but can cause performance issues when misused. Context optimization is about structuring context to minimize unnecessary re-renders.

Key problems to solve:
- **Over-rendering** — All consumers re-render on any context change
- **Prop drilling avoidance** — Moving state to context when unnecessary
- **Update frequency mismatch** — Mixing fast and slow-changing values

Proper context optimization is essential for performant animated UIs.

## 2. Why This Matters for Design Engineers

Context performance directly affects animation quality:
- Re-renders during animation cause jank
- Large contexts can freeze the UI
- Poorly structured context limits component reuse

As a Design Engineer, you must:
- Split contexts by update frequency
- Memoize context values properly
- Use context selectively
- Consider alternatives when appropriate

## 3. Key Principles / Mental Models

### The Re-Render Chain
```
Context Value Changes
        ↓
All Consumers Re-render
        ↓
Their Children Re-render
        ↓
Animation Jank
```

### Update Frequency Classification
- **Static** — Never changes (theme, config)
- **Slow** — Rarely changes (user, preferences)
- **Medium** — Occasionally changes (filter state, selections)
- **Fast** — Frequently changes (mouse position, animations)

### Context Splitting Strategy
```tsx
// ❌ One context with everything
const AppContext = createContext({ user, theme, cartItems, mousePosition });

// ✅ Split by update frequency
const UserContext = createContext(user);      // Slow
const ThemeContext = createContext(theme);    // Static
const CartContext = createContext(cartItems); // Medium
// mousePosition shouldn't be in context at all!
```

## 4. Implementation in React

### Context Splitting

```tsx
// ❌ Everything in one context
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  notifications: Notification[];
  sidebarOpen: boolean;
}

const AppContext = createContext<AppState | null>(null);

// ✅ Split by concern and update frequency
const UserContext = createContext<User | null>(null);
const ThemeContext = createContext<'light' | 'dark'>('light');
const NotificationContext = createContext<Notification[]>([]);
const UIContext = createContext<{ sidebarOpen: boolean }>({ sidebarOpen: true });
```

### Separating State from Dispatch

```tsx
// ❌ State and actions together
const TodoContext = createContext<{
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  removeTodo: (id: string) => void;
} | null>(null);

// ✅ Separate state from dispatch
const TodoStateContext = createContext<Todo[]>([]);
const TodoDispatchContext = createContext<{
  addTodo: (todo: Todo) => void;
  removeTodo: (id: string) => void;
} | null>(null);

function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  
  // Memoize dispatch functions
  const dispatch = useMemo(() => ({
    addTodo: (todo: Todo) => setTodos(prev => [...prev, todo]),
    removeTodo: (id: string) => setTodos(prev => prev.filter(t => t.id !== id)),
  }), []);

  return (
    <TodoStateContext.Provider value={todos}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}

// Components that only dispatch don't re-render on state changes
function AddTodoButton() {
  const { addTodo } = useContext(TodoDispatchContext)!;
  // This component won't re-render when todos change
  return <button onClick={() => addTodo({ id: '1', text: 'New' })}>Add</button>;
}
```

### Memoizing Context Value

```tsx
// ❌ New object every render
function BadProvider({ children }) {
  const [count, setCount] = useState(0);
  
  return (
    <CountContext.Provider value={{ count, setCount }}>
      {children}
    </CountContext.Provider>
  );
}

// ✅ Memoized value
function GoodProvider({ children }) {
  const [count, setCount] = useState(0);
  
  const value = useMemo(() => ({ count, setCount }), [count]);
  
  return (
    <CountContext.Provider value={value}>
      {children}
    </CountContext.Provider>
  );
}
```

### Using Selector Pattern

```tsx
import { useSyncExternalStore } from 'react';

// Create a store with selector support
function createStore<T>(initialState: T) {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (newState: T | ((prev: T) => T)) => {
      state = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(state) 
        : newState;
      listeners.forEach(listener => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

// Use with selector
function useStoreSelector<T, S>(
  store: ReturnType<typeof createStore<T>>,
  selector: (state: T) => S
): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState())
  );
}

// Usage
const todoStore = createStore<{ todos: Todo[]; filter: string }>({
  todos: [],
  filter: 'all',
});

function TodoCount() {
  // Only re-renders when count changes, not when filter changes
  const count = useStoreSelector(todoStore, state => state.todos.length);
  return <span>{count} todos</span>;
}

function TodoFilter() {
  // Only re-renders when filter changes
  const filter = useStoreSelector(todoStore, state => state.filter);
  return <span>Filter: {filter}</span>;
}
```

## 5. React Patterns to Use

### Context Module Pattern

```tsx
// contexts/theme.tsx
const ThemeContext = createContext<Theme | null>(null);
const ThemeDispatchContext = createContext<((theme: Theme) => void) | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>({ mode: 'light', accent: 'blue' });

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeDispatchContext.Provider value={setTheme}>
        {children}
      </ThemeDispatchContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

export function useSetTheme() {
  const context = useContext(ThemeDispatchContext);
  if (!context) throw new Error('useSetTheme must be used within ThemeProvider');
  return context;
}

// Selector hook
export function useThemeMode() {
  const theme = useTheme();
  // Note: This still re-renders when any theme property changes
  return theme.mode;
}
```

### Compound Provider Pattern

```tsx
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <ToastProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </ToastProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

// Or compose programmatically
function composeProviders(...providers: React.FC<{ children: ReactNode }>[]) {
  return ({ children }: { children: ReactNode }) => 
    providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children
    );
}

const AppProviders = composeProviders(
  ThemeProvider,
  UserProvider,
  ToastProvider,
  ModalProvider
);
```

### Zustand for Complex State

```tsx
import { create } from 'zustand';

// Alternative to context for complex state with selectors
interface UIStore {
  sidebarOpen: boolean;
  activeModal: string | null;
  notifications: Notification[];
  toggleSidebar: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  activeModal: null,
  notifications: [],
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));

// Component with selector - only re-renders when sidebarOpen changes
function Sidebar() {
  const isOpen = useUIStore(state => state.sidebarOpen);
  const toggle = useUIStore(state => state.toggleSidebar);
  
  return (
    <motion.aside animate={{ x: isOpen ? 0 : -300 }}>
      <button onClick={toggle}>Toggle</button>
    </motion.aside>
  );
}
```

## 6. Important Hooks

### useContextSelector (Custom Implementation)

```tsx
import { createContext, useContext, useRef, useEffect, useState } from 'react';

type Listener<T> = (state: T) => void;

function createSelectableContext<T>() {
  const StateContext = createContext<T | null>(null);
  const ListenersContext = createContext<React.MutableRefObject<Set<Listener<T>>> | null>(null);

  function Provider({ value, children }: { value: T; children: ReactNode }) {
    const listeners = useRef(new Set<Listener<T>>());
    const stateRef = useRef(value);
    stateRef.current = value;

    useEffect(() => {
      listeners.current.forEach(listener => listener(value));
    }, [value]);

    return (
      <ListenersContext.Provider value={listeners}>
        <StateContext.Provider value={value}>
          {children}
        </StateContext.Provider>
      </ListenersContext.Provider>
    );
  }

  function useSelector<S>(selector: (state: T) => S): S {
    const state = useContext(StateContext);
    const listeners = useContext(ListenersContext);
    
    if (!state || !listeners) {
      throw new Error('useSelector must be used within Provider');
    }

    const [selected, setSelected] = useState(() => selector(state));
    const selectorRef = useRef(selector);
    selectorRef.current = selector;

    useEffect(() => {
      const listener: Listener<T> = (newState) => {
        const newSelected = selectorRef.current(newState);
        setSelected(prev => {
          if (Object.is(prev, newSelected)) return prev;
          return newSelected;
        });
      };

      listeners.current.add(listener);
      return () => {
        listeners.current.delete(listener);
      };
    }, [listeners]);

    return selected;
  }

  return { Provider, useSelector };
}

// Usage
const { Provider: TodoProvider, useSelector: useTodoSelector } = 
  createSelectableContext<{ todos: Todo[]; filter: string }>();

function TodoCount() {
  const count = useTodoSelector(state => state.todos.length);
  return <span>{count}</span>;
}
```

### useMemoizedCallback

```tsx
function useMemoizedCallback<T extends (...args: any[]) => any>(callback: T): T {
  const ref = useRef(callback);
  
  useEffect(() => {
    ref.current = callback;
  });
  
  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args);
  }, []) as T;
}
```

## 7. Animation Considerations

### Isolating Animation State

```tsx
// ❌ Animation state in main context causes re-renders
const AppContext = createContext({
  user,
  theme,
  animationProgress: 0.5, // Changes 60 times per second!
});

// ✅ Keep animation state outside context
function AnimatedComponent() {
  const progress = useMotionValue(0);
  
  // Motion values don't cause re-renders
  return <motion.div style={{ opacity: progress }} />;
}

// ✅ Or use a dedicated animation context
const AnimationContext = createContext<{
  isAnimating: boolean;
  duration: number;
}>({
  isAnimating: false,
  duration: 300,
});
```

### Animation State Without Re-renders

```tsx
import { useMotionValue, MotionValue } from 'framer-motion';

// Context for motion values (doesn't re-render on updates)
const MotionContext = createContext<{
  scrollY: MotionValue<number>;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
} | null>(null);

function MotionProvider({ children }: { children: ReactNode }) {
  const scrollY = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleScroll = () => scrollY.set(window.scrollY);
    const handleMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouse);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, [scrollY, mouseX, mouseY]);

  // Value object is stable, motion values update internally
  const value = useMemo(() => ({ scrollY, mouseX, mouseY }), []);

  return (
    <MotionContext.Provider value={value}>
      {children}
    </MotionContext.Provider>
  );
}

function useMotionContext() {
  const context = useContext(MotionContext);
  if (!context) throw new Error('Must be within MotionProvider');
  return context;
}

// Usage - no re-renders even with constant mouse movement
function FollowCursor() {
  const { mouseX, mouseY } = useMotionContext();
  
  return (
    <motion.div
      className="fixed w-4 h-4 bg-blue-500 rounded-full pointer-events-none"
      style={{ x: mouseX, y: mouseY }}
    />
  );
}
```

## 8. Performance Considerations

### Profiling Context Updates

```tsx
function ProfiledProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  
  useEffect(() => {
    console.log('[Context] State updated:', state);
  }, [state]);
  
  return (
    <Profiler
      id="MyContext"
      onRender={(id, phase, actualDuration) => {
        console.log(`[Profiler] ${id} ${phase}: ${actualDuration.toFixed(2)}ms`);
      }}
    >
      <MyContext.Provider value={state}>
        {children}
      </MyContext.Provider>
    </Profiler>
  );
}
```

### Batch Updates

```tsx
import { unstable_batchedUpdates } from 'react-dom';

function useBatchedDispatch() {
  const dispatch = useContext(DispatchContext)!;
  
  return useCallback((...actions: Action[]) => {
    unstable_batchedUpdates(() => {
      actions.forEach(action => dispatch(action));
    });
  }, [dispatch]);
}
```

## 9. Common Mistakes

### 1. One Giant Context
**Problem:** Everything in one context, all consumers re-render.
**Solution:** Split by concern and update frequency.

### 2. Non-Memoized Values
**Problem:** Creating new object every render.
**Solution:** Use useMemo for context values.

### 3. Animation State in Context
**Problem:** 60fps updates through context.
**Solution:** Use motion values or refs for animation state.

### 4. Using Context for Local State
**Problem:** Lifting state to context unnecessarily.
**Solution:** Keep state local when possible.

### 5. Missing Provider Errors
**Problem:** Cryptic errors when provider is missing.
**Solution:** Throw descriptive errors in hooks.

## 10. Practice Exercises

### Exercise 1: Split a Monolith
Take a large context and split it into multiple focused contexts.

### Exercise 2: Add Selectors
Implement selector pattern for a shopping cart context.

### Exercise 3: Animation Context
Build a context that shares animation state without causing re-renders.

### Exercise 4: State vs. Dispatch
Separate state from dispatch in an existing context.

### Exercise 5: Migrate to Zustand
Convert a complex context to Zustand with proper selectors.

## 11. Advanced Topics

- **Jotai/Recoil** — Atomic state management
- **React Query Context** — Server state management
- **Module Federation** — Sharing context across micro-frontends
- **SSR Hydration** — Context in server-rendered apps
- **DevTools Integration** — Debugging context with React DevTools
- **Concurrent Features** — Context with Suspense and transitions
