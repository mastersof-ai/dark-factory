---
description: 'Discover components and write cross-component architecture docs (SYSTEM.md, DEPENDENCIES.md)'
allowed-tools:
  - Read
  - Write
  - Bash(ls *)
  - Bash(find *)
  - Bash(mkdir *)
  - Bash(git log *)
  - Bash(git diff *)
  - Glob
  - Grep
  - AskUserQuestion
---

# Discover Components

Interactive Phase 1 of Dark Factory. Explore the codebase, identify components,
ask the founder about relationships and architecture, then write cross-component docs.

## Prerequisites

None — this is the starting point.

## Execution

Follow **Phase 1** of the workflow at @~/.claude/df/workflows/map-codebase.md
(Steps 1.1 through 1.6).

This runs as the main conversation (not a spawned agent) so you can ask the
founder questions and iterate until the component picture is clear.

## Output

- `.dark-factory/SYSTEM.md` — cross-component architecture overview
- `.dark-factory/DEPENDENCIES.md` — component dependency graph and shared resources
- Component list confirmed by founder (consumed by `/df:recruit` and `/df:analyze`)

## Next Steps

After discovery, run:

- `/df:recruit` — score agents against components and build the registry
- `/df:analyze` — deep-dive components with specialist agents
- Or `/df:map-codebase` to run the full pipeline including verification
