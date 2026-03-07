# Error Boundaries & Recovery

## 1. Concept Overview

Error boundaries are React components that catch JavaScript errors in their child component tree, log those errors, and display a fallback UI instead of crashing the entire application.

Key capabilities:
- Catch rendering errors
- Display fallback UI
- Enable error reporting
- Allow recovery/retry

```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <ComponentThatMightFail />
</ErrorBoundary>
```

## 2. Why This Matters for Design Engineers

Error handling affects UX:
- Graceful degradation
- Clear error communication
- Recovery options
- User confidence

As a Design Engineer, you must:
- Design helpful error states
- Create recovery mechanisms
- Animate error transitions
- Balance detail with clarity

## 3. Key Principles / Mental Models

### Error Types
```
1. Render errors: Component crashes during render
2. Event errors: onClick throws (not caught by boundaries)
3. Async errors: API failures (need try/catch)
4. Network errors: Failed requests
```

### Boundary Placement
```
                    [Root Boundary]
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
[Layout]              [Content]             [Sidebar]
    │                     │                     │
    └──[Feature Boundary]─┘                     │
           │                                    │
    [Isolated Feature]                   [Widget Boundary]
                                               │
                                         [Chat Widget]
```

### Recovery Strategies
```
1. Retry: Try the same action again
2. Refresh: Reload the section/page
3. Reset: Clear state and restart
4. Fallback: Use alternative content
5. Report: Log error and show contact
```

## 4. Implementation in React

### Class-based Error Boundary

```tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.reset}
        />
      );
    }

    return this.props.children;
  }
}
```

### Animated Error Fallback

```tsx
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      {/* Error icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
      >
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-gray-900 mb-2"
      >
        Something went wrong
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 mb-6 max-w-md"
      >
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onReset}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Try again
      </motion.button>
    </motion.div>
  );
}
```

### Error Boundary with React Query

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query';

function QueryErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

## 5. React Patterns to Use

### Retry with Exponential Backoff

```tsx
function RetryableContent({ children }: { children: ReactNode }) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = async (error: Error, onReset: () => void) => {
    if (retryCount >= 3) {
      return; // Give up after 3 attempts
    }

    setIsRetrying(true);
    
    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, retryCount) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    setRetryCount(prev => prev + 1);
    setIsRetrying(false);
    onReset();
  };

  return (
    <ErrorBoundary
      onError={(error, reset) => handleError(error, reset)}
      fallback={
        isRetrying ? (
          <div className="flex items-center gap-2">
            <Spinner />
            <span>Retrying... (attempt {retryCount + 1}/3)</span>
          </div>
        ) : undefined
      }
    >
      {children}
    </ErrorBoundary>
  );
}
```

### Contextual Error Boundaries

```tsx
// Different fallbacks for different contexts
function App() {
  return (
    <ErrorBoundary fallback={<FullPageError />}>
      <Layout>
        <ErrorBoundary fallback={<SidebarError />}>
          <Sidebar />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<ContentError />}>
          <MainContent />
        </ErrorBoundary>
      </Layout>
    </ErrorBoundary>
  );
}
```

### Error with Recovery Options

```tsx
function ErrorWithOptions({ error, onReset }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  const copyError = () => {
    navigator.clipboard.writeText(
      `Error: ${error?.message}\n\nStack: ${error?.stack}`
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <AlertIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Oops! Something broke</h2>
      </div>

      <div className="space-y-3">
        <button
          onClick={onReset}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Refresh page
        </button>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 text-gray-500 text-sm hover:text-gray-700"
        >
          {showDetails ? 'Hide' : 'Show'} technical details
        </button>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 overflow-hidden"
          >
            <pre className="p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
              {error?.stack}
            </pre>
            <button
              onClick={copyError}
              className="mt-2 text-sm text-blue-500 hover:text-blue-600"
            >
              Copy to clipboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

### Suspense + Error Boundary Combo

```tsx
function AsyncContent({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingSkeleton />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
```

## 6. Error Reporting

### Integration with Error Services

```tsx
import * as Sentry from '@sentry/react';

class ReportingErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.withScope(scope => {
      scope.setExtras({
        componentStack: errorInfo.componentStack,
      });
      Sentry.captureException(error);
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.reset}
          eventId={Sentry.lastEventId()}
        />
      );
    }
    return this.props.children;
  }
}
```

## 7. Animation Considerations

### Smooth Error Transitions

```tsx
function AnimatedErrorBoundary({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'idle' | 'error'>('idle');
  const [error, setError] = useState<Error | null>(null);

  return (
    <AnimatePresence mode="wait">
      {state === 'error' ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <ErrorFallback error={error} onReset={() => setState('idle')} />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <ErrorBoundaryCore
            onError={(e) => { setError(e); setState('error'); }}
          >
            {children}
          </ErrorBoundaryCore>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Error State Micro-interactions

```tsx
function ShakingError({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: [0, -10, 10, -10, 10, 0] }}
      transition={{ duration: 0.5 }}
      className="p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <p className="text-red-700">Something went wrong!</p>
      <button onClick={onReset}>Retry</button>
    </motion.div>
  );
}
```

## 8. Performance Considerations

### Lazy Error Fallbacks

```tsx
const HeavyErrorFallback = lazy(() => import('./HeavyErrorFallback'));

class ErrorBoundary extends Component<Props, State> {
  render() {
    if (this.state.hasError) {
      return (
        <Suspense fallback={<SimpleError />}>
          <HeavyErrorFallback error={this.state.error} />
        </Suspense>
      );
    }
    return this.props.children;
  }
}
```

### Prevent Error Cascade

```tsx
// Isolate features to prevent cascade
function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <ErrorBoundary fallback={<WidgetError />}>
        <Widget1 />
      </ErrorBoundary>
      <ErrorBoundary fallback={<WidgetError />}>
        <Widget2 />
      </ErrorBoundary>
      <ErrorBoundary fallback={<WidgetError />}>
        <Widget3 />
      </ErrorBoundary>
    </div>
  );
}
```

## 9. Common Mistakes

### 1. No Error Boundary
**Problem:** One error crashes entire app.
**Solution:** Add boundaries at key points.

### 2. Single Root Boundary
**Problem:** Entire app shows error state.
**Solution:** Add granular boundaries.

### 3. No Recovery Option
**Problem:** User stuck in error state.
**Solution:** Always provide retry/refresh option.

### 4. Not Catching Async Errors
**Problem:** Promises reject unhandled.
**Solution:** Use try/catch in async code.

### 5. Too Much Detail
**Problem:** Technical errors scare users.
**Solution:** User-friendly messages, hide stack.

## 10. Practice Exercises

### Exercise 1: Widget Dashboard
Create dashboard with isolated error boundaries per widget.

### Exercise 2: Form Recovery
Build form that saves progress and recovers after error.

### Exercise 3: API Error Handling
Create comprehensive API error handling with retry.

### Exercise 4: Offline Fallback
Build error boundary that detects offline state.

### Exercise 5: Error Analytics
Implement error tracking with Sentry integration.

## 11. Advanced Topics

- **Error Boundary Hooks** — react-error-boundary library
- **Partial Hydration Errors** — SSR error handling
- **Error Aggregation** — Grouping similar errors
- **User Feedback Collection** — "What were you doing?" forms
- **Graceful Degradation** — Progressive feature fallback
- **Self-Healing UI** — Automatic recovery strategies
