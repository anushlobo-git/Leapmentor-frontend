# TypeScript Migration

## Status

The production frontend migration from JavaScript/JSX to TypeScript/TSX is complete.

- Production source under `src/` uses `.ts`, `.tsx`, or declaration files.
- Remaining `.js` and `.jsx` files under `src/` are test files only.
- TypeScript uses Vite bundler resolution and path aliases defined in `tsconfig.json` and `vite.config.ts`.
- JavaScript remains temporarily enabled with `allowJs: true` and `checkJs: false` so legacy test files can run during the final test migration.

## Source Boundaries

| Area                  | Current location          | Responsibility                                                              |
| --------------------- | ------------------------- | --------------------------------------------------------------------------- |
| Application bootstrap | `src/main.tsx`            | React entrypoint, providers, and global startup behavior                    |
| Application shell     | `src/app/`                | Router, top-level providers, and fallback pages                             |
| Business features     | `src/features/<feature>/` | Components, hooks, API modules, mappers, and feature state                  |
| Shared UI             | `src/components/`         | Business-agnostic layout, common, and UI primitives                         |
| Infrastructure        | `src/lib/`                | Axios clients, auth utilities, validation, logging, mappers, and formatters |
| Root state            | `src/store/index.ts`      | Redux store composition                                                     |
| Test setup            | `src/test/setup.ts`       | Vitest and Testing Library setup                                            |

## TypeScript Configuration

The repository uses `tsconfig.json` with:

- `noEmit: true` for type checking without generated JavaScript.
- `moduleResolution: "bundler"` for Vite-compatible imports.
- `jsx: "react-jsx"` for TSX components.
- `strict: false` during the incremental migration; this can be tightened after remaining test files are migrated.
- `allowJs: true` and `checkJs: false` for the remaining JavaScript test files.
- Aliases including `@app`, `@features`, `@components`, `@lib`, `@store`, `@constants`, `@config`, and `@test`.

New production code should be added as `.ts` or `.tsx` and should use the configured aliases where they improve readability.

## Verification Commands

Run these commands from the frontend root before opening a pull request:

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

The current verified baseline is:

- TypeScript check passes.
- All 288 test files pass, with 2,978 tests passing.
- Production build passes.
- ESLint reports no errors; existing warnings remain in legacy test files.

## Final Test Migration

The remaining JavaScript/JSX files are test files. Converting them is not required for the production migration to work, but it is the next cleanup step before enabling stricter compiler settings:

1. Rename test files to `.test.ts` or `.test.tsx`.
2. Add explicit types where test helpers expose implicit values.
3. Set `checkJs` to `true` or remove `allowJs` after no JavaScript source remains.
4. Consider enabling `strict` incrementally and fix warnings in the same test areas.

Do not commit generated `dist/`, `coverage/`, or `.scannerwork/` output. These paths are ignored by `.gitignore`.
