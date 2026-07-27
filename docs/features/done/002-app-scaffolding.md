---
id: 002
title: App scaffolding (Expo / React Native)
created: 2026-07-26
priority: high
effort: L
blocked_by: []
owner:
spec: docs/superpowers/specs/app-scaffolding/July_2026/2026-07-27-app-scaffolding-design.md
plan: docs/superpowers/plans/app-scaffolding/July_2026/2026-07-27-app-scaffolding.md
---

## Summary

Scaffold the Expo / React Native + TypeScript app shell: project init, navigation,
base theming, and the folder conventions for feature UI. This unblocks every
screen-based feature — the domain model (001) exists but there is no app to
surface it yet.

## Acceptance criteria

- [ ] Expo app boots on iOS (and Android where feasible) under TypeScript strict.
- [ ] Navigation (stack/tabs) in place with a placeholder home screen.
- [ ] Shared UI conventions (theme, base components) established and documented.
- [ ] Domain layer is importable from screens via the `@/` alias.
- [ ] lint / typecheck / test pass; RN component tests use jest-expo per AGENTS.md §4.

## Notes / links

- First UI feature; sets the patterns the rest of the app follows.
- Follow AGENTS.md §3 (organize by feature) and the `@/*` → `src/*` alias.
- Unblocks `003-exercise-library-ui`.
