# Development Lifecycle System — Design

**Date:** 2026-07-26
**Topic:** dev-lifecycle
**Status:** Approved — ready for implementation planning

## Problem

The project (anime-fitness, an Expo/React Native fitness app themed around
"train like anime character X") is in Phase 1 — collaboration tooling only, no
app code yet. Two contributors work with Claude Code and Codex. We need a
documented, low-overhead way to answer "what do we build first, what's next,
and where is each feature in its lifecycle" that both AI agents and humans can
read directly in the repo.

This spec covers **only the process/lifecycle system**. It does not design the
fitness domain model or any app feature — those are separate specs. The domain
model is seeded as the first backlog item and gets its own spec next.

## Goals

- A single doc, `development_process.md`, describing how work flows idea → shipped.
- A folder-based kanban of feature "cards" (markdown) tracking every feature's stage.
- Everything in-repo, greppable by Claude/Codex, versioned with the code — the
  same philosophy as `PROJECT_CONTEXT.md`.
- Zero duplication with existing docs: `AGENTS.md` = rules/workflow,
  `PROJECT_CONTEXT.md` = architecture, `development_process.md` = how work flows
  and what's in flight.

## Non-goals

- Designing the fitness domain model or sourcing exercise data (its own spec).
- Any app scaffolding or code.
- Replacing GitHub PRs/branching (defined in `AGENTS.md`) — this layers on top.
- A status field duplicated in card frontmatter — the folder IS the status.

## Design

### Folder structure

```
docs/
└── features/
    ├── backlog/        # not started; work ordered by `priority`
    ├── in-progress/    # actively being built (spec+plan exist, branch open)
    └── done/           # merged to main
development_process.md  # the lifecycle doc, at repo root
```

A feature's **stage is the folder it lives in** — the single source of truth.
There is intentionally no `status:` frontmatter field, to avoid drift between
the folder and a duplicated field.

### The feature card

Each feature is one markdown file. It is a **thin tracker**: the detailed
design lives in the linked spec/plan under `docs/superpowers/`, not here.

Filename: `NN-kebab-title.md` (e.g. `001-fitness-domain-model.md`). The `NN-`
prefix is a stable identifier and rough creation order; it does not change when
the card moves between folders.

```markdown
---
id: 001
title: Fitness domain model
created: 2026-07-26
priority: high # high | medium | low — drives ordering within backlog/
effort: L # S | M | L — rough size estimate
blocked_by: [] # list of feature ids that must ship first (hard deps)
owner: # optional — contributor claiming the work
spec: # link to docs/superpowers/specs/... once written
plan: # link to docs/superpowers/plans/... once written
---

## Summary

One paragraph: what this feature is and why it matters.

## Acceptance criteria

- [ ] Concrete, checkable outcomes that define "done".

## Notes / links

Research pointers, open questions, related cards.
```

**Ordering:** within `backlog/`, work is prioritized by the `priority` field;
`blocked_by` encodes hard dependencies (a card cannot start while any id it
lists is unshipped). The `NN-` prefix gives stable identity, not work order.

### The lifecycle (three stages)

| Stage       | Folder                       | Entry criteria                                          |
| ----------- | ---------------------------- | ------------------------------------------------------- |
| Backlog     | `docs/features/backlog/`     | Card created; idea captured. Not started.               |
| In progress | `docs/features/in-progress/` | Spec + plan written, branch open, actively being built. |
| Done        | `docs/features/done/`        | Merged to `main`.                                       |

### End-to-end flow

1. **Capture** — create a card in `backlog/` from the template above.
2. **Design** — run the `brainstorming` skill → produces a spec in
   `docs/superpowers/specs/...`. Link it in the card's `spec:` field.
3. **Plan** — run the `writing-plans` skill → produces a plan in
   `docs/superpowers/plans/...`. Link it in the card's `plan:` field.
4. **Start** — `git mv` the card from `backlog/` to `in-progress/`, open a
   feature branch (per `AGENTS.md` branch naming), set `owner:`.
5. **Build** — implement per the plan; open a PR to `main`.
6. **Ship** — on merge, `git mv` the card to `done/`.

Moving cards is part of doing the work, not optional bookkeeping.

### `development_process.md` contents

1. Purpose and how this relates to `AGENTS.md` and `PROJECT_CONTEXT.md` (cross-links, no duplication).
2. The three stages + entry criteria (table above).
3. The end-to-end flow (steps above).
4. The feature-card template and field reference (including `priority`,
   `effort`, `blocked_by`).
5. How ordering and dependencies work.
6. Maintenance rule: cards are created and moved as part of the work; a card's
   folder must always reflect reality.

### Seed content

Create exactly one card, `docs/features/backlog/001-fitness-domain-model.md`:

- **Summary:** Define the core data model for fitness content — exercises, the
  muscle groups / attributes they train, and training regimes/programs that
  group them. This is the foundation the app is built on.
- **Acceptance criteria:** placeholder outcomes to be firmed up in its own spec
  (entities and relationships defined; typed models; a small seed dataset).
- **Notes / links:** candidate open-source data sources to evaluate in that
  feature's spec — **free-exercise-db** and **wger** — noting licensing and
  fields must be assessed there, not here. `priority: high`, `effort: L`,
  `blocked_by: []`.

No other cards are seeded; further roadmap items are added as decided.

### Integration with existing docs

- `AGENTS.md`: add a short "Development lifecycle" subsection pointing to
  `development_process.md`. No rules duplicated.
- `PROJECT_CONTEXT.md`: add `docs/features/` and `development_process.md` to the
  folder map with one-line descriptions (per its own maintenance rule).
- `README.md`: one line pointing contributors to `development_process.md`.

## Testing / verification

This is documentation scaffolding, so verification is structural:

- `npm run format:check` passes on all new markdown.
- The three `docs/features/` folders exist and are discoverable (each holds a
  `.gitkeep` or the seed card so git tracks empty stages).
- `development_process.md` links resolve; the `001` card matches the documented
  template exactly.
- Cross-links in `AGENTS.md`, `PROJECT_CONTEXT.md`, and `README.md` resolve.

## Open questions

None blocking. Exercise-data sourcing and the domain model's shape are
deliberately deferred to the `001-fitness-domain-model` spec.
