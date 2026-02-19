# Template: TESTING.md

Write this document for a single component. Cover testing approach, frameworks,
patterns, and how to run tests.

---

## Required Sections

### Test Framework

What testing framework(s) are used:

- Framework name + version
- Config file path
- Test runner command

### Test Structure

How tests are organized:

- Test directory location (e.g., `test/`, `__tests__/`)
- Naming convention (e.g., `*_test.clj`, `*.spec.ts`)
- Mapping to source files (mirror structure, co-located, etc.)

### Test Types

What types of tests exist in this component:

```
| Type        | Location       | Runner          | Count | Notes               |
|-------------|----------------|-----------------|-------|---------------------|
| Unit        | test/unit/     | lein test       | 45    | Fast, no I/O        |
| Integration | test/integ/    | lein test       | 12    | Needs running DB    |
| E2E         | e2e/           | playwright test | 8     | Needs running app   |
```

### Test Patterns

How tests are typically written. Include a representative example:

```
// Example from `test/api/repos.test.ts`
describe('create repo', () => {
  it('creates a new repository', async () => {
    const result = await createRepo(testData);
    expect(result.status).toBe(201);
    expect(typeof result.id).toBe('string');
  });
});
```

Document:

- Setup / teardown patterns (fixtures, beforeEach, etc.)
- Mocking / stubbing approach
- Test data creation patterns
- Assertion style

### Running Tests

How to run tests locally:

- Run all tests: command
- Run specific test file: command
- Run specific test: command
- Watch mode (if available): command

### Fixtures / Test Data

How test data is created and managed:

- Factory functions or builders
- Fixture files
- Database seeding
- Mock data patterns

### Coverage

Current test coverage approach:

- Coverage tool (if any)
- Coverage thresholds (if enforced)
- How to generate coverage report

### External Test Tools

Tests that run outside the component's own test framework:

- API tests (Postman/Newman collections)
- Security tests
- Performance tests
- Where they live, how they're run

---

## Quality Bar

- Include file paths for test config, example test files, and fixtures
- Show actual test commands that work
- Include a real code example of a typical test
- Minimum 25 lines
