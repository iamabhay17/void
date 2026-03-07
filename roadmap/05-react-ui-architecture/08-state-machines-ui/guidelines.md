# State Machines for UI

## 1. Concept Overview

State machines model UI as explicit states with defined transitions. Instead of managing boolean flags, you define what states exist and what events cause transitions between them.

```tsx
// ❌ Boolean soup
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);

// ✅ State machine
type State = 'idle' | 'loading' | 'success' | 'error';
const [state, setState] = useState<State>('idle');
```

State machines eliminate impossible states and make complex UI logic predictable.

## 2. Why This Matters for Design Engineers

State machines solve UI complexity:
- Multi-step forms with branching paths
- Modals with loading and error states
- Drag-and-drop interactions
- Complex animation sequences

As a Design Engineer, you must:
- Identify all possible UI states
- Define valid transitions between states
- Handle edge cases systematically
- Coordinate animations with state changes

## 3. Key Principles / Mental Models

### States vs. Boolean Flags
Booleans can represent 2^n states, but only some are valid:
```tsx
// With booleans: 8 possible states (2^3)
{ isLoading: true, isSuccess: true, isError: true }  // Impossible!

// With state machine: only valid states
'idle' | 'loading' | 'success' | 'error'  // 4 valid states
```

### Finite State Machine Anatomy
- **States** — Finite set of conditions (idle, loading, success)
- **Events** — Things that happen (SUBMIT, RETRY, CANCEL)
- **Transitions** — Rules: State + Event → New State
- **Context** — Extra data (error message, result)

### Transition Table
```
State    + Event   → New State
──────────────────────────────
idle     + SUBMIT  → loading
loading  + SUCCESS → success
loading  + ERROR   → error
error    + RETRY   → loading
```

## 4. Implementation in React

### Simple State Machine with useReducer

```tsx
type State = 'idle' | 'loading' | 'success' | 'error';
type Event = 
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS'; data: any }
  | { type: 'ERROR'; error: string }
  | { type: 'RETRY' }
  | { type: 'RESET' };

interface Context {
  state: State;
  data: any | null;
  error: string | null;
}

function reducer(context: Context, event: Event): Context {
  switch (context.state) {
    case 'idle':
      if (event.type === 'SUBMIT') {
        return { ...context, state: 'loading' };
      }
      break;
      
    case 'loading':
      if (event.type === 'SUCCESS') {
        return { state: 'success', data: event.data, error: null };
      }
      if (event.type === 'ERROR') {
        return { state: 'error', data: null, error: event.error };
      }
      break;
      
    case 'success':
      if (event.type === 'RESET') {
        return { state: 'idle', data: null, error: null };
      }
      break;
      
    case 'error':
      if (event.type === 'RETRY') {
        return { ...context, state: 'loading', error: null };
      }
      if (event.type === 'RESET') {
        return { state: 'idle', data: null, error: null };
      }
      break;
  }
  
  // Invalid transition - return unchanged
  return context;
}

function AsyncForm() {
  const [{ state, data, error }, dispatch] = useReducer(reducer, {
    state: 'idle',
    data: null,
    error: null,
  });

  const handleSubmit = async () => {
    dispatch({ type: 'SUBMIT' });
    try {
      const result = await submitForm();
      dispatch({ type: 'SUCCESS', data: result });
    } catch (e) {
      dispatch({ type: 'ERROR', error: e.message });
    }
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.button
            key="submit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSubmit}
          >
            Submit
          </motion.button>
        )}
        
        {state === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Spinner />
          </motion.div>
        )}
        
        {state === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ✓ Success! {data}
          </motion.div>
        )}
        
        {state === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p>Error: {error}</p>
            <button onClick={() => dispatch({ type: 'RETRY' })}>Retry</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### XState for Complex Machines

```tsx
import { createMachine, assign } from 'xstate';
import { useMachine } from '@xstate/react';

