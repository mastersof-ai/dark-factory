# Workflow: Map Codebase

Orchestrate a full codebase mapping. Four phases: Architect Discovery (interactive),
Agent Recruitment (interactive), Component Deep Dive (parallel agents), and
Verification + Commit.

## Composable Commands

Each phase is available as a standalone command. `/df:map-codebase` runs all four
in sequence; the sub-commands can be run individually for targeted work.

| Command                   | Phase   | Standalone Use Case                                       |
| ------------------------- | ------- | --------------------------------------------------------- |
| `/df:discover`            | Phase 1 | Re-explore after major structural changes                 |
| `/df:recruit`             | Phase 2 | Re-assign agents, fix bad matches, create new specialists |
| `/df:analyze [component]` | Phase 3 | Re-analyze one component after re-assignment              |
| `/df:map-codebase`        | All     | Full pipeline from scratch or refresh                     |

**Data flow between phases:**

```
/df:discover → .dark-factory/SYSTEM.md, DEPENDENCIES.md
                        ↓
/df:recruit  → .dark-factory/registry.md (reads SYSTEM.md for component list)
                        ↓
/df:analyze  → .dark-factory/{component}/*.md (reads registry for agent types)
                        ↓
Phase 4      → verification + commit (only in /df:map-codebase)
```

Each command reads its inputs from the filesystem, so you can run them in any
order as long as prerequisites exist.

---

## Phase 1: Architect Discovery (Interactive)

This phase runs as the **main conversation** — not a spawned agent — so you can
ask the user questions and iterate.

### Step 1.1: Check Existing Docs

If `.dark-factory/` already exists:

1. List all files with modification dates (`ls -la .dark-factory/`)
2. Ask the user:
   - **Full refresh** — re-map everything from scratch
   - **Update specific components** — only re-run Deep Dive for selected components
   - **Skip** — abort, keep existing docs

For "Update specific components": note which components to re-map, then skip to
Phase 3 with only those components. SYSTEM.md and DEPENDENCIES.md always get
re-evaluated in Phase 1 regardless.

For "Full refresh": delete `.dark-factory/` and continue.

### Step 1.2: Explore Repository Structure

Gather facts about the repo before asking questions:

1. **Directory structure**: `ls` the top-level and key subdirectories
2. **Package manifests**: Find `package.json`, `project.clj`, `Cargo.toml`,
   `pyproject.toml`, `go.mod`, etc. Read their dependency sections.
3. **Config files**: Find Docker, CI, Terraform, env files
4. **Existing CLAUDE.md files**: Read each component's CLAUDE.md for documented architecture
5. **Git history**: Recent commits to understand active areas

### Step 1.3: Identify Components

From the exploration, build a component list. For each component, determine:

- **Name**: short identifier (e.g., `api`, `admin`, `web`)
- **Location**: path relative to repo root (e.g., `apps/api`)
- **Tech stack**: language, framework, key dependencies
- **Purpose**: one-line description

### Step 1.4: Interactive Q&A

Ask the user questions iteratively using AskUserQuestion. Cover:

1. **Component list confirmation**: "I found N components — any I'm missing or should exclude?"
2. **Cross-component relationships**: "How do {A} and {B} relate? Do they share a database, call each other's APIs, etc.?"
3. **Shared resources**: databases, storage, queues, secrets, authentication
4. **Deployment topology**: how components are deployed, what talks to what in production
5. **Key architectural decisions/constraints**: anything the docs should capture

Iterate until you have a clear picture. Don't rush this — context quality is everything.

### Step 1.5: Write Cross-Component Docs

Create `.dark-factory/` directory, then write:

1. **SYSTEM.md** — Use the template at `~/.claude/df/templates/system.md` as structure guidance.
   Fill it with the information gathered in the conversation.

2. **DEPENDENCIES.md** — Use the template at `~/.claude/df/templates/dependencies.md`.
   Map all cross-component relationships, shared resources, and data flows.

### Step 1.6: Confirm Before Deep Dive

Present the component list with tech stacks to the user:

```
Ready to deep-dive these components:

| Component | Location  | Stack         |
|-----------|-----------|---------------|
| api       | apps/api  | Clojure/Ring  |
| admin     | apps/admin| Angular 21    |
| ...       | ...       | ...           |

Each component gets 5 docs: ARCHITECTURE, STACK, CONVENTIONS, TESTING, CONCERNS.
Proceed?
```

Wait for user confirmation before Phase 2.

---

## Phase 2: Agent Recruitment (Interactive)

This phase scores existing agents against components discovered in Phase 1, presents
a scorecard to the founder, and writes the registry. Runs in the main conversation
(not spawned) so the founder can review and override.

