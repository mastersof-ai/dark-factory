# Template: STACK.md

Write this document for a single component. Cover the technology stack —
dependencies, build system, runtime, integrations, and configuration.

---

## Required Sections

### Runtime

Language version, runtime, platform:

- Language + version (e.g., JVM 25, Node 22, Python 3.12)
- Runtime environment (e.g., ECS, Lambda, Cloudflare Workers)
- Architecture (e.g., arm64, x86_64)

### Build System

How the component is built and managed:

- Build tool (e.g., Leiningen, npm, Cargo)
- Build config file path (e.g., `project.clj`, `package.json`)
- Key build commands (dev, test, prod)
- Build output (JAR, bundle, binary)

### Key Dependencies

List the 10-15 most important dependencies (not exhaustive). For each:

- Name + version
- What it's used for
- Where it's configured or imported

Group by category (web framework, database, auth, testing, etc.)

### Dev Dependencies

Testing frameworks, linters, formatters, and dev tools:

- Name + version
- Purpose
- Config file path if applicable

### External Integrations

Services and APIs this component talks to:

- Service name (DynamoDB, S3, Cognito, etc.)
- Client library used
- Config: how connection is configured (env vars, config files)
- Key files: where integration code lives

### Configuration

How the component is configured:

- Config file locations (e.g., `resources/config.edn`, `.env`)
- Environment variables (list key ones)
- Feature flags or toggles
- Profile/environment switching (dev vs prod)

### Local Development

How to run this component locally:

- Required tools and versions
- Setup steps
- Dev server command
- Hot reload behavior
- Ports used

---

## Quality Bar

- Include file paths for all config files and key dependency usage sites
- Version numbers for key dependencies
- Distinguish runtime vs dev dependencies
- Minimum 25 lines
