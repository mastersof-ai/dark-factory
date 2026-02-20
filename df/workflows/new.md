# Workflow: New Work Item

Capture thoughts, explore code, shape approaches — with graduated commitment.
One entry point (`/df:new`) meets you where you are. State saves at every natural
stopping point so you can park an idea and come back days later.

## Levels

```
CAPTURE  →  EXPLORE  →  SHAPE  →  COMMIT
 30 sec     5-15 min   15-30 min   handoff
```

Each level produces a persistent artifact. You never lose work.

## State Directory

All work items live in `.df-work/{slug}/` at the project root:

```
.df-work/
  {slug}/
    STATE.md      # Current level + metadata
    THOUGHT.md    # Capture output
    SCOPE.md      # Explore output
    SHAPE.md      # Shape output
```

---

## Step 0: Parse Input + Route

The user invokes `/df:new <text>`. Determine whether this is a resume or new capture.

### 0.1: Check for Resume

```
slugified = lowercase($ARGUMENTS), replace spaces/punctuation with hyphens, trim
```

1. Check if `.df-work/{slugified}/STATE.md` exists → **resume** (go to Step 0.2)
2. Check if any `.df-work/*/STATE.md` contains a title matching `$ARGUMENTS` (fuzzy) → **resume**
3. Otherwise → **new capture** (go to Step 1)

### 0.2: Resume Existing Item

1. Read `.df-work/{slug}/STATE.md` to get current level
2. Read the artifact for that level (THOUGHT.md, SCOPE.md, or SHAPE.md)
3. Briefly summarize where things left off — 2-3 sentences max
4. Continue from the **next** level's entry point:
   - If level is `capture` → go to Step 2 (Explore)
   - If level is `explore` → go to Step 3 (Shape)
   - If level is `shape` → go to Step 4 (Commit)
   - If level is `committed` → tell the user it's already committed, offer to re-shape

---

## Step 1: CAPTURE (30 seconds)

Goal: record the thought and anchor it to a codebase area. That's it.

### 1.1: Acknowledge

Respond naturally to the thought. Show you understood it. One sentence.

### 1.2: Locate in Codebase

If `.dark-factory/SYSTEM.md` exists, read it and propose codebase areas as
multiple choice based on the known components. Include an "Other" escape hatch.

If no SYSTEM.md exists, ask one open-ended question:
> "Where in the codebase does this live?"

**One question only. Wait for the answer.**

### 1.3: Save State

Generate a slug from the input text (lowercase, hyphens, max 40 chars).

Create `.df-work/{slug}/` and write two files:

**STATE.md:**
```markdown
# {Original text}

- **Slug**: {slug}
- **Level**: capture
- **Created**: {YYYY-MM-DD}
- **Updated**: {YYYY-MM-DD}
- **Area**: {codebase area from 1.2}
```

**THOUGHT.md:**
```markdown
# {Original text}

## The Thought

{Original text, expanded with any context from the brief exchange}

## Codebase Area

{Area identified in 1.2 — path, component name, or description}
```

### 1.4: Natural Exit Point

Offer to continue or park. Use AskUserQuestion with two options:

- **Dig deeper** — "I'll explore the code and scope what's involved" _(continue to Step 2)_
- **Park it** — "Captured. Pick it up anytime with `/df:new {slug}`"

If the user picks "Park it", stop here. The item is saved at capture level.

If the user picks "Dig deeper", continue to Step 2.

---

## Step 2: EXPLORE (5-15 minutes)

Goal: read actual code, understand the current state, identify what's involved.

### 2.1: Read the Code

Based on the area from THOUGHT.md:

1. Explore the directory structure (`ls`, `Glob`)
2. Read key files — entry points, the specific code the thought references
3. Check git history for recent changes in the area (`git log --oneline -10 -- {area}`)
4. If `.dark-factory/{component}/` docs exist for this area, read ARCHITECTURE.md
   and CONCERNS.md for existing analysis

Build a mental model of the current state before asking any questions.

### 2.2: Report What You Found

Share your findings conversationally. Lead with what's relevant to the original
thought. Be specific — file paths, function names, current behavior. Keep it to
a short paragraph, not a wall of text.

### 2.3: Scope Through Conversation

Ask questions **one at a time** to understand what the user sees and wants. Examples:

- "Is the issue with {specific thing you found}, or something broader?"
- "I see {pattern}. Is that intentional or part of what feels wrong?"
- "This touches {A} and {B}. Should we scope to just {A} for now?"

**Rules:**
- One question per turn
- Multiple choice when you can frame the options
- Lead with your read on the situation
- 3-5 questions max — don't interrogate

### 2.4: Save State

Update STATE.md (set level to `explore`, update timestamp).

Write **SCOPE.md:**
```markdown
# {Title}: Scope

## Current State

{What the code does today — specific files, functions, behavior}

## What's Involved

| File / Area | Role | Impact |
|-------------|------|--------|
| {path}      | {what it does} | {how it relates to this work} |

## Key Findings

{Anything notable from the exploration — patterns, debt, dependencies, surprises}

## Boundaries

- **In scope**: {what this work item covers}
- **Out of scope**: {what it explicitly doesn't cover}
- **Dependencies**: {what this touches or depends on}
```

