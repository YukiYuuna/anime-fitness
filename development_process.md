# Development Process

How work flows in anime-fitness from idea to shipped, and how we track what is
in flight. This complements — never duplicates — the other root docs:

- **[AGENTS.md](./AGENTS.md)** — the rules: branching, commits, coding standards, verification.
- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** — the architecture: folder map and constraint-driven decisions.
- **This file** — how work flows and where each feature sits in its lifecycle.

## Feature tracking: a folder kanban

Every feature is a markdown "card" under `docs/features/`. The folder a card
lives in IS its stage — there is no status field to keep in sync.

```
docs/features/
├── backlog/        # not started; work ordered by `priority`
├── in-progress/    # spec + plan exist, branch open, actively being built
└── done/           # merged to main
```

## The three stages

| Stage       | Folder                       | Entry criteria                                          |
| ----------- | ---------------------------- | ------------------------------------------------------- |
| Backlog     | `docs/features/backlog/`     | Card created; idea captured. Not started.               |
| In progress | `docs/features/in-progress/` | Spec + plan written, branch open, actively being built. |
| Done        | `docs/features/done/`        | Merged to `main`.                                       |

## End-to-end flow

1. **Capture** — create a card in `backlog/` using the template below.
2. **Design** — run the `brainstorming` skill → a spec in `docs/superpowers/specs/...`. Link it in the card's `spec:` field.
3. **Plan** — run the `writing-plans` skill → a plan in `docs/superpowers/plans/...`. Link it in the card's `plan:` field.
4. **Start** — `git mv` the card from `backlog/` to `in-progress/`, open a feature branch (see AGENTS.md branch naming), set `owner:`.
5. **Build** — implement per the plan; open a PR to `main`.
6. **Ship** — on merge, `git mv` the card to `done/`.

Moving cards is part of doing the work, not optional bookkeeping.

## The feature card

Filename: `NN-kebab-title.md` (e.g. `001-fitness-domain-model.md`). The `NN-`
prefix is a stable id and rough creation order; it never changes when the card
moves between folders.

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

### Field reference

- **id** — matches the `NN-` filename prefix; stable identity.
- **priority** — `high | medium | low`; orders work within `backlog/`.
- **effort** — `S | M | L`; rough size to aid sequencing.
- **blocked_by** — list of feature ids that must ship first; a card cannot enter `in-progress/` while any listed id is unshipped.
- **owner** — optional; the contributor who has claimed the card.
- **spec / plan** — links to the detailed docs under `docs/superpowers/`, filled in as those are written.

## Ordering and dependencies

Within `backlog/`, pick the highest-`priority` card whose `blocked_by` list is
empty (or fully shipped). `priority` drives ordering; `blocked_by` enforces hard
dependencies. The `NN-` prefix is identity, not work order.

## Keeping this current

A card's folder must always reflect reality. Create a card when an idea is worth
tracking, and `git mv` it the moment its stage changes. This is part of the
work, not separate bookkeeping — the same expectation `PROJECT_CONTEXT.md` sets
for the architecture map.
