# Multi-AI Collaboration Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up a repository so that a Claude Code user and a Codex user produce consistent, compatible work — via one canonical rules file plus a shared formatter/linter/type-checker.

**Architecture:** A single canonical `AGENTS.md` holds all project rules; `CLAUDE.md` is a thin pointer to it. Prettier, ESLint (flat config, TypeScript-aware), TypeScript strict, and EditorConfig enforce consistency mechanically. A feature-branch + PR workflow keeps `main` releasable. The Expo/React Native app is **not** built here — this is the foundation it will extend in phase 2.

**Tech Stack:** Node + npm (dev tooling only), Prettier, ESLint 9 (flat config) + typescript-eslint, TypeScript 5 (strict).

## Global Constraints

- No application/runtime dependencies this phase — **devDependencies only**.
- No git hooks, commit-message linting, or CI this phase.
- No Expo app scaffolding this phase (phase 2).
- All rules live in `AGENTS.md`; `CLAUDE.md` must never duplicate rules, only point to `AGENTS.md`.
- Tooling must be **Expo-compatible** so it does not conflict with Expo presets in phase 2.
- Formatting standard: 2-space indent, single quotes, semicolons, trailing commas (`all`), print width 100, LF line endings.
- **This plan contains no git commands.** Commits are performed by the human outside the plan. Each task ends by running tooling and observing output.

---

### Task 1: Node project foundation

**Files:**

- Create: `package.json`
- Create: `.gitignore`

**Interfaces:**

- Consumes: nothing (first task).
- Produces: npm scripts `format`, `format:check`, `lint`, `typecheck`; devDependencies `prettier`, `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-config-prettier`, `typescript`. Later tasks add the config files these scripts invoke.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "anime-fitness",
  "version": "0.0.0",
  "private": true,
  "description": "Anime-themed fitness app (Expo/React Native). Phase 1: shared collaboration tooling.",
  "type": "module",
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.0",
    "eslint": "^9.9.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.3.3",
    "typescript": "^5.5.4",
    "typescript-eslint": "^8.2.0"
  }
}
```

Note: if a newer compatible major of any devDependency is available at install time, prefer it, but keep ESLint at v9+ (flat config) and typescript-eslint at v8+.

- [ ] **Step 2: Create `.gitignore`**

```gitignore
# Dependencies
node_modules/

# Build output
dist/
build/
web-build/

# Expo (phase 2)
.expo/
.expo-shared/

# Native (phase 2)
ios/Pods/
*.xcworkspace

# Environment
.env
.env.local
.env.*.local

# Coverage / tests
coverage/

# Logs
*.log
npm-debug.log*

# OS / editor
.DS_Store
Thumbs.db
.idea/
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`
Expected: completes without errors; creates `node_modules/` and `package-lock.json`.

- [ ] **Step 4: Verify scripts are registered**

Run: `npm run`
Expected: lists `format`, `format:check`, `lint`, `typecheck` among available scripts.

---

### Task 2: Formatting — Prettier + EditorConfig

**Files:**

- Create: `.prettierrc`
- Create: `.prettierignore`
- Create: `.editorconfig`

**Interfaces:**

- Consumes: `format` / `format:check` scripts from Task 1.
- Produces: the single formatting standard all other files must satisfy.

- [ ] **Step 1: Create `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

- [ ] **Step 2: Create `.prettierignore`**

```gitignore
node_modules
dist
build
web-build
.expo
coverage
package-lock.json
```

- [ ] **Step 3: Create `.editorconfig`**

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 4: Format the repo**

Run: `npm run format`
Expected: Prettier rewrites files as needed and exits 0.

- [ ] **Step 5: Verify formatting is clean**

Run: `npm run format:check`
Expected: `All matched files use Prettier code style!` — exit 0.

---

### Task 3: TypeScript strict config

**Files:**

- Create: `tsconfig.json`
- Create: `types/placeholder.d.ts`

**Interfaces:**

- Consumes: `typecheck` script from Task 1.
- Produces: strict `tsconfig.json` that phase 2's Expo app extends. `include` globs cover `.ts`/`.tsx`/`.d.ts`.

