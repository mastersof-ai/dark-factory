---
description: 'Capture a thought, explore code, shape an approach — graduated commitment from 30 seconds to full implementation'
allowed-tools:
  - Read
  - Write
  - Bash(ls *)
  - Bash(find *)
  - Bash(mkdir *)
  - Bash(git log *)
  - Bash(git diff *)
  - Bash(wc *)
  - Glob
  - Grep
  - AskUserQuestion
---

# New Work Item

One entry point for capturing work. Say what's on your mind — the system meets
you where you are through conversation. State saves at every natural stopping point.

## Usage

- `/df:new "pagination feels wrong"` — capture a new thought
- `/df:new pagination-feels-wrong` — resume an existing item
- `/df:list` — see all items at all levels

## Execution

Follow the workflow at @~/.claude/df/workflows/new.md from Step 0.

The input text is: $ARGUMENTS

If `$ARGUMENTS` is empty, ask the user: "What's on your mind?" — then proceed
with their answer as the input text.
