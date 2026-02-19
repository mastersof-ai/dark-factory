---
description: 'Score agents against components and build the agent registry — run standalone to re-assign or create agents'
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - AskUserQuestion
---

# Recruit Agents

Interactive Phase 2 of Dark Factory. Score existing agents against discovered
components, present a scorecard to the founder, handle CREATE decisions for gaps,
and write the agent registry.

## Prerequisites

- `.dark-factory/SYSTEM.md` must exist (run `/df:discover` first)
- `.claude/agents/` should contain agent definitions to score against

## Execution

Follow **Phase 2** of the workflow at @~/.claude/df/workflows/map-codebase.md
(Steps 2.1 through 2.6).

Scoring rubric: @~/.claude/df/references/agent-scoring.md

This runs as the main conversation so the founder can review the scorecard,
override assignments, and approve any new agent definitions.

## Common Scenarios

- **First run**: Score all components, assign agents, write registry
- **Re-score after adding agents**: Update assignments with new candidates
- **Fix a bad assignment**: Re-score specific components, founder overrides
- **Create general-purpose agents**: For repos without existing specialists

## Output

- `.dark-factory/registry.md` — agent-to-component assignments with scores and verdicts
- Any new `.claude/agents/df-*.md` definitions (for CREATE verdicts, with founder approval)

## Next Steps

After recruitment, run `/df:analyze` to deep-dive components with assigned agents.
