# Design: Multi-AI Collaboration Structure

**Date:** 2026-07-18
**Topic:** collaboration-setup
**Status:** Approved (design phase)

## Purpose

Establish a repository structure and rule system so that two contributors —
one using **Claude Code CLI** and one using **Codex (OpenAI)** — produce
consistent, compatible work in the same repository. This is **phase 1**. The
anime-fitness application itself is **phase 2** and will get its own
spec → plan → implementation cycle.

## Goals

- A single source of truth for project rules that **both** AIs read.
- Machine-assisted consistency via formatter + linter + type-checking, so code
  conforms regardless of which AI authored it.
- A collision-free parallel workflow (feature branches + PRs).
- A foundation the phase-2 Expo app extends rather than replaces.

## Non-Goals (this phase)

- Scaffolding the Expo/React Native application (first act of phase 2).
- Git hooks (husky/lint-staged), commit-message linting, and CI (deferred).
- Designing app features, data models, or screens.

## Decisions

| Question               | Decision                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------- |
| Shared rules structure | Single canonical `AGENTS.md`; thin `CLAUDE.md` pointer                                 |
| Rule categories        | Workflow & process, Coding standards, Architecture & structure, Testing & verification |
| Collaboration model    | Feature branches + PRs to `main`                                                       |
| App platform           | iOS-first, Android later                                                               |
| Framework              | Expo / React Native + TypeScript                                                       |
| Enforcement level      | Docs + Prettier + ESLint + TypeScript + EditorConfig (no hooks/CI yet)                 |

## Repository Layout

```
anime-fitness/
├── AGENTS.md              # canonical rules — both Codex & Claude read this
├── CLAUDE.md              # thin pointer: "Read AGENTS.md for all rules"
├── README.md              # human-facing: what the repo is, how to get started
├── docs/
│   └── superpowers/       # specs & plans
├── .editorconfig          # cross-editor whitespace/charset baseline
├── .prettierrc            # formatting rules
├── .prettierignore
├── eslint.config.mjs      # ESLint flat config, TypeScript-aware
├── tsconfig.json          # TypeScript strict base
├── package.json           # dev tooling + scripts (format / lint / typecheck)
├── .gitignore
└── .github/
    └── pull_request_template.md   # PR checklist both contributors fill in
```

The Expo app source (`app/`, `src/`, etc.) is intentionally **not** created in
this phase. Phase 2 scaffolds it and extends the tooling defined here.

## Component 1: Shared Instruction System

- **`AGENTS.md` is the single source of truth.** Codex reads it natively;
  Claude Code honors it as well.
- **`CLAUDE.md`** is minimal (~3 lines) and defers entirely to `AGENTS.md`:
  "All project rules live in `AGENTS.md`. Read it fully before working." This
  eliminates rule drift and avoids symlink fragility across git checkouts.
- Any future tool-specific config (`.claude/`, Codex settings) stays thin and
  defers to `AGENTS.md` for the actual rules.

**Interface:** Both AIs, on session start, load `AGENTS.md` and follow it.
**Dependency:** None beyond the two tools' native file-reading conventions.

## Component 2: `AGENTS.md` Contents

Four sections, matching the agreed rule categories:

1. **Workflow & process**
   - Feature-branch + PR model; `main` stays releasable.
   - Branch naming: `feat/…`, `fix/…`, `chore/…`, `docs/…`.
   - Conventional Commits message format.
   - "Pull `main` before branching"; keep branches small and focused.
   - How the two contributors avoid collisions (claim work via branch/PR scope).
   - Definition of done (lint + typecheck pass, scope described, tests where
     relevant).

2. **Coding standards**
   - TypeScript strict mode.
   - Functional React components + hooks; no class components.
   - Naming conventions, file organization, error-handling patterns.
   - Small, single-purpose files.

3. **Architecture & structure**
   - Stack declared: Expo / React Native + TypeScript.
   - Feature-based module boundaries; where shared code lives.
   - Kept lightweight now; deepened when the app is designed in phase 2.

4. **Testing & verification**
   - Planned framework: Jest + React Native Testing Library.
   - "Verified" means run `lint` + `typecheck` (+ `test` once tests exist)
     before opening a PR.

## Component 3: Enforcement Tooling

Docs + formatter/linter level (no git hooks / CI this phase):

- **Prettier** (`.prettierrc`, `.prettierignore`) — one formatting standard
  applied identically regardless of author.
- **ESLint** (`eslint.config.mjs`, flat config, `typescript-eslint`) — catches
  real issues and style violations; configured to be Expo-compatible so it does
  not fight Expo's presets when the app is scaffolded.
- **TypeScript strict** (`tsconfig.json`) — type-safety baseline, Expo-compatible.
- **EditorConfig** (`.editorconfig`) — whitespace/charset parity across editors.
- **`package.json`** — holds dev dependencies and the shared scripts
  `AGENTS.md` instructs both AIs to run:
  - `format` — Prettier write
  - `lint` — ESLint
  - `typecheck` — `tsc --noEmit`

**Interface:** `npm run format | lint | typecheck`.
**Dependency:** Node + npm; devDependencies only (no app runtime deps yet).

## Component 4: Git & Collaboration Workflow

- Feature branches → PR to `main` → review → merge.
- `main` stays releasable at all times.
- **`.github/pull_request_template.md`** enforces a shared checklist:
  lint/typecheck passed, scope described, tests included where relevant.
- **`.gitignore`** covers Node, Expo/React Native, and OS/editor artifacts.

## Testing / Verification for This Phase

Because no application code exists yet, verification is limited to:

- `npm run format` runs cleanly on the repo.
- `npm run lint` runs with no config errors on the existing files.
- `npm run typecheck` succeeds against the base `tsconfig.json`.
- `AGENTS.md` and `CLAUDE.md` are internally consistent (CLAUDE.md correctly
  points to AGENTS.md).

## Open Items Deferred to Phase 2

- Scaffold Expo app; extend ESLint/tsconfig to the app source.
- Add Jest + React Native Testing Library and real tests.
- Optionally add git hooks + CI once the team wants stricter enforcement.
- Design app features, data models, navigation, and anime theming.
