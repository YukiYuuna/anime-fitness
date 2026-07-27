---
id: 005
title: "Train like X" anime-character mapping
created: 2026-07-26
priority: medium
effort: M
blocked_by: ['001']
owner:
spec:
plan:
---

## Summary

The app's signature hook: map an anime character to a training regime and/or
attribute profile ("train like X"). Deferred from 001 deliberately as a layer on
top of the catalog rather than baked into the domain model.

## Acceptance criteria

- [ ] Character entity + mapping to regimes and/or trained attributes.
- [ ] A couple of example characters mapped to seeded regimes.
- [ ] Decide how much theming lives in data vs presentation (the 001 open question).
- [ ] Licensing/IP considerations for character names/likeness noted in the spec.

## Notes / links

- Depends on the catalog + regimes `001-fitness-domain-model`; pairs naturally
  with `004-user-activity-logging`.
- Carries over the 001 open question: theming in the domain vs a layer on top.
