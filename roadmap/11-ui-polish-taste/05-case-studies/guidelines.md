# Case Studies

## 1. Concept Overview

Case studies are deep-dive analyses of real products and design decisions. By studying how excellent products approach design and engineering challenges, we internalize patterns and principles we can apply to our own work.

This module examines:
- How world-class products handle common UI challenges
- The engineering decisions behind polished interactions
- Patterns that can be adapted to your own work

```
Theory → See it in practice → Apply to your work
```

## 2. Why This Matters for Design Engineers

Case studies provide:
- Real-world validation of principles
- Concrete implementation references
- Understanding of trade-offs
- Inspiration for your own solutions

## 3. Case Study: Linear

### The Context
Linear is a project management tool known for its exceptional design polish. It demonstrates how attention to detail creates a premium feel.

### Key Patterns

#### 1. Command Menu (⌘K)

```tsx
// Linear's command menu is instantly responsive
// Key implementation details:

function CommandMenu() {
  // 1. Pre-loaded data - no loading states
  const { commands, issues, projects } = usePreloadedData();
  
  // 2. Instant filter with keyboard navigation
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(0);
  
  // 3. Fuzzy search for forgiving input
  const filtered = useMemo(() => 
    fuzzysort.go(search, commands, { key: 'label' }),
    [search, commands]
  );
  
  // 4. Sophisticated keyboard handling
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setSelected(s => Math.min(s + 1, filtered.length - 1));
      }
      // ... etc
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.15 }} // Fast, precise
    >
      <input 
        autoFocus
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="text-lg" // Large, easy to read
      />
      <Results items={filtered} selected={selected} />
    </motion.div>
  );
}

// Takeaways:
// - Speed is a feature: instant response
// - Keyboard-first: full keyboard navigation
// - Fuzzy matching: forgives typos
// - Subtle animation: fast but polished
```

#### 2. Issue Status Transitions

```tsx
// Linear's status changes feel seamless

function IssueStatus({ issue }: { issue: Issue }) {
  const [status, setStatus] = useState(issue.status);
  const [isPending, setIsPending] = useState(false);

  const updateStatus = async (newStatus: Status) => {
    const previousStatus = status;
    
    // Optimistic update
    setStatus(newStatus);
    setIsPending(true);
    
    try {
      await api.updateIssueStatus(issue.id, newStatus);
    } catch {
      // Subtle rollback with animation
      setStatus(previousStatus);
      toast.error('Failed to update status');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.button
      layout
      animate={{ opacity: isPending ? 0.7 : 1 }}
      className="flex items-center gap-2"
    >
      <motion.div
        key={status}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <StatusIcon status={status} />
      </motion.div>
      <span>{statusLabels[status]}</span>
    </motion.button>
  );
}

// Takeaways:
// - Optimistic updates: instant feedback
// - Visual continuity: animate between states
// - Graceful errors: subtle rollback
// - Spring physics: natural feel
```

#### 3. Sidebar Navigation

```tsx
// Linear's sidebar has subtle but important polish

function Sidebar() {
  const [collapsed, setCollapsed] = usePersistedState('sidebar', false);
  
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ 
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
      className="border-r bg-gray-50/50" // Subtle background
    >
      {/* Logo area maintains click target */}
      <div className="h-14 flex items-center px-4">
        <Logo collapsed={collapsed} />
      </div>
      
      {/* Items animate individually */}
      <nav className="space-y-1 px-2">
        {items.map((item, i) => (
          <motion.a
            key={item.path}
            href={item.path}
            initial={false}
            animate={{
              paddingLeft: collapsed ? 12 : 16,
            }}
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
            className="flex items-center gap-3 py-2 rounded-lg"
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.a>
        ))}
      </nav>
    </motion.aside>
  );
}

// Takeaways:
// - State persistence: remembers preference
// - Layout animation: smooth collapse
// - Text handling: graceful show/hide
// - Subtle hover: not distracting
```

## 4. Case Study: Stripe

### The Context
Stripe is known for exceptional documentation, forms, and visual polish. Their attention to error handling and guidance sets industry standards.

### Key Patterns

#### 1. Form Validation

```tsx
// Stripe's inline validation is immediate and helpful

function StripeStyleInput({
  label,
  value,
  onChange,
  validate,
  suggestions,
}: InputProps) {
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Validate on blur, not on every keystroke
  const handleBlur = () => {
    setIsFocused(false);
    setIsDirty(true);
    
    const validationError = validate(value);
    setError(validationError);
  };

  // But clear errors as they're fixed
  useEffect(() => {
    if (error && isDirty) {
      const validationError = validate(value);
      if (!validationError) {
        setError(null);
      }
    }
  }, [value, error, isDirty, validate]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        className={cn(
          'w-full px-3 py-2 rounded-lg border transition-all',
          'focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-red-500 focus:ring-red-500/20'
            : 'border-gray-300 focus:ring-blue-500/20 focus:border-blue-500'
        )}
      />
      
      {/* Error with animation */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="text-sm text-red-500 mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      
      {/* Inline suggestions */}
      {suggestions && isFocused && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-1 w-full bg-white border rounded-lg shadow-lg"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onChange(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50"
            >
              {suggestion}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Takeaways:
// - Validation timing: on blur, not keystroke
// - Error clearing: immediate when fixed
// - Inline help: suggestions when focused
// - Animated feedback: smooth transitions
```

#### 2. Code Block Interactions

