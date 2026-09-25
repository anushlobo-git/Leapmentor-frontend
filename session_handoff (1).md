# Data Router Migration — Status: COMPLETE (Phases 1–7)

Phases 1–4 and the ScrollRestoration/progress-bar half of 6 were done in the previous session.
This session finished the rest:

- **Phase 6 `useBlocker`** — `lib/hooks/useUnsavedChangesPrompt.ts` (useBlocker + beforeunload),
  `lib/hooks/useFormDirty.ts`, `components/shared/UnsavedChangesDialog.tsx`. Wired into
  MentorOnboarding (`OnboardingFormShell`), MenteeOnboarding (`MenteeOnboardingShell`),
  `MentorEditProfileShell`, `MenteeEditProfileShell`. Presenters expose `isDirty`; it is forced
  clean after successful save/submit so the post-success redirect isn't blocked.
- **Phase 5 loader** — `/shared-dashboard/:connectRequestId`:
  `features/shared-dashboard/models/sharedDashboard.loader.ts` (+ `shouldRevalidate`, lazy-loaded
  with the page in routes.tsx). Page reads `useLoaderData()` and mirrors `connect` into Redux.
- **Phase 7** — `docs/PROJECT_STRUCTURE.md` updated (route tree, conventions).

Behavior changes to be aware of: on a 403 the shared dashboard now shows the NotFound/error screen
(a loader can't `navigate(-1)`); other load errors still show the inline error + "Go back".

Verification: `npx tsc --noEmit` clean; full `npx vitest run` → 2999 pass, 4 fail (the known
pre-existing `logger.test.js` failures).

Not done (optional, per the plan): moving ProtectedRoute role/permission checks into loaders.