- [ ] **Step 1: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ESNext", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["**/*.ts", "**/*.tsx", "**/*.d.ts"],
  "exclude": ["node_modules", "dist", "build", ".expo"]
}
```

- [ ] **Step 2: Create `types/placeholder.d.ts`**

This gives `tsc` an input before any app source exists, so `typecheck` exits 0 instead of erroring with "No inputs were found". Phase 2 replaces/extends it.

```ts
// Placeholder so `tsc --noEmit` has an input before the Expo app is scaffolded.
// Phase 2 will replace or extend this with real application types.
export {};
```

- [ ] **Step 3: Run the type checker**

Run: `npm run typecheck`
Expected: exits 0 with no output (no type errors, and at least one input file found).

- [ ] **Step 4: Re-verify formatting still clean**

Run: `npm run format:check`
Expected: `All matched files use Prettier code style!` — exit 0. (New files were created; confirm they match the standard.)

---

### Task 4: ESLint flat config

**Files:**

- Create: `eslint.config.mjs`

**Interfaces:**

- Consumes: `lint` script from Task 1; `eslint-config-prettier` (disables rules that conflict with Prettier).
- Produces: repo-wide lint baseline for `.ts`/`.tsx`/`.mjs`/`.js`.

- [ ] **Step 1: Create `eslint.config.mjs`**

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['node_modules', 'dist', 'build', 'web-build', '.expo', 'coverage'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
);
```

- [ ] **Step 2: Run the linter**

Run: `npm run lint`
Expected: exits 0 with no reported problems. (`eslint-config-prettier` is last so formatting-related rules never conflict with Prettier.)

- [ ] **Step 3: Re-format and re-check**

Run: `npm run format && npm run format:check`
Expected: format exits 0; check reports `All matched files use Prettier code style!`.

---

### Task 5: Canonical rules — `AGENTS.md`

**Files:**

- Create: `AGENTS.md`

**Interfaces:**

- Consumes: the script names from Task 1 (`format`, `lint`, `typecheck`) — referenced verbatim in the rules.
- Produces: the single source of truth that `CLAUDE.md` (Task 6) points to.

- [ ] **Step 1: Create `AGENTS.md`**

```markdown
# AGENTS.md — Project Rules

This is the **single source of truth** for how this repository is built. It is
read by every AI assistant (Claude Code, Codex) and human contributor. Read it
fully before doing any work.

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

- **Planned framework:** Jest + React Native Testing Library (added in phase 2).
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
```

- [ ] **Step 2: Re-format and verify**

Run: `npm run format && npm run format:check`
Expected: format exits 0; check reports all files use Prettier style.

---

### Task 6: `CLAUDE.md` pointer + `README.md`

**Files:**

- Create: `CLAUDE.md`
- Create: `README.md`

**Interfaces:**

- Consumes: `AGENTS.md` from Task 5 (target of the pointer).
- Produces: Claude Code entrypoint and human-facing overview.

- [ ] **Step 1: Create `CLAUDE.md`**

```markdown
# CLAUDE.md

All project rules, conventions, and workflow live in **[AGENTS.md](./AGENTS.md)**.

Read `AGENTS.md` in full before doing any work in this repository. It is the
single source of truth shared by every AI assistant and human contributor. Do
not duplicate rules here — update `AGENTS.md` instead.
```

- [ ] **Step 2: Create `README.md`**

````markdown
# anime-fitness

An anime-themed fitness app built with **Expo / React Native + TypeScript**
(iOS-first, Android planned).

Built collaboratively by two contributors using **Claude Code** and **Codex**.
All contributor rules live in [AGENTS.md](./AGENTS.md).

## Status

**Phase 1 — collaboration tooling** (current): shared rules, formatter, linter,
type-checker. The application is scaffolded in phase 2.

## Getting started

```bash
npm install
```
````

## Commands

| Command                | Purpose                 |
| ---------------------- | ----------------------- |
| `npm run format`       | Auto-format all files   |
| `npm run format:check` | Verify formatting       |
| `npm run lint`         | Lint the codebase       |
| `npm run typecheck`    | Type-check the codebase |

## Workflow

Feature branches → PR to `main` → review → merge. See [AGENTS.md](./AGENTS.md).

````

- [ ] **Step 3: Verify the pointer is consistent**

Confirm `CLAUDE.md` references `AGENTS.md` and contains no duplicated rules.
Run: `npm run format:check`
Expected: all files use Prettier style — exit 0.

---

### Task 7: PR template + full verification

**Files:**
- Create: `.github/pull_request_template.md`

**Interfaces:**
- Consumes: everything above.
- Produces: the shared PR checklist; final green tooling run.

- [ ] **Step 1: Create `.github/pull_request_template.md`**

```markdown
## Summary

<!-- What does this PR change and why? -->

## Contributor

- [ ] Claude Code
- [ ] Codex

## Checklist

- [ ] Branch named per convention (`feat/…`, `fix/…`, etc.)
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run format:check` passes
- [ ] Tests added/updated where relevant (or N/A)
- [ ] Scope is focused; `AGENTS.md` rules followed
````

- [ ] **Step 2: Format the new file**

Run: `npm run format`
Expected: exits 0.

- [ ] **Step 3: Full verification sweep**

Run: `npm run format:check && npm run lint && npm run typecheck`
Expected: all three exit 0 — formatting clean, no lint problems, no type errors.

- [ ] **Step 4: Confirm final file tree**

Run: `git status --short` (read-only check) or `ls -a`
Expected: repository contains `AGENTS.md`, `CLAUDE.md`, `README.md`,
`package.json`, `package-lock.json`, `.gitignore`, `.editorconfig`,
`.prettierrc`, `.prettierignore`, `eslint.config.mjs`, `tsconfig.json`,
`types/placeholder.d.ts`, `.github/pull_request_template.md`, and `docs/`.

---

## Self-Review Notes

- **Spec coverage:** Repository layout → Tasks 1–7. Shared instruction system →
  Tasks 5 (AGENTS.md) & 6 (CLAUDE.md pointer). AGENTS.md four categories →
  Task 5. Enforcement tooling (Prettier/ESLint/TS/EditorConfig + scripts) →
  Tasks 1–4. Git & collaboration workflow → Task 7 (PR template) + AGENTS.md §1.
  Phase-2 items remain deferred. All spec sections mapped.
- **Placeholder scan:** `types/placeholder.d.ts` is an intentional, functional
  file (documented), not a plan placeholder. No TBD/TODO steps remain.
- **Type/name consistency:** Script names `format`, `format:check`, `lint`,
  `typecheck` are identical across `package.json`, `AGENTS.md`, `README.md`, and
  the PR template.
