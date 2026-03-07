# Building Taste

## 1. Concept Overview

Taste in design is the cultivated ability to recognize and create what's excellent, appropriate, and delightful. It's not innate—it's developed through deliberate exposure, practice, and reflection. Taste is what separates competent execution from truly exceptional work.

Components of taste:
- **Recognition** — Knowing good from great
- **Discernment** — Understanding why something works
- **Curation** — Choosing what's appropriate
- **Creation** — Making excellent decisions
- **Restraint** — Knowing when to stop

```
Skills: What you can do
Taste: What you choose to do
```

## 2. Why This Matters for Design Engineers

Taste elevates your work:
- Technical skill + good taste = exceptional output
- Makes better decisions faster
- Creates differentiated work
- Earns trust and creative latitude

As a Design Engineer, you must:
- Actively cultivate taste
- Study excellent work
- Practice discernment
- Trust and refine intuition

## 3. Key Principles / Mental Models

### Taste Is Contextual
```
What's tasteful depends on:
- Brand and product context
- Target audience
- Cultural context
- Current design trends
- Technical constraints
```

### The Taste Stack
```
Layer 1: Exposure — Seeing lots of work
Layer 2: Analysis — Understanding why things work
Layer 3: Practice — Making things yourself
Layer 4: Feedback — Learning from others
Layer 5: Refinement — Iterating your instincts
```

### Influences on Taste
```
Direct: Studying design intentionally
Indirect: Everything you consume (art, architecture, fashion)
Experience: Things you've made and learned from
Feedback: Reactions from users and peers
Time: Taste evolves and matures
```

## 4. Developing Taste

### Build a Reference Library

```tsx
// Organize inspiration systematically
interface DesignReference {
  id: string;
  source: string;
  url: string;
  category: Category;
  tags: string[];
  notes: string;
  dateAdded: Date;
}

type Category = 
  | 'landing-pages'
  | 'dashboards'
  | 'mobile-apps'
  | 'micro-interactions'
  | 'typography'
  | 'color'
  | 'illustration'
  | 'motion'
  | 'branding';

// Categories to track:
const referenceCategories = {
  UI: ['landing pages', 'dashboards', 'mobile', 'forms', 'navigation'],
  Visual: ['typography', 'color palettes', 'illustrations', 'photography'],
  Motion: ['transitions', 'micro-interactions', 'loading states', 'gestures'],
  Systems: ['design systems', 'component libraries', 'documentation'],
  Adjacent: ['architecture', 'fashion', 'industrial design', 'art'],
};
```

### Active Study Routine

```markdown
## Weekly Taste-Building Routine

### Daily (5-10 min)
- Browse design inspiration (Dribbble, Twitter, Mobbin)
- Screenshot anything that catches your eye
- Note one thing that makes it work

### Weekly (30 min)
- Deep-dive one excellent product
- Analyze one component in detail
- Try to recreate one design element

### Monthly (2 hours)
- Review saved inspiration
- Identify patterns in what you like
- Update personal style preferences
- Write about what you've learned
```

### Taste Development Exercises

```tsx
// Exercise 1: Spot the Difference
// Compare two similar designs, articulate differences
function spotTheDifference() {
  return {
    designs: ['App A', 'App B'],
    questions: [
      'Which feels more premium? Why?',
      'Which feels more trustworthy? Why?',
      'Which has better hierarchy? Why?',
      'Which is more usable? Why?',
    ],
  };
}

// Exercise 2: Predict the Refinement
// Look at early version, predict improvements
function predictRefinement(earlyVersion: Design) {
  return {
    visual: 'What visual changes would you make?',
    spacing: 'How would you adjust spacing?',
    typography: 'What typography improvements?',
    color: 'Any color refinements?',
    motion: 'What animations would you add?',
  };
}

// Exercise 3: Why Does This Work?
// Articulate why excellent designs succeed
function whyDoesThisWork(excellentDesign: Design) {
  return {
    firstImpression: 'What hits you first?',
    hierarchy: 'How does it guide your eye?',
    details: 'What subtle touches do you notice?',
    emotion: 'How does it make you feel?',
    differentiation: 'What makes it stand out?',
  };
}
```

