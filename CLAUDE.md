# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Dark Factory is a Claude Code skill pack (npm: `@mastersof-ai/dark-factory`) that maps codebases into structured architecture documentation using specialist AI agents. It installs into `.claude/` (local) or `~/.claude/` (global) and provides slash commands that orchestrate a 4-phase pipeline: discover components, recruit specialist agents, analyze each component in parallel, verify output quality.

## Development Setup

```bash
npm link                          # symlinks source into global node_modules
dark-factory init --global        # install to ~/.claude/ for testing
dark-factory update --global      # push edits after changing files
```

No build step, no test suite, no linter. The JavaScript runs directly in Node.js 18+ ESM. Testing is manual — see DEVELOPMENT.md for the full workflow.

## Publishing

```bash
npm version patch|minor
npm publish              # first time: npm publish --access public
git push && git push --tags
```

## Architecture

### Repo root mirrors install structure

`commands/`, `df/`, `hooks/` at package root are copied verbatim into `.claude/` during install. The path `df/templates/architecture.md` in the repo is the same as `.claude/df/templates/architecture.md` after install. No build, no mapping.

### Only two kinds of code

1. **JavaScript** (`src/cli.mjs`, `hooks/df-*.js`): The installer CLI and two hooks. Pure Node.js, zero dependencies.
2. **Markdown skills** (`commands/df/*.md`, `df/workflows/*.md`): Claude Code interprets these as executable AI workflows. This is where the pipeline logic lives — not in JS.

### The 4-phase pipeline

Defined in `df/workflows/map-codebase.md`. Slash commands in `commands/df/` are thin entry points that reference the workflow via `@.claude/df/workflows/map-codebase.md`.

- **Phase 1 (Discover)**: Interactive. Claude explores the repo, identifies components, writes `.dark-factory/SYSTEM.md` and `DEPENDENCIES.md`.
- **Phase 2 (Recruit)**: Interactive. Scores existing `.claude/agents/*.md` against components on 4 dimensions (Stack Match, Domain Fit, Tooling, Availability). Writes `.dark-factory/registry.md`.
- **Phase 3 (Analyze)**: Parallel. Spawns one Task agent per component using `TeamCreate` for observability. Each agent writes 5 docs to `.dark-factory/{component}/`.
- **Phase 4 (Verify)**: Checks file existence, line counts against thresholds in `df/references/evaluation-criteria.md`, scans for leaked secrets.

### Data flow is filesystem-based

```
Phase 1 → .dark-factory/SYSTEM.md, DEPENDENCIES.md
Phase 2 ← reads SYSTEM.md; → .dark-factory/registry.md
Phase 3 ← reads registry.md; → .dark-factory/{component}/*.md
Phase 4 ← reads all output
```

### Installer mechanics (`src/cli.mjs`)

- `copyTree()` walks source dirs recursively; `PRESERVED_FILES` set can protect files from being overwritten during updates (currently empty — registry moved to `.dark-factory/`)
- `registerHooks()` merges into `settings.json` additively — strips stale DF hook entries before re-adding, never overwrites unrelated settings
- Statusline only registered if `settings.statusLine` doesn't already exist (respects GSD and other tools)
- `detectInstalledScope()` checks local `.claude/dark-factory/VERSION` first, then global

### Hooks

- `df-check-update.js` (SessionStart): Spawns background process, compares installed VERSION against `npm view`, writes result to `cache/df-update-check.json`. Silent failure throughout.
- `df-statusline.js`: Reads the cache JSON, outputs ANSI indicator if update available. Reads stdin per Claude Code statusline protocol.

## Key Conventions

- Slash command files use YAML frontmatter with `allowed-tools` to declare tool permissions
- Templates in `df/templates/` define required sections and quality bars per doc type — they are read by spawned agents at analysis time, not preprocessed
- Agent scoring rubric lives in `df/references/agent-scoring.md` (4 dimensions, 0-10 scale)
- Quality thresholds (minimum line counts, required elements) live in `df/references/evaluation-criteria.md`
- Created agents follow the naming convention `df-{component}.md` in `.claude/agents/`
