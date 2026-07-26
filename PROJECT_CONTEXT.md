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

**Phase 1 — collaboration tooling.** The application itself has not been
scaffolded yet (see [AGENTS.md](./AGENTS.md)). This section will be rewritten
once Expo/React Native code lands in phase 2.

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
├── types/                    Ambient TypeScript declarations (placeholder.d.ts
│                              exists only to give tsc a root file pre-phase-2)
├── AGENTS.md                 Single source of truth for workflow/coding rules
├── CLAUDE.md                 Pointer to AGENTS.md (Claude Code entry point)
├── development_process.md    Lifecycle: how work flows idea→shipped + feature tracking
├── PROJECT_CONTEXT.md         This file — architecture map
├── README.md                  Human-facing overview
├── eslint.config.mjs          ESLint (flat config) + typescript-eslint
├── .prettierrc / .prettierignore  Prettier formatting rules
├── .editorconfig              Editor-level whitespace/charset defaults
├── package.json                Scripts: format, format:check, lint, typecheck
└── tsconfig.json               TypeScript compiler config
```

There is no `src/` yet — the app itself (Expo/React Native, feature-organized
per AGENTS.md §3) is scaffolded in phase 2. This section gets rewritten with
real feature folders once that lands.

## Quirks & constraint-driven decisions

Only decisions that look suboptimal at first glance but were the best option
given a real constraint go here. Ordinary choices don't need justification.

- **`types/placeholder.d.ts` exists with no real content.** `tsc --noEmit`
  (used in CI/`npm run typecheck`) needs at least one file to type-check
  before the app is scaffolded. Delete this once real source files exist —
  it should not survive into phase 2.
- **Two AI-assistant config files (`CLAUDE.md`, `AGENTS.md`) instead of one.**
  Claude Code and Codex each look for their own filename by convention;
  duplicating full rules risked drift, so `CLAUDE.md` is a thin pointer to
  `AGENTS.md`, which stays the single real source of truth.
