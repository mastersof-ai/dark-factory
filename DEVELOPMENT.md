# Development Guide

How to develop, test, and publish Dark Factory.

## Setup

```bash
cd ~/Projects/MastersOfAI/dark-factory

# Link the package globally so `dark-factory` CLI points at your source
npm link
```

After linking, the `dark-factory` command runs directly from your checkout — every file edit is immediately available without reinstalling.

## Installing from Source

### Option 1: npm link (recommended for development)

```bash
# Link once (creates global symlink to your source)
npm link

# Install into any project
cd ~/Projects/SomeProject
dark-factory init --local

# Or install to your user-level Claude Code config
dark-factory init --global
```

### Option 2: Run directly (no link needed)

```bash
# Install into a project
cd ~/Projects/SomeProject
node ~/Projects/MastersOfAI/dark-factory/bin/dark-factory.mjs init --local

# Install to user level
node ~/Projects/MastersOfAI/dark-factory/bin/dark-factory.mjs init --global
```

### Option 3: npm link into a specific project

```bash
cd ~/Projects/SomeProject
npm link @mastersof-ai/dark-factory
npx dark-factory init --local
```

## Development Workflow

### Editing Skills and Templates

1. Edit files directly in `commands/df/`, `df/templates/`, `df/workflows/`, etc.
2. Re-run the installer to push changes to your test target:
   ```bash
   dark-factory update --local   # push to current project
   dark-factory update --global  # push to user config
   ```
3. In Claude Code, the updated skills take effect immediately (no restart needed for skill content changes)

### Editing Hooks

Hooks (`hooks/df-check-update.js`, `hooks/df-statusline.js`) require a reinstall AND a Claude Code restart:

1. Edit the hook file in `hooks/`
2. Run `dark-factory update --global` (or `--local`)
3. Restart Claude Code to pick up the new hook

### Testing the CLI

```bash
# Create a throwaway test directory
mkdir /tmp/df-test && cd /tmp/df-test

# Test fresh install
dark-factory init --local
ls -la .claude/

# Test update doesn't break existing install
dark-factory update

# Test help
dark-factory help

# Clean up
rm -rf /tmp/df-test
```

## Project vs User Install: When to Use Which

### User-level (`--global` → `~/.claude/`)

**Best for:**
- Your personal development machine
- Having Dark Factory available in every project automatically
- Quick iteration — one install, test anywhere

**Trade-off:** Changes affect all projects. If you break something, every Claude Code session sees it.

```bash
dark-factory init --global
# Now /df:map-codebase works in any project
```

### Project-level (`--local` → `.claude/`)

**Best for:**
- Testing in isolation without affecting other projects
- Committing Dark Factory into a specific repo (team use)
- CI/CD environments

**Trade-off:** Only available in that project directory.

```bash
cd ~/Projects/SomeProject
dark-factory init --local
# Only works in this project
```

### Both installed?

Local takes priority. Claude Code checks `.claude/` (project) before `~/.claude/` (user). This means you can have a global install for convenience and override it per-project if needed.

### Recommended dev setup

```bash
# Install globally for everyday use
dark-factory init --global

# When testing changes, update global
dark-factory update --global
# Then open Claude Code in any project and test
```

## File Map

What's in the repo and where it gets installed:

```
Source (repo)              → Installed to (.claude/)       Purpose
─────────────────────────  ──────────────────────────────  ───────────────────────
commands/df/*.md           → commands/df/*.md              Skill entry points
df/workflows/*.md          → df/workflows/*.md             Orchestration logic
df/templates/*.md          → df/templates/*.md             Doc structure templates
df/references/*.md         → df/references/*.md            Scoring rubric, eval criteria
df/registry.md             → df/registry.md                Registry template (actual registry in .dark-factory/)
hooks/df-check-update.js   → hooks/df-check-update.js      Background update check
hooks/df-statusline.js     → hooks/df-statusline.js        Status bar indicator
(generated at install)     → dark-factory/VERSION           Installed version
(generated at install)     → settings.json (merged)         Hook + statusline registration
─────────────────────────  ──────────────────────────────  ───────────────────────
bin/dark-factory.mjs       (not installed)                  CLI entry point
src/cli.mjs                (not installed)                  Installer logic
```

## Publishing

### First publish

```bash
# Make sure you're logged into npm under the mastersof-ai org
npm login

# Scoped packages need --access public on first publish
npm publish --access public
```

### Subsequent releases

```bash
# Bump version
npm version patch   # 0.1.0 → 0.1.1
# or
npm version minor   # 0.1.0 → 0.2.0

# Publish
npm publish

# Push tags
git push && git push --tags
```

### Pre-publish checklist

- [ ] All changes committed
- [ ] Tested `init --local` in a clean directory
- [ ] Tested `update` on existing install
- [ ] No CloudRepo-specific references in installable files
- [ ] README reflects current features
- [ ] Version bumped in package.json

## Architecture Notes

### Why the repo root mirrors the install structure

The installable content (`commands/`, `df/`, `hooks/`) lives at the package root, not nested under a `files/` directory. This means:

- The repo structure matches what gets installed — no mental mapping needed
- `package.json` `files` field controls what ships to npm (excludes `src/`, `bin/`, docs)
- Editing a template? It's at `df/templates/architecture.md` in both the repo and the install

### Settings.json merge strategy

The installer merges into existing settings.json rather than overwriting:

- **Hooks**: Adds to `hooks.SessionStart[]`, removes stale DF entries first (idempotent)
- **Statusline**: Only set if no existing statusline (doesn't replace GSD or other tools)
- **Other settings**: Untouched

### Preserved files

The `PRESERVED_FILES` set in `cli.mjs` lists files that are never overwritten during updates (currently empty). The agent registry now lives in `.dark-factory/registry.md` (per-project output), so it's naturally preserved — the installer doesn't touch `.dark-factory/`.
