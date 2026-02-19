---
description: 'Full codebase mapping pipeline — discover, recruit, analyze, verify (or use sub-commands individually)'
allowed-tools:
  - Read
  - Write
  - Bash(ls *)
  - Bash(cat *)
  - Bash(find *)
  - Bash(wc *)
  - Bash(git log *)
  - Bash(git diff *)
  - Bash(mkdir *)
  - Bash(grep -r *)
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

# Map Codebase

Full Dark Factory pipeline: discover components, recruit agents, analyze with
specialists, and verify output quality. Runs all 4 phases end-to-end.

For individual phases, use the sub-commands directly:

| Command                   | Phase   | What it does                                                             |
| ------------------------- | ------- | ------------------------------------------------------------------------ |
| `/df:discover`            | Phase 1 | Explore codebase, identify components, write SYSTEM.md + DEPENDENCIES.md |
| `/df:recruit`             | Phase 2 | Score agents against components, build registry                          |
| `/df:analyze [component]` | Phase 3 | Deep-dive with specialist agents (all or specific components)            |
| `/df:map-codebase`        | All     | This command — runs discover + recruit + analyze + verify                |

## Execution

Follow the workflow at @.claude/df/workflows/map-codebase.md end-to-end.
Preserve all workflow gates — especially the interactive Phase 1 conversation
and the Phase 4 verification checks.

## Output Structure

```
.dark-factory/
  SYSTEM.md              # Cross-component architecture
  DEPENDENCIES.md        # Component dependency graph
  {component}/
    ARCHITECTURE.md      # Patterns, layers, data flow
    STACK.md             # Dependencies, integrations, config
    CONVENTIONS.md       # Naming, style, import patterns
    TESTING.md           # Frameworks, patterns, fixtures
    CONCERNS.md          # Tech debt, security, performance
```

## Templates

Per-component doc templates live at `.claude/df/templates/`.
Cross-component templates: `.claude/df/templates/system.md` and `.claude/df/templates/dependencies.md`.

## Dark Factory Footprint

```
.claude/commands/df/       # Skills (commands)
.claude/df/                # Workflows, templates, references (DF internals)
.claude/df/registry.md     # Agent-to-component assignments (Phase 2 output)
.claude/agents/df-*        # Per-component agents (created by Phase 2 when needed)
.dark-factory/             # Output docs (component + cross-component)
```

To completely remove Dark Factory:

- Delete `.claude/commands/df/`
- Delete `.claude/df/`
- Delete `.claude/agents/df-*` (if agents were created)
- Delete `.dark-factory/`
