# Template: CONVENTIONS.md

Write this document for a single component. Cover coding conventions, patterns,
and style — the "how we write code here" guide.

---

## Required Sections

### Naming Conventions

Document naming patterns for:

- Files and directories (kebab-case, PascalCase, etc.)
- Functions/methods
- Variables and constants
- Namespaces / modules / packages
- Tests

Include examples from actual code.

### Code Organization

How code is organized within the component:

- Directory structure pattern (by feature, by layer, by type)
- Where new files of each type go
- Module/namespace organization

### Import / Require Patterns

How dependencies are imported:

- Standard import style (explicit requires, barrel exports, etc.)
- Ordering conventions
- What's avoided (e.g., `:refer :all`, wildcard imports)

Include a typical import block from the codebase.

### Common Patterns

Document 3-5 recurring patterns in the codebase:

- How HTTP handlers are written
- How database queries are structured
- How errors are handled
- How config is accessed
- How tests are structured

For each: show a brief code example from the actual codebase with file path.

### Error Handling

How the component handles errors:

- Exception types or error value patterns
- Error propagation strategy
- Logging/reporting conventions
- User-facing error formats

### Logging / Observability

How the component produces observability data:

- Logging library and usage pattern
- Log levels and when each is used
- Tracing / metrics if applicable
- Example log statement from the codebase

### Anti-Patterns

Things explicitly avoided in this codebase:

- What NOT to do (e.g., "don't use spec in new code", "no inline templates")
- Why each is avoided
- What to use instead

---

## Quality Bar

- Every pattern must include a code example with file path
- Reference actual conventions from the codebase, not hypothetical best practices
- Include anti-patterns — what NOT to do is as valuable as what to do
- Minimum 25 lines
