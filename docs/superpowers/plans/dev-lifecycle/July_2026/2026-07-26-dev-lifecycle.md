# Development Lifecycle System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up an in-repo development lifecycle system — a `docs/features/` folder kanban plus a `development_process.md` doc — that lets Claude, Codex, and humans see how work flows and where each feature sits.

**Architecture:** Pure documentation scaffolding. A feature is a markdown "card"; the folder it lives in (`backlog/` → `in-progress/` → `done/`) IS its stage, so there is no status field to keep in sync. Cards are thin trackers that link out to the detailed spec/plan under `docs/superpowers/`.

**Tech Stack:** Markdown only. Verification is Prettier (`npm run format:check`) plus link-resolution checks — there is no runtime code, so tasks use **structural verification** in place of unit tests.

## Global Constraints

- **The user performs ALL git operations.** Do NOT run `git add`, `git commit`, `git mv`, `git push`, or any other git write command. Where a task ends in a commit, present the staged file list and a suggested Conventional Commit message and hand off to the user.
- **Markdown must pass `npm run format:check`.** Always run `npm run format` (auto-fix) before `npm run format:check` in each task.
- **Commit style:** Conventional Commits — `docs(dev-lifecycle): <summary>` (per AGENTS.md).
- **No rule duplication.** `AGENTS.md` = rules/workflow, `PROJECT_CONTEXT.md` = architecture, `development_process.md` = how work flows + what's in flight. Cross-link; never copy content between them.
- **Feature-card frontmatter fields (canonical):** `id`, `title`, `created`, `priority` (`high|medium|low`), `effort` (`S|M|L`), `blocked_by` (list of ids), `owner` (optional), `spec` (link), `plan` (link). There is intentionally NO `status` field — the folder is the status.

---

### Task 1: Kanban skeleton + seed card

Creates the `docs/features/` folder kanban and the single seed card. Git does not track empty directories, so `in-progress/` and `done/` get a `.gitkeep`; `backlog/` is tracked by the seed card it contains.

**Files:**

- Create: `docs/features/in-progress/.gitkeep` (empty)
- Create: `docs/features/done/.gitkeep` (empty)
- Create: `docs/features/backlog/001-fitness-domain-model.md`

**Interfaces:**

- Consumes: nothing (first task).
- Produces: the `docs/features/{backlog,in-progress,done}/` structure and card `001` that Task 2's `development_process.md` documents, and that Task 3's cross-links reference.

- [ ] **Step 1: Create the two `.gitkeep` files**

Create `docs/features/in-progress/.gitkeep` and `docs/features/done/.gitkeep`, each an empty file (0 bytes).

- [ ] **Step 2: Create the seed card**

Create `docs/features/backlog/001-fitness-domain-model.md` with exactly this content:

```markdown
---
id: 001
title: Fitness domain model
created: 2026-07-26
priority: high
effort: L
blocked_by: []
owner:
spec:
plan:
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
```

- [ ] **Step 3: Auto-format**

Run: `npm run format`
Expected: exits 0; may reformat the new card.

- [ ] **Step 4: Verify formatting is clean**

Run: `npm run format:check`
Expected: PASS — "All matched files use Prettier code style!" (no unformatted files listed).

- [ ] **Step 5: Verify the structure exists and is tracked**

Run: `find docs/features -type f | sort`
Expected output (exactly these three lines):

```
docs/features/backlog/001-fitness-domain-model.md
docs/features/done/.gitkeep
docs/features/in-progress/.gitkeep
```

- [ ] **Step 6: Hand off commit to the user**

Do NOT run git. Tell the user: stage `docs/features/` and commit with:
`docs(dev-lifecycle): add feature kanban skeleton and domain-model seed card`

---

### Task 2: `development_process.md`

The centerpiece lifecycle doc at repo root. Documents the stages, the idea→ship flow, the card template, and the ordering/dependency rules — all matching what Task 1 created.

**Files:**

- Create: `development_process.md`

**Interfaces:**

- Consumes: the `docs/features/` structure and card-`001` shape from Task 1 (referenced, must stay consistent).
- Produces: `development_process.md`, which Task 3 links to from `AGENTS.md`, `PROJECT_CONTEXT.md`, and `README.md`.

- [ ] **Step 1: Create `development_process.md`**

