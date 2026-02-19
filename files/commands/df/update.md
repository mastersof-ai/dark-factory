---
description: 'Update Dark Factory to the latest version'
allowed-tools:
  - Bash(npx *)
  - Bash(node *)
  - Bash(npm view *)
  - Bash(cat *)
  - Read
  - Glob
---

# Update Dark Factory

Check for and install the latest version of Dark Factory.

## Steps

### 1. Detect Installation

Determine if Dark Factory is installed locally or globally:

```bash
# Check local first (takes priority)
if [ -f ".claude/dark-factory/VERSION" ]; then
  INSTALLED=$(cat .claude/dark-factory/VERSION)
  SCOPE="local"
elif [ -f "$HOME/.claude/dark-factory/VERSION" ]; then
  INSTALLED=$(cat "$HOME/.claude/dark-factory/VERSION")
  SCOPE="global"
else
  echo "Dark Factory is not installed."
  exit 1
fi
echo "Installed: v$INSTALLED ($SCOPE)"
```

### 2. Check Latest Version

```bash
LATEST=$(npm view @mastersof-ai/dark-factory version 2>/dev/null)
echo "Latest: v$LATEST"
```

If the installed version matches the latest, report that Dark Factory is up to date and stop.

### 3. Update

Run the installer with the detected scope:

```bash
npx @mastersof-ai/dark-factory@latest update --$SCOPE
```

### 4. Clear Update Cache

```bash
# Clear the update notification
rm -f .claude/cache/df-update-check.json
rm -f "$HOME/.claude/cache/df-update-check.json"
```

### 5. Report

Show what was updated:
- Previous version → new version
- Remind the user to restart Claude Code to pick up the new hooks
