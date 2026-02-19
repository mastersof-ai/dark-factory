# Template: ARCHITECTURE.md

Write this document for a single component. Cover how the component is structured
internally — its layers, patterns, data flow, and key abstractions.

---

## Required Sections

### Purpose

One paragraph: what this component does, who/what interacts with it.

### Architecture Pattern

What pattern does this component follow? (MVC, layered, hexagonal, feature-module, etc.)
Brief explanation of how the pattern is applied here.

### Layer Map

For each architectural layer, document:

```
### HTTP Layer
- **Purpose**: Request handling, routing, middleware
- **Location**: `src/api/routes/`
- **Key files**:
  - `src/api/routes/index.ts` — main route definitions
  - `src/api/middleware/auth.ts` — authentication middleware
```

Cover all layers: routing, business logic, data access, configuration, etc.

### Data Flow

Trace a typical request through the component from entry to response.
Include file paths at each step. Use numbered steps:

```
1. Request hits `src/routes/core.clj:45` (Compojure route match)
2. Middleware chain: auth → params → content-type
3. Handler calls `src/services/repo.clj:23` (business logic)
4. Data access via `src/db/dynamo.clj:67` (DynamoDB query)
5. Response serialized and returned
```

### Entry Points

List all entry points into this component:

- HTTP endpoints (routes)
- CLI commands
- Event handlers / background jobs
- Imports from other components

For each: file path + one-line description.

### Key Abstractions

Document the 3-5 most important abstractions:

- Protocols / interfaces / base classes
- Core data types / models
- Patterns (DI, event bus, state machines, etc.)

Include the file where each is defined.

### State Management

How this component manages state:

- Database connections (pooling, lifecycle)
- In-memory caches
- Configuration loading
- Auth / session state

---

## Quality Bar

- Every section must include file paths in backticks with line numbers where precise
- Minimum 30 lines
- Reference actual code, not hypothetical patterns
- Stack-appropriate: use correct terminology for the component's language/framework
