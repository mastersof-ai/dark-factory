---
description: 'Show all work items at all levels — captured thoughts, explored scopes, shaped approaches'
allowed-tools:
  - Read
  - Bash(ls *)
  - Bash(find *)
  - Glob
---

# List Work Items

Show all items in `.df-work/` with their current level and metadata.

## Execution

### 1. Check for Work Items

Look for `.df-work/*/STATE.md` files. If `.df-work/` doesn't exist or is empty:

> No work items yet. Start one with `/df:new "your thought here"`

### 2. Read Each Item

For each `STATE.md`, extract:
- Title (the `# heading`)
- Slug
- Level (capture / explore / shape / committed)
- Area
- Updated date

### 3. Display

Show a table grouped by level, most recently updated first:

```
Work Items

  SHAPED
  ● pagination-feels-wrong    apps/admin          2026-02-19
  ● auth-token-refresh        apps/api            2026-02-18

  EXPLORED
  ○ sidebar-navigation        apps/admin          2026-02-17

  CAPTURED
  · slow-query-on-users       apps/api            2026-02-16
  · rethink-error-boundaries  apps/admin           2026-02-15

  COMMITTED
  ✓ admin-portal-review       apps/admin          2026-02-14
```

Level indicators: `✓` committed, `●` shaped, `○` explored, `·` captured.

### 4. Hint

After the table:

> Resume any item: `/df:new <slug>`