const formMachine = createMachine({
  id: 'form',
  initial: 'idle',
  context: {
    data: null as any,
    error: null as string | null,
    retries: 0,
  },
  states: {
    idle: {
      on: { SUBMIT: 'loading' },
    },
    loading: {
      invoke: {
        src: 'submitForm',
        onDone: {
          target: 'success',
          actions: assign({ data: (_, event) => event.data }),
        },
        onError: {
          target: 'error',
          actions: assign({ error: (_, event) => event.data.message }),
        },
      },
    },
    success: {
      on: { RESET: 'idle' },
    },
    error: {
      on: {
        RETRY: {
          target: 'loading',
          actions: assign({ retries: (ctx) => ctx.retries + 1 }),
          cond: (ctx) => ctx.retries < 3,
        },
        RESET: 'idle',
      },
    },
  },
});

function XStateForm() {
  const [state, send] = useMachine(formMachine, {
    services: {
      submitForm: async () => {
        const response = await fetch('/api/submit');
        return response.json();
      },
    },
  });

  return (
    <AnimatePresence mode="wait">
      {state.matches('idle') && (
        <motion.button
          key="submit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => send('SUBMIT')}
        >
          Submit
        </motion.button>
      )}
      
      {state.matches('loading') && (
        <motion.div key="loading">Loading...</motion.div>
      )}
      
      {state.matches('success') && (
        <motion.div key="success">
          Success: {state.context.data}
        </motion.div>
      )}
      
      {state.matches('error') && (
        <motion.div key="error">
          Error: {state.context.error}
          <button onClick={() => send('RETRY')}>
            Retry ({3 - state.context.retries} left)
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Modal State Machine

```tsx
type ModalState = 'closed' | 'opening' | 'open' | 'closing';
type ModalEvent = 
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'ANIMATION_END' };

function modalReducer(state: ModalState, event: ModalEvent): ModalState {
  switch (state) {
    case 'closed':
      if (event.type === 'OPEN') return 'opening';
      break;
    case 'opening':
      if (event.type === 'ANIMATION_END') return 'open';
      if (event.type === 'CLOSE') return 'closing';
      break;
    case 'open':
      if (event.type === 'CLOSE') return 'closing';
      break;
    case 'closing':
      if (event.type === 'ANIMATION_END') return 'closed';
      if (event.type === 'OPEN') return 'opening';
      break;
  }
  return state;
}

function AnimatedModal() {
  const [state, dispatch] = useReducer(modalReducer, 'closed');
  
  const isVisible = state !== 'closed';
  const isAnimatingIn = state === 'opening';
  
  return (
    <>
      <button onClick={() => dispatch({ type: 'OPEN' })}>
        Open Modal
      </button>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: isAnimatingIn ? 1 : 0,
              scale: isAnimatingIn ? 1 : 0.95,
            }}
            onAnimationComplete={() => {
              dispatch({ type: 'ANIMATION_END' });
            }}
            className="fixed inset-0 flex items-center justify-center bg-black/50"
          >
            <div className="bg-white p-6 rounded-xl">
              <p>Modal content</p>
              <button onClick={() => dispatch({ type: 'CLOSE' })}>
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

## 5. React Patterns to Use

### Multi-Step Form Machine

```tsx
type FormState = 'step1' | 'step2' | 'step3' | 'submitting' | 'complete';
type FormEvent =
  | { type: 'NEXT'; data: any }
  | { type: 'BACK' }
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS' }
  | { type: 'ERROR' };

interface FormContext {
  state: FormState;
  step1Data: any;
  step2Data: any;
  step3Data: any;
}

const transitions: Record<FormState, Partial<Record<FormEvent['type'], FormState>>> = {
  step1: { NEXT: 'step2' },
  step2: { NEXT: 'step3', BACK: 'step1' },
  step3: { SUBMIT: 'submitting', BACK: 'step2' },
  submitting: { SUCCESS: 'complete', ERROR: 'step3' },
  complete: {},
};

function formReducer(context: FormContext, event: FormEvent): FormContext {
  const nextState = transitions[context.state][event.type];
  if (!nextState) return context;

  // Save step data on NEXT
  if (event.type === 'NEXT') {
    return {
      ...context,
      state: nextState,
      [`${context.state}Data`]: event.data,
    };
  }

  return { ...context, state: nextState };
}

function MultiStepForm() {
  const [{ state, ...data }, dispatch] = useReducer(formReducer, {
    state: 'step1',
    step1Data: null,
    step2Data: null,
    step3Data: null,
  });

  const stepNumber = state.startsWith('step') ? parseInt(state.slice(-1)) : null;

  return (
    <div>
      {/* Progress indicator */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map(n => (
          <motion.div
            key={n}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            animate={{
              backgroundColor: stepNumber && n <= stepNumber ? '#3b82f6' : '#e5e7eb',
              color: stepNumber && n <= stepNumber ? '#fff' : '#6b7280',
            }}
          >
            {n}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {state === 'step1' && (
            <Step1 onNext={(data) => dispatch({ type: 'NEXT', data })} />
          )}
          {state === 'step2' && (
            <Step2
              onNext={(data) => dispatch({ type: 'NEXT', data })}
              onBack={() => dispatch({ type: 'BACK' })}
            />
          )}
          {state === 'step3' && (
            <Step3
              onSubmit={() => dispatch({ type: 'SUBMIT' })}
              onBack={() => dispatch({ type: 'BACK' })}
            />
          )}
          {state === 'submitting' && <Spinner />}
          {state === 'complete' && <Success />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

### Drag and Drop Machine

```tsx
type DragState = 'idle' | 'dragging' | 'dropping';
type DragEvent =
  | { type: 'DRAG_START'; item: any; position: { x: number; y: number } }
  | { type: 'DRAG_MOVE'; position: { x: number; y: number } }
  | { type: 'DRAG_END' }
  | { type: 'DROP'; target: string };

interface DragContext {
  state: DragState;
  draggedItem: any;
  position: { x: number; y: number };
  dropTarget: string | null;
}

function dragReducer(context: DragContext, event: DragEvent): DragContext {
  switch (context.state) {
    case 'idle':
      if (event.type === 'DRAG_START') {
        return {
          state: 'dragging',
          draggedItem: event.item,
          position: event.position,
          dropTarget: null,
        };
      }
      break;
      
    case 'dragging':
      if (event.type === 'DRAG_MOVE') {
        return { ...context, position: event.position };
      }
      if (event.type === 'DROP') {
        return { ...context, state: 'dropping', dropTarget: event.target };
      }
      if (event.type === 'DRAG_END') {
        return { state: 'idle', draggedItem: null, position: { x: 0, y: 0 }, dropTarget: null };
      }
      break;
      
    case 'dropping':
      if (event.type === 'DRAG_END') {
        return { state: 'idle', draggedItem: null, position: { x: 0, y: 0 }, dropTarget: null };
      }
      break;
  }
  return context;
}
```

## 6. Important Hooks

### useStateMachine Hook

```tsx
function useStateMachine<S extends string, E extends { type: string }>(
  reducer: (state: S, event: E) => S,
  initialState: S
) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const can = useCallback((eventType: E['type']) => {
    const testEvent = { type: eventType } as E;
    const nextState = reducer(state, testEvent);
    return nextState !== state;
  }, [state, reducer]);
  
  const send = useCallback((event: E) => {
    if (process.env.NODE_ENV === 'development') {
      const nextState = reducer(state, event);
      if (nextState === state) {
        console.warn(
          `Invalid transition: ${state} + ${event.type}`,
          'Event ignored.'
        );
      }
    }
    dispatch(event);
  }, [state, reducer]);
  
  return { state, send, can };
}
```

### useAnimatedState

```tsx
function useAnimatedState<S extends string, E extends { type: string }>(
  reducer: (state: S, event: E) => S,
  initialState: S
) {
  const [displayState, setDisplayState] = useState(initialState);
  const [targetState, setTargetState] = useState(initialState);
  const [isAnimating, setIsAnimating] = useState(false);

  const send = useCallback((event: E) => {
    const nextState = reducer(targetState, event);
    if (nextState !== targetState) {
      setTargetState(nextState);
      setIsAnimating(true);
    }
  }, [targetState, reducer]);

  const onAnimationComplete = useCallback(() => {
    setDisplayState(targetState);
    setIsAnimating(false);
  }, [targetState]);

  return {
    displayState,
    targetState,
    isAnimating,
    send,
    onAnimationComplete,
  };
}
```

## 7. Animation Considerations

### Animation-Aware States

```tsx
type UIState = 
  | 'idle'
  | 'entering'
  | 'active'
  | 'exiting';

// States include animation phases
const machine = createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: { SHOW: 'entering' },
    },
    entering: {
      after: { 300: 'active' }, // Transition after animation
      on: { HIDE: 'exiting' },
    },
    active: {
      on: { HIDE: 'exiting' },
    },
    exiting: {
      after: { 200: 'idle' },
      on: { SHOW: 'entering' },
    },
  },
});
```

### Coordinating Animations with State

```tsx
function StateMachineAnimation() {
  const [state, send] = useMachine(toastMachine);

  const variants = {
    idle: { opacity: 0, y: 50 },
    entering: { opacity: 1, y: 0 },
    active: { opacity: 1, y: 0 },
    exiting: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      variants={variants}
      animate={state.value}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onAnimationComplete={() => {
        if (state.matches('entering')) {
          send('ANIMATION_COMPLETE');
        }
        if (state.matches('exiting')) {
          send('ANIMATION_COMPLETE');
        }
      }}
    >
      Toast message
    </motion.div>
  );
}
```

## 8. Performance Considerations

### Memoizing Transitions

```tsx
const transitions = useMemo(() => ({
  idle: { SUBMIT: 'loading' },
  loading: { SUCCESS: 'success', ERROR: 'error' },
  success: { RESET: 'idle' },
  error: { RETRY: 'loading', RESET: 'idle' },
}), []);
```

### Avoiding Object Creation

```tsx
// ❌ Creates new object each call
dispatch({ type: 'SUBMIT' });

// ✅ Reuse event objects
const SUBMIT_EVENT = { type: 'SUBMIT' } as const;
dispatch(SUBMIT_EVENT);
```

## 9. Common Mistakes

### 1. Not Handling Invalid Transitions
**Problem:** Silent failures when invalid event sent.
**Solution:** Log warnings in development.

### 2. Mixing State Machine with Booleans
**Problem:** Back to impossible states.
**Solution:** Keep all related state in the machine.

### 3. Missing Animation States
**Problem:** Animations interrupted by state changes.
**Solution:** Include entering/exiting states.

### 4. Overcomplicated Machines
**Problem:** Too many states and transitions.
**Solution:** Use hierarchical states or split machines.

### 5. Forgetting Context
**Problem:** State alone isn't enough info.
**Solution:** Include context for additional data.

## 10. Practice Exercises

### Exercise 1: Toggle Machine
Build a toggle with explicit on/off/transitioning states.

### Exercise 2: Fetch Machine
Create a complete fetch machine with retry and caching.

### Exercise 3: Multi-Step Wizard
Build a form wizard with branching paths.

### Exercise 4: Notification Queue
Create a notification system that queues and animates.

### Exercise 5: Drag and Drop
Implement full drag-and-drop with state machine.

## 11. Advanced Topics

- **Parallel States** — Multiple orthogonal state regions
- **History States** — Remembering previous state
- **Actor Model** — Spawning child machines
- **State Charts** — Visual state machine design
- **Testing Machines** — Model-based testing
- **DevTools** — XState visualizer and inspector