Scoring rubric: @~/.claude/df/references/agent-scoring.md
Registry output: `.dark-factory/registry.md`

### Step 2.1: Check Existing Registry

If `.dark-factory/registry.md` already has assignments (non-empty table):

1. Show the current registry to the user
2. Ask:
   - **Keep** — use existing assignments, skip to Phase 3
   - **Re-score** — re-evaluate all components against current agents
   - **Update specific** — re-score only selected components

For "Keep": skip to Phase 3 immediately.
For "Re-score" or "Update specific": continue with Step 2.2.

### Step 2.2: Inventory Existing Agents

Scan both project-level and user-level agents:

1. Read `.claude/agents/*.md` (project-level)
2. Read `~/.claude/agents/*.md` (user-level / global)
3. Merge both lists — if the same agent name exists in both, project-level takes priority
4. Read each agent file's frontmatter and first paragraph
5. Extract: name, primary stack, domain expertise, tooling familiarity
6. Build a candidate list (exclude agents with no engineering relevance,
   e.g., sales advisors, content strategists)

If no agents exist in either location, note that all components will score as CREATE.

### Step 2.3: Score Component-Agent Pairs

For each component from Phase 1:

1. Read the scoring rubric at `~/.claude/df/references/agent-scoring.md`
2. Score the top 2-3 candidate agents on all 4 dimensions
3. Track availability — decrement as agents accumulate assignments
4. Record the best match with total score and verdict

### Step 2.4: Present Scorecard to Founder

Show the full scorecard table:

```
Component       Best Agent               Stack Domain Tool Avail TOTAL Verdict
─────────────── ──────────────────────── ───── ────── ──── ───── ───── ───────
api             backend-engineer            3      3    2     1     9  ASSIGN
...
```

For each verdict:

- **ASSIGN**: "Use {agent} for {component}?"
- **REVIEW**: "Partial match — good enough or create specialist?" (show runner-up)
- **CREATE**: "No strong match. Create a new agent?"

Wait for founder to approve, override, or adjust assignments.

### Step 2.5: Handle CREATE Decisions

For each component where the founder confirms CREATE:

1. Read 1-2 existing agents as style reference
2. Use the component's `.dark-factory/` docs (if they exist) for domain context
3. Generate an agent definition including:
   - Mandatory tooling rules
   - Coding philosophy and stack expertise
   - Component-specific conventions
4. Follow naming: `df-{component}.md` (e.g., `df-observability.md`)
5. Show draft to founder for approval before writing to `.claude/agents/`

### Step 2.6: Write Registry

Write `.dark-factory/registry.md` with all final assignments:

- Include scores, verdicts, and any founder override notes
- Record the date for staleness tracking
- This becomes the source of truth for Phase 3 agent resolution

---

## Phase 3: Component Deep Dive (Parallel Agents)

For each confirmed component, spawn a Task agent (type resolved from the registry,
or `general-purpose` as fallback). Each agent writes its 5 docs directly to
`.dark-factory/{component}/`.

### Step 3.1: Create Output Directories

```bash
mkdir -p .dark-factory/{component}
```

for each component.

### Step 3.2: Resolve Agents + Build Prompts

First, resolve the agent type for each component:

1. Read `.dark-factory/registry.md`
2. For each component:
   - If the registry has an assignment → use that agent as `subagent_type`
   - If the registry is empty or missing → fall back to `general-purpose` (M1 behavior)

Then build a prompt for each component that includes:

1. **Component identity**: name, location, tech stack, purpose (from Phase 1)
2. **System context**: brief summary of cross-component relationships relevant to this component
3. **Why this matters**: explain which downstream workflows consume these docs
   (e.g., `/work:research` reads `.dark-factory/` for context, Phase 2 uses docs to
   inform agent creation, `/work:assign` references component expertise)
4. **Template references**: instruct the agent to read templates from `~/.claude/df/templates/`
5. **Stack-specific guidance**: tailor exploration commands to the stack:
   - **Clojure**: look at `project.clj`, `src/`, namespace structure, protocols, Integrant config
   - **Angular/TypeScript**: look at `package.json`, `angular.json`, module structure, services, components
   - **Astro**: look at `package.json`, `astro.config.*`, pages, layouts, components
   - **Python**: look at `pyproject.toml`, module structure, frameworks
   - **Go**: look at `go.mod`, package structure, interfaces
   - **Rust**: look at `Cargo.toml`, module structure, traits
   - _(Adapt for whatever stacks are present)_
6. **Output instructions**: write each doc to `.dark-factory/{component}/{DOC}.md`
7. **Quality bar**: every section must include file paths in backticks; minimum 20 lines per doc;
   no placeholder content

### Agent Prompt Template

