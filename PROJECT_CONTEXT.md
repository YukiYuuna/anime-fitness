# PROJECT_CONTEXT.md — Architecture & Structure

This file describes **what exists in this repo and why it's laid out this
way**. It is read by AI assistants (Claude Code, Codex) and human contributors
to build an accurate mental model of the codebase before making changes.

For workflow, coding standards, and process rules, see [AGENTS.md](./AGENTS.md).
This file is architecture/structure only.

## Maintenance rule

**This file must be kept up to date.** Any change that adds, removes, or
meaningfully restructures a folder, module, or major dependency must update
the relevant section here in the same PR/commit. A stale map is worse than no
map — if you're not sure whether a change is "meaningful," ask: would a new
contributor be misled by the old description? If yes, update it.

Do not log routine changes (new component in an existing feature folder, a
bugfix, a dependency patch bump). Do log: new top-level folders, new
build/tooling systems, changed module boundaries, or new services.

## Current status

**Phase 2 — app scaffolded.** The Expo / React Native app shell is in place
(feature `002`): Expo Router navigation (`src/app/`), a single dark theme
(`src/theme/`), base components (`src/components/`), and a two-tab skeleton
(Home + Library). The framework-free domain model (`src/domain/catalog/`,
feature `001`) is consumed by screens via the `@/` alias. Real screen content
(exercise browsing, etc.) is built in subsequent features.

## Folder structure

```
.
├── .claude/                  Claude Code local settings (not synced to Codex)
├── .github/                  GitHub-specific config (PR template, etc.)
├── docs/
│   ├── features/            Feature kanban — cards move backlog/ → in-progress/ → done/
│   └── superpowers/
│       ├── specs/            Design docs produced by the brainstorming skill
│       └── plans/            Implementation plans produced by the writing-plans skill
├── src/
│   ├── app/                  Expo Router routes (file-based): _layout + (tabs)/
│   ├── components/           Themed base components (Screen, Text, Button)
│   ├── theme/                Dark theme tokens + ThemeProvider + useTheme()
│   └── domain/
│       └── catalog/          Fitness catalog domain model (Zod schemas, loader, validator, seed)
├── tests/                    Unit tests (Vitest), mirroring the src/ tree
│   └── domain/catalog/       Tests for the catalog domain model (+ seed/, import/)
├── AGENTS.md                 Single source of truth for workflow/coding rules
├── CLAUDE.md                 Pointer to AGENTS.md (Claude Code entry point)
├── app.json                  Expo app manifest (name, scheme, expo-router plugin)
├── babel.config.cjs          Babel (babel-preset-expo); .cjs because pkg is type:module
├── development_process.md    Lifecycle: how work flows idea→shipped + feature tracking
├── PROJECT_CONTEXT.md         This file — architecture map
├── README.md                  Human-facing overview
├── eslint.config.mjs          ESLint (flat config) + typescript-eslint
├── vitest.config.ts           Vitest config (test files live under tests/)
├── .prettierrc / .prettierignore  Prettier formatting rules
├── .editorconfig              Editor-level whitespace/charset defaults
├── package.json                Scripts: format, format:check, lint, typecheck, test
└── tsconfig.json               TypeScript compiler config
```

The app is an Expo / React Native app using **Expo Router** (file-based routes
under `src/app/`). `src/domain/` holds framework-free domain logic (feature
`001`); `src/theme/` and `src/components/` provide the dark theme and base UI
primitives (feature `002`). Screens compose base components and read domain data
via the `@/` alias.

Tests live in a top-level `tests/` tree that **mirrors** the `src/` layout
(`tests/domain/catalog/` ↔ `src/domain/catalog/`), keeping test files out of the
source folders. Vitest discovers them via `tests/**/*.test.ts`. They import
source through the `@/*` → `src/*` path alias (declared in `tsconfig.json` and
`vitest.config.ts`), so imports read `@/domain/catalog/…` instead of deep
relative paths.

## Quirks & constraint-driven decisions

Only decisions that look suboptimal at first glance but were the best option
given a real constraint go here. Ordinary choices don't need justification.

- **Two AI-assistant config files (`CLAUDE.md`, `AGENTS.md`) instead of one.**
  Claude Code and Codex each look for their own filename by convention;
  duplicating full rules risked drift, so `CLAUDE.md` is a thin pointer to
  `AGENTS.md`, which stays the single real source of truth.
