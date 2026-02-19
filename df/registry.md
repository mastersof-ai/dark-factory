# Dark Factory — Agent Registry Template

This is the template for the agent registry. Phase 2 writes the actual registry to
`.dark-factory/registry.md` in each project, so that agent assignments are per-codebase
(not shared across projects in global installs).

Phase 3 reads `.dark-factory/registry.md` to resolve agent types. If that file is
empty or missing, Phase 3 falls back to `general-purpose` (M1 behavior).

---

## Format

| Component | Agent | Score | Verdict | Notes |
| --------- | ----- | ----- | ------- | ----- |

- **Component**: matches the component name from Phase 1 discovery
- **Agent**: the `subagent_type` value to pass to the Task tool (e.g., `backend-engineer`)
- **Score**: `N/10` from the scoring rubric at @~/.claude/df/references/agent-scoring.md
- **Verdict**: ASSIGN, REVIEW (founder-approved), or CREATE (new agent)
- **Notes**: brief rationale or founder override notes