```
You are mapping the `{component}` component at `{location}`.

## Your Task

Explore `{location}` thoroughly and write 5 architecture documents to
`.dark-factory/{component}/`. Read the template for each doc before writing it.

## Component Context
- **Stack**: {stack}
- **Purpose**: {purpose}
- **System role**: {brief from SYSTEM.md — how this component fits in the system}

## Documents to Write

For each document, read the template FIRST at the path shown, then explore the
component and write the doc.

1. **ARCHITECTURE.md** — template: `~/.claude/df/templates/architecture.md`
2. **STACK.md** — template: `~/.claude/df/templates/stack.md`
3. **CONVENTIONS.md** — template: `~/.claude/df/templates/conventions.md`
4. **TESTING.md** — template: `~/.claude/df/templates/testing.md`
5. **CONCERNS.md** — template: `~/.claude/df/templates/concerns.md`

## Stack-Specific Exploration

{stack-specific commands and files to examine — see Step 3.2 guidance}

## Quality Requirements

- Every section MUST include file paths in backticks (e.g., `src/foo/bar.clj:42`)
- Minimum 20 meaningful lines per document (not padding)
- No placeholder sections — if you can't find info for a section, say so explicitly
- Reference actual code, not hypothetical patterns
- Include line numbers where they add precision

## Output

Write all 5 docs to `.dark-factory/{component}/`.
When done, report only: file names and line counts. Do NOT echo document contents back.
```

### Step 3.3: Create Team + Tasks

Use TeamCreate to set up a team for the deep dive:

1. `TeamCreate` with `team_name: "df-map"` (or similar)
2. `TaskCreate` one task per component — subject: "Map {component}", description includes
   the full agent prompt from the template above
3. Spawn one teammate per component using `Task` with:
   - `team_name`: the team name from step 1
   - `name`: `map-{component}` (e.g., `map-api`, `map-admin`)
   - `subagent_type`: resolved from registry (Step 3.2) — named agent or `general-purpose` fallback
   - `mode`: `bypassPermissions` (agents need to read and write freely)
4. Assign tasks to teammates via `TaskUpdate` with `owner`

All teammates spawn in parallel — use a single message with multiple Task calls.

**Why teams, not bare Task calls**: TeamCreate + TaskCreate gives real-time observability
via TaskList. You can see which components finished, which are still running, and catch
failures immediately instead of waiting for all 8 to return.

### Step 3.4: Monitor + Collect Results

As teammates complete tasks:

1. They mark their task completed via TaskUpdate and go idle
2. Check TaskList periodically — when all tasks show `completed`, proceed
3. If any agent fails, note the failure for Phase 4
4. Send `shutdown_request` to all teammates once collection is complete
5. `TeamDelete` to clean up

---

## Phase 4: Verification + Commit

### Step 4.1: File Existence Check

For each expected file, verify it exists and has >20 lines:

```bash
wc -l .dark-factory/**/*.md .dark-factory/*.md
```

Build a results table:

```
| Component | Doc           | Lines | Status |
|-----------|---------------|-------|--------|
| api       | ARCHITECTURE  | 87    | OK     |
| api       | STACK         | 45    | OK     |
| ...       | ...           | ...   | ...    |
```

If any file is missing or under 20 lines, flag it. Offer to re-run the agent for
that component.

### Step 4.2: Security Scan

Scan all generated docs for leaked secrets:

```bash
grep -riE '(api[_-]?key|secret|password|token|credential|private[_-]?key)\s*[:=]' .dark-factory/
grep -riE '[A-Za-z0-9+/]{40,}' .dark-factory/
grep -riE 'AKIA[0-9A-Z]{16}' .dark-factory/
```

If any matches found, show them to the user and ask whether to redact or proceed.

### Step 4.3: Summary

Present the final summary:

```
Codebase mapping complete.

| Component | ARCH | STACK | CONV | TEST | CONCERNS | Total Lines |
|-----------|------|-------|------|------|----------|-------------|
| api       | 87   | 45    | 62   | 38   | 41       | 273         |
| ...       | ...  | ...   | ...  | ...  | ...      | ...         |

Cross-component: SYSTEM.md (X lines), DEPENDENCIES.md (Y lines)
Total: N files, M lines
```

### Step 4.4: Offer Commit

Ask the user if they'd like to commit `.dark-factory/`:

```
Commit .dark-factory/ to git?
  Message: "docs: map existing codebase via Dark Factory"
```

If yes, stage and commit. If no, leave unstaged.

### Step 4.5: Next Steps

```
Mapping complete. Next actions:

- Review: read .dark-factory/ docs to verify quality
- M2 (future): /df:recruit-agents — create per-component df-* agents
- Refresh: re-run /df:map-codebase to update stale docs
```
