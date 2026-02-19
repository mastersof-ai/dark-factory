# Template: CONCERNS.md

Write this document for a single component. Surface technical debt, security
considerations, performance issues, and gaps — the things an engineer should
know about before working in this area.

---

## Required Sections

### Technical Debt

Known debt items. For each:

- **What**: describe the issue
- **Where**: file paths affected
- **Impact**: how it affects development or users
- **Effort**: rough sense of fix complexity (small/medium/large)

### Security Considerations

Security-relevant aspects of this component:

- Authentication / authorization implementation
- Input validation approach and gaps
- Sensitive data handling (PII, credentials, tokens)
- Known security concerns or TODOs
- Dependency vulnerabilities (if known)

**Do NOT include actual secrets, keys, or credentials.**

### Performance

Performance characteristics and concerns:

- Known hot paths or bottlenecks
- Caching strategy and effectiveness
- Database query patterns (N+1, full scans, etc.)
- Bundle size / load time concerns (for frontend)
- Scaling limits

### Missing or Incomplete

Features or infrastructure that are:

- Stubbed but not implemented
- Partially implemented
- Documented as TODO/FIXME in the code

Search for `TODO`, `FIXME`, `HACK`, `WORKAROUND` and summarize findings.

### Error Handling Gaps

Areas where error handling is weak:

- Unhandled exceptions
- Missing validation
- Silent failures
- Poor error messages

### Documentation Gaps

What's not documented that should be:

- Undocumented APIs or interfaces
- Missing inline documentation for complex logic
- Outdated documentation that contradicts the code

### Migration / Upgrade Needs

Pending upgrades or migrations:

- Deprecated dependencies
- Framework version upgrades needed
- Data migration requirements

---

## Quality Bar

- Be specific: file paths and line numbers for every concern
- Prioritize: most impactful concerns first within each section
- Be honest: this doc exists to surface problems, not hide them
- No secrets: never include API keys, tokens, passwords, or credentials
- Minimum 20 lines
