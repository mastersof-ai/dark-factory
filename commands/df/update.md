---
description: 'Update Dark Factory to the latest version'
allowed-tools:
  - Bash(npx *)
  - Bash(node *)
  - Bash(npm view *)
  - Read
  - Glob
  - AskUserQuestion
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

### 3. Show Changelog

Before updating, check if a changelog is available and show what changed:

1. Read the installed changelog at `{configDir}/dark-factory/CHANGELOG.md` (if it exists)
2. Fetch the latest changelog from the new version:
   ```bash
   npx @mastersof-ai/dark-factory@latest help 2>/dev/null
   ```
3. Present a summary of changes between the installed version and the latest version
4. Use `AskUserQuestion` to confirm: "Update Dark Factory from v{INSTALLED} to v{LATEST}?"
   - Options: "Update" (proceed), "Skip" (abort)

If the user chooses "Skip", stop here.

### 4. Update

Run the installer with the detected scope:

```bash
npx @mastersof-ai/dark-factory@latest update --$SCOPE
```

### 5. Clear Update Cache

```bash
# Clear the update notification
rm -f .claude/cache/df-update-check.json
rm -f "$HOME/.claude/cache/df-update-check.json"
```

### 6. Report

Show what was updated:
- Previous version -> new version
- Any local modifications that were backed up (check `df-local-patches/`)
- Remind the user to restart Claude Code to pick up the new hooks
