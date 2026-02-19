---
description: 'Deep-dive a component (or all) with assigned specialist agents — produces 5 architecture docs per component'
allowed-tools:
  - Read
  - Write
  - Bash(ls *)
  - Bash(mkdir *)
  - Bash(wc *)
  - Bash(grep -r *)
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

# Analyze Components

Phase 3 of Dark Factory. Spawn the assigned agent for each component to write
5 architecture docs (ARCHITECTURE, STACK, CONVENTIONS, TESTING, CONCERNS).

## Usage

- `/df:analyze` — analyze all components from the registry
- `/df:analyze infrastructure` — analyze a single component
- `/df:analyze api apex` — analyze specific components

## Prerequisites

- `.dark-factory/SYSTEM.md` must exist (run `/df:discover` first)
- `.claude/df/registry.md` should exist (run `/df:recruit` first)
  - If no registry exists, falls back to `general-purpose` agents (M1 behavior)

## Execution

Follow **Phase 3** of the workflow at @.claude/df/workflows/map-codebase.md
(Steps 3.1 through 3.4).

**Scoping rules:**

- If `$ARGUMENTS` names specific components, only spawn agents for those
- If `$ARGUMENTS` is empty, spawn agents for all components in the registry
- Existing docs for targeted components are overwritten (fresh analysis)

**Agent resolution:**

- Read `.claude/df/registry.md` for agent assignments
- Spawn `subagent_type` matching the registry entry (e.g., `backend-engineer`)
- Fall back to `general-purpose` if no registry entry exists

## Output

Per component:

- `.dark-factory/{component}/ARCHITECTURE.md`
- `.dark-factory/{component}/STACK.md`
- `.dark-factory/{component}/CONVENTIONS.md`
- `.dark-factory/{component}/TESTING.md`
- `.dark-factory/{component}/CONCERNS.md`

## Next Steps

Run `/df:map-codebase` for the full pipeline with Phase 4 verification,
or review the generated docs directly.