## 5. Cultivating Sources

### Design Resources to Follow

```markdown
## Platforms
- **Dribbble** — Visual inspiration (filter for quality)
- **Mobbin** — Real app patterns
- **Awwwards** — Award-winning websites
- **Minimal Gallery** — Minimal design collection
- **Godly** — Curated web design

## Designers to Study
- Linear team (product design)
- Rauno Freiberg (interactions)
- Paco Coursey (interfaces)
- Emil Kowalski (animations)
- Josh Comeau (education)

## Companies to Watch
- Linear — Product polish
- Stripe — Documentation, forms
- Vercel — Marketing, developer tools
- Raycast — Desktop apps
- Arc — Browser innovation
- Figma — Collaboration tools
- Notion — Content editing

## Publications
- Dense Discovery (weekly newsletter)
- Sidebar (daily design links)
- UX Collective (articles)
```

### Adjacent Fields for Inspiration

```tsx
const adjacentInspiration = {
  architecture: {
    why: 'Space, proportion, materials',
    study: ['Tadao Ando', 'Dieter Rams buildings'],
  },
  fashion: {
    why: 'Color, texture, cultural timing',
    study: ['Runway shows', 'Brand identities'],
  },
  industrialDesign: {
    why: 'Form, function, tactility',
    study: ['Dieter Rams', 'Apple products'],
  },
  typography: {
    why: 'Letterforms, hierarchy, detail',
    study: ['Type foundries', 'Book design'],
  },
  cinema: {
    why: 'Composition, color grading, pacing',
    study: ['Title sequences', 'Cinematography'],
  },
  music: {
    why: 'Rhythm, tension, resolution',
    study: ['Album artwork', 'Music videos'],
  },
};
```

## 6. Taste in Practice

### Making Tasteful Decisions

```tsx
// Framework for design decisions
interface TastefulDecision {
  options: string[];
  considerations: {
    context: 'What does the brand/product call for?';
    users: 'What do users expect/need?';
    constraints: 'What are the technical/time limits?';
    trends: 'Is this timely or timeless?';
  };
  evaluation: {
    appropriate: 'Does this fit the context?';
    restrained: 'Is this the simplest solution?';
    delightful: 'Does this bring joy?';
    distinctive: 'Does this stand out appropriately?';
  };
}

// Example: Choosing animation for a modal
const modalAnimationDecision = {
  options: ['fade', 'scale', 'slide up', 'spring bounce'],
  
  context: 'Professional SaaS product, not playful',
  users: 'Power users, frequent usage',
  constraints: 'Must feel fast, can\'t delay workflow',
  
  choice: 'scale with fade',
  rationale: 'Professional but not boring, quick but noticeable',
  parameters: 'duration: 150ms, scale: 0.98 to 1',
};
```

### Restraint Over Addition

```tsx
// Good taste often means removing, not adding

// ❌ Adding more to improve
function OverDesigned() {
  return (
    <button className="
      bg-gradient-to-r from-blue-500 to-purple-600 
      shadow-lg shadow-blue-500/50
      border-2 border-blue-400
      animate-pulse
      rounded-full
      uppercase
      tracking-widest
    ">
      Submit
    </button>
  );
}

// ✅ Restraint creates elegance
function Tasteful() {
  return (
    <button className="
      bg-blue-500 
      text-white
      hover:bg-blue-600
      px-4 py-2 
      rounded-lg
    ">
      Submit
    </button>
  );
}
```

### When to Break Rules

