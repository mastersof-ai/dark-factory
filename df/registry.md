# Dark Factory — Agent Registry

Maps components to their assigned agents. Written by Phase 2 (Agent Recruitment),
read by Phase 3 (Component Deep Dive) to determine which agent type to spawn.

Last updated: (not yet populated — run `/df:map-codebase` to populate via Phase 2)

---

## Assignments

| Component | Agent | Score | Verdict | Notes |
| --------- | ----- | ----- | ------- | ----- |

---

## Format Notes

- **Component**: matches the component name from Phase 1 discovery
- **Agent**: the `subagent_type` value to pass to the Task tool (e.g., `backend-engineer`)
- **Score**: `N/10` from the scoring rubric at @.claude/df/references/agent-scoring.md
- **Verdict**: ASSIGN, REVIEW (founder-approved), or CREATE (new agent)
- **Notes**: brief rationale or founder override notes

Phase 3 reads this registry to resolve agent types. If this file is empty or missing,
Phase 3 falls back to `general-purpose` (M1 behavior).
