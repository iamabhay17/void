# Optimistic UI

## 1. Concept Overview

Optimistic UI is a pattern where the interface updates immediately as if an action succeeded, before the server confirms. If the action fails, the UI rolls back to the previous state.

This creates perceived instant responses:
```
User clicks "Like" → UI shows liked immediately → Server processes → 
  Success: Keep UI state
  Failure: Rollback + show error
```

vs. Pessimistic UI:
```
User clicks "Like" → Show loading → Wait for server → Update UI
```

## 2. Why This Matters for Design Engineers

Optimistic UI creates:
- Instant feedback
- Perceived faster performance
- Smoother user experience
- Reduced cognitive load

As a Design Engineer, you must:
- Know when optimistic updates are appropriate
- Handle rollback gracefully
- Animate state transitions
- Communicate errors clearly

## 3. Key Principles / Mental Models

### The Optimism Trade-off
```
Optimistic: Fast feel, but must handle failures
Pessimistic: Slower feel, but always accurate

Use optimistic for:
✓ Low-stakes actions (likes, favorites)
✓ High success rate operations
✓ Quick server responses

Use pessimistic for:
✗ Financial transactions
✗ Irreversible actions
✗ Complex validations
```

### State Management
```
1. Capture current state (for rollback)
2. Apply optimistic update
3. Send request to server
4. On success: Keep new state
5. On failure: Restore previous state + show error
```

## 4. Implementation in React

### Basic Optimistic Toggle

```tsx
function LikeButton({ postId, initialLiked }: { postId: string; initialLiked: boolean }) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isPending, setIsPending] = useState(false);

  const toggleLike = async () => {
    const previousState = isLiked;
    
    // Optimistic update
    setIsLiked(!isLiked);
    setIsPending(true);

    try {
      await api.toggleLike(postId, !previousState);
    } catch (error) {
      // Rollback on failure
      setIsLiked(previousState);
      toast.error('Failed to update. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.button
      onClick={toggleLike}
      disabled={isPending}
      whileTap={{ scale: 0.9 }}
      animate={{ 
        scale: isLiked ? [1, 1.2, 1] : 1,
      }}
      transition={{ duration: 0.3 }}
      className={cn(
        'p-2 rounded-full',
        isLiked ? 'text-red-500' : 'text-gray-400'
      )}
    >
      <HeartIcon filled={isLiked} />
    </motion.button>
  );
}
```

### Optimistic List Add

```tsx
function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [pendingTodos, setPendingTodos] = useState<Set<string>>(new Set());

  const addTodo = async (text: string) => {
    // Create optimistic todo with temp ID
    const tempId = `temp-${Date.now()}`;
    const optimisticTodo: Todo = {
      id: tempId,
      text,
      completed: false,
    };

    // Optimistic update
    setTodos(prev => [...prev, optimisticTodo]);
    setPendingTodos(prev => new Set([...prev, tempId]));

    try {
      const realTodo = await api.createTodo(text);
      
      // Replace temp with real
      setTodos(prev => 
        prev.map(t => t.id === tempId ? realTodo : t)
      );
    } catch (error) {
      // Remove failed todo
      setTodos(prev => prev.filter(t => t.id !== tempId));
      toast.error('Failed to add todo');
    } finally {
      setPendingTodos(prev => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });
    }
  };

  return (
    <ul>
      <AnimatePresence>
        {todos.map(todo => (
          <motion.li
            key={todo.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: pendingTodos.has(todo.id) ? 0.5 : 1, 
              height: 'auto',
            }}
            exit={{ opacity: 0, height: 0 }}
          >
            {todo.text}
            {pendingTodos.has(todo.id) && <Spinner size="sm" />}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
```

### Optimistic Delete with Undo

```tsx
function DeletableItem({ item, onDelete }: ItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const deleteTimeout = useRef<NodeJS.Timeout>();

  const handleDelete = () => {
    setIsDeleting(true);
    setShowUndo(true);

    // Delay actual deletion for undo opportunity
    deleteTimeout.current = setTimeout(async () => {
      try {
        await api.deleteItem(item.id);
        onDelete(item.id);
      } catch (error) {
        setIsDeleting(false);
        setShowUndo(false);
        toast.error('Failed to delete');
      }
    }, 5000); // 5 second undo window
  };

  const handleUndo = () => {
    clearTimeout(deleteTimeout.current);
    setIsDeleting(false);
    setShowUndo(false);
  };

  return (
    <AnimatePresence>
      {!isDeleting ? (
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, height: 0 }}
        >
          {item.content}
          <button onClick={handleDelete}>Delete</button>
        </motion.div>
      ) : showUndo ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-100 p-4 rounded"
        >
          Item deleted
          <button onClick={handleUndo} className="text-blue-500 ml-2">
            Undo
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
```

## 5. React Patterns to Use

