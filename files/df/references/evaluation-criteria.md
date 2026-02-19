# Dark Factory — Evaluation Criteria

Quality standards for DF-generated documentation. Use this reference when evaluating
output from `/df:map-codebase` runs. Each criterion is testable — not subjective.

## Universal Criteria (All Doc Types)

### Content Quality

| Criterion              | Test                                                  | Minimum           |
| ---------------------- | ----------------------------------------------------- | ----------------- |
| **File path density**  | Count backtick-quoted paths per 10 lines              | >= 1 per 10 lines |
| **Path resolvability** | Every backtick path resolves to a real file           | 100%              |
| **No stubs**           | Grep for TODO, placeholder, TBD, example, lorem       | 0 matches         |
| **No empty sections**  | Every `##` heading has >= 3 lines of content below it | 100%              |
| **Line count floor**   | Total lines per file                                  | >= 50 lines       |

### Structure Quality

| Criterion               | Test                                | Minimum      |
| ----------------------- | ----------------------------------- | ------------ |
| **Template compliance** | All template sections present       | 100%         |
| **Heading hierarchy**   | No skipped levels (## → ####)       | 0 violations |
| **Code blocks tagged**  | Every code fence has a language tag | 100%         |

### Stack Appropriateness

The documentation must use correct terminology for the component's stack:

| Stack         | Expected Terms                                           | Red Flags                     |
| ------------- | -------------------------------------------------------- | ----------------------------- |
| **Clojure**   | namespace, defn, Ring, middleware, Integrant, component  | class, method, Spring, module |
| **Angular**   | component, service, signal, inject, standalone, NgModule | React, hook, useState, JSX    |
| **Astro**     | island, frontmatter, .astro, content collection          | component lifecycle, useState |
| **Terraform** | resource, module, provider, state, plan                  | deploy, dockerfile, pipeline  |

## Per-Doc-Type Criteria

### ARCHITECTURE.md

| Criterion         | Test                                           | Minimum  |
| ----------------- | ---------------------------------------------- | -------- |
| **Layer diagram** | Contains a Mermaid diagram or ASCII art        | Required |
| **Data flow**     | Describes how data moves through the component | Required |
| **Entry points**  | Lists main entry point files with paths        | >= 1     |
| **Section count** | Distinct `##` sections                         | >= 4     |
| **Line count**    | Total lines                                    | >= 80    |

### STACK.md

| Criterion           | Test                                       | Minimum |
| ------------------- | ------------------------------------------ | ------- |
| **Dependency list** | Named dependencies with versions or ranges | >= 5    |
| **Config files**    | References to config files with paths      | >= 2    |
| **Build tooling**   | Build/run commands documented              | >= 1    |
| **Line count**      | Total lines                                | >= 60   |

### CONVENTIONS.md

| Criterion           | Test                                                    | Minimum      |
| ------------------- | ------------------------------------------------------- | ------------ |
| **Code examples**   | Fenced code blocks showing conventions                  | >= 3         |
| **Do/Don't pairs**  | At least some conventions shown as correct vs incorrect | >= 2         |
| **Naming patterns** | File naming, function naming, or variable naming rules  | >= 1 section |
| **Line count**      | Total lines                                             | >= 60        |

### TESTING.md

| Criterion           | Test                                           | Minimum  |
| ------------------- | ---------------------------------------------- | -------- |
| **Framework named** | Test framework identified by name              | Required |
| **Run command**     | How to execute tests                           | Required |
| **Example test**    | At least one code block showing test structure | >= 1     |
| **Coverage notes**  | What is/isn't tested, or coverage targets      | Required |
| **Line count**      | Total lines                                    | >= 50    |

### CONCERNS.md

| Criterion         | Test                                                   | Minimum               |
| ----------------- | ------------------------------------------------------ | --------------------- |
| **Severity tags** | Each concern tagged (high/medium/low)                  | 100%                  |
| **Actionability** | Each concern has a suggested fix or investigation path | 100%                  |
| **Specificity**   | References specific files, functions, or patterns      | >= 1 path per concern |
| **Line count**    | Total lines                                            | >= 40                 |

### SYSTEM.md (Cross-component)

| Criterion               | Test                                            | Minimum  |
| ----------------------- | ----------------------------------------------- | -------- |
| **Component list**      | All components named                            | 100%     |
| **Integration diagram** | Mermaid or ASCII showing how components connect | Required |
| **Shared patterns**     | Cross-cutting concerns documented               | >= 2     |
| **Line count**          | Total lines                                     | >= 80    |

### DEPENDENCIES.md (Cross-component)

| Criterion             | Test                                           | Minimum  |
| --------------------- | ---------------------------------------------- | -------- |
| **Dependency matrix** | Which component depends on which               | Required |
| **Shared deps**       | Libraries used by multiple components          | >= 1     |
| **Version alignment** | Notes on version consistency across components | Required |
| **Line count**        | Total lines                                    | >= 50    |

## Scoring

Rate each doc 1-5 using these criteria:

| Score | Meaning                                                                          |
| ----- | -------------------------------------------------------------------------------- |
| **5** | All criteria met, genuinely useful for an agent picking up the component         |
| **4** | Minor gaps (1-2 criteria missed), still highly useful                            |
| **3** | Usable but missing depth — an agent would need to supplement with codebase reads |
| **2** | Structural issues or significant gaps — more stub than substance                 |
| **1** | Template barely filled in, not useful                                            |

Record scores in `.claude/df/dev/ITERATION-LOG.md` after each run.
