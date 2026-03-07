# Design Critique

## 1. Concept Overview

Design critique is the skill of systematically evaluating design work—your own and others'—to identify strengths, weaknesses, and opportunities for improvement. It's not about personal preference but about measured analysis against principles and goals.

Critique encompasses:
- **Identifying issues** — What doesn't work and why
- **Articulating strengths** — What works well
- **Proposing solutions** — How to improve
- **Prioritizing feedback** — What matters most

```
Bad critique: "I don't like it"
Good critique: "The visual hierarchy is unclear because the secondary 
               action has equal visual weight to the primary action"
```

## 2. Why This Matters for Design Engineers

Critique skills help:
- Improve your own work iteratively
- Communicate with designers effectively
- Contribute to design discussions
- Learn from studying other work

As a Design Engineer, you must:
- Evaluate designs objectively
- Give constructive feedback
- Receive feedback gracefully
- Self-critique before review

## 3. Key Principles / Mental Models

### Critique Framework (WHAT-WHY-HOW)
```
WHAT: Describe what you observe objectively
WHY: Explain why it's a problem/success
HOW: Suggest how to improve/enhance
```

### Critique Dimensions
```
1. Visual: Aesthetics, polish, consistency
2. Functional: Usability, accessibility
3. Conceptual: Does it solve the problem?
4. Technical: Is it implementable?
5. Brand: Does it align with identity?
```

### The Critique Mindset
```
Not: "This is bad"
But: "This could be better because..."

Not: "I would have..."
But: "Have you considered..."

Not: "Users won't understand"
But: "A user in scenario X might expect..."
```

## 4. Critique Process

### Self-Critique Checklist

```tsx
// Before submitting for review, ask yourself:

interface SelfCritiqueChecklist {
  visual: {
    hierarchy: 'Is it clear what to look at first?';
    spacing: 'Is spacing consistent?';
    alignment: 'Is everything properly aligned?';
    typography: 'Is type legible and hierarchical?';
    color: 'Are colors purposeful and accessible?';
  };
  functional: {
    clarity: 'Is the purpose immediately clear?';
    interaction: 'Are interactive elements obvious?';
    feedback: 'Does the UI respond to actions?';
    error: 'Are error states handled?';
    empty: 'Are empty states designed?';
  };
  technical: {
    responsive: 'Does it work at all sizes?';
    performance: 'Will it be performant?';
    accessibility: 'Is it accessible?';
    edge: 'Are edge cases handled?';
  };
}
```

### Giving Critique

```markdown
## Structure for Giving Feedback

### 1. Start with Context
"I'm looking at this as [user type] trying to [task]..."

### 2. Lead with Positives
"The [specific element] works well because [reason]..."

### 3. Be Specific About Issues
"The [specific element] is [observation] which might cause [problem] 
because [reason]..."

### 4. Suggest Alternatives
"One option might be to [solution] which could help because [reason]..."

### 5. Prioritize
"The most critical issue to address is [X] because [impact]..."
```

### Receiving Critique

```markdown
## How to Receive Feedback

1. Listen without defending
2. Ask clarifying questions
3. Take notes
4. Thank the reviewer
5. Reflect before responding
6. Separate yourself from your work

## Questions to Ask:
- "Can you elaborate on [point]?"
- "What would you suggest instead?"
- "How critical is this issue?"
- "Which change would have the most impact?"
```

## 5. Critique Vocabulary

### Visual Analysis Terms

```tsx
const visualVocabulary = {
  hierarchy: {
    good: ['clear hierarchy', 'appropriate emphasis', 'well-structured'],
    issues: ['competing elements', 'unclear priority', 'visual noise'],
  },
  spacing: {
    good: ['breathing room', 'consistent rhythm', 'well-balanced'],
    issues: ['cramped', 'inconsistent', 'too sparse', 'unrelated groupings'],
  },
  typography: {
    good: ['legible', 'appropriate scale', 'clear structure'],
    issues: ['hard to read', 'too many weights', 'unclear hierarchy'],
  },
  color: {
    good: ['purposeful', 'accessible', 'cohesive palette'],
    issues: ['low contrast', 'too many colors', 'unclear meaning'],
  },
  layout: {
    good: ['well-organized', 'predictable', 'scannable'],
    issues: ['unbalanced', 'confusing flow', 'misaligned'],
  },
};
```

### Interaction Analysis Terms

```tsx
const interactionVocabulary = {
  affordance: {
    good: ['clear clickable elements', 'obvious interactions'],
    issues: ['unclear what\'s clickable', 'hidden functionality'],
  },
  feedback: {
    good: ['responsive', 'appropriate timing', 'clear confirmation'],
    issues: ['no feedback', 'delayed response', 'unclear result'],
  },
  flow: {
    good: ['natural progression', 'clear next steps'],
    issues: ['dead ends', 'unclear path', 'too many choices'],
  },
  cognitive: {
    good: ['easy to understand', 'low mental load'],
    issues: ['overwhelming', 'requires too much thinking'],
  },
};
```

## 6. Critique Examples

### Before/After Critique

```tsx
// Bad Critique:
// "The button looks weird"

// Good Critique:
`
OBSERVATION: The primary action button has the same visual weight 
as the secondary action.

IMPACT: Users might click the wrong action because there's no 
clear hierarchy between "Cancel" and "Save".

SUGGESTION: Consider making the primary action more prominent 
with a solid fill while keeping the secondary action as an 
outlined or text button. This establishes clear visual priority.

PRIORITY: High - affects core task completion
`
```

### Component Critique

