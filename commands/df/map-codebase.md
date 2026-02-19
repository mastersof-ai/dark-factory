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

Follow the workflow at @~/.claude/df/workflows/map-codebase.md end-to-end.
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

Doc templates live in `~/.claude/df/templates/` (paths are rewritten at install time).
Cross-component templates: `system.md` and `dependencies.md`. Per-component: `architecture.md`, `stack.md`, `conventions.md`, `testing.md`, `concerns.md`.

## Dark Factory Footprint

DF skills and internals live in either `.claude/` (local install) or `~/.claude/` (global install):

```
{config}/commands/df/      # Skills (commands)
{config}/df/               # Workflows, templates, references (DF internals)
```

Per-project output (always in the project directory):

```
.dark-factory/             # Output docs (component + cross-component)
.dark-factory/registry.md  # Agent-to-component assignments (Phase 2 output)
.claude/agents/df-*        # Per-component agents (created by Phase 2 when needed)
```