```tsx
// Taste means knowing when rules don't apply

const ruleBreaking = {
  // Normally: High contrast text
  // Break: Hero text can be lower contrast for atmosphere
  typography: {
    rule: 'Text should have 4.5:1 contrast',
    exception: 'Large decorative text can be lighter',
    judgment: 'Must still be readable, just not optimal',
  },
  
  // Normally: Consistent spacing
  // Break: Asymmetry can create interest
  layout: {
    rule: 'Use consistent spacing scale',
    exception: 'Intentional asymmetry for visual interest',
    judgment: 'Must look intentional, not accidental',
  },
  
  // Normally: Subtle animations
  // Break: Celebration moments can be big
  animation: {
    rule: 'Animations should be subtle (200-300ms)',
    exception: 'Success celebrations can be dramatic',
    judgment: 'Must be earned, not gratuitous',
  },
};
```

## 7. Evaluating Your Taste

### Self-Assessment

```markdown
## Taste Development Metrics

### Recognition (Can you identify quality?)
- [ ] Can spot what makes a design excellent
- [ ] Notice subtle details others miss
- [ ] Predict which designs will age well
- [ ] Recognize appropriate vs. inappropriate style

### Articulation (Can you explain why?)
- [ ] Can verbalize why something works
- [ ] Use specific design vocabulary
- [ ] Give constructive feedback
- [ ] Defend design decisions with reasoning

### Creation (Does your work reflect taste?)
- [ ] Make appropriate stylistic choices
- [ ] Exercise restraint
- [ ] Create distinctive work
- [ ] Receive positive peer feedback

### Evolution (Are you growing?)
- [ ] Taste has evolved over time
- [ ] Can recognize past work's weaknesses
- [ ] Continually finding new inspiration
- [ ] Opinions are earned, not borrowed
```

### Taste Pitfalls

```tsx
const tastePitfalls = {
  trendChasing: {
    symptom: 'Every project looks like Dribbble\'s front page',
    solution: 'Focus on timeless principles over current trends',
  },
  
  overRefinement: {
    symptom: 'Spending hours on invisible details',
    solution: 'Know when good enough is good enough',
  },
  
  borrowedOpinions: {
    symptom: 'Like something because others do',
    solution: 'Develop independent assessment',
  },
  
  snobbery: {
    symptom: 'Dismissing popular or simple designs',
    solution: 'Appreciate effectiveness over novelty',
  },
  
  stagnation: {
    symptom: 'Same aesthetic for years',
    solution: 'Continue exploring and evolving',
  },
};
```

## 8. Common Mistakes

### 1. Conflating Taste with Style
**Problem:** Thinking taste = preferring minimalism.
**Solution:** Taste is appropriateness, not style.

### 2. Passive Consumption
**Problem:** Looking at design but not analyzing.
**Solution:** Active study with articulation.

### 3. Copying Instead of Understanding
**Problem:** Reproducing without learning principles.
**Solution:** Understand why, not just what.

### 4. Not Creating Enough
**Problem:** All study, no practice.
**Solution:** Make things constantly.

### 5. Ignoring Context
**Problem:** Applying "good design" universally.
**Solution:** Consider audience and purpose.

## 9. Practice Exercises

### Exercise 1: 100 Screenshots
Collect 100 design screenshots, organize by what you love about each.

### Exercise 2: Design Journal
Write weekly about design observations and lessons.

### Exercise 3: Recreate Excellence
Pick excellent UI, recreate it pixel-perfect.

### Exercise 4: Design Ancestry
For a design you love, trace its influences.

### Exercise 5: Prediction Game
For trending designs, predict if they'll age well. Check in 2 years.

## 10. Advanced Topics

- **Historical Design Study** — Learning from design history
- **Cross-Cultural Taste** — How taste varies globally
- **Personal Style** — Developing recognizable aesthetic
- **Trend Forecasting** — Predicting design directions
- **Design Ethics** — Taste in inclusive design
- **Teaching Taste** — Helping others develop taste

## 11. Taste Affirmations

```markdown
## Mindset for Developing Taste

- Taste is learned, not inherited
- Strong opinions, loosely held
- Good taste requires seeing lots of bad work
- Excellence in one field informs taste in others
- Your taste will (and should) evolve
- Trust your gut, but train it continuously
- Taste without skills is frustrating; develop both
- The best designers never stop being students
```
