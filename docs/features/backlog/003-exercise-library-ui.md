---
id: 003
title: Exercise library UI (browse & filter)
created: 2026-07-26
priority: medium
effort: M
blocked_by: ['002']
owner:
spec:
plan:
---

## Summary

A screen to browse the exercise catalog and filter by muscle group, equipment,
movement category, and difficulty — the first real use of the 001 domain model
inside the app.

## Acceptance criteria

- [ ] Browse/list exercises from the seed catalog.
- [ ] Filter by muscle group, equipment, movement category, and difficulty.
- [ ] Exercise detail view (instructions, muscles worked, trained attributes).
- [ ] Reads through the domain model's public API; no schema/validation logic in the UI.

## Notes / links

- Depends on `002-app-scaffolding` (the app shell) and `001-fitness-domain-model`
  (the catalog).
