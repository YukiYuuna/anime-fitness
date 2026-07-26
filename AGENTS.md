# AGENTS.md — Project Rules

This is the **single source of truth** for how this repository is built. It is
read by every AI assistant (Claude Code, Codex) and human contributor. Read it
fully before doing any work.

For the architecture map (folder structure, what each folder is for, and
constraint-driven decisions), see [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).
**Keep it updated**: any change that adds, removes, or meaningfully
restructures a folder, module, or major dependency must update
`PROJECT_CONTEXT.md` in the same PR/commit.

> The app is **Expo / React Native + TypeScript**, iOS-first with Android
> planned. Phase 1 (current) sets up collaboration tooling; the app itself is
> phase 2.

## 1. Workflow & Process

- **Branch model:** Feature branches off `main`. `main` stays releasable at all
  times. Never commit directly to `main`.
- **Branch naming:** `feat/<short-desc>`, `fix/<short-desc>`, `chore/…`,
  `docs/…`, `refactor/…`.
- **Before branching:** pull the latest `main`.
- **Keep branches small and focused** — one logical change per branch/PR.
- **Commits:** Conventional Commits — `type(scope): summary`
  (e.g. `feat(auth): add login screen`). Types: `feat`, `fix`, `chore`, `docs`,
  `refactor`, `test`, `style`.
- **Pull requests:** open a PR to `main`, fill in the PR template, get review
  before merge.
- **Avoiding collisions:** claim work by opening the branch/PR early; keep PRs
  scoped so the two contributors rarely touch the same files.
- **Definition of done:** `npm run lint`, `npm run typecheck`, and (once tests
  exist) `npm run test` all pass; PR template complete; scope described.
- **Feature tracking:** every feature is a card in `docs/features/`
  (`backlog/` → `in-progress/` → `done/`). See
  [development_process.md](./development_process.md) for the full lifecycle.

## 2. Coding Standards

- **TypeScript strict** — no `any` unless justified in a comment; prefer precise
  types.
- **React:** functional components + hooks only. No class components.
- **Files:** small and single-purpose. When a file grows to cover multiple
  responsibilities, split it.
- **Naming:** `camelCase` for variables/functions, `PascalCase` for
  components/types, `SCREAMING_SNAKE_CASE` for constants.
- **Formatting is not manual:** run `npm run format`. Do not hand-format; let
  Prettier decide.
- **Errors:** handle failures explicitly; no silent catches. Surface actionable
  messages.

## 3. Architecture & Structure

- **Stack:** Expo / React Native + TypeScript.
- **Module boundaries:** organize by feature, not by technical layer. Files that
  change together live together.
- **Shared code:** cross-feature utilities/components live in a shared location
  (to be defined when the app is scaffolded in phase 2).
- This section is intentionally lightweight now and will be deepened when the
  app is designed.

## 4. Testing & Verification

- **Test frameworks:** the pure-TypeScript domain layer uses **Vitest**
  (`npm run test`). React Native component/UI tests will use jest-expo + React
  Native Testing Library when the app is scaffolded. Use Vitest for anything
  that isn't a rendered RN component.
- **Test location:** tests live in a top-level `tests/` tree that **mirrors**
  `src/` (e.g. `src/domain/catalog/exercise.ts` → `tests/domain/catalog/exercise.test.ts`).
  Do not co-locate `*.test.ts` files next to source. Tests import source via the
  `@/` alias (e.g. `@/domain/catalog/exercise`), configured in `tsconfig.json`
  (`paths`) and `vitest.config.ts` (`resolve.alias`) — not deep `../../../` paths.
- **"Verified" means:** you ran the checks and observed them pass — not that you
  believe they would.
- **Before opening a PR:** run `npm run lint` and `npm run typecheck` (and
  `npm run test` once tests exist). All must pass.

## Tooling Commands

| Command                | Purpose                           |
| ---------------------- | --------------------------------- |
| `npm run format`       | Auto-format all files (Prettier)  |
| `npm run format:check` | Verify formatting without writing |
| `npm run lint`         | Lint (ESLint + typescript-eslint) |
| `npm run typecheck`    | Type-check (`tsc --noEmit`)       |
| `npm run test`         | Run unit tests (Vitest)           |
