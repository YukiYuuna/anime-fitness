---
id: 004
title: User activity & workout logging (domain)
created: 2026-07-26
priority: medium
effort: L
blocked_by: ['001']
owner:
spec:
plan:
---

## Summary

The layer deferred from 001: model how a user logs a workout session — the
sets/reps/weight actually performed against a regime — and tracks history and
progress. Domain-first (schemas + validation); the UI to surface it comes later.

## Acceptance criteria

- [ ] Session and logged-set entities defined (Zod, same conventions as 001).
- [ ] A session references a `Regime` and records performed sets vs the prescription.
- [ ] Basic progress/history queries (e.g. last performance per exercise).
- [ ] Persistence approach decided (local store vs backend) and recorded in the spec.

## Notes / links

- Builds on the catalog `001-fitness-domain-model`; a UI to surface it depends on
  `002-app-scaffolding`.
- Open question for the spec: persistence (on-device store vs backend/sync).
