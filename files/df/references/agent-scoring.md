# Agent Scoring Rubric

Reference for Phase 2 (Agent Recruitment) of the map-codebase workflow.
Agents consult this rubric when scoring component-agent pairs.

---

## Dimensions

Each component-agent pair is scored on 4 dimensions (0-10 total):

| Dimension        | Range | Criteria                                                                    |
| ---------------- | ----- | --------------------------------------------------------------------------- |
| **Stack Match**  | 0-3   | 0=no overlap, 1=same language family, 2=same framework, 3=exact stack match |
| **Domain Fit**   | 0-3   | 0=wrong domain, 1=tangential, 2=same category, 3=this is their primary job  |
| **Tooling**      | 0-2   | 0=unfamiliar toolchain, 1=partial overlap, 2=knows the exact tools          |
| **Availability** | 0-2   | 0=already owns 3+ components, 1=owns 1-2 components, 2=unassigned           |

### Stack Match Examples

- **3**: A Python engineer agent → Python/Django component
- **2**: An Angular engineer agent → React component (same language family + SPA framework)
- **1**: A backend engineer agent → Python component (knows server-side, but different ecosystem)
- **0**: A frontend engineer agent → Terraform infrastructure

### Domain Fit Examples

- **3**: A test engineer agent → test suite component (testing IS their primary job)
- **2**: An infrastructure agent → Docker/observability (infra-adjacent)
- **1**: A backend engineer agent → documentation (they know the code, but writing docs isn't their job)
- **0**: A sales advisor agent → API implementation

### Tooling Examples

- **2**: An Angular engineer agent → Angular component (knows ng CLI, Angular CDK, Tailwind)
- **1**: A frontend agent → Next.js component (knows npm/Tailwind, not Next.js specifics)
- **0**: A backend engineer agent → Terraform infrastructure (different toolchain entirely)

### Availability

Track assignments during scoring. Decrement availability as agents accumulate components:

- **2**: Agent has no component assignments yet
- **1**: Agent owns 1-2 components already
- **0**: Agent owns 3+ components (overloaded)

---

## Score Thresholds

| Total    | Verdict | Action                                                                               |
| -------- | ------- | ------------------------------------------------------------------------------------ |
| **8-10** | ASSIGN  | Strong match. Use this agent as-is.                                                  |
| **5-7**  | REVIEW  | Decent match — founder should verify. May need component-specific context in prompt. |
| **0-4**  | CREATE  | No suitable agent. Offer to create a new one.                                        |

---

## Scorecard Format

Present results as a table, one row per component, showing the best candidate:

```
Component       Best Agent               Stack Domain Tool Avail TOTAL Verdict
─────────────── ──────────────────────── ───── ────── ──── ───── ───── ───────
api             backend-engineer            3      3    2     1     9  ASSIGN
frontend        angular-engineer            3      3    2     2    10  ASSIGN
monitoring      (none suitable)             -      -    -     -     3  CREATE
```

For REVIEW verdicts, also show the runner-up candidate so the founder can compare.

---

## Repos Without Existing Agents

When `.claude/agents/` is empty or contains no relevant agents:

1. All components score as CREATE
2. Generate agent definitions following best practices:
   - Read 1-2 existing agents (if any) as style reference
   - Use component's `.dark-factory/` docs for domain context
   - Name new agents `df-{component}.md`
   - Include: mandatory tooling rules, coding philosophy, stack expertise
3. Present all drafts to founder for approval before writing
