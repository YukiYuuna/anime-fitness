# anime-fitness

An anime-themed fitness app built with **Expo / React Native + TypeScript**
(iOS-first, Android planned).

Built collaboratively by two contributors using **Claude Code** and **Codex**.
All contributor rules live in [AGENTS.md](./AGENTS.md). The architecture map
(folder structure, decisions) lives in
[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).

## Status

**Phase 1 — collaboration tooling** (current): shared rules, formatter, linter,
type-checker. The application is scaffolded in phase 2.

## Getting started

```bash
npm install
```

## Commands

| Command                | Purpose                 |
| ---------------------- | ----------------------- |
| `npm run format`       | Auto-format all files   |
| `npm run format:check` | Verify formatting       |
| `npm run lint`         | Lint the codebase       |
| `npm run typecheck`    | Type-check the codebase |

## Workflow

Feature branches → PR to `main` → review → merge. See [AGENTS.md](./AGENTS.md).
Features are tracked as cards in `docs/features/`; see
[development_process.md](./development_process.md) for the lifecycle.
