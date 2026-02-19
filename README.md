# Dark Factory

Map any codebase with specialist AI agents. A skill pack for [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

Dark Factory analyzes your codebase and produces structured architecture documentation — per-component docs covering architecture, stack, conventions, testing, and concerns. It scores your existing AI agents against each component and assigns the best specialist for the job.

## Quick Start

```bash
# Install into your project
npx @mastersof-ai/dark-factory init

# Open Claude Code and run the full pipeline
/df:map-codebase
```

That's it. Dark Factory will:

1. **Discover** your components (interactive conversation)
2. **Recruit** agents — score existing agents against components, assign specialists
3. **Analyze** each component in parallel with assigned agents
4. **Verify** output quality and offer to commit

## Commands

| Command | What it does |
|---------|-------------|
| `/df:map-codebase` | Full pipeline — discover, recruit, analyze, verify |
| `/df:discover` | Identify components, write cross-component docs (SYSTEM.md, DEPENDENCIES.md) |
| `/df:recruit` | Score agents against components, build the agent registry |
| `/df:analyze [component]` | Deep-dive with specialist agents (all or specific components) |

Each command is standalone. Run the full pipeline to get started, then use individual commands for targeted work:

```bash
# Re-assign agents after adding new ones
/df:recruit

# Re-analyze just one component
/df:analyze infrastructure

# Re-analyze everything with current assignments
/df:analyze
```

## What You Get

```
.dark-factory/
  SYSTEM.md              # Cross-component architecture overview
  DEPENDENCIES.md        # Component dependency graph
  {component}/
    ARCHITECTURE.md      # Patterns, layers, data flow
    STACK.md             # Dependencies, integrations, config
    CONVENTIONS.md       # Naming, style, import patterns
    TESTING.md           # Frameworks, patterns, fixtures
    CONCERNS.md          # Tech debt, security, performance
```

Every doc includes real file paths with line numbers, concrete code examples, and actionable insights. No boilerplate, no placeholders.

## Agent Recruitment

Dark Factory doesn't just throw generic agents at your code. Phase 2 scores your existing Claude Code agents on 4 dimensions:

| Dimension | What it measures |
|-----------|-----------------|
| **Stack Match** | Does the agent know this language/framework? |
| **Domain Fit** | Is this the agent's primary job? |
| **Tooling** | Does it know the exact tools? |
| **Availability** | Is it already overloaded? |

Agents scoring 8-10 get assigned automatically. 5-7 get flagged for your review. 0-4 trigger a CREATE recommendation — Dark Factory will draft a new specialist agent for your approval.

If your project has no agents yet, Dark Factory detects the gap and generates sensible defaults.

## Updating

```bash
npx @mastersof-ai/dark-factory update
```

Updates skills, templates, and workflows. Preserves your agent registry and any custom agents.

## How It Works

Dark Factory installs into `.claude/` — the standard Claude Code configuration directory:

```
.claude/
  commands/df/           # Skill entry points (what you invoke)
  df/
    workflows/           # Orchestration logic
    templates/           # Doc templates (structure for each doc type)
    references/          # Scoring rubric, evaluation criteria
    registry.md          # Your agent assignments (preserved on update)
```

The skills are markdown files that Claude Code executes as AI-guided workflows. No runtime dependencies, no background processes, no API keys.

## Uninstall

```bash
# Remove Dark Factory skills and config
rm -rf .claude/commands/df/ .claude/df/

# Remove generated docs (optional)
rm -rf .dark-factory/

# Remove any DF-created agents (optional)
rm -f .claude/agents/df-*.md
```

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI
- Node.js >= 18 (for the installer only — Dark Factory itself is pure markdown)

## License

MIT - see [LICENSE](LICENSE)

---

Built by [Masters of AI](https://mastersof.ai)