### With React Query

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function LikeButtonWithQuery({ post }: { post: Post }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.toggleLike(post.id),
    
    // Optimistic update
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts', post.id] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['posts', post.id]);

      // Optimistically update
      queryClient.setQueryData(['posts', post.id], (old: Post) => ({
        ...old,
        isLiked: !old.isLiked,
        likeCount: old.isLiked ? old.likeCount - 1 : old.likeCount + 1,
      }));

      return { previous };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['posts', post.id], context?.previous);
      toast.error('Action failed');
    },

    // Refetch on settle
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', post.id] });
    },
  });

  return (
    <button onClick={() => mutation.mutate()}>
      {post.isLiked ? '❤️' : '🤍'} {post.likeCount}
    </button>
  );
}
```

### Optimistic Form Submission

```tsx
function CommentForm({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [optimisticComments, setOptimisticComments] = useState<Comment[]>([]);

  const handleSubmit = async (text: string) => {
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      text,
      author: currentUser,
      createdAt: new Date(),
      isPending: true,
    };

    setOptimisticComments(prev => [...prev, optimisticComment]);

    try {
      const realComment = await api.createComment(postId, text);
      setComments(prev => [...prev, realComment]);
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setOptimisticComments(prev => 
        prev.filter(c => c.id !== optimisticComment.id)
      );
    }
  };

  const allComments = [...comments, ...optimisticComments];

  return (
    <div>
      {allComments.map(comment => (
        <CommentCard 
          key={comment.id} 
          comment={comment}
          isPending={'isPending' in comment}
        />
      ))}
      <CommentInput onSubmit={handleSubmit} />
    </div>
  );
}
```

### Optimistic Reorder

```tsx
function ReorderableList({ items: initialItems }: { items: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [isSaving, setIsSaving] = useState(false);

  const handleReorder = async (newItems: Item[]) => {
    const previousItems = items;
    
    // Optimistic update
    setItems(newItems);
    setIsSaving(true);

    try {
      await api.updateOrder(newItems.map(i => i.id));
    } catch (error) {
      // Rollback
      setItems(previousItems);
      toast.error('Failed to save order');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Reorder.Group
      values={items}
      onReorder={handleReorder}
      className={cn(isSaving && 'opacity-70')}
    >
      {items.map(item => (
        <Reorder.Item key={item.id} value={item}>
          {item.content}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
```

## 6. Animation Considerations

### Smooth Rollback

```tsx
function OptimisticCard({ item }: { item: Item }) {
  const [state, setState] = useState<'idle' | 'pending' | 'error'>('idle');

  return (
    <motion.div
      animate={{
        opacity: state === 'pending' ? 0.7 : 1,
        scale: state === 'error' ? [1, 1.02, 1] : 1,
        borderColor: state === 'error' ? '#ef4444' : 'transparent',
      }}
      transition={{ duration: 0.2 }}
    >
      {item.content}
    </motion.div>
  );
}
```

### Success Celebration

```tsx
function LikeWithCelebration({ isLiked }: { isLiked: boolean }) {
  return (
    <motion.div className="relative">
      <motion.div
        animate={{
          scale: isLiked ? [1, 1.3, 1] : 1,
        }}
        transition={{ duration: 0.4 }}
      >
        <HeartIcon filled={isLiked} />
      </motion.div>
      
      {/* Celebration particles */}
      <AnimatePresence>
        {isLiked && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute w-2 h-2 bg-red-400 rounded-full"
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos(i * 60 * Math.PI / 180) * 30,
                  y: Math.sin(i * 60 * Math.PI / 180) * 30,
                }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.6 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

## 7. Error Handling

### Clear Error Communication

```tsx
function OptimisticAction({ action }: Props) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button onClick={performAction}>Action</button>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-500 text-sm mt-2"
          >
            {error}
            <button onClick={() => setError(null)} className="ml-2">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## 8. Performance Considerations

### Debounce Rapid Actions

```tsx
function RapidToggle() {
  const [value, setValue] = useState(false);
  const pendingValue = useRef(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const toggle = () => {
    setValue(v => !v);
    pendingValue.current = !pendingValue.current;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        await api.setValue(pendingValue.current);
      } catch {
        setValue(!pendingValue.current);
      }
    }, 500); // Debounce by 500ms
  };

  return <Toggle value={value} onChange={toggle} />;
}
```

## 9. Common Mistakes

### 1. No Rollback on Error
**Problem:** UI stuck in wrong state after failure.
**Solution:** Always restore previous state on error.

### 2. No Loading Indication
**Problem:** User doesn't know action is pending.
**Solution:** Show subtle pending state (opacity, spinner).

### 3. Lost User Input
**Problem:** Form clears before confirming save.
**Solution:** Keep input until confirmed.

### 4. Silent Failures
**Problem:** Error happens but user not informed.
**Solution:** Always show error feedback.

### 5. Race Conditions
**Problem:** Out-of-order responses cause wrong state.
**Solution:** Cancel pending requests or use request IDs.

## 10. Practice Exercises

### Exercise 1: Shopping Cart
Build a cart with optimistic add/remove/quantity updates.

### Exercise 2: Voting System
Create upvote/downvote with optimistic counts.

### Exercise 3: Bookmark System
Build bookmarks with optimistic add/remove and folders.

### Exercise 4: Comment Thread
Create comments with optimistic posting and deletion.

### Exercise 5: Settings Panel
Build settings with optimistic toggle switches.

## 11. Advanced Topics

- **Conflict Resolution** — Handling concurrent edits
- **Offline Support** — Queuing optimistic actions
- **Undo Stacks** — Multiple levels of undo
- **Optimistic File Upload** — Showing files before upload completes
- **Real-time Sync** — Combining with WebSockets
- **Testing Optimistic UI** — Simulating failures
