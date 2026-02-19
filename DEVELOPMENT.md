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

# Verify path rewriting (local should use ./.claude/)
grep '\.claude/df/' .claude/df/workflows/map-codebase.md | head -3

# Verify CommonJS shim
cat .claude/package.json   # should be {"type":"commonjs"}

# Verify file manifest
cat .claude/df-file-manifest.json | head -5

# Test update doesn't break existing install
dark-factory update

# Test local patch detection: modify a file, then update
echo "# local edit" >> .claude/df/registry.md
dark-factory update
ls .claude/df-local-patches/   # should contain backed-up file

# Test clean copy: add orphan, then update
touch .claude/df/orphan.md
dark-factory update
ls .claude/df/orphan.md 2>/dev/null   # should be gone

# Test uninstall
dark-factory uninstall --local
ls .claude/commands/df/ 2>/dev/null   # should be gone
cat .claude/settings.json             # should have no DF hooks

# Test global install with path rewriting
dark-factory init --global
grep "$HOME/.claude/df/" ~/.claude/df/workflows/map-codebase.md | head -3

# Test custom config dir
dark-factory init -c /tmp/df-custom
ls /tmp/df-custom/commands/df/

# Test CLAUDE_CONFIG_DIR env var
CLAUDE_CONFIG_DIR=/tmp/df-env dark-factory init --global
ls /tmp/df-env/commands/df/

# Test non-interactive fallback
echo "" | dark-factory init   # should default to global

# Test help
dark-factory help

# Clean up
rm -rf /tmp/df-test /tmp/df-custom /tmp/df-env
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
Source (repo)              → Installed to (.claude/)        Purpose
─────────────────────────  ──────────────────────────────── ───────────────────────
commands/df/*.md           → commands/df/*.md (rewritten)   Skill entry points
df/workflows/*.md          → df/workflows/*.md (rewritten)  Orchestration logic
df/templates/*.md          → df/templates/*.md (rewritten)  Doc structure templates
df/references/*.md         → df/references/*.md (rewritten) Scoring rubric, eval criteria
df/registry.md             → df/registry.md (rewritten)     Registry template
hooks/df-check-update.js   → hooks/df-check-update.js       Background update check
hooks/df-statusline.js     → hooks/df-statusline.js         Status bar indicator
CHANGELOG.md               → dark-factory/CHANGELOG.md      Version history
(generated at install)     → dark-factory/VERSION            Installed version
(generated at install)     → package.json                    CommonJS shim
(generated at install)     → df-file-manifest.json           File hashes for patch detection
(generated at install)     → settings.json (merged)          Hook + statusline registration
─────────────────────────  ──────────────────────────────── ───────────────────────
bin/dark-factory.mjs       (not installed)                   CLI entry point
src/cli.mjs                (not installed)                   Installer logic
```

### Path rewriting

Source markdown files use `~/.claude/` as a canonical placeholder. At install time, `copyTreeWithRewrite()` replaces this placeholder with the actual config directory path:

- **Global install**: `~/.claude/` → `/home/user/.claude/` (absolute path)
- **Local install**: `~/.claude/` → `./.claude/` (relative to project root)

This means template references like `~/.claude/df/templates/architecture.md` and `@` includes like `@~/.claude/df/workflows/map-codebase.md` resolve correctly regardless of install mode.

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

### Clean copy and patch detection

The installer does a **clean destination copy** — it deletes `commands/df/` and `df/` before re-copying. This eliminates orphaned files from previous versions.

To protect user modifications, the installer generates a **file manifest** (`df-file-manifest.json`) with SHA256 hashes after each install. On the next update, it compares installed files against the manifest and backs up any modified files to `df-local-patches/` before overwriting.

The agent registry lives in `.dark-factory/registry.md` (per-project output), so it's naturally preserved — the installer doesn't touch `.dark-factory/`.
