---
id: 001
title: Fitness domain model
created: 2026-07-26
priority: high
effort: L
blocked_by: []
owner:
spec: docs/superpowers/specs/fitness-domain-model/July_2026/2026-07-26-fitness-domain-model-design.md
plan: docs/superpowers/plans/fitness-domain-model/July_2026/2026-07-26-fitness-domain-model.md
---

## Summary

Define the core data model for fitness content — exercises, the muscle groups
and attributes they train, and the training regimes/programs that group them
into a plan. This is the foundation the rest of the app is built on: workout
screens, "train like anime character X" mappings, and progress tracking all
depend on these entities existing and being well-shaped.

## Acceptance criteria

- [ ] Core entities identified and their relationships defined (at minimum:
      exercise, muscle group / trained attribute, training regime).
- [ ] Typed models expressed in TypeScript (strict), following AGENTS.md standards.
- [ ] A small seed dataset exists to exercise the models.
- [ ] Data-source decision made (see notes) and recorded in the feature's spec.

## Notes / links

- This card is a tracker only; the detailed design goes in its own spec via the
  `brainstorming` skill, then a plan via `writing-plans`.
- Candidate open-source data sources to evaluate (licensing + field coverage to
  be assessed in the spec, not assumed here):
  - **free-exercise-db** — public-domain exercise dataset (JSON).
  - **wger** — open-source workout manager with an exercise database/API.
- Open question for the spec: how much of the anime-character theming belongs in
  the domain model vs a layer built on top of it.
- The committed seed dataset is an intentionally minimal curated subset (13
  exercises); it can be expanded later via the `import/from-free-exercise-db.ts`
  tool (see `src/domain/catalog/import/README.md`).
