# Dark Factory

An automated software engineering tool with 100% AI engineers. Built on [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

> **Pre-release** — This is early. The core pipeline works and produces useful output today, but the full vision is still being built. See [where we're headed](#the-vision).

## Why This Exists

I use Claude Code a lot. It generates a *ton* of code — and I was drowning in the review workload. Just like code reviews in the real world, my manual reviews weren't catching everything. API breakages slipped through. UX regressions slipped through. And honestly, manual review of AI-generated code has marginal value at best, especially when the code is driven by experienced engineers working with Opus.

So I started thinking: what if Claude itself could become the factory floor? Not one agent doing everything, but a team — specialists that plan, review, test APIs (Postman), test UX (Playwright), run security checks, and verify each other's work. Spend your time up front getting the design and spec right with an AI team, push go, and what comes out is a system that's been vetted more thoroughly than most human projects. Ten different agents running ten distinct verification passes, plus static analysis, plus whatever else you wire up.

This is what everyone talks about as "the future" — but it's already here if you do it right.

Tools like [GSD](https://github.com/gsd-build/get-shit-done) and [SuperPowers](https://github.com/obra/superpowers) have trailblazed this space. GSD in particular is a master class in building a complete software development lifecycle workflow engine inside Claude Code. But I wanted more. I wanted to work across multiple system components, spin out agents that specialize in each part, have them work independently, review each other's output, and collaborate when the problem crosses boundaries.

That's Dark Factory. A coordinated team of AI agents and a multi-agent workflow that takes you from initial thought (or PR) to completed, validated fix. Coordinated agents and smart workflows can one-shot much bigger systems than vanilla Claude Code — and the goal isn't to replace Claude Code, but to grow with it. As the model improves, you still have your Dark Factory working for you.

## What It Does Today

Right now, Dark Factory's first iteration focuses on **understanding your codebase**:

1. **Discovers** your system components through an interactive conversation
2. **Recruits** specialist agents — scores them against each component, assigns the best fit
3. **Analyzes** each component in parallel, producing structured architecture docs
4. **Verifies** output quality against defined thresholds

Even without the full workflow engine, the generated docs are immediately useful. Drop them into your prompts, use them as context for other tools, or just read them to understand a codebase you inherited. We're building the foundation — per-component context that future actions will use across tasks and agent invocations. We're helping Claude Code find its context window.

I imagine one day Claude Code itself will just do these types of flows natively. But until then, we're here.

## Quick Start

```bash
# Install into your project
npx @mastersof-ai/dark-factory init --local

# Or install globally for all projects
npx @mastersof-ai/dark-factory init --global

# Open Claude Code and run the full pipeline
/df:map-codebase
```

## The Vision

The end state is a Dark Factory that takes you from "here's what I want to build" to "here's a tested, reviewed, verified implementation" — with a team of specialist agents doing the heavy lifting:

- Agents that own specific components and know them deeply
- Cross-component collaboration when changes span boundaries
- Automated API and UX testing, security scanning, static analysis
- Agents that review each other's work from different angles
- A workflow that gets the design right *before* writing code

This is the stuff that AI skeptics say will never happen. We're building it anyway.

## Installation Modes

| Mode | Command | Where it installs | Best for |
|------|---------|-------------------|----------|
| **Local** | `init --local` | `.claude/` in your project | Per-project setup, committed to git |
| **Global** | `init --global` | `~/.claude/` in your home dir | Available in all projects |

Local installations take priority over global when both exist.

## Commands

| Command | What it does |
|---------|-------------|
| `/df:map-codebase` | Full pipeline — discover, recruit, analyze, verify |
| `/df:discover` | Identify components, write cross-component docs (SYSTEM.md, DEPENDENCIES.md) |
| `/df:recruit` | Score agents against components, build the agent registry |
| `/df:analyze [component]` | Deep-dive with specialist agents (all or specific components) |
| `/df:update` | Update Dark Factory to the latest version |

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

## Updates

Dark Factory checks for updates automatically at session start. When an update is available:

- **Status bar**: Shows `⬆ /df:update` indicator
- **In Claude Code**: Run `/df:update` to update

From the terminal:

```bash
npx @mastersof-ai/dark-factory update
```

## Advanced Options

### Custom Config Directory

```bash
CLAUDE_CONFIG_DIR=/custom/path dark-factory init --global

# Or use --config-dir / -c flag (overrides --local/--global and env var)
dark-factory init -c /custom/path
```

### Force Statusline

By default, Dark Factory won't overwrite an existing statusline registration (e.g., from GSD). Use `--force-statusline` to override:

```bash
dark-factory init --global --force-statusline
```

## How It Works

Dark Factory installs into `.claude/` — the standard Claude Code configuration directory. The skills are markdown files that Claude Code executes as AI-guided workflows. No runtime dependencies, no background processes, no API keys beyond what Claude Code already uses.

## Uninstall

```bash
dark-factory uninstall          # auto-detects location
dark-factory uninstall --local  # or specify explicitly
dark-factory uninstall --global
```

Preserves your generated docs (`.dark-factory/`) and custom agents — delete those manually if unwanted.

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI
- Node.js >= 18

## Get in Touch

Questions, ideas, or just want to talk about multi-agent workflows? Find me at **256BitChris** on [Reddit](https://reddit.com/u/256BitChris) or [X](https://x.com/256BitChris).

## License

MIT — see [LICENSE](LICENSE)

## Acknowledgments

Standing on the shoulders of [GSD](https://github.com/gsd-build/get-shit-done) and [SuperPowers](https://github.com/obra/superpowers), which showed what's possible when you treat Claude Code as a workflow engine. Dark Factory takes a different path — multi-agent, multi-component — but the inspiration is real.

---

Built by [Masters of AI](https://mastersof.ai)