```tsx
// Stripe's code blocks have excellent copy UX

function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="relative group rounded-xl overflow-hidden bg-gray-900">
      {/* Language badge */}
      <div className="absolute top-2 left-3 text-xs text-gray-500 uppercase">
        {language}
      </div>
      
      {/* Copy button - visible on hover */}
      <motion.button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <CheckIcon className="w-4 h-4 text-green-400" />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <CopyIcon className="w-4 h-4 text-gray-400" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Code with line highlighting */}
      <pre className="p-4 pt-10 overflow-x-auto">
        {lines.map((line, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredLine(i)}
            onMouseLeave={() => setHoveredLine(null)}
            className={cn(
              'transition-colors',
              hoveredLine === i && 'bg-gray-800/50'
            )}
          >
            <span className="select-none text-gray-600 mr-4 w-8 inline-block text-right">
              {i + 1}
            </span>
            <code>{line}</code>
          </div>
        ))}
      </pre>
    </div>
  );
}

// Takeaways:
// - Copy feedback: clear confirmation
// - Line numbers: not selectable
// - Hover states: line highlighting
// - Progressive disclosure: show tools on hover
```

## 5. Case Study: Vercel

### The Context
Vercel excels at developer experience, deployment feedback, and marketing polish. Their real-time feedback during deployments is exemplary.

### Key Patterns

#### 1. Deployment Progress

```tsx
// Vercel's deployment UI shows excellent state communication

interface DeploymentStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
}

function DeploymentProgress({ steps }: { steps: DeploymentStep[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-3 py-2"
        >
          {/* Status indicator */}
          <div className="w-6 h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {step.status === 'pending' && (
                <motion.div
                  key="pending"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-2 h-2 rounded-full bg-gray-300"
                />
              )}
              {step.status === 'running' && (
                <motion.div
                  key="running"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ rotate: { repeat: Infinity, duration: 1 } }}
                  className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                />
              )}
              {step.status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <motion.svg
                    viewBox="0 0 24 24"
                    className="w-3 h-3 text-white"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </motion.svg>
                </motion.div>
              )}
              {step.status === 'error' && (
                <motion.div
                  key="error"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <XIcon className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Step info */}
          <div className="flex-1 flex items-center justify-between">
            <span className={cn(
              step.status === 'pending' && 'text-gray-400',
              step.status === 'running' && 'text-gray-900 font-medium',
              step.status === 'success' && 'text-gray-600',
              step.status === 'error' && 'text-red-600',
            )}>
              {step.label}
            </span>
            
            {step.duration && (
              <span className="text-sm text-gray-400 tabular-nums">
                {step.duration}ms
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Takeaways:
// - Clear state indicators: each state visually distinct
// - Progressive reveal: steps animate in
// - Timing info: shows duration for completed steps
// - Animated checkmark: satisfying completion
```

## 6. Patterns Across All Studies

### Common Excellence Patterns

```tsx
const universalPatterns = {
  speed: {
    principle: 'UI responds in <100ms',
    techniques: [
      'Optimistic updates',
      'Pre-loading data',
      'Skeleton states',
      'Local-first state',
    ],
  },
  
  feedback: {
    principle: 'Every action has clear feedback',
    techniques: [
      'State-based styling',
      'Micro-animations',
      'Toast notifications',
      'Inline validation',
    ],
  },
  
  transitions: {
    principle: 'State changes are smooth',
    techniques: [
      'AnimatePresence for mounting',
      'Layout animations',
      'Spring physics',
      'Staggered children',
    ],
  },
  
  keyboard: {
    principle: 'Full keyboard support',
    techniques: [
      'Global shortcuts',
      'Arrow key navigation',
      'Focus management',
      'Command palette',
    ],
  },
  
  errors: {
    principle: 'Errors are helpful, not scary',
    techniques: [
      'Inline validation',
      'Clear error messages',
      'Recovery suggestions',
      'Graceful degradation',
    ],
  },
};
```

## 7. Practice Exercises

### Exercise 1: Product Deep Dive
Choose a product, document 10 polish details.

### Exercise 2: Pattern Recreation
Recreate one interaction from this module.

### Exercise 3: Apply to Your Work
Take one pattern, apply it to your current project.

### Exercise 4: Improvement Audit
Find a product, identify 5 improvement opportunities.

### Exercise 5: Your Own Case Study
Document a project you've built as a case study.

## 8. Case Study Template

```markdown
## Case Study: [Product Name]

### Context
- What the product does
- Why it's notable for design

### Pattern 1: [Name]
- What: Description of the pattern
- Why it works: Design principles at play
- How: Implementation approach
- Code example

### Pattern 2: [Name]
...

### Key Takeaways
1. [Principle 1]
2. [Principle 2]
3. [Principle 3]

### Apply to Your Work
- Situation where this applies
- How to adapt the pattern
```

## 9. Continuing Your Study

### Products to Analyze

```markdown
## Essential Studies
- Linear (project management)
- Stripe (payments/docs)
- Vercel (deployment)
- Figma (design tool)
- Notion (documents)
- Arc (browser)
- Raycast (launcher)

## Also Worth Studying
- Framer (web builder)
- Superhuman (email)
- Craft (documents)
- Things (todos)
- Loom (video)
- Pitch (presentations)
```

### What to Look For

```tsx
const analysisChecklist = {
  firstImpression: 'What hits you in the first 5 seconds?',
  navigation: 'How do you move around?',
  feedback: 'How does it respond to actions?',
  errors: 'How does it handle failures?',
  details: 'What subtle touches do you notice?',
  performance: 'How fast does it feel?',
  keyboard: 'Can you use it without a mouse?',
  delight: 'What makes you smile?',
};
```

---

*Congratulations on completing the Design Engineer Learning Roadmap! Continue practicing, studying excellent work, and building. The best way to develop taste and skill is through consistent creation and refinement.*