```tsx
// Analyzing a card component
function critiqueCard(card: CardDesign) {
  return {
    visual: {
      strengths: [
        'Clean, minimal aesthetic aligns with brand',
        'Good use of whitespace in content area',
      ],
      improvements: [
        'Shadow feels too heavy for this minimal style',
        'Image aspect ratio inconsistent with grid',
      ],
    },
    functional: {
      strengths: [
        'Clear primary action',
        'Scannable content structure',
      ],
      improvements: [
        'Hover state doesn\'t indicate full card is clickable',
        'Truncated title has no way to view full text',
      ],
    },
    technical: {
      strengths: [
        'Semantic HTML structure',
        'Good touch target sizes',
      ],
      improvements: [
        'Missing alt text for image',
        'Keyboard focus not visible',
      ],
    },
    prioritized: [
      '1. Add hover state for clickability',
      '2. Fix keyboard focus visibility',
      '3. Reduce shadow weight',
    ],
  };
}
```

## 7. Design Review Meetings

### Leading a Design Review

```markdown
## Design Review Structure

### Setup (2 min)
- State the goal of the design
- Describe the user/scenario
- Note any constraints

### Presentation (5 min)
- Walk through the design
- Explain key decisions
- Show edge cases

### Silent Review (3 min)
- Everyone examines silently
- Makes notes independently

### Feedback Round (15 min)
- Each person shares top feedback
- Focus on most important issues
- Designer takes notes, doesn't defend

### Discussion (10 min)
- Discuss major points
- Explore alternatives together
- Reach decisions

### Wrap Up (5 min)
- Summarize decisions
- List action items
- Set next steps
```

### Critique Facilitation

```tsx
// As facilitator, ask these questions:
const facilitatorQuestions = [
  // Understand the design
  'What problem is this solving?',
  'Who is the target user?',
  'What are the constraints?',
  
  // Prompt specific feedback
  'What works well about the visual hierarchy?',
  'How might this fail for [edge case]?',
  'What would a first-time user expect here?',
  
  // Drive to resolution
  'What\'s the most critical issue to address?',
  'What would have the biggest impact?',
  'How might we address [issue]?',
];
```

## 8. Studying Excellence

### Analyzing Great Design

```tsx
// Framework for studying exemplary work
function analyzeExcellentDesign(product: string) {
  return {
    visual: {
      observe: 'What visual techniques are they using?',
      example: 'Linear uses subtle gradients and consistent 16px spacing',
    },
    interaction: {
      observe: 'What makes interactions feel good?',
      example: 'Stripe\'s form validation gives immediate feedback',
    },
    copy: {
      observe: 'How do they communicate?',
      example: 'Vercel uses concise, confident language',
    },
    details: {
      observe: 'What small touches add quality?',
      example: 'Figma\'s cursors show collaborator names on hover',
    },
    implementation: {
      observe: 'How is this technically achieved?',
      example: 'Notion uses optimistic updates for instant feel',
    },
  };
}
```

## 9. Common Mistakes

### 1. Vague Feedback
**Problem:** "It feels off."
**Solution:** Be specific about what and why.

### 2. Solution-Only
**Problem:** "Just make it blue."
**Solution:** Explain the problem first.

### 3. Personal Preference
**Problem:** "I don't like cards."
**Solution:** Ground in principles/goals.

### 4. Too Many Notes
**Problem:** 50 minor comments.
**Solution:** Prioritize top 3-5 issues.

### 5. Ignoring Context
**Problem:** Critiquing without understanding goals.
**Solution:** Understand constraints first.

## 10. Practice Exercises

### Exercise 1: Daily Critique
Critique one design (app, website, poster) daily.

### Exercise 2: Before/After
Find redesigns and analyze improvements.

### Exercise 3: Peer Review
Exchange work with peer, practice feedback.

### Exercise 4: Product Teardown
Deep-dive analysis of one product.

### Exercise 5: Self Review
Critique your own work systematically.

## 11. Critique Templates

### Quick Critique Template

```markdown
## Design: [Name]

### What Works
- [Strength 1]
- [Strength 2]

### What Needs Work
- **[Issue 1]**: [Description] → [Suggestion]
- **[Issue 2]**: [Description] → [Suggestion]

### Priority Actions
1. [Most important change]
2. [Second priority]
```

### Comprehensive Review Template

```markdown
## Design Review: [Name]
**Reviewer**: [Name]
**Date**: [Date]

### Context Understanding
- Goal: [What the design is trying to achieve]
- User: [Who this is for]
- Constraints: [Known limitations]

### Visual Analysis
| Aspect | Assessment | Notes |
|--------|------------|-------|
| Hierarchy | ⚠️ | [Details] |
| Spacing | ✅ | [Details] |
| Color | ✅ | [Details] |
| Typography | ⚠️ | [Details] |

### Functional Analysis
| Aspect | Assessment | Notes |
|--------|------------|-------|
| Clarity | ✅ | [Details] |
| Interactions | ⚠️ | [Details] |
| States | ❌ | [Details] |

### Top Recommendations
1. **[Critical]** [Issue and solution]
2. **[Important]** [Issue and solution]
3. **[Nice to have]** [Issue and solution]

### Questions for Discussion
- [Question 1]
- [Question 2]
```

## 12. Advanced Topics

- **Critique Culture** — Building team feedback norms
- **Remote Critiques** — Async design review
- **Critique Tools** — Figma comments, Loom videos
- **Design Systems Critique** — Component-level review
- **Competitive Analysis** — Structured competitor review
- **User Testing Integration** — Data-informed critique