### 2.5: Natural Exit Point

Offer to continue or park:

- **Shape it** — "Let me propose approaches for how to do this" _(continue to Step 3)_
- **Park it** — "Scope is mapped. Resume anytime with `/df:new {slug}`"

---

## Step 3: SHAPE (15-30 minutes)

Goal: clear goal, recommended approach, Locked/Discretion/Deferred categories.

### 3.1: Synthesize

Read THOUGHT.md and SCOPE.md. Form your recommendation before asking questions.

### 3.2: Propose Approaches

Present 2-3 approaches. **Lead with your recommendation.** Format:

> I'd go with **Approach A** because {reason}.
>
> **A: {Name}** (Recommended)
> {2-3 sentences — what, how, tradeoff}
>
> **B: {Name}**
> {2-3 sentences — what, how, tradeoff}
>
> **C: {Name}** _(only if meaningfully different)_
> {2-3 sentences}

Use AskUserQuestion with the approaches as options.

### 3.3: Refine Through Conversation

Based on the chosen approach, ask targeted questions **one at a time** to nail
down the specifics. Focus on areas where the user's intent matters:

- Behavior at edge cases
- UX preferences
- Performance vs. simplicity tradeoffs
- What "done" looks like

3-5 questions max.

### 3.4: Categorize Decisions

This is the key output. Classify every decision into three categories:

- **Locked**: The founder has decided. Implementing agents MUST follow these exactly.
  These come from explicit user answers during this conversation.

- **Discretion**: The implementing agent can decide within guidelines. Include
  the guideline (e.g., "Use existing patterns in the codebase", "Optimize for
  readability over performance").

- **Deferred**: Explicitly not decided yet. Either needs more information, or
  intentionally left for later. Note what would trigger the decision.

### 3.5: Save State

Update STATE.md (set level to `shape`, update timestamp).

Write **SHAPE.md:**
```markdown
# {Title}: Shape

## Goal

{One clear sentence describing the desired outcome}

## Approach

{The chosen approach — name, description, rationale}

## Locked Decisions

{Decisions the founder made. These are requirements, not suggestions.}

- {Decision 1}: {what was decided and why}
- {Decision 2}: {what was decided and why}

## Agent Discretion

{Decisions the implementing agent can make within these guidelines.}

- {Area 1}: {guideline for the decision}
- {Area 2}: {guideline for the decision}

## Deferred

{Decisions explicitly not made yet.}

- {Decision 1}: {why deferred, what would trigger it}

## Scope Reference

{Brief — point to SCOPE.md for details}

- Files: {key files from scope}
- Boundaries: {in/out scope summary}
```

### 3.6: Natural Exit Point

Offer to continue or park:

- **Commit to building** — "Ready to transition this into implementation" _(continue to Step 4)_
- **Park it** — "Shaped and ready when you are. Resume with `/df:new {slug}`"

---

## Step 4: COMMIT (transition)

Goal: mark the item as ready for implementation and produce a handoff brief.

### 4.1: Produce Handoff

Read all three artifacts (THOUGHT.md, SCOPE.md, SHAPE.md) and update STATE.md:

Update STATE.md: set level to `committed`, update timestamp.

### 4.2: Present Summary

Show a compact summary:

```
✓ {Title} → committed

  Goal:     {one-liner from SHAPE.md}
  Approach: {approach name}
  Area:     {codebase area}
  Locked:   {count} decisions
  Discretion: {count} areas
  Deferred: {count} items

  Files: .df-work/{slug}/
```

### 4.3: Next Steps

The shaped work item is now a complete brief at `.df-work/{slug}/`. Tell the user:

> This is ready for implementation. The SHAPE.md has everything an implementing
> agent needs — goal, approach, and exactly what's locked vs. discretionary.

If the project has an implementation pipeline (e.g., `/work:plan`, agent teams),
mention it. Otherwise, the brief stands on its own.

---

## Conversation Style (applies to ALL levels)

These rules override default behavior throughout the entire workflow:

1. **One question at a time.** Never ask two questions in the same message.
2. **Multiple choice when possible.** Frame the decision space. The user can
   always say "none of these."
3. **Lead with your opinion.** Don't just present options — recommend one.
   "I think X because Y. Alternatives: ..."
4. **Be specific.** Reference actual files, functions, line numbers. Not
   "the pagination component" but "`apps/admin/src/app/shared/components/pagination.component.ts`".
5. **Be concise.** Short paragraphs. No walls of text. The user's time is
   the most valuable resource in this flow.
6. **Don't explain the process.** Never say "now we're entering the Explore
   phase" or reference level names. Just do the work naturally.
7. **Save state silently.** Write files without narrating it. Don't say
   "I'm saving SCOPE.md now." Just save it and continue the conversation.