Create `development_process.md` at the repo root with exactly this content (the outer fence here is four backticks so the doc's own triple-backtick blocks nest correctly — the file itself uses normal triple backticks):

````markdown
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
````

- [ ] **Step 2: Auto-format**

Run: `npm run format`
Expected: exits 0.

- [ ] **Step 3: Verify formatting is clean**

Run: `npm run format:check`
Expected: PASS — no unformatted files listed.

- [ ] **Step 4: Verify internal links resolve**

Run:

```bash
for f in AGENTS.md PROJECT_CONTEXT.md docs/features/backlog/001-fitness-domain-model.md; do
  test -e "$f" && echo "OK  $f" || echo "MISSING  $f"
done
```

Expected: three `OK` lines (these are the paths `development_process.md` references).

- [ ] **Step 5: Hand off commit to the user**

Do NOT run git. Tell the user: stage `development_process.md` and commit with:
`docs(dev-lifecycle): add development process lifecycle doc`

---

### Task 3: Cross-link integration

Wires the new system into the three existing docs so contributors and agents discover it. Small, surgical edits — no rule duplication.

**Files:**

- Modify: `AGENTS.md` (Section 1 — Workflow & Process)
- Modify: `PROJECT_CONTEXT.md` (folder map)
- Modify: `README.md` (Workflow section)

**Interfaces:**

- Consumes: `development_process.md` (Task 2) and `docs/features/` (Task 1) — the link targets.
- Produces: nothing downstream (final task).

- [ ] **Step 1: Add a feature-tracking bullet to `AGENTS.md` Section 1**

In `AGENTS.md`, find this exact bullet (end of Section 1):

```markdown
- **Definition of done:** `npm run lint`, `npm run typecheck`, and (once tests
  exist) `npm run test` all pass; PR template complete; scope described.
```

Replace it with:

```markdown
- **Definition of done:** `npm run lint`, `npm run typecheck`, and (once tests
  exist) `npm run test` all pass; PR template complete; scope described.
- **Feature tracking:** every feature is a card in `docs/features/`
  (`backlog/` → `in-progress/` → `done/`). See
  [development_process.md](./development_process.md) for the full lifecycle.
```

- [ ] **Step 2: Add `docs/features/` to the `PROJECT_CONTEXT.md` folder map**

In `PROJECT_CONTEXT.md`, find this exact block:

```markdown
├── docs/
│ └── superpowers/
│ ├── specs/ Design docs produced by the brainstorming skill
│ └── plans/ Implementation plans produced by the writing-plans skill
```

Replace it with:

```markdown
├── docs/
│ ├── features/ Feature kanban — cards move backlog/ → in-progress/ → done/
│ └── superpowers/
│ ├── specs/ Design docs produced by the brainstorming skill
│ └── plans/ Implementation plans produced by the writing-plans skill
```

- [ ] **Step 3: Add `development_process.md` to the `PROJECT_CONTEXT.md` root-file list**

In `PROJECT_CONTEXT.md`, find this exact line:

```markdown
├── CLAUDE.md Pointer to AGENTS.md (Claude Code entry point)
```

Replace it with:

```markdown
├── CLAUDE.md Pointer to AGENTS.md (Claude Code entry point)
├── development_process.md Lifecycle: how work flows idea→shipped + feature tracking
```

- [ ] **Step 4: Add a feature-tracking line to `README.md`**

In `README.md`, find this exact line (in the Workflow section):

```markdown
Feature branches → PR to `main` → review → merge. See [AGENTS.md](./AGENTS.md).
```

Replace it with:

```markdown
Feature branches → PR to `main` → review → merge. See [AGENTS.md](./AGENTS.md).
Features are tracked as cards in `docs/features/`; see
[development_process.md](./development_process.md) for the lifecycle.
```

- [ ] **Step 5: Auto-format**

Run: `npm run format`
Expected: exits 0.

- [ ] **Step 6: Verify formatting is clean**

Run: `npm run format:check`
Expected: PASS — no unformatted files listed.

- [ ] **Step 7: Verify every cross-link target exists**

Run:

```bash
for f in development_process.md docs/features AGENTS.md PROJECT_CONTEXT.md; do
  test -e "$f" && echo "OK  $f" || echo "MISSING  $f"
done
```

Expected: four `OK` lines.

- [ ] **Step 8: Hand off commit to the user**

Do NOT run git. Tell the user: stage `AGENTS.md`, `PROJECT_CONTEXT.md`, `README.md` and commit with:
`docs(dev-lifecycle): link development process into AGENTS, PROJECT_CONTEXT, README`

---

## Verification (whole plan)

After all tasks, confirm end to end:

- [ ] `npm run format:check` passes across the repo.
- [ ] `find docs/features -type f | sort` shows the three expected files.
- [ ] `development_process.md` exists at repo root and its links to `AGENTS.md`, `PROJECT_CONTEXT.md`, and the `001` card resolve.
- [ ] `AGENTS.md`, `PROJECT_CONTEXT.md`, and `README.md` each link to `development_process.md`.
- [ ] No `status:` field appears in the seed card (grep: `grep -n "status:" docs/features/backlog/001-fitness-domain-model.md` returns nothing).
- [ ] All changes handed to the user for commit; no git write commands were run by the executor.
