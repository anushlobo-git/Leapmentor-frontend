# Testing

This document explains how tests work in the LeapMentor frontend: the tools used, how to run them, where tests live, and what coverage is expected.

## Tools

| Tool | What it is / does |
| --- | --- |
| **Vitest** | The test runner. It finds test files, runs them, and reports pass/fail. It is the Vite-native equivalent of Jest and reuses the project's Vite config. |
| **Testing Library** (`@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`) | Renders React components in tests and lets you interact with them the way a real user would (click, type, find text on screen) instead of testing internal implementation details. |
| **`@testing-library/jest-dom`** | Adds readable assertions for the DOM, e.g. `expect(button).toBeInTheDocument()` / `toBeDisabled()`. Loaded once in `src/test/setup.ts`. |
| **jsdom** | A simulated browser environment so component tests can run in Node without opening a real browser. |
| **`@vitest/coverage-v8`** | Measures how much of the code the tests actually exercise (code coverage). |

## Running tests

All commands run from `Leapmentor-frontend/`:

```bash
npm test              # run the whole suite once (vitest run)
npm run test:watch    # re-run automatically as you edit files
npm run test:coverage # run once and produce a coverage report
```

- `npm test` is what you run before opening a pull request.
- `npm run test:watch` is what you keep running while writing a feature.
- `npm run test:coverage` writes a report into the `coverage/` folder (open `coverage/index.html` in a browser for the visual version). `coverage/` is git-ignored.

## Configuration

All test configuration lives in the `test` block of `vite.config.ts`:

- **`environment: "jsdom"`** — tests run in a simulated browser.
- **`globals: true`** — `describe`, `it`, `expect`, etc. are available without importing them.
- **`setupFiles: "./src/test/setup.ts"`** — runs before the suite; it imports `@testing-library/jest-dom`.
- **Coverage** uses the `v8` provider and reports in `text`, `html`, and `lcov` formats (the `lcov` output is what external quality tools such as SonarQube can read; see `sonar-project.properties`).

### Coverage thresholds

The build treats coverage as a quality gate. Current minimums (in `vite.config.ts`):

| Metric | Minimum |
| --- | --- |
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

Coverage is measured over `src/app`, `src/features`, `src/components`, `src/lib`, and `src/store`. Test files, `src/main.tsx`, story files, `src/constants`, and `src/config` are excluded from the measurement.

## Where tests live

Tests are **colocated** with the code they test — the test file sits right next to the source file and shares its name with a `.test` suffix:

```
src/lib/http/axiosInstance.ts
src/lib/http/axiosInstance.test.js     ← test for the file above

src/components/shared/ErrorBoundary.tsx
src/components/shared/ErrorBoundary.test.jsx
```

Test files may currently be `.js`/`.jsx` (legacy) or `.ts`/`.tsx`. Production source is fully TypeScript; some older test files are still JavaScript and are supported during the migration.

## Helpers

- **`src/test/renderWithStore.tsx`** — a wrapper that renders a component already connected to the Redux store. Use it when a component reads from or dispatches to the shared app state (`auth`, `wallet`, etc.), so the component has the context it needs during the test.
- **`src/test/setup.ts`** — global setup, loaded automatically before every test run.

## Writing a test — the shape

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyButton from "./MyButton";

describe("MyButton", () => {
  it("calls the handler when clicked", async () => {
    const onClick = vi.fn();
    render(<MyButton onClick={onClick}>Save</MyButton>);

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

Guidelines:

- Test what the user sees and does, not internal state.
- Prefer queries like `getByRole` / `getByText` over test IDs.
- For components that use Redux, render with `renderWithStore` instead of the bare `render`.

## Before you open a pull request

Run all three checks and make sure they pass:

```bash
npm run lint
npm run typecheck
npm test
```

See [BRANCHING.md](BRANCHING.md) for how the pull request then flows into `develop` and `main`.
