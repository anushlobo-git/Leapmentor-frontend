# Branching & Git Flow

This document describes how branches are organized and how a change travels from a developer's machine into production. It follows the common **Git Flow** model, simplified for this project.

## The two long-lived branches

These two branches always exist and are never deleted:

| Branch | Purpose | Who merges into it |
| --- | --- | --- |
| `main` | The production branch. Whatever is on `main` is what is (or is about to be) live. It should always be stable. | Only `develop`, once a set of changes is fully tested and ready to release. |
| `develop` | The integration branch. This is where finished features are combined and tested together before a release. | Feature branches, via pull requests. |

Think of it as a pipeline:

```
feature branch  ──►  develop  ──►  main
   (your work)     (tested together)  (production)
```

- You never commit directly to `main`.
- You never commit directly to `develop` either — changes reach `develop` through a reviewed pull request from a feature branch.

## Short-lived branches (feature branches)

Every piece of work — a new feature, a bug fix, a small change — starts as its own branch created **from `develop`**. These are temporary and are deleted after they are merged.

**Naming convention** (already used in this repo):

- `feature/<short-name>` — new functionality, e.g. `feature/rbac-authorization`, `feature/api-modules`
- `fix/<short-name>` — bug fixes, e.g. `fix/cookie`

Keep the name short, lowercase, and descriptive of the change.

## The everyday workflow

1. **Start from an up-to-date `develop`:**
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. **Create your feature branch:**
   ```bash
   git checkout -b feature/my-change
   ```
3. **Do the work and commit in small, clear steps:**
   ```bash
   git add <files>
   git commit -m "Add mentee wallet balance card"
   ```
4. **Push your branch to GitHub:**
   ```bash
   git push -u origin feature/my-change
   ```
5. **Open a Pull Request (PR) on GitHub: `feature/my-change` → `develop`.**
   - Describe what changed and why.
   - Make sure checks pass locally first: `npm run lint`, `npm run typecheck`, `npm test`.
   - Get it reviewed, then merge.
6. **Delete the feature branch** after merge (GitHub offers a button for this).

## Releasing to production

When everything gathered on `develop` has been tested together and is ready to go live:

1. Open a Pull Request: `develop` → `main`.
2. Review and merge.
3. `main` now reflects the release. Deploy from `main` (see [DEPLOYMENT.md](DEPLOYMENT.md)).

So the direction of flow is always **feature → develop → main**, never the reverse for new work.

## Golden rules

- **`main` is always deployable.** Never push experimental work to it.
- **One branch per change.** Don't pile unrelated changes onto a single branch.
- **Pull before you branch.** Always start feature branches from the latest `develop`.
- **PRs, not direct pushes**, into `develop` and `main`.
- **Small PRs are easier to review** than large ones.

## Note on the current repository state

The remote currently contains many historical branches, and both a `develop` and a `development` branch exist. Going forward the standard should be a single `develop` as the integration branch (per the table above); `development` and stale feature branches can be reconciled/cleaned up by the team to avoid confusion. This document defines the target model, not the exact current cleanup state.
