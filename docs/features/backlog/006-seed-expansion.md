---
id: 006
title: Expand exercise seed via import tool
created: 2026-07-26
priority: low
effort: S
blocked_by: ['001']
owner:
spec:
plan:
---

## Summary

Grow the curated seed beyond the initial 13 exercises toward the ~30–50 target,
including advanced-difficulty coverage, by running the free-exercise-db import
tool and hand-curating the authored fields.

## Acceptance criteria

- [ ] Seed expanded across all movement categories and difficulties (incl. advanced).
- [ ] `movementCategory` / `trainedAttributes` hand-curated after the heuristic import.
- [ ] The seed integrity test still passes with zero errors.

## Notes / links

- Uses the regeneration steps in `src/domain/catalog/import/README.md`.
- Low priority — the current 13-exercise seed is functional; this is enrichment.
